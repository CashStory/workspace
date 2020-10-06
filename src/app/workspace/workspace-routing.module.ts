import { SelectWSBComponent } from './select-wsb/select-wsb.component';
import { AccountComponent } from './account/account.component';
import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { WorkspaceComponent } from './workspace.component';

const routes: Routes = [{
  path: '',
  component: WorkspaceComponent,
  children: [
    {
      path: 'account',
      component: AccountComponent,
    },
    {
      path: '',
      component: SelectWSBComponent,
    },
    {
      path: ':workspace',
      component: SelectWSBComponent,
    },
    {
      path: ':workspace/dashboard',
      component: SelectWSBComponent,
    },
    {
      path: ':workspace/share',
      component: SelectWSBComponent,
    },
    {
      path: ':workspace/section/:section',
      component: SelectWSBComponent,
    },
    {
      path: ':workspace/section/:section',
      component: SelectWSBComponent,
    },
    {
      path: ':workspace/section/:section/box/:box',
      component: SelectWSBComponent,
    },
    {
      path: '',
      redirectTo: '/',
      pathMatch: 'full',
    },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkspaceRoutingModule {
}
