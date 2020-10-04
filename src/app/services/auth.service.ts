import { WorkspaceService } from './workspace.service';
import { map, take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { IUser } from '../shared/models/user';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IWp, IWorkspace, ISection, IBox } from '../shared/models/workspace';
import { ILogin } from '../shared/models/auth';
import * as stringSimilarity from 'string-similarity';
import { IFavorite } from '../shared/models/favorite';
import { CookieService } from 'ngx-cookie-service';
import { FormGroup } from '@angular/forms';

declare global {
  interface Window { dataLayer: {}[]; }
}

export function tokenGetter() {
  return localStorage.getItem('token');
}

export function authScheme() {
  return localStorage.getItem('authScheme');
}

window.dataLayer = window.dataLayer || [];
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token;
  private loggedIn = false;
  isAdmin = false;
  currentUserObs = new ReplaySubject<IUser>(1);
  currentWpObs = new ReplaySubject<IWp>(1);
  currentWorkspaceObs = new ReplaySubject<IWorkspace>(1);
  private _Workspace: IWorkspace;
  private _Wp: IWp;
  private _User: IUser;
  private autoLoginStatue: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private autoLoginUrlParam: string = '?autologin=';

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private workspaceService: WorkspaceService,
    private jwtHelper: JwtHelperService) {
    if (authScheme() == null) {
      localStorage.setItem('authScheme', 'Bearer ');
    }
    const cookieTokenName = 'auto-login-token';
    const redirect: string = localStorage.getItem('redirect');
    if (this.cookieService.check(cookieTokenName)) {
      const token = this.cookieService.get(cookieTokenName);
      if (token === 'auth-failed') {
        localStorage.removeItem('token');
        localStorage.removeItem('authScheme');
        this.setAutoLoginStatue(false);
      } else {
        localStorage.setItem('token', token);
        localStorage.setItem('authScheme', 'Bearer ');
      }
      this.cookieService.delete(cookieTokenName, '/', this.getHostCookieName());
    }
    const originalUrl = window.location.href;
    if (originalUrl.includes(this.autoLoginUrlParam)) {
      const decodedToken = originalUrl.split(this.autoLoginUrlParam)[1];
      localStorage.setItem('token', decodedToken);
      localStorage.setItem('authScheme', 'Basic ');
    }
    this.token = tokenGetter();
    this.getDecodeUser();
    this.currentWpObs.subscribe((workspaceCurrent) => {
      this._Wp = workspaceCurrent;
      if (this._Wp) {
        this.editMyWp(workspaceCurrent)
          .pipe(take(1)).subscribe();
        if (!this._Workspace || (this._Workspace._id !== this._Wp.id)) {
          this.workspaceService.getById(this._Wp.id)
            .pipe(take(1))
            .subscribe((workspace) => {
              this._Workspace = workspace;
              this.feedWpWithLogoANdName();
              this.currentWorkspaceObs.next(workspace);
            });
        }
      }
    });
    if (redirect) {
      localStorage.removeItem('redirect');
      this.router.navigate([redirect]);
    }
  }

  checkIframeAllowed(url: string): Observable<any> {
    return this.http.post<any>(`${environment.api}/test_iframe`, { url });
  }

  runNotebook(url: string): Observable<any> {
    return this.http.post<any>(`${environment.api}/notebook`, { url });
  }

  getAutoLoginStatue(): Observable<boolean> {
    return this.autoLoginStatue;
  }

  setAutoLoginStatue(statue: boolean) {
    return this.autoLoginStatue.next(statue);
  }

  getHostCookieName() {
    let hostName = window.location.hostname;
    const parts = hostName.split('.').reverse();
    if (parts !== null && parts.length > 1) {
      hostName = `${parts[1]}.${parts[0]}`;
    }
    return `.${hostName}`;
  }

  findSectionBox(name: string): { input: string, intent: string, workspace: string, section: number, box: string, factor: number } {
    // const minFactor = 0.8;
    const searchName = (name ? name : '').toLowerCase();
    let bestMatch: {
      input: string,
      intent: string,
      workspace: string,
      section: number, box: string, factor: number,
    } = { input: searchName, intent: null, workspace: null, section: null, box: null, factor: 0 };
    if (this._Workspace) {
      for (let i = 0; i < this._Workspace.sections.length; i += 1) {
        const section = this._Workspace.sections[i];
        for (let y = 0; y < section.box.length; y += 1) {
          const box = section.box[y];
          const boxName = (box.name ? box.name : '').toLowerCase();
          const matchBox = {
            intent: box.name,
            input: searchName,
            workspace: this._Workspace._id,
            section: section.id,
            box: box._id,
            factor: stringSimilarity.compareTwoStrings(boxName, searchName),
          };
          if (matchBox.factor > bestMatch.factor) {
            bestMatch = matchBox;
          }
        }
        const sectionName = (section.title ? section.title : '').toLowerCase();
        const matchSection = {
          intent: section.title,
          input: searchName,
          workspace: this._Workspace._id,
          section: section.id,
          box: null,
          factor: stringSimilarity.compareTwoStrings(sectionName, searchName),
        };
        if (matchSection.factor > bestMatch.factor) {
          bestMatch = matchSection;
        }
      }
    }
    return bestMatch;
  }

  getSectionById(sectionId) {
    for (let index = 0; index < this._Workspace.sections.length; index += 1) {
      if (this._Workspace.sections[index].id === sectionId) {
        return this._Workspace.sections[index];
      }
    }
    return null;
  }

  isFav(wp: IWp) {
    if (!this._User) {
      return false;
    }
    return this._User.workspaces[this._Workspace._id].favorites.boxes
        .find((val, index) => {
          if (val.wp && val.wp.box === wp.box
            && val.wp.id === wp.id
            && val.wp.section === wp.section) {
            return true;
          }
        });
  }

  getDefaultBox(sectionId): string {
    if (this._Workspace && sectionId) {
      const section = this.getSectionById(sectionId);
      if (section) {
        const boxs = section.box;
        if (boxs) {
          for (let i = 0; i < boxs.length; i += 1) {
            if (boxs[i].autoExpand) {
              return boxs[i]._id;
            }
          }
        }
      }
    }
    return null;
  }

  feedWpWithLogoANdName() {
    let hasChange = false;
    if (this._Wp && this._Wp.id && !this._Wp.logo && this._Workspace) {
      this._Wp.logo = this._Workspace.logo;
      hasChange = true;
    }
    if (this._Wp && this._Wp.id && !this._Wp.name && this._Workspace) {
      this._Wp.name = this._Workspace.name;
      hasChange = true;
    }
    if (hasChange) {
      this.currentWpObs.next(this._Wp);
    }
  }

  getCurrentWorkSpace(): IWorkspace {
    return this._Workspace;
  }

  findBox(workspace: IWorkspace, sectionId: number, boxId: string): IBox {
    const section = this.findSection(workspace, sectionId);
    if (section) {
      return section.box.find(o => o._id === boxId);
    }
    return null;
  }

  findSection(workspace: IWorkspace, sectionId: number): ISection {
    if (workspace) {
      return workspace.sections.find(o => o.id === sectionId);
    }
    return null;
  }

  private getSectionsBoxInSortPosition(section: ISection) {
    const updatedBox = section.box.map((elem, index) => ({ ...elem, position: elem.hasOwnProperty('position') ? elem.position : index }));
    return updatedBox.sort((a, b) => a.position - b.position);
  }

  getCurrentSectionBox(wp: IWp): Promise<{ section: ISection, box: IBox }> {
    return new Promise((resolve, reject) => {
      if (this._Workspace && wp) {
        const section = this.findSection(this._Workspace, wp.section);
        if (section !== undefined && section.box.length > 0) {
          const updatedSectionWithBoxPositions = this.getSectionsBoxInSortPosition(section);
          section.box = updatedSectionWithBoxPositions;
        }
        const box = this.findBox(this._Workspace, wp.section, wp.box);
        resolve({ section: section === undefined ? null : section, box: box === undefined ? null : box });
      } else {
        this.currentWorkspaceObs
          .pipe(take(1))
          .subscribe((currentWorkspace) => {
            if (currentWorkspace && wp) {
              const section = this.findSection(currentWorkspace, wp.section);
              const box = this.findBox(currentWorkspace, wp.section, wp.box);
              resolve({ section: section === undefined ? null : section, box: box === undefined ? null : box });
            }
          }, (err) => {
            reject(err);
          });
      }
    });
  }

  private updatecurrentWpObs(currentWp: IWp, currentWorkspace: IWorkspace, sectionId: number, boxId: string) {
    const section = sectionId === undefined ? currentWp.section : (this.findSection(currentWorkspace, sectionId) ? sectionId : null);
    const box = boxId === undefined ? currentWp.box : (this.findBox(currentWorkspace, sectionId, boxId) ? boxId : null);
    const updatedWp: IWp = {
      section,
      box,
      name: currentWp.name,
      id: currentWp.id,
      logo: currentWp.logo,
    };
    if (updatedWp !== this._Wp) {
      this.currentWpObs.next(updatedWp);
    }
  }

  updateSectionBox(sectionId: number, boxId: string) {
    return this.currentWpObs
      .pipe(take(1))
      .subscribe((currentWp: IWp) => {
        if (currentWp) {
          if (!this._Workspace) {
            this.currentWorkspaceObs
              .pipe(take(1))
              .subscribe((currentWorkspace) => {
                this.updatecurrentWpObs(currentWp, currentWorkspace, sectionId, boxId);
              });
          } else {
            this.updatecurrentWpObs(currentWp, this._Workspace, sectionId, boxId);
          }
        }
      });
  }

  async event(prev: any, next: any, meta: any): Promise<any> {
    return await this.http.post<any>(`${environment.api}/users/me/event`, { prev, next, meta })
      .subscribe(() => { });
  }

  eventBeacon(prev: any, next: any, meta: any): boolean {
    const data = `prev=${prev}&next=${next}&meta${meta}`;
    return navigator.sendBeacon(`${environment.api}/users/me/event`, data);
  }

  isAuthenticated() {
    return (authScheme() != null && authScheme().indexOf('Basic ') !== -1) ? true : !this.jwtHelper.isTokenExpired(this.token);
  }

  private loginApi(credentials: ILogin): Observable<any> {
    return this.http.post<any>(`${environment.api}/auth/login`, credentials);
  }

  private getDecodeUser() {
    return new Promise((resolve, reject) => {
      if (this.token) {
        this.getMe()
          .pipe(take(1))
          .subscribe((me) => {
            if (me) {
              this.setCurrentUser(me);
            } else {
              this.logout();
            }
            resolve('ok');
          }, (err) => {
            console.error('Oops:', err.message);
            this.logout();
          });
      } else {
        this.logout();
        resolve('ko');
      }
    });
  }
  private getMe(): Observable<IUser> {
    return this.http.get<IUser>(`${environment.api}/users/me`);
  }

  getActiveSaml(): Observable<any> {
    return this.http.get<IUser>(`${environment.api}/auth/saml`);
  }

  addFav(favorite: IFavorite, userWs = false): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<IUser>(`${environment.api}/users/me/favorite`, favorite, { responseType: 'json' })
        .subscribe((user) => {
          this.currentUserObs
            .pipe(take(1))
            .subscribe(async () => {
              resolve(await this.getCurrentSectionBox(this._Wp));
            }, (err) => {
              reject(err);
            });
          this.currentUserObs.next(user);
          this._User = user;
        }, (err) => {
          console.error('error add', err);
          reject(err);
        });
    });
  }

  delFav(favorite: IFavorite): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http.post<IUser>(`${environment.api}/users/me/favorite/del`, favorite, { responseType: 'json' })
        .subscribe((user) => {
          this.currentUserObs
            .pipe(take(1))
            .subscribe(async () => {
              resolve(await this.getCurrentSectionBox(this._Wp));
            }, (err) => {
              reject(err);
            });
          this.currentUserObs.next(user);
          this._User = user;
        }, (err) => {
          console.error('error del', err);
          reject(err);
        });
    });
  }

  editMe(user: Partial<IUser>): Observable<IUser> {
    return this.http.put<IUser>(`${environment.api}/users/me`, user, { responseType: 'json' });
  }

  updatePassword(user: Partial<IUser>, passwordObj): Observable<IUser> {
    return this.http.put<IUser>(`${environment.api}/users/me/password`, { user, passwordObj }, { responseType: 'json' });
  }

  editMyWp(currentWp: IWp): Observable<IWp> {
    return this.http.put<IWp>(`${environment.api}/users/me/wp`, currentWp, { responseType: 'json' });
  }

  deleteMe(): Observable<IUser> {
    if (this.token) {
      const decodedUser = this.decodeUserFromToken(this.token);
      return this.http.delete<IUser>(`${environment.api}/users/${decodedUser._id}`, { responseType: 'json' });
    }
  }

  login(emailAndPassword: ILogin) {
    return this.loginApi(emailAndPassword)
      .pipe(take(1), map((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('authScheme', 'Bearer ');
        this.token = res.token;
        this.getDecodeUser();
        return this.loggedIn;
      },
      ));
  }

  logout() {
    if (localStorage.getItem('token')) {
      this.event({}, {}, { event: 'logout', date: new Date() });
    }
    localStorage.removeItem('token');
    localStorage.removeItem('authScheme');
    this.cookieService.delete('auto-login-token', '/', this.getHostCookieName());
    this.loggedIn = false;
    this._Workspace = null;
    this.token = undefined;
    this.currentWpObs.next(null);
    this.currentWorkspaceObs.next(null);
    this.currentUserObs.next(null);
    this.isAdmin = false;
    this.router.navigate(['/auth/login']);
  }

  decodeUserFromToken(token: string) {
    return this.jwtHelper.decodeToken(token);
  }

  setCurrentUser(user: IUser) {
    if (!this.loggedIn) {
      const allWp = Object.keys(user.workspaces);
      if (user.workspaceCurrent && allWp.indexOf(user.workspaceCurrent.id) === -1
        && user.role !== 'admin') {
        delete user.workspaceCurrent;
      }
      if (!user.workspaceCurrent) {
        const firstWp = allWp.shift();
        user.workspaceCurrent = {
          id: firstWp,
          name: user.workspaces[firstWp].name,
        };
      }
      if (user.workspaceCurrent !== this._Wp) {
        this.currentWpObs.next(user.workspaceCurrent);
      }
      this.loggedIn = true;
      this.isAdmin = user.role === 'admin' ? true : false;
      window.dataLayer.push({
        event: 'eventGA',
        eventCategory: 'Account',
        eventAction: 'Login',
        eventLabel: user._id,
      });
    } else {
      window.dataLayer.push({
        user: {
          userId: this.loggedIn ? user._id : undefined,
          loginState: this.loggedIn,
        },
      });
    }
    this.currentUserObs.next(user);
    this._User = user;
  }
  addNewBoxToWorkSpace(newBox: IBox): Promise<any> {
    const workspace = this._Workspace._id;
    const section = this._Wp.section;
    return new Promise((resolve, reject) => {
      this.http.post<IWorkspace>(`${environment.api}/workspaces/${workspace}/section/${section}/box`, newBox, { responseType: 'json' })
        .subscribe(async (UpdatedWP) => {
          this._Workspace = UpdatedWP;
          resolve(await this.getCurrentSectionBox(this._Wp));
        }, (err) => {
          console.error('error: ', err);
          reject(err);
        });
    });
  }
  editBox(boxId, body): Promise<any> {
    const workspace = this._Workspace._id;
    const section = this._Wp.section;
    return new Promise((resolve, reject) => {
      this.http.put<IWorkspace>(`${environment.api}/workspaces/${workspace}/section/${section}/box/${boxId}`, body,
        { responseType: 'json' })
        .subscribe(async (UpdatedWP) => {
          this._Workspace = UpdatedWP;
          resolve(await this.getCurrentSectionBox(this._Wp));
        }, (err) => {
          console.error('error: ', err);
          reject(err);
        });
    });
  }
  updateBoxPositions(body): Promise<any> {
    const workspace = this._Workspace._id;
    const section = this._Wp.section;
    return new Promise((resolve, reject) => {
      this.http.put<IWorkspace>(`${environment.api}/workspaces/${workspace}/section/${section}/box`, body,
        { responseType: 'json' })
        .subscribe(async (UpdatedWP) => {
          this._Workspace = UpdatedWP;
          resolve(await this.getCurrentSectionBox(this._Wp));
        }, (err) => {
          console.error('error: ', err);
          reject(err);
        });
    });
  }
  removeBoxFromSection(boxId): Promise<any> {
    const workspace = this._Workspace._id;
    const section = this._Wp.section;
    return new Promise((resolve, reject) => {
      this.http.delete<IWorkspace>(`${environment.api}/workspaces/${workspace}/section/${section}/box/${boxId}`,
        { responseType: 'json' })
        .subscribe(async (UpdatedWP) => {
          this._Workspace = UpdatedWP;
          resolve(await this.getCurrentSectionBox(this._Wp));
        }, (err) => {
          console.error('error: ', err);
          reject(err);
        });
    });
  }

  matchingPasswords(currentPassword: string, newPassword: string) {
    return (group: FormGroup): {[key: string]: any} => {
      const existingPassword = group.controls[currentPassword];
      const PasswordToBeUpdate = group.controls[newPassword];
      if (existingPassword.value === PasswordToBeUpdate.value) {
        return {
          matchingPasswords: { value: 'same password' },
        };
      }
      return  null;
    };
  }

  duplicateWP(user_workspace) {
    return this.http.post(`${environment.api}/workspaces/duplicate`, user_workspace);
  }

}
