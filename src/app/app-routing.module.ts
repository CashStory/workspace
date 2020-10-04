import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuardLogin } from './services/auth-guard-login.service';

const routes: Routes = [
  {
    path: '', loadChildren: () => import('./workspace/workspace.module').then(m => m.WorkspaceModule),
    canActivate: [AuthGuardLogin],
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: '**', redirectTo: '/' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
