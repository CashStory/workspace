import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LogoutComponent } from './logout/logout.component';
import { ResetpwdComponent } from './reset-pwd/reset-pwd.component';
import { BaseComponent } from './base/base';
import { ThemeModule } from '../@theme/theme.module';
@NgModule({
  declarations: [
    BaseComponent,
    LoginComponent,
    RegisterComponent,
    LogoutComponent,
    ResetpwdComponent,
  ],
  imports: [
    AuthRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    ThemeModule,
    CommonModule,
  ],
})
export class AuthModule { }
