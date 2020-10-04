import { Component, OnInit, TemplateRef } from '@angular/core';
import { IUser } from '../../shared/models/user';
import { AuthService , tokenGetter } from '../../services/auth.service';
import { UploadService } from '../../services/upload.service';
import { NbDialogService, NbDialogRef, NbToastrService } from '@nebular/theme';
import { take } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { environment } from '../../../environments/environment';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

@Component({
  selector: 'ngx-app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {

  user: IUser;
  loading = false;
  currentDialog: NbDialogRef<any>;
  userRoles: string[] = [
    'Accountant', 'Business Owner', 'Board Member', 'CFO',
    'Trader', 'Treasurer', 'Financial Controller', 'Credit Manager',
    'Risk Manager', 'Cash Manager', 'Invertor Relations Manager', 'Business Analyst',
    ' FP&A', 'Product Management', 'Program/Project Management', 'Data/Anaytics/Business Intelligence',
    'Engineering (Software)', 'Sales & Marketing',
    'Media/Communications', 'Operations',
    'Research', 'Other',
  ];
  showPassword: boolean = false;
  formRules: object = {
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.pattern(/^\S*$/)]],
  };
  public createBoxForm: FormGroup;
  constructor(
    public auth: AuthService,
    private toast: NbToastrService,
    private upload: UploadService,
    private dialogService: NbDialogService,
    private cookieService: CookieService,
    private formBuilder: FormBuilder,
  ) {
    this.createBoxForm = this.formBuilder.group(this.formRules, {
      validator: this.auth.matchingPasswords('currentPassword', 'newPassword') });
  }

  ngOnInit() {
    this.getUser();
  }
  // fonction qui recupere les infos de l'user log

  getUser() {
    this.auth.currentUserObs.subscribe((user) => {
      this.user = user;
    });
  }

  getServices() {
    return (this.user && this.user.services) ? Object.values(this.user.services) : [];
  }

  save() {
    this.user.reset = true;
    this.auth.editMe(this.user)
      .pipe(take(1))
      .subscribe((res) => {
        this.toast.show('Well done !', 'Profile updated', { status: 'success' });
      }, (error) => {
        console.error(error);
        this.toast.show(`Can\'t be update !`, 'Profile Error', { status: 'danger' });
      });
  }

  changePassword() {
    this.user.reset = true;
    this.auth.updatePassword(this.user, this.createBoxForm.value)
      .pipe(take(1))
      .subscribe((res) => {
        this.toast.show('Well done !', 'Profile updated', { status: 'success' });
        this.createBoxForm.reset();
      }, (error) => {
        console.error(error);
        if (error.status === 404) {
          return this.toast.show('Invalid current password', 'Update Error', { status: 'danger' });
        }
        this.toast.show(`Can\'t be update !`, 'Profile Error', { status: 'danger' });
      });
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  getInputType() {
    if (this.showPassword) {
      return 'text';
    }
    return 'password';
  }

  handleFileInput(files: FileList) {
    const fileToUpload = files.item(0);
    this.loading = true;
    this.upload.postFile(fileToUpload)
      .subscribe((data: any) => {
        this.loading = false;
        this.user.picture = data.filename;
        this.save();
      }, (error) => {
        console.error(error);
        this.loading = false;
        this.toast.show(`Upload fail, try again`, 'Sorry', { status: 'danger' });
      });
  }

  open(dialog: TemplateRef<any>) {
    this.currentDialog = this.dialogService.open(dialog);
  }

  linkedInSync() {
    // set auth into cookie then redirect
    const token = tokenGetter();
    this.cookieService.set('auth', token, 265, '/', this.auth.getHostCookieName(), false);
    localStorage.setItem('redirect', '/account');
    window.location.href = `${environment.api}/users/profileSync/linkedin`;
  }

  closeDialog() {
    if (this.currentDialog) {
      this.currentDialog.close();
      this.currentDialog = null;
    }
  }
}
