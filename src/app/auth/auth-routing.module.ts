import { ResetpwdComponent } from './reset-pwd/reset-pwd.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { BaseComponent } from './base/base';

const routes: Routes = [{
  path: '',
  component: BaseComponent,
  children: [
    {
      path: 'login',
      component: LoginComponent,
    },
    {
      path: 'logout',
      component: LogoutComponent,
    },
    {
      path: 'reset-pwd',
      component: ResetpwdComponent,
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {
}
