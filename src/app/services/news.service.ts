import { IWorspaceConfig } from '../shared/models/user';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, Subscription, throwError } from 'rxjs';
import { SmartTableService } from './smart-table.service';

export class NewsPost {
  uuid: string;
  title: string;
  link: string;
  img: string;
  score: number;
  duplicatesCount: number;
  source: string;
  sourceImg: string;
  sourceId: string;
  sourceFollowers: number;
  sourceUrl: string;
  text: string;
  lang: string;
  category: string;
  creator: string;
  publishTime: string;
}

@Injectable()
export class NewsService {

  private lastId: string = null;
  private database: string = 'api-news';
  private collection: string = 'news';

  constructor(public smartTableService: SmartTableService) { }

  load(page: number, pageSize: number, workspaceConfig: IWorspaceConfig): Observable<NewsPost[]> {
    const skip = (page - 1) * pageSize;
    let params = new HttpParams()
      .set('sort', '{"publishTime":-1}')
      .set('skip', String(skip))
      .set('limit', String(pageSize));
    if (this.lastId) {
      params = params
        .set('lastId', String(this.lastId));
    }
    if (workspaceConfig && workspaceConfig.news) {
      const search: any = {};
      let request = false;
      if (workspaceConfig.news.lang) {
        search.lang = workspaceConfig.news.lang;
        request = true;
      }
      if (workspaceConfig.news.sources && workspaceConfig.news.sources.length > 0) {
        search.sources = workspaceConfig.news.sources.toString();
        request = true;
      }
      if (workspaceConfig.news.categories && workspaceConfig.news.categories.length > 0) {
        search.categories = workspaceConfig.news.categories.toString();
        request = true;
      }
      if (request) {
        params = params.append('search', JSON.stringify(search));
      }
    }
    return new Observable((subscriber) => {
      this.smartTableService
        .get({ database: this.database, collection: this.collection }, params, 'body')
        .subscribe((data) => {
          if (data && data.length && data.length > 0) {
            this.lastId = data[data.length - 1]._id;
          }
          subscriber.next(data);
          subscriber.complete();
        }, (err) => {
          throwError(err);
        });
    });
  }
}
