import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { ResetpwdComponent } from './reset-pwd/reset-pwd.component';
import { BaseComponent } from './base/base';
import { ThemeModule } from '../@theme/theme.module';
@NgModule({
  declarations: [
    BaseComponent,
    LoginComponent,
    LogoutComponent,
    ResetpwdComponent,
  ],
  imports: [
    AuthRoutingModule,
    ThemeModule,
    CommonModule,
  ],
})
export class AuthModule { }
