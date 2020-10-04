import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NbButtonModule, NbSpinnerModule, NbToastrModule } from '@nebular/theme';
import { UploadComponent } from './upload.component';
// import { NgxDropzoneModule } from 'ngx-dropzone';

const PAGES_COMPONENTS = [
  UploadComponent,
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NbButtonModule,
    NbSpinnerModule,
    NbToastrModule,
    // NgxDropzoneModule,
  ],
  declarations: [
    ...PAGES_COMPONENTS,
  ],
  exports: [UploadComponent],
})
export class UploadModule {
}
