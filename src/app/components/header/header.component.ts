import { UploadService } from '../../services/upload.service';
import { AuthService } from '../../services/auth.service';
import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { IUser } from '../../shared/models/user';
import { NbSidebarService, NbMenuService, NbContextMenuDirective, NbMenuItem, NbDialogService } from '@nebular/theme';
import { NgxSearchService } from '../search/ngx.search.service';
import { filter, map } from 'rxjs/operators';
import { IWp } from '../../shared/models/workspace';
import { Router } from '@angular/router';
import hotkeysJs from 'hotkeys-js';
import { WorkspaceService } from '../../services/workspace.service';
@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {

  user: IUser;
  onSearchSubmitObs;
  placeholder = 'Bob search...';
  isDuplicateWS: Boolean = false;

  workSpacesMenu: NbMenuItem[] = [];
  ws: IWp;

  @ViewChildren(NbContextMenuDirective) MenuElems: QueryList<NbContextMenuDirective>;

  constructor(
    private nbMenuService: NbMenuService,
    private sidebarService: NbSidebarService,
    public searchService: NgxSearchService,
    public upload: UploadService,
    public router: Router,
    public auth: AuthService,
    private wsp: WorkspaceService,
    private dialogService: NbDialogService,
  ) {
    hotkeysJs('ctrl+f,cmd+f', (event) => {
      this.openSearch();
      event.preventDefault();
    });
  }

  ngOnInit() {
    this.sidebarService.collapse('menu-sidebar');
    this.getUser();
    this.nbMenuService.onItemClick()
      .pipe(
        filter(({ tag }) => {
          return tag === 'workSpacesMenu';
        }),
        map(({ item: { link, title } }): IWp => ({ id: link, name: title })),
      )
      .subscribe((wp: IWp) => {
        if (this.workSpacesMenu.findIndex(i => i.link === wp.id) > -1) {
          this.changeDashboard(wp);
        }
      });
    this.onSearchSubmitObs = this.searchService.onSearchSubmit()
      .subscribe((term) => {
        const found = this.auth.findSectionBox(term.term);
        if (found.factor < 0.3) {
          this.auth.event(found, {}, { event: 'search_not_found', date: new Date() });
          setTimeout(() => {
            this.searchService.activateSearch('rotate-layout', found.intent);
          }, 1000);
        } else {
          this.auth.event(found, {}, { event: 'search_open', date: new Date() });
          this.router.navigate([`/${found.workspace}/section/${found.section}/box/${found.box}`]);
        }
      });
    this.auth.currentWpObs.subscribe((ws) => {
      this.ws = ws;
      this.wsp.getById(this.ws.id)
      .subscribe((workspace) => {
        if (workspace.creatorId === this.user._id) {
          this.isDuplicateWS = true;
        } else {
          this.isDuplicateWS = false;
        }
      });
    });
  }

  showFirstName() {
    const isMobile = window.matchMedia('screen and (max-device-width: 767px)').matches;
    if (!isMobile && this.user) {
      return this.user.firstName;
    }
    return '';
  }

  changeDashboard(wp: IWp) {
    this.router.navigate([`/${wp.id}/dashboard`]);
  }

  moreThanOneWp() {
    return Object.keys(this.user.workspaces).length;
  }

  // fonction who get logged user info
  getUser() {
    this.auth.currentUserObs.subscribe((user) => {
      this.user = user;
      this.workSpacesMenu = [];
      if (this.user) {
        for (const [key, workspace] of Object.entries(this.user.workspaces)) {
          this.workSpacesMenu.push({ title: workspace.name, link: key  });
        }
      }
    });
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }

  openSearch() {
    this.searchService.activateSearch('rotate-layout');
  }
}
