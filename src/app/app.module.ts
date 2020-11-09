import { FocusService } from './services/focus.service';
/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */
import { APP_BASE_HREF } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { UUID } from 'angular2-uuid';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthService, tokenGetter, authScheme } from './services/auth.service';
import { AuthGuardLogin } from './services/auth-guard-login.service';
import { AuthGuardAdmin } from './services/auth-guard-admin.service';
import { WorkspaceService } from './services/workspace.service';
import { NewsService } from './services/news.service';
import { JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { NbToastrModule } from '@nebular/theme';

import { environment } from '../environments/environment';
import { UploadService } from './services/upload.service';
import { SpeechService } from './services/speech-service';
import { UserService } from './services/user.service';
import { MonacoEditorModule } from 'ngx-monaco-editor';
import { SmartTableService } from './services/smart-table.service';
import { EnvService } from './services/env.service';
import { ThemeModule } from './@theme/theme.module';
import { CookieService } from 'ngx-cookie-service';
import { RequestAccessComponent } from './workspace/request-access/request-access.component';
import { TemplateApplyComponent } from './workspace/template-apply/template-apply.component';

export function jwtOptionsFactory() {
  return {
    tokenGetter,
    authScheme,
    whitelistedDomains: environment.whitelistedDomains,
  };
}

@NgModule({
  declarations: [
    AppComponent,
    RequestAccessComponent,
    TemplateApplyComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    NgbModule,
    NbToastrModule.forRoot(),
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
      },
    }),
    ThemeModule.forRoot(),
    MonacoEditorModule.forRoot(),
  ],
  bootstrap: [
    AppComponent,
  ],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/' },
    AuthService,
    EnvService,
    UploadService,
    SpeechService,
    UserService,
    SmartTableService,
    AuthGuardLogin,
    AuthGuardAdmin,
    WorkspaceService,
    UUID,
    NewsService,
    FocusService,
    CookieService,
  ],
})
export class AppModule {
}
