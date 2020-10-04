import { AuthService } from './../../services/auth.service';
import { FocusService } from './../../services/focus.service';
import { Component, Output, EventEmitter, Input, OnChanges } from '@angular/core';
import { NbToastrService } from '@nebular/theme';
import { NgxEditorModel } from 'ngx-monaco-editor';

@Component({
  selector: 'ngx-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnChanges {
  dataModel: NgxEditorModel;
  editor;
  editorOptions: any = {
    theme: 'vs-dark',
    language: 'json',
    model: {},
  };
  @Input() file: string;
  @Input() fileName: string;
  @Input() fileModel: string;
  @Output() save = new EventEmitter<boolean>();
  @Output() close = new EventEmitter<boolean>();
  loading: boolean;

  constructor(
    public focusService: FocusService,
    private auth: AuthService,
    private toast: NbToastrService,
  ) {
    this.loading = true;
  }

  ngOnChanges() {
    this.reload();
  }

  updateEditor(model, data) {
    return new Promise((resolve, reject) => {
      try {
        if (model && model !== '') {
          this.dataModel = {
            value: JSON.stringify(data, null, 2),
            uri: monaco.Uri.parse(`a://b/${model}.json`),
            language: 'json',
          };
        } else {
          this.dataModel = {
            value: JSON.stringify(data, null, 2),
            language: 'json',
          };
        }
        this.editor.setValue(this.dataModel.value);
        this.loading = false;
        setTimeout(() => {
          resolve();
        });
      } catch (err) {
        this.toast.show(`wrong format`, 'JSON', { status: 'danger' });
        console.error(err);
        reject(err);
      }
    });
  }

  fullScreen() {
    if (!this.focusService.isFocus()) {
      this.auth.event({}, {}, { event: 'fullscreen', date: new Date(), url: window.location.href });
      this.focusService.focus();
    } else {
      this.auth.event({}, {}, { event: 'un_fullscreen', date: new Date(), url: window.location.href });
      this.focusService.unFocus();
    }
    if (this.editor) {
      setTimeout(() => {
        this.editor.layout();
      }, 20);
    }
  }

  getClassCard() {
    if (this.focusService.isFocus()) {
      return 'editor_box_fullscreen';
    }
    return 'editor_box';
  }

  getClass() {
    if (this.focusService.isFocus()) {
      return 'col-12 h-100 px-0';
    }
    return 'col-12 h-100 px-0 px-md-3';
  }

  reload() {
    if (this.editor) {
      this.loading = true;
      const line = this.editor.getPosition();
      this.updateEditor(this.fileModel, this.file).then(() => {
        this.editor.setPosition(line);
        this.editor.revealLineInCenterIfOutsideViewport(line.lineNumber);
        this.editor.focus();
        this.loading = false;
      }).catch((err) => {
        this.loading = false;
      });
    }
  }

  monacoInited(editor) {
    this.editor = editor;
    if (!this.dataModel) {
      this.updateEditor(this.fileModel, this.file)
        .then(() => {
          this.loading = false;
        }).catch((err) => {
          this.loading = false;
        });
    }
  }

  closeEditor() {
    this.close.emit();
  }

  async checkJson() {
    try {
      const newJson = JSON.parse(this.editor.getValue());
      await this.save.emit(newJson);
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 2000);
    } catch (err) {
      this.toast.show(`wrong format`, 'JSON', { status: 'danger' });
    }
  }

  onKeyDown($event): void {
    // Detect platform
    if (navigator.platform.match('Mac')) {
      this.handleMacKeyEvents($event);
    } else {
      this.handleWindowsKeyEvents($event);
    }
  }

  handleMacKeyEvents($event) {
    // MetaKey documentation
    // https://developer.mozilla.org/en-US/docs/Web/KeyboardEvent/metaKey
    const charCode = String.fromCharCode($event.which).toLowerCase();
    if ($event.metaKey && charCode === 's') {
      // Action on Cmd + S
      this.checkJson();
      $event.preventDefault();
    }
  }

  handleWindowsKeyEvents($event) {
    const charCode = String.fromCharCode($event.which).toLowerCase();
    if ($event.ctrlKey && charCode === 's') {
      // Action on Ctrl + S
      this.checkJson();
      $event.preventDefault();
    }
  }
}
