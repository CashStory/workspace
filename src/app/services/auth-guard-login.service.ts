import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
@Injectable({
  providedIn: 'root',
})
export class AuthGuardLogin implements CanActivate {

  constructor(public auth: AuthService, public router: Router) { }

  canActivate() {
    if (!this.auth.isAuthenticated()) {
      this.auth.logout();
      return false;
    }
    return true;
  }

}
