import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-register',
  styleUrls: ['./register.component.scss'],
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit {

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
  }
  ngOnInit() {
    this.auth.getActiveSaml().subscribe((res) => {
      this.activeSamlAuth = res;
    });
  }
  register(): void {
    this.errors = this.messages = [];
    this.submitted = true;

    this.auth.login(this.user)
    .subscribe((res) => {
      this.router.navigate(['/workspace']);
    }, (error) => {
      this.toast.show(`Invalid email or password!`, 'Sorry', { status: 'danger' });
      console.error('error', error);
    });
  }

}
