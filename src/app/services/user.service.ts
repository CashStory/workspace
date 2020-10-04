import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUser } from '../shared/models/user';
import { environment } from '../../environments/environment';

@Injectable()
export class UserService {

  constructor(private http: HttpClient) { }

  resetpwd(email: string): Observable<IUser> {
    return this.http.post<IUser>(`${environment.api}/auth/resetpwd`, { email });
  }

}
