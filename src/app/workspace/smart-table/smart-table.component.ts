import { SmartTableDataSource } from './../../services/smart-table-data-source';
import { FocusService } from './../../services/focus.service';
import { SmartTableService } from '../../services/smart-table.service';
import { AuthService } from './../../services/auth.service';
import { ElementRef, Component, OnInit, Input, Output, EventEmitter, ViewChild, TemplateRef } from '@angular/core';
import { NbToastrService, NbDialogService, NbDialogRef } from '@nebular/theme';
import { FileSaverService } from 'ngx-filesaver';
import { IBox } from '../../shared/models/workspace';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-smart-table',
  templateUrl: './smart-table.component.html',
  styleUrls: ['./smart-table.component.scss'],
})
export class SmartTableComponent implements OnInit {
  source: SmartTableDataSource;
  file: any;
  fileName: string;
  fileModel: string;
  dataName: string;
  delimiter: string = '+';
  splitterRegex: any;
  currentDialog: NbDialogRef<any>;
  tableLoadingSpinner: boolean;
  @Input() box: IBox;
  @Input() sectionId: string;
  @Input() workspaceId: string;
  @Output() backAction: EventEmitter<any> = new EventEmitter();
  elem: ElementRef;

  @ViewChild('table', { read: ElementRef }) set elemOnHTML(elemOnHTML: ElementRef) {
    if (!!elemOnHTML) {
      this.elem = elemOnHTML;
    }
  }
  constructor(
    public smartTableService: SmartTableService,
    public toast: NbToastrService,
    private fileSaverService: FileSaverService,
    private router: Router,
    private dialogService: NbDialogService,
    public focusService: FocusService,
    private auth: AuthService,
  ) {
    this.fileModel = '';
    this.splitterRegex = new RegExp(`[${this.delimiter}]+`);
  }
  settings = null;
  _settings = {
    actions: {
      delete: false,
      add: false,
      edit: false,
    },
    edit: {
      confirmSave: true,
      editButtonContent: '<i class="fal fa-edit fa-xs p-1 m-1" title="Edit"></i>',
      saveButtonContent: '<i class="fal fa-check fa-xs p-1 m-1" title="Save"></i>',
      cancelButtonContent: '<i class="fal fa-times fa-xs p-1 m-1" title="Cancel"></i>',
    },
    delete: {
      deleteButtonContent: '<i class="fal fa-trash-alt fa-xs p-1 m-1" title="Delete"></i>',
      confirmDelete: true,
    },
    add: {
      confirmCreate: true,
      createButtonContent: '<i class="fal fa-check fa-xs p-1" title="Save"></i>',
      addButtonContent: '<i class="fal fa-plus fa-xs p-1" title="Add"></i>',
      cancelButtonContent: '<i class="fal fa-times fa-xs p-1" title="Cancel"></i>',
    },
    pager: {
      perPage: 30,
    },
    columns: {
      _id: {
        title: 'id',
      },
      name: {
        title: 'Name',
      },
    },
  };

  ngOnInit() {
    this.settings = this.valuePrepareFromDeepKey(Object.assign(this._settings, this.box.smartTable.settings));
    this.source = new SmartTableDataSource(this.smartTableService, this.box.smartTable);
    this.source.getLoaderStatus().subscribe((status) => {
      this.tableLoadingSpinner = status;
    });
  }

  valuePrepareFromDeepKey(settings: any) {
    for (const column in settings.columns) {
      if (settings.columns.hasOwnProperty(column)) {
        const columnName = this.checkColumnNameIsSplittable(column);
        if (columnName[1]) {
          settings.columns[column].valuePrepareFunction = (cell, row) => {
            return columnName.reduce((o, x) => {
              return (typeof o === 'undefined' || o === null) ? o : o[x];
            }, row);
          };
        }
      }
    }
    return settings;
  }

  setValuePrepareFromDeepKey(settings: any, DataSet) {
    const newDataSet = {};
    for (const column in DataSet) {
      if (settings.columns.hasOwnProperty(column)) {
        const columnName = this.checkColumnNameIsSplittable(column);
        if (columnName[1]) {
          if (DataSet[column] && DataSet[column] !== '') {
            newDataSet[columnName[0]] = {};
            newDataSet[columnName[0]][columnName[1]] = DataSet[column];
          }
        } else if (DataSet[column] && DataSet[column] !== '') {
          newDataSet[column] = DataSet[column];
        }
      } else {
        newDataSet[column] = DataSet[column];
      }
    }
    return newDataSet;
  }

  checkColumnNameIsSplittable(property) {
    return property.split(this.splitterRegex);
  }

  reload() {
    this.source.load([]);
  }

  fullScreen() {
    this.focusService.toggle();
  }

  getClass() {
    if (this.focusService.isFocus()) {
      return 'col-12 px-0';
    }
    return this.box.class ? this.box.class : 'col-12 px-0 px-md-3';
  }

  upload(dialog: TemplateRef<any>) {
    this.currentDialog = this.dialogService.open(dialog);
  }

  runNotebook(url) {
    this.toast.show('usually, it takes few sec to complete', `Notebook started`, { status: 'success' });
    this.auth.runNotebook(url)
    .subscribe((data) => {
      if (data && data.message) {
        const time = Math.round(data.time * 10) / 10;
        this.toast.show(`in ${time} sec`, `Notebook run successfully`, { status: 'success' });
      } else if (data && data.error) {
        this.toast.show(data.error, `Notebook run fail`, { status: 'danger' });
      } else {
        this.toast.show('unknow error', `Notebook run fail`, { status: 'danger' });
      }
    }, (err) => {
      this.toast.show(`Notebook run fail`, err.message, { status: 'danger' });
    });
  }

  deleteDoc(doc: any) {
    if (window.confirm(`Are you sure you want to permanently delete document
    ${doc._id} ?`)) {
      this.source.delete(doc).subscribe(() => {
        this.toast.show(`Deleted successfully`, this.box.name, { status: 'success' });
      }, (err) => {
        this.tableLoadingSpinner = false;
        this.toast.show(`Deleting failed`, this.box.name, { status: 'danger' });
      });
    }
  }
  closeDialog() {
    if (this.currentDialog) {
      this.currentDialog.close();
      this.currentDialog = null;
    }
  }

  addAll(docs: any) {
    const allCreated: Promise<any>[] = [];
    if (Array.isArray(docs)) {
      docs.forEach((doc) => {
        allCreated.push(this.addDoc(doc));
      });
    } else {
      allCreated.push(this.addDoc(docs));
    }
    forkJoin(...allCreated)
      .subscribe(() => {
        this.toast
          .show(`Bulk Create successfull`, this.box.name, { status: 'success' });
        this.closeDialog();
      }, (error) => {
        console.error(error);
        this.toast.show(error.message, this.box.name, { status: 'danger' });
        this.closeDialog();
      });
  }

  addDoc(doc: any): Promise<any> {
    delete doc._id;
    return new Promise((resolve, reject) => {
      const formattedDoc = this.setValuePrepareFromDeepKey(this.settings, doc);
      this.source.addData(formattedDoc).subscribe((response) => {
        this.toast.show(`Added successfully`, this.box.name, { status: 'success' });
        resolve(response);
      }, (error) => {
        this.toast.show('Data adding failed', this.box.name, { status: 'danger' });
        this.tableLoadingSpinner = false;
        console.error(error);
        reject(error);
      });
    });
  }

  editDoc(newDoc): Promise<any> {
    return new Promise((resolve, reject) => {
      const formattedDoc = this.setValuePrepareFromDeepKey(this.settings, newDoc);
      this.source.updateDoc(formattedDoc).subscribe((response) => {
        this.toast.show(`Updated successfully`, this.box.name, { status: 'success' });
        if (this.file) {
          this.file = response;
        }
        resolve(response);
      }, (error) => {
        console.error(error);
        reject(error);
        this.tableLoadingSpinner = false;
        this.toast.show('Updated fail', this.box.name, { status: 'danger' });
      });
    });
  }

  backTolist() {
    this.file = null;
    this.fileName = null;
  }

  capitalizeFirstLetter(text) {
    return text[0].toUpperCase() + text.slice(1);
  }

  openEditor(doc: any) {
    this.fileName = doc._id;
    if (this.box.smartTable.model) {
      this.fileModel = `I${this.capitalizeFirstLetter(this.box.smartTable.model)}`;
    }
    this.file = doc;
  }

  dynamicDownloadJson(doc: any) {
    try {
      const dataString = JSON.stringify([doc], null, 2);
      const myblob = new Blob([dataString], {
        type: 'application/json',
      });
      this.fileSaverService.save(myblob, `${doc._id}.json`);
    } catch (err) {
      this.toast.show(`Download fail`, this.box.name, { status: 'danger' });
      console.error(err);
    }
  }

  basicAction(action, event) {
    event.action = action;
    return this.onCustomAction(event);
  }

  async onCustomAction(event) {
    switch (event.action) {
      case 'editJsonAction':
        this.openEditor(event.data);
        break;
      case 'editInlineAction':
        try {
          await this.editDoc(event.newData);
          event.confirm.resolve(event.newData);
        } catch (err) {
          console.error(err);
        }
        break;
      case 'seeWorkspaceAction':
        // event.data
        this.router.navigate([`/${event.data._id}/dashboard`]);
        // this.auth.currentWpObs.next(wp);
        break;
      case 'addInlineAction':
        try {
          await this.addDoc(event.newData);
          event.confirm.resolve(event.newData);
        } catch (err) {
          console.error(err);
        }
        break;
      case 'deleteInlineAction':
        try {
          await this.deleteDoc(event.data);
          event.confirm.resolve(event.data);
        } catch (err) {
          console.error(err);
        }
        break;
      case 'deleteAction':
        this.deleteDoc(event.data);
        break;
      case 'downloadAction':
        this.dynamicDownloadJson(event.data);
        break;
    }
  }
  back() {
    this.backAction.emit();
  }
}
