import { Component, OnInit } from '@angular/core';
import { WorkspaceService } from '../../services/workspace.service';
import { AuthService } from '../../services/auth.service';
import { IShared } from '../../shared/models/workspace';

@Component({
  selector: 'ngx-share-workspace',
  templateUrl: './share-workspace.component.html',
  styleUrls: ['./share-workspace.component.scss'],
})
export class ShareWorkspaceComponent implements OnInit {
  workspace: any;
  currentWsId: any;
  sharePostData: IShared;
  shareEmail: any;
  role: string;
  errorMsg: string;
  shareablelink: any;

  constructor(
    private wsService: WorkspaceService,
    public auth: AuthService,
  ) { }

  ngOnInit(): void {
    this.auth.currentWpObs.subscribe((ws) => {
      this.shareablelink = `${location.origin}/${ws.id}/share`;
      this.currentWsId = ws.id;
      this.wsService.getShare(ws.id).subscribe((workSpace) => {
        this.workspace = workSpace;
      });
    });
  }

  addShare() {
    const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (EMAIL_REGEXP.test(this.shareEmail)) {
      this.sharePostData = { email : this.shareEmail, role: this.role || 'view'  };
      this.wsService.addShare(this.currentWsId, this.sharePostData).subscribe(async (workspace) => {
        this.workspace = workspace;
      });
    } else {
      this.errorMsg = 'Enter a valid email address. eg. mail@example.com';
    }
  }

  removeShare(email) {
    this.wsService.deleteShare(this.currentWsId, email).subscribe(async (workspace) => {
      this.workspace = workspace;
    });
  }

  toggleEditor(event) {
    if (event) {
      this.role = 'edit';
    } else {
      this.role  = 'view';
    }
  }

  toggleLink() {
    this.wsService.toggleLink(this.currentWsId).subscribe(async (workspace) => {
      this.workspace = workspace;
    });
  }

}
