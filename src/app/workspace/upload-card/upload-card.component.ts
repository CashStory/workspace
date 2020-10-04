import { NbToastrService, NbDialogService } from '@nebular/theme';
import { Component, TemplateRef, Input, Output, EventEmitter } from '@angular/core';
import * as XLSX from 'xlsx';
import { ISmartTable } from '../../shared/models/auth';

@Component({
  selector: 'ngx-upload-card',
  templateUrl: './upload-card.component.html',
  styleUrls: ['./upload-card.component.scss'],
})
export class UploadCardComponent {
  constructor(
    private toast: NbToastrService,
    private dialogService: NbDialogService) {
  }

  @Input() kind: string;
  @Output() addAll: EventEmitter<any> = new EventEmitter();

  entries: any[];
  filename;

  parseFile(file) {
    let error;
    let fileParsed;
    try {
      fileParsed = JSON.parse(file.fileString);
      if (Array.isArray(fileParsed)) {
        this.entries = fileParsed;
      } else {
        this.entries = [fileParsed];
      }
      this.filename = file.name;
    } catch (err) {
      console.error(err);
      error = {
        error: err,
        title: 'Parser',
        description: 'Fail, check JSON syntax !',
      };
    }
    if (!this.filename) {
      error = null;
      try {
        const workbook = XLSX.read(file.fileString, { type: 'string' });
        this.filename = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[this.filename];
        this.entries = XLSX.utils.sheet_to_json(worksheet);
      } catch (err) {
        error = {
          error: err,
          title: 'Parser',
          description: 'Fail, check XLS syntax !',
        };
        console.error(err);
      }
    }
    if (error) {
      this.toast.show(error.description, error.title, { status: 'danger' });
    } else {
      this.toast.show('Success, ready to Add !', 'Parser', { status: 'success' });
    }
  }

  add() {
    if (this.filename) {
      this.addAll.emit(this.entries);
    }
  }

  open(dialog: TemplateRef<any>) {
    this.dialogService.open(dialog);
  }

}
