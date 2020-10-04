import { ILogin } from '../../shared/models/auth';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NbToastrService } from '@nebular/theme';
import { take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import platformDetect from 'platform-detect';

@Component({
  selector: 'ngx-app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  user: ILogin = { username: null, password: null };
  sub: any;
  landingUrl = environment.landingUrl;
  passwordType = 'password';
  web = platformDetect.web;
  activeSamlAuth: [] = [];
  ApiUrl = environment.api;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
  ) { }

  ngOnInit() {
    (document.querySelector('.bg-logo') as HTMLElement).style.background = 'none';
    this.auth.getAutoLoginStatue().subscribe((status) => {
      if (!status) {
        this.toast.show(`User does not exist!`, 'Sorry', { status: 'danger' });
      }
    });
    this.sub = this.route
      .queryParams
      .subscribe((params) => {
        this.user.username = params['email'] || '';
      });
    this.auth.currentUserObs.pipe(take(1))
      .subscribe((user) => {
        if (user) {
          this.router.navigate(['/workspace']);
        }
      });
    this.auth.getActiveSaml().subscribe((res) => {
      this.activeSamlAuth = res;
    });
  }

  showPwd() {
    this.passwordType = this.passwordType === 'text' ? 'password' : 'text';
  }

  login() {
    this.auth.login(this.user)
      .subscribe((res) => {
        this.router.navigate(['/workspace']);
      }, (error) => {
        this.toast.show(`Invalid email or password!`, 'Sorry', { status: 'danger' });
        console.error('error', error);
      });
  }

  redirectToSSO(samlVendor: string) {
    window.location.href = `${environment.api}/auth/${samlVendor}`;
  }
}
