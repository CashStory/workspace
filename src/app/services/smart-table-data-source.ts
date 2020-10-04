import { ISmartTable } from '../shared/models/auth';
import { ServerDataSource } from 'ng2-smart-table';
import { HttpParams, HttpErrorResponse } from '@angular/common/http';
import { SmartTableService } from './smart-table.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs';

export class SmartTableDataSource extends ServerDataSource {

  protected lastRequestCount: number = 0;
  protected lastPage: number = 0;
  protected lastRequestId: string = null;
  protected firstRequestId: string = null;
  private pagerLastKey: string = 'lastId';
  private pagerFirstKey: string = 'firstId';
  private smartTable: ISmartTable;
  private loaderStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(public smartTableService: SmartTableService, smartTable: ISmartTable) {
    super(null, {
      endPoint: 'cs',
      filterFieldKey: 'search',
      sortFieldKey: 'sort',
      pagerLimitKey: 'limit',
      pagerPageKey: 'skip',
    });
    this.smartTable = smartTable;
  }

  count(): number {
    return this.lastRequestCount;
  }

  getLoaderStatus(): Observable<boolean> {
    return this.loaderStatus;
  }

  getElements(): Promise<any> {
    this.loaderStatus.next(true);
    const httpParams = this.createRequesParams();
    return this.smartTableService
      .get(this.smartTable, httpParams)
      .pipe(map(async (res) => {
        if (res.headers.has(this.conf.totalKey)) {
          this.lastRequestCount = 0 + res.headers.get(this.conf.totalKey);
          if (res.body.length > 0) {
            this.lastRequestId = res.body[res.body.length - 1]._id;
            this.firstRequestId = res.body[0]._id;
          }
          this.lastPage = 0 + this.pagingConf['page'];
          // console.log('this.lastRequestId', this.lastRequestId);
        }
        this.loaderStatus.next(false);
        this.data = res.body;
        return res.body;
      }))
      .catch((err: HttpErrorResponse): any => {
        this.loaderStatus.next(false);
        console.error('An error occurred:', err.error);
      })
      .toPromise();
  }

  protected createRequesParams(): HttpParams {
    let httpParams = new HttpParams();
    httpParams = this.addSortRequestParams(httpParams);
    httpParams = this.addFilterRequestParams(httpParams);
    httpParams = this.addPagerRequestParams(httpParams);
    return httpParams;
  }

  protected addSortRequestParams(httpParams: HttpParams): HttpParams {
    if (this.sortConf) {
      const sorts = {};
      this.sortConf.forEach((fieldConf) => {
        sorts[fieldConf.field] = fieldConf.direction === 'asc' ? 1 : -1;
      });
      if (Object.keys(sorts).length > 0) {
        // tslint:disable-next-line: no-parameter-reassignment
        httpParams = httpParams.set(this.conf.sortFieldKey, JSON.stringify(sorts));
      }
    }

    return httpParams;
  }

  protected addFilterRequestParams(httpParams: HttpParams): HttpParams {
    if (this.filterConf.filters) {
      const filters = {};
      this.filterConf.filters.forEach((fieldConf: any) => {
        if (fieldConf['search'] && fieldConf['field'] === '_id') {
          filters[fieldConf['field']] = fieldConf['search'];
        } else if (fieldConf['search']) {
          filters[fieldConf['field']] = {
            $regex: fieldConf['search'],
            $options: 'i',
          };
        }
      });
      // if (this.lastRequestId) {
      //   filters['_id'] = { $gt: this.lastRequestId };
      // }
      if (Object.keys(filters).length > 0) {
        // tslint:disable-next-line: no-parameter-reassignment
        httpParams = httpParams.set(this.conf.filterFieldKey, JSON.stringify(filters));
      }
    }
    return httpParams;
  }

  protected addPagerRequestParams(httpParams: HttpParams): HttpParams {
    if (this.pagingConf && this.pagingConf['page'] && this.pagingConf['perPage']) {
      const skip = this.pagingConf['perPage'] * (this.pagingConf['page'] - 1);
      // tslint:disable-next-line: no-parameter-reassignment
      httpParams = httpParams.set(this.conf.pagerPageKey, `${skip}`);
      if (this.lastRequestId && this.pagingConf['page'] === this.lastPage + 1) {
        // tslint:disable-next-line: no-parameter-reassignment
        httpParams = httpParams.set(this.pagerLastKey, `${this.lastRequestId}`);
      } else if (this.firstRequestId && this.pagingConf['page'] === this.lastPage - 1) {
        // tslint:disable-next-line: no-parameter-reassignment
        httpParams = httpParams.set(this.pagerFirstKey, `${this.firstRequestId}`);
      }
      // tslint:disable-next-line: no-parameter-reassignment
      httpParams = httpParams.set(this.conf.pagerLimitKey, this.pagingConf['perPage']);
    }
    return httpParams;
  }

  public delete(doc): Observable<any> {
    this.loaderStatus.next(true);
    return this.smartTableService.delete(this.smartTable, doc).map((response) => {
      this.loaderStatus.next(false);
      return response;
    })
      .first();
  }

  public updateDoc(doc): Observable<any> {
    this.loaderStatus.next(true);
    return this.smartTableService.edit(this.smartTable, doc).map((response) => {
      this.loaderStatus.next(false);
      return response;
    })
      .first();
  }
  public addData(doc: any): Observable<any> {
    this.loaderStatus.next(true);
    return this.smartTableService.add(this.smartTable, doc).map((response) => {
      this.loaderStatus.next(false);
      return response;
    })
      .first();
  }
}
