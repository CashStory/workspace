import { FocusService } from '../../services/focus.service';
import { FullscreenLockService } from '../../services/fullscreen-lock.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { take, skip } from 'rxjs/operators';
import { IWp } from '../../shared/models/workspace';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'ngx-select-wsb',
  template: `
  <ngx-section *ngIf="!isDash"></ngx-section>
  <ngx-dashboard *ngIf="isDash"></ngx-dashboard>
  `,
})

export class SelectWSBComponent implements OnInit, OnDestroy {
  subRoute: any;
  isDash: boolean;
  currentWp: IWp;
  currentWpObs: any;

  constructor(
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private focusService: FocusService,
    private fullscreenLockService: FullscreenLockService,
    private wsServices: WorkspaceService,
  ) {
    this.isDash = true;
    this.route.queryParams
      .subscribe((params) => {
        if (params['fullscreen'] === 'true') {
          this.focusService.focus();
        }

        if (params['fullscreen'] === 'true' && params['fullscreenlock'] === 'true') {
          this.fullscreenLockService.lock();
        }
      });
  }

  ngOnDestroy() {
    this.subRoute.unsubscribe();
    this.currentWpObs.unsubscribe();
  }

  async setSB(sectionId, boxId) {
    if (!boxId) {
      const box = await this.auth.getDefaultBox(sectionId);
      if (box) {
        this.router.navigate([`box/${box}`], { relativeTo: this.route });
        this.auth.updateSectionBox(sectionId, box);
      } else {
        this.auth.updateSectionBox(sectionId, null);
      }
    } else {
      this.auth.updateSectionBox(sectionId, boxId);
    }
  }

  setWp(id) {
    return new Promise((resolve, reject) => {
      if (this.currentWp && id && id !== this.currentWp.id) {
        this.auth.currentWpObs
          .pipe(skip(1), take(1))
          .subscribe(() => {
            setTimeout(() => {
              resolve();
            }, 500);
          });
        this.auth.currentWpObs.next({ id });
      } else {
        this.auth.currentWpObs
          .pipe(take(1))
          .subscribe(() => {
            resolve();
          });
      }
    });
  }

  ngOnInit() {
    this.currentWpObs = this.auth.currentWpObs
      .subscribe(async (currentWp) => {
        this.currentWp = currentWp;
      });
    this.currentWpObs = this.auth.currentWpObs
      .pipe(take(1))
      .subscribe(async (currentWp) => {
        this.subRoute = this.route.params.subscribe(async (params) => {
          if (location.href.indexOf('share') > -1) {
            if (params.workspace !== currentWp.id) {
              await this.wsServices.getById(params.workspace).subscribe(async (res: any) => {
                if (res.linkShared) {
                  this.isDash = true;
                  await this.setWp(params.workspace)
                  .then(() => {
                    this.setSB(null, null);
                  });
                  this.router.navigate([`/`]);
                } else {
                  this.router.navigate([`/`]);
                }
              });
            }
          }

          const workspaceId = params.workspace;
          if (!workspaceId && currentWp) {
            this.router.navigate([`/${currentWp.id}/dashboard`]);
          } else if (location.href.indexOf('dashboard') > -1) {
            this.isDash = true;
            this.setWp(workspaceId)
              .then(() => {
                this.setSB(null, null);
              });
          } else {
            this.isDash = false;
            const sectionId = params.section ? parseInt(params.section, 10) : null;
            const boxId = params.box ? params.box : null;
            this.setWp(workspaceId)
              .then(() => {
                this.setSB(sectionId, boxId);
              });
          }
        });
      });
  }
}
