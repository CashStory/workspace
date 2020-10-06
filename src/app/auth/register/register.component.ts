import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NbToastrService } from '@nebular/theme';
import { environment } from 'environments/environment';

@Component({
  selector: 'ngx-register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {
  ApiUrl = environment.api;

  showMessages: any = {
    success: true,
    error: true,
  };
  validation = {
    password: {
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    confirmPassword: {
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    email: {
      required: true,
    },
    full_name: {
      required: false,
      minLength: 4,
      maxLength: 50,
    },
  };
  submitted = false;
  errors: string[] = [];
  messages: string[] = [];
  user: any = {
    full_name: null,
    email: null,
    password: null,
    confirmPassword: null,
    terms: false,
  };
  activeSamlAuth: [] = [];

  constructor(private auth: AuthService,
              private toast: NbToastrService,
              protected router: Router) {
                this.user = {
                  full_name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  terms: false,
                };
  }
  ngOnInit() {
    console.log('this.user', this.user);

    this.auth.getActiveSaml().subscribe((res) => {
      this.activeSamlAuth = res;
    });
  }
  register(): void {
    this.errors = this.messages = [];
    this.submitted = true;
    this.auth.register(this.user)
    .subscribe((res) => {
      this.toast.show('Registred succesfully!', 'Success!', { status: 'success' });
      this.auth.login({ username: this.user.email, password: this.user.password })
      .subscribe(() => {
        this.router.navigate(['/']);
      }, (error) => {
        this.toast.show(`Invalid email or password!`, 'Sorry', { status: 'danger' });
      });
    }, (error) => {
      this.toast.show(error.error.message, 'Sorry', { status: 'danger' });
      this.submitted = false;
    });
  }

  redirectToSSO(samlVendor: string) {
    window.location.href = `${environment.api}/auth/${samlVendor}`;
  }

}
