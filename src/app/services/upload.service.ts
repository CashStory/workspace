import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable()
export class UploadService {

  constructor(private http: HttpClient) { }

  sendFile(form: object): Observable<string> {
    return this.http.post<string>(`${environment.api}/files/send`, form);
  }

  postFile(fileToUpload: File): Observable<{}> {
    const endpoint = `${environment.api}/files`;
    const formData: FormData = new FormData();
    formData.append('myImage', fileToUpload, fileToUpload.name);
    return this.http
      .post(endpoint, formData, {});
  }

  getImage(filename: string): string {
    if (this.isfullpath(filename)) {
      return filename;
    }
    if (filename) {
      return `${environment.api}/files/${filename}`;
    }
    return 'assets/images/avatar.png';
  }

  isfullpath(filename: string): boolean {
    try {
      new URL(filename);
      return true;
    } catch (e) {
      return false;
    }
  }
}
