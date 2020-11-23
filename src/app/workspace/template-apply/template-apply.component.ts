import { Component, OnInit } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { WorkspaceService } from 'app/services/workspace.service';

@Component({
  selector: 'ngx-template-apply',
  templateUrl: './template-apply.component.html',
  styleUrls: ['./template-apply.component.scss'],
})
export class TemplateApplyComponent implements OnInit {
  wpName: string;
  nameError: boolean = false;
  templateId: string;
  constructor(
    private wss: WorkspaceService,
    private toastrService: NbToastrService,
  ) { }

  ngOnInit(): void {

  }

  applyTheme() {
    if (!this.wpName) {
      this.nameError = true;
      return false;
    }
    const postData = {
      wpName : this.wpName,
    };
    this.wss.applyTemplate(this.templateId, postData).subscribe((resp) => {
      this.toastrService.show('', 'Workspace Created!');
      location.href = `/${resp[0]._id}`;
    });
  }

}
