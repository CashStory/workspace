import { NewsPost, NewsService } from './../../services/news.service';
import { Component, ViewEncapsulation, OnInit, OnChanges } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { combineLatest } from 'rxjs';
import { IWorspaceConfig } from '../../shared/models/user';

@Component({
  selector: 'ngx-dashboard',
  templateUrl: './dashboard.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  news: NewsPost[] = [];
  placeholders: number[] = [];
  loading: boolean = false;
  pageToLoadNext = 1;
  pageSize = 10;
  workspaceConfig: IWorspaceConfig = {
    name: '',
    news: {
      name: 'News',
      lang: 'en',
      class: 'col-12 col-md-6 px-0 px-md-3 order-2 order-md-1',
    },
    favorites: {
      name: 'Favorites',
      boxes: [],
      class: 'col-12 col-md-6 px-0 px-md-3 order-1 order-md-2',
    },
  };

  userworkspaceConfig: IWorspaceConfig = {
    name: '',
    news: {
      name: 'News',
      lang: 'en',
      class: 'col-12 col-md-6 px-0 px-md-3 order-2 order-md-1',
    },
    favorites: {
      name: 'Favorites',
      boxes: [],
      class: 'col-12 col-md-6 px-0 px-md-3 order-1 order-md-2',
    },
  };

  constructor(
    private auth: AuthService,
    private newsService: NewsService,
  ) {
  }

  ngOnInit() {
    this.init();
  }

  ngOnChanges() {
    this.init();
  }

  init() {
    this.auth.updateSectionBox(null, null);
    combineLatest(this.auth.currentUserObs, this.auth.currentWpObs)
      .subscribe(([currentUsr, currentWs]) => {
        if (currentUsr && currentWs) {
          if (currentUsr.workspaces[currentWs.id]) {
            this.workspaceConfig = currentUsr.workspaces[currentWs.id];
          } else {
            this.workspaceConfig.name = currentWs.name;
          }
          this.addDefaultclass();
        }
      });
  }
  addDefaultclass() {
    if (this.workspaceConfig.news && !this.workspaceConfig.news.class) {
      this.workspaceConfig.news.class = 'col-12 col-md-6 px-0 px-md-3 order-2 order-md-1';
    }
    if (this.workspaceConfig.favorites && !this.workspaceConfig.favorites.class) {
      this.workspaceConfig.favorites.class = 'col-12 col-md-6 px-0 px-md-3 order-1 order-md-2';
    }
    if (this.userworkspaceConfig.news && !this.userworkspaceConfig.news.class) {
      this.userworkspaceConfig.news.class = 'col-12 col-md-6 px-0 px-md-3 order-2 order-md-1';
    }
    if (this.userworkspaceConfig.favorites && !this.userworkspaceConfig.favorites.class) {
      this.userworkspaceConfig.favorites.class = 'col-12 col-md-6 px-0 px-md-3 order-1 order-md-2';
    }
  }

  loadNext() {
    if (this.loading) {
      return;
    }
    this.loading = true;
    this.placeholders = [this.pageSize];
    this.newsService.load(this.pageToLoadNext, this.pageSize, this.workspaceConfig)
      .subscribe((nextNews) => {
        this.placeholders = [];

        this.news.push(...nextNews);
        this.loading = false;
        this.pageToLoadNext += 1;
      });
  }
}
