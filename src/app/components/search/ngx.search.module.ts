/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { NgModule } from '@angular/core';

import { NbButtonModule, NbIconModule, NbOverlayModule, NbCardModule } from '@nebular/theme';
import { NgxSearchComponent, NgxSearchFieldComponent } from './ngx.search.component';
import { NgxSearchService } from './ngx.search.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [
    NbCardModule,
    NbOverlayModule,
    NbIconModule,
    NbButtonModule,
    CommonModule,
    FormsModule,
  ],
  declarations: [
    NgxSearchComponent,
    NgxSearchFieldComponent,
  ],
  exports: [
    NgxSearchComponent,
    NgxSearchFieldComponent,
  ],
  providers: [
    NgxSearchService,
  ],
  entryComponents: [
    NgxSearchFieldComponent,
  ],
})
export class NgxSearchModule {
}
