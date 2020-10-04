import { Component, OnInit } from '@angular/core';
import { IUser } from '../../shared/models/user';
import { AuthService } from '../../services/auth.service';
import { NbToastrService, NbDialogService, NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-duplicate-workspace',
  templateUrl: './duplicate-workspace.component.html',
})
export class DuplicateWorkspaceComponent implements OnInit {

  constructor(
    private auth: AuthService,
    public toast: NbToastrService,
  ) { }
  user: IUser;
  invalidWpName: boolean = false;
  wpName: string;

  ngOnInit(): void {
    this.getUser();
  }

  getUser() {
    this.auth.currentUserObs.subscribe((user) => {
      this.user = user;
    });
  }

  duplicateWP() {
    if (this.wpName !== '' && this.wpName !== undefined && this.wpName !== 'undefined') {
      this.invalidWpName = false;
      const duplicateData = {
        [this.user.workspaceCurrent.id] : this.user.workspaces[this.user.workspaceCurrent.id],
      };
      duplicateData[this.user.workspaceCurrent.id].name = this.wpName;
      this.auth.duplicateWP(duplicateData)
        .subscribe((res) => {
          this.toast.show('Switch to duplicated orkspace to edit', 'Duplicated Succesfully!', { status: 'primary' });
          location.reload();
        }, (error) => {
          this.toast.show('Try again to duplicate the workspace', 'Something went wrong!', { status: 'danger' });
        });
    } else {
      this.invalidWpName = true;
      return false;
    }
  }

}
