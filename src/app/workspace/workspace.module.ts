import { BoxComponent } from './box/box.component';
import { UploadModule } from './../upload/upload.module';
import { SafeStylePipe, SectionComponent } from './section/section.component';
import { SelectWSBComponent } from './select-wsb/select-wsb.component';
import { AccountComponent } from './account/account.component';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ColorPickerModule } from 'ngx-color-picker';

import { WorkspaceComponent } from './workspace.component';
import { WorkspaceRoutingModule } from './workspace-routing.module';
import { AuthModule } from '../auth/auth.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NbAccordionModule, NbCardModule, NbDialogModule, NbToastrModule } from '@nebular/theme';
import { MonacoEditorModule, NgxMonacoEditorConfig } from 'ngx-monaco-editor';
import { EditorComponent } from './editor/editor.component';
import { FileSaverModule } from 'ngx-filesaver';
import * as UserModelJson from '../shared/user_models.json';
import * as WorkspaceModelJson from '../shared/workspace_models.json';
import { UploadCardComponent } from './upload-card/upload-card.component';
import { DuplicateWorkspaceComponent } from './duplicate-workspace/duplicate-workspace.component';
import {
  HeaderComponent,
  SearchInputComponent,
  NewsPostPlaceholderComponent,
  NewsPostComponent,
  NewsFavComponent,
  FloatingButtonComponent,
  FloatingButtonItemComponent,
  EditLockComponent,
} from '../components';
import { ThemeModule } from '../@theme/theme.module';
import { LayoutComponent } from '../components/layout';

const PAGES_COMPONENTS = [
  WorkspaceComponent,
  AccountComponent,
  DashboardComponent,
  SectionComponent,
  SelectWSBComponent,
  BoxComponent,
  EditorComponent,
  LayoutComponent,
  HeaderComponent,
  SearchInputComponent,
  NewsPostPlaceholderComponent,
  NewsPostComponent,
  NewsFavComponent,
  FloatingButtonComponent,
  FloatingButtonItemComponent,
  EditLockComponent,
];

const ENTRY_COMPONENTS = [
  UploadCardComponent,
  DuplicateWorkspaceComponent,
];

export function onMonacoLoad() {
  const schemas = [];
  // onMonacoLoad: () => { console.log((<any>window).monaco); }
  for (const [key, schema] of Object.entries(UserModelJson.definitions)) {
    const uri = monaco.Uri.parse(`a://b/${key}.json`);
    schemas.push({
      schema,
      uri: `http://cs/${key}-schema.json`,
      fileMatch: [uri.toString()],
    });
  }
  for (const [key, schema] of Object.entries(WorkspaceModelJson.definitions)) {
    const uri = monaco.Uri.parse(`a://b/${key}.json`);
    schemas.push({
      schema,
      uri: `http://cs/${key}-schema.json`,
      fileMatch: [uri.toString()],
    });
  }
  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    schemas,
    validate: true,
    enableSchemaRequest: true,
  });
}

const monacoConfig: NgxMonacoEditorConfig = {
  onMonacoLoad,
  baseUrl: 'assets',
  defaultOptions: { scrollBeyondLastLine: false },
};
@NgModule({
  imports: [
    WorkspaceRoutingModule,
    ThemeModule,
    AuthModule,
    NbAccordionModule,
    UploadModule,
    DragDropModule,
    FileSaverModule,
    NbAccordionModule,
    NbCardModule,
    NbDialogModule.forChild(),
    NbToastrModule.forRoot(),
    MonacoEditorModule.forRoot(monacoConfig),
    ColorPickerModule,
  ],
  declarations: [...ENTRY_COMPONENTS, ...PAGES_COMPONENTS, SafeStylePipe],
  entryComponents: [...ENTRY_COMPONENTS],
  schemas: [NO_ERRORS_SCHEMA],
})
export class WorkspaceModule {
}
