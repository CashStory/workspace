import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'ngx-base',
  styleUrls: ['./base.scss'],
  template: `
  <nb-layout>
  <nb-layout-column class="bg-white bg-logo">
      <nb-card-header>
        <nav class="navigation">
          <a *ngIf="!isLoginPage()" href="#" (click)="back()" class="link" aria-label="Back">
          <nb-icon icon="arrow-back" class="h4"></nb-icon>
          </a>
        </nav>
      </nb-card-header>
      <nb-card-body class="w-100 w-md-75 px-3 mx-md-auto">
      <div class="nb-auth-block">
          <router-outlet></router-outlet>
      </div>
      </nb-card-body>
  </nb-layout-column>
</nb-layout>`,
})
export class BaseComponent implements OnInit {

  constructor(protected location: Location) { }

  ngOnInit() {
  }

  isLoginPage () {
    return window.location.href.indexOf('/auth/login') > -1;
  }

  back() {
    this.location.back();
  }
}
