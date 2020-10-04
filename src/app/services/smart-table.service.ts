import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ISmartTable } from '../shared/models/auth';

@Injectable()
export class SmartTableService {
  constructor(private http: HttpClient) { }

  get(smartTable: Partial<ISmartTable>, query = null, observe = 'response' as 'body'): Observable<any> {
    const httpOptions = {
      observe,
      params: new HttpParams(),
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    if (query) {
      httpOptions.params = query;
    }
    return this.http.get<any[]>(`${environment.api}/smarttables/${smartTable.database}/${smartTable.collection}`,
      httpOptions);
  }

  count(smartTable: ISmartTable, query = null): Observable<number> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
      params: query,
    };
    return this.http.get<number>(`${environment.api}/smarttables/${smartTable.database}/${smartTable.collection}/count`,
      httpOptions);
  }

  add(smartTable: ISmartTable, doc): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.post<any>(`${environment.api}/smarttables/${smartTable.database}/${smartTable.collection}`,
      doc, httpOptions);
  }

  edit(smartTable: ISmartTable, doc): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.put(`${environment.api}/smarttables/${smartTable.database}/${smartTable.collection}/${doc._id}`,
      doc, httpOptions);
  }

  delete(smartTable: ISmartTable, doc): Observable<any> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    return this.http.delete(`${environment.api}/smarttables/${smartTable.database}/${smartTable.collection}/${doc._id}`,
      httpOptions);
  }

}
