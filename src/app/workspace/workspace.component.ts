import { IWorkspace } from './../shared/models/workspace';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { MENU_ITEMS } from './workspace-menu-base';
import { AuthService } from '../services/auth.service';
import { NbIconLibraries, NbMenuService } from '@nebular/theme';
import { NavigationStart, Router } from '@angular/router';
import { environment } from '../../environments/environment';

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}

@Component({
  selector: 'ngx-pages',
  template: `
    <ngx-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-layout>
  `,
})
export class WorkspaceComponent implements OnInit, OnDestroy {

  menu = [];
  dashboard = {
    title: 'Dashboard',
    icon: 'home',
    link: '/dashboard',
  };
  currentWorkspace: IWorkspace;
  chatToggleStatus: boolean = false;
  crispKeyLoaded: boolean = !!environment.crispWebsiteId;
  constructor(
    private auth: AuthService,
    private iconLibraries: NbIconLibraries,
    private menuService: NbMenuService,
    private router: Router,
  ) {
    this.iconLibraries.registerFontPack('fab', { packClass: 'fab', iconClassPrefix: 'fa' });
    this.iconLibraries.registerFontPack('fas', { packClass: 'fas', iconClassPrefix: 'fa' });
    this.iconLibraries.registerFontPack('fad', { packClass: 'fad', iconClassPrefix: 'fa' });
    this.iconLibraries.registerFontPack('fal', { packClass: 'fal', iconClassPrefix: 'fa' });
    this.iconLibraries.registerFontPack('far', { packClass: 'far', iconClassPrefix: 'fa' });
    this.iconLibraries.setDefaultPack('fal'); // <---- set as default
    this.menuService.onItemClick().subscribe((event) => {
      if (this.crispKeyLoaded) {
        this.toggleChat(event.item.title);
      }
    });
    router.events.forEach((event) => {
      if (event instanceof NavigationStart && this.chatToggleStatus && this.crispKeyLoaded) {
        this.chatToggleStatus = false;
        (document.querySelector('.crisp-client') as HTMLElement).style.display = 'none';
      }
    });

    // Crisp Chat Plugin
    if (this.crispKeyLoaded) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = environment.crispWebsiteId;
      const d = document;
      const s = d.createElement('script');
      s.src = 'https://client.crisp.chat/l.js';
      s.async = Boolean(1);
      d.getElementsByTagName('head')[0].appendChild(s);
    }
  }

  ngOnInit() {
    this.resetMenu();
    this.getDashboard();
  }

  toggleChat(menuTitle) {
    if (menuTitle === 'Assistance') {
      if (!this.chatToggleStatus) {
        this.chatToggleStatus = true;
        if (window.$crisp.is('chat:closed')) {
          window.$crisp.push(['do', 'chat:open']);
        }
        (document.querySelector('.crisp-client') as HTMLElement).style.display = 'block';
      } else {
        this.chatToggleStatus = false;
        (document.querySelector('.crisp-client') as HTMLElement).style.display = 'none';
      }

    }
  }

  ngOnDestroy() {
    if (this.crispKeyLoaded) {
      this.chatToggleStatus = false;
      (document.querySelector('.crisp-client') as HTMLElement).style.display = 'none';
    }
  }

  setHomeMobile() {
    if (window.screen.width < 768) {
      this.menu.unshift(this.dashboard);
    }
  }

  resetMenu() {
    this.menu.length = 0;
    MENU_ITEMS.forEach((item) => {
      this.menu.push(item);
    });
  }

  getDashboard() {
    this.auth.currentWorkspaceObs.subscribe((currentWorkspace) => {
      if (currentWorkspace) {
        if (!this.currentWorkspace || (this.currentWorkspace && this.currentWorkspace._id !== currentWorkspace._id)) {
          this.currentWorkspace = currentWorkspace;
          this.resetMenu();
          if (currentWorkspace.menu) {
            currentWorkspace.menu.reverse().forEach((element) => {
              if (!this.menu.find(o => o.title === element.title)) {
                this.menu.unshift({
                  title: element.title,
                  icon: element.icon,
                  link: `/${currentWorkspace._id}/section/${element.sectionId}`,
                });
              }
            });
          }
          this.setHomeMobile();
        }
      }
    });
  }
}
