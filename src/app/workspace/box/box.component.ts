import { FocusService } from '../../services/focus.service';
import { HttpClient } from '@angular/common/http';
import { OnDestroy, OnInit, Input, Component, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { connectToChild } from 'penpal';
import { environment } from '../../../environments/environment';
import { IUser, IService } from '../../shared/models/user';
import { IBox } from '../../shared/models/workspace';
import { AuthService } from '../../services/auth.service';
import { NbToastrService } from '@nebular/theme';

interface Auths {
  [AuthName: string]: {
    before: () => void,
    after: () => void,
  };
}

interface TCParams {
  ANALYTICS_ID?: string;
  DIALOGFLOW_ID?: string;
  API_BASEROUTE?: string;
  USERNAME?: string;
  PASSWORD?: string;
}

@Component({
  selector: 'ngx-box',
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss'],
})
export class BoxComponent implements OnInit, OnDestroy {
  auths: Auths;
  tokenLogin: string;
  urlToOpen: string;
  connectionChild: any;
  user: IUser;
  iFrame: HTMLIFrameElement;
  loading: boolean = true;
  @Input('box') public box: IBox;
  @Input() sectionId: string;
  @Input() workspaceId: string;
  @Output() backAction: EventEmitter<any> = new EventEmitter();
  @ViewChild('iframe', { static: true }) iframe: ElementRef;

  constructor(
    private auth: AuthService,
    public focusService: FocusService,
    public toast: NbToastrService,
    private http: HttpClient,
  ) {
    this.auths = {
      default: {
        before: () => this.beforeSimpleLogin(),
        after: () => this.noop(),
      },
      toucan_cloud: {
        before: () => this.beforeToucanCloud(),
        after: () => this.noop(),
      },
      filestash: {
        before: () => this.beforeFilestash(),
        after: () => this.noop(),
      },
    };
  }

  decodeMessage(e) {
    let decoded;
    try {
      decoded = JSON.parse(e.data);
    } catch (err) {
      decoded = { err, eventHandler: e.data };
    }
    return decoded;
  }

  ngOnDestroy() {
  }

  ngOnInit() {
    this.getUser();
    if (this.box && this.box.url && typeof this.box.iframe !== 'undefined' && !this.box.iframe) {
      window.open(
        this.box.url,
        '_blank');
      this.back();
      return;
    }
    this.checkAuthKey('before');
  }

  checkAuthKey(keyword) {
    if (this.box && this.box.authMethod && this.auths[this.box.authMethod]) {
      this.auths[this.box.authMethod][keyword]();
    } else if (this.box && this.box.authMethod && this.box.authMethod.indexOf('filestash') > -1) {
      this.auths.filestash[keyword]();
    } else if (this.box && this.box.authMethod) {
      this.auths.default[keyword]();
    } else if (keyword === 'before') {
      this.setChildCo(this.box.url, null);
    }
  }

  fullScreen() {
    if (!this.focusService.isFocus()) {
      this.auth.event(this.box, {}, { event: 'fullscreen', date: new Date(), url: window.location.href });
      this.focusService.focus();
    } else {
      this.auth.event(this.box, {}, { event: 'un_fullscreen', date: new Date(), url: window.location.href });
      this.focusService.unFocus();
    }
  }

  getClass() {
    if (this.focusService.isFocus()) {
      return 'col-12 h-100 px-0';
    }
    return this.box.class ? this.box.class : 'col-12 h-100 px-0 px-md-3';
  }

  blank() {
    window.open(
      this.urlToOpen,
      '_blank');
  }

  reload() {
    this.loading = true;
    const urlReload = this.iFrame.src;
    this.iFrame.src = '';
    setTimeout(() => {
      this.setIframe(urlReload);
    }, 500);
  }
  isAllowedFrameOption(frameOption, url) {
    if (!frameOption) {
      return false;
    }
    const options = frameOption.toLowerCase();
    if (options === 'deny' || (frameOption === 'sameorigin' && url !== window.location.host))  {
      return false;
    }
    return true;
  }
  runNotebook(url) {
    this.toast.show('usually, it takes few sec to complete', `Notebook started`, { status: 'success' });
    this.auth.runNotebook(url)
    .subscribe((data) => {
      if (data && data.message) {
        const time = Math.round(data.time * 10) / 10;
        this.toast.show(`in ${time} sec`, `Notebook run successfully`, { status: 'success' });
      } else if (data && data.error) {
        this.toast.show(data.error, `Notebook run fail`, { status: 'danger' });
      } else {
        this.toast.show('unknow error', `Notebook run fail`, { status: 'danger' });
      }
    }, (err) => {
      this.toast.show(`Notebook run fail`, err.message, { status: 'danger' });
    });
  }
  setIframe(url, query = null, err = null) {
    this.loading = true;
    return new Promise<string>((resolve, reject) => {
      this.auth.checkIframeAllowed(url)
        .subscribe((data) => {
          let error = err;
          this.iFrame = this.iframe.nativeElement as HTMLIFrameElement;
          if (!error && data && data.headers) {
            const frameOption = data.headers['x-frame-options'];
            const CSP = data.headers['content-security-policy'];
            if (CSP) {
              const Frameancestors = CSP.split('frame-ancestors');
              const frontUrl = window.location.host;
              const Frameancestor = Frameancestors.length > 1 && Frameancestors[1] ? Frameancestors[1] : null;
              if (Frameancestor) {
                if (Frameancestor.indexOf('*') === -1 && Frameancestor.indexOf(frontUrl) === -1) {
                  error = `Service ${url} didn't allow ${frontUrl} in Frameancestor: \n ${Frameancestor}`;
                }
              } else if (this.isAllowedFrameOption(frameOption, url)) {
                error = `Service ${url} have x-frame-options set to ${frameOption}`;
              }
            }
          }
          if (error) {
            const page = data.htmlError.replace('{ERROR}', error);
            this.iFrame.srcdoc = page;
            this.loading = false;
          } else {
            if (url.indexOf('?') > -1 && query) {
              this.urlToOpen = `${url}&${query}`;
            } else if (query) {
              this.urlToOpen = `${url}?${query}`;
            } else {
              this.urlToOpen = url;
            }
            this.iFrame.src = this.urlToOpen;
            setTimeout(() => {
              this.loading = false;
            }, 500);
            resolve();
          }
        }, (errr) => {
          console.error(err);
          this.setIframe(null, null, JSON.stringify(err, null, 2));
        });
    });
  }

  noop() {
    if (this.connectionChild) {
      this.connectionChild.promise.then((child) => {
        if (this.box.hideElements && child && child.hideElements) {
          child.hideElements(this.box.hideElements);
        }
        if (this.box.injectCSS && child && child.injectCSCSS) {
          child.injectCSCSS(this.box.injectCSS);
        }
      });
    }
  }

  getName() {
    return `${this.workspaceId}_${this.sectionId}_${this.box._id}`;
  }

  getZoomPercentage() {
    return this.box.zoom || 100;
  }

  setChildCo(url: string, login) {
    this.setIframe(url)
      .then(() => {
        this.connectionChild = connectToChild({
          iframe: this.iFrame,
          debug: true,
          methods: {
            getName: () => this.getName(),
            getZoomPercentage: () => this.getZoomPercentage(),
            needLogin: () => {
              return login;
            },
            urlChangeEvent: (eventUrl) => {
              const body = {
                workspace: this.workspaceId,
                section: this.sectionId,
                box: this.box,
                url: window.location.href,
              };
              this.auth.event(body, {}, { event: 'bob-rpa url change', date: new Date(), url: eventUrl });
            },
          },
        });
      });
  }

  beforeFilestash() {
    const mode = this.box.authMethod.split('_')[1];
    const MAJMode = mode.toUpperCase();
    if (this.box.url.indexOf('@') === -1) { // make old conf compatible.
      const urlFix = document.location.host.split('.');
      this.box.url = `${this.box.url}@files.cashstory.${urlFix[urlFix.length - 1]}`;
    }
    // new format url = HOST:PORT@URL
    const parse = this.box.url.split('@');
    const url = `https://${parse[1]}`;
    const host = parse[0].split(':')[0];
    const port = parse[0].split(':')[1];
    let logins = {
      host: '',
      port: '',
      tab: MAJMode,
      login: 'Please contact bob@cashstory.com',
      pwd: '',
    };
    if (this.user.services && this.user.services[this.box.authMethod]) {
      const service: IService = <IService>this.user.services[this.box.authMethod];
      logins = {
        host,
        port,
        tab: MAJMode,
        login: service.login.username,
        pwd: service.login.password,
      };
    }
    if (this.box.login && this.box.login.username) {
      logins = {
        host,
        port,
        tab: MAJMode,
        login: this.box.login.username,
        pwd: this.box.login.password,
      };
    }
    this.setChildCo(url, logins);
  }

  beforeSimpleLogin() {
    let login = {
      login: 'Please contact bob@cashstory.com',
      pwd: '',
    };
    if (this.user.services && this.user.services[this.box.authMethod]) {
      const service: IService = <IService>this.user.services[this.box.authMethod];
      login = {
        login: service.login.username,
        pwd: service.login.password,
      };
    }
    if (this.box.login && this.box.login.username) {
      login = {
        login: this.box.login.username,
        pwd: this.box.login.password,
      };
    }
    this.setChildCo(this.box.url, login);
  }

  objToJson(obj) {
    let objList = obj.replace(/(\r\n|\n|\r| |"|{|})/gm, '');
    objList = objList.split(',');
    const newObj: TCParams = {};
    objList.forEach((element) => {
      const itemsObj = element.split(':');
      const keyTc = itemsObj.shift();
      const valueTc = itemsObj.join(':');
      newObj[keyTc] = valueTc;
    });
    return newObj;
  }

  cleanToucanUrl() {
    const cleanUrlList = this.box.url.split('/');
    cleanUrlList.pop();
    return cleanUrlList.join('/');
  }

  getToucanApiUrl(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
          // console.log('xhttp.responseText', xhttp.responseText);
          let newHtml = xhttp.responseText;
          newHtml = newHtml.split('=')[1];
          newHtml = newHtml.replace(';', '');
          newHtml = newHtml.replace(' ', '');
          try {
            const jsonParam = this.objToJson(newHtml);
            this.box.urlApi = jsonParam.API_BASEROUTE;
            resolve(jsonParam.API_BASEROUTE);
          } catch (err) {
            reject('couldn\'t get api url');
          }
        }
      };
      const cleanUrl = `${this.cleanToucanUrl()}/scripts/tc-params.js`;
      xhttp.open('GET', `${environment.api}/proxy?url=${cleanUrl}`, true);
      // xhttp.setRequestHeader('Authorization', `Bearer ${tokenGetter()}`);
      xhttp.send();
    });
  }

  syntaxHighlight(json) {
    const newJson = JSON.stringify(json, undefined, 2)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return newJson
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
        let cls = 'number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'key';
          } else {
            cls = 'jstring';
          }
        } else if (/true|false/.test(match)) {
          cls = 'boolean';
        } else if (/null/.test(match)) {
          cls = 'null';
        }
        return `<span class="${cls}">${match}</span>`;
      });
  }

  beforeToucanCloud() {
    // this.setIframe(`${environment.api}/proxy`, `inject=toucan&url=${this.box.url}`);
    // `${environment.api}/proxy?url=${this.box.url}`
    const url = new URL(this.box.url);
    const path = url.pathname;
    const search = url.searchParams;
    this.getToucanApiUrl()
      .then((apiUrl) => {
        this.http
          .post(`${environment.api}/proxy?url=${apiUrl}/login`, {
            username: this.box.login.username,
            password: this.box.login.password,
          })
          .subscribe((res) => {
            this.tokenLogin = res['token'];
            search.append('token', this.tokenLogin);
            search.append('tc_api', `${environment.api}/proxy?url=${apiUrl}`);
            this.setIframe(`${url.origin}${path}?${search.toString()}`);
          }, (err) => {
            console.error(err);
            this.setIframe(null, null, this.syntaxHighlight(err));
          });
      });
  }

  getUser() {
    this.auth.currentUserObs.subscribe((user) => {
      this.user = user;
    });
  }

  back() {
    this.backAction.emit();
  }
}
