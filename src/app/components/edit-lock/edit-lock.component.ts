import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { IUser } from '../../shared/models/user';
import { AuthService } from '../../services/auth.service';
import { NbDialogService, NbDialogRef, NbToastrService } from '@nebular/theme';
import { DuplicateWorkspaceComponent } from '../../workspace/duplicate-workspace/duplicate-workspace.component';
import { ActivatedRoute } from '@angular/router';
import { WorkspaceService } from '../../services/workspace.service';

@Component({
  selector: 'ngx-edit-lock',
  styleUrls: ['./edit-lock.component.scss'],
  templateUrl: './edit-lock.component.html',
})
export class EditLockComponent implements OnInit {

  @Output() lockClicked = new EventEmitter();
  isEdit: boolean = true;
  user: IUser;
  currWs: string;
  currWsDetails;

  constructor(
    private auth: AuthService,
    private dialogService: NbDialogService,
    private route: ActivatedRoute,
    private ws: WorkspaceService,
    ) {
    this.currWs = this.route.snapshot.params.workspace;
  }

  wsDetails() {
    this.ws.getById(this.currWs)
    .subscribe((workspace) => {
      this.currWsDetails = workspace;
    });
  }

  toggleLock() {
    if (this.user.role !== 'admin' && (this.currWsDetails.creatorId !== this.user._id)) {
      this.dialogService.open(DuplicateWorkspaceComponent);
    } else {
      this.isEdit = !this.isEdit;
      this.lockClicked.emit(this.isEdit);
    }
  }

  ngOnInit() {
    this.getUser();
    this.wsDetails();
  }

  getUser() {
    this.auth.currentUserObs.subscribe((user) => {
      this.user = user;
    });
  }
}
