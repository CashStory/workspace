import { Component, OnInit, Input, ViewChild, ElementRef, EventEmitter, Output } from '@angular/core';
import { UploadService } from '../services/upload.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss'],
})
export class UploadComponent implements OnInit {

  fileToUpload: File = null;
  // tslint:disable-next-line:no-input-rename
  // @Input('callback') public callback;
  @Input('uploadFile') public uploadFile = true;
  @Output() fileOut = new EventEmitter<object>();
  @ViewChild('fileInp', { static: true }) fileInp: ElementRef;
  uploadOk = false;
  // filename = null;
  uploaded = false;
  loading = false;

  constructor(
    private upload: UploadService,
    private toast: NbToastrService,
  ) { }

  ngOnInit() {
  }

  readSingleFile(file: File) {
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = (e) => {
      this.fileOut.emit({ name: file.name, fileString: reader.result });
    };
    reader.readAsText(file);
  }

  handleFileInput(files: FileList) {
    this.fileToUpload = files.item(0);
    if (this.uploadFile) {
      this.startUpload();
    } else {
      this.readSingleFile(this.fileToUpload);
    }
  }

  startUpload() {
    // this.callback('waiting');
    this.loading = true;
    this.upload.postFile(this.fileToUpload)
      .subscribe((data: any) => {
        // this.callback(data.filename);
        this.loading = false;
        this.fileOut.emit({ name: data.filename, fileString: null });
        // this.filename = data.filename;
      }, (error) => {
        console.error(error);
        this.loading = false;
        this.toast.show(`Upload fail, try again`, 'Sorry', { status: 'danger' });
      });
  }

  onClickFile() {
    this.fileInp.nativeElement.click();
    // this.filename = '';
    this.loading = false;
    this.fileToUpload = null;
  }

}
