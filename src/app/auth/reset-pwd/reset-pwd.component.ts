import { environment } from './../../../environments/environment';
import { UserService } from './../../services/user.service';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'ngx-reset-pwd',
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-pwd.component.scss'],
})
export class ResetpwdComponent implements OnInit {

  landingUrl = environment.landingUrl;
  registerMailForm: FormGroup;
  email = new FormControl('', [
    Validators.required,
    Validators.minLength(9),
    Validators.maxLength(100),
    Validators.pattern('[a-zA-Z0-9.-]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}'),
  ]);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toast: NbToastrService,
    private userService: UserService,
  ) { }
  sub: any;

  ngOnInit() {
    this.registerMailForm = this.formBuilder.group({
      email: this.email,
    });

    this.sub = this.route
      .queryParams
      .subscribe((params) => {
        if (params['email']) {
          this.email = params['email'];
        }
      });

  }
  sendMailToken() {
    this.userService.resetpwd(this.email.value)
      .subscribe(() => {
        this.toast.show(`New password send!`, 'Guess what', { status: 'success' });
        this.router.navigate(['/login']);
      }, (error) => {
        console.error(error);
        this.toast.show(`Email does not exist!`, 'Sorry', { status: 'danger' });
      });
  }
}
