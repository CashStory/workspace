import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  CdkDrag,
  CdkDropList, CdkDropListGroup, CdkDragMove,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/overlay';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { IBox, ISection, IWp } from '../../shared/models/workspace';
import { IFavorite } from '../../shared/models/favorite';
import { NbToastrService, NbDialogService, NbDialogRef } from '@nebular/theme';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IUser } from '../../shared/models/user';
import { environment } from '../../../environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({ name: 'safeStyle' })
export class SafeStylePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { } transform(value) { return this.sanitizer.bypassSecurityTrustStyle(value); }
}
// /assets/toolbox/wekan.png
@Component({
  selector: 'ngx-section',
  templateUrl: './section.component.html',
  styleUrls: ['./section.component.scss'],
})
export class SectionComponent implements OnInit, OnDestroy {
  @ViewChild(CdkDropListGroup) listGroup: CdkDropListGroup<CdkDropList>;
  @ViewChild(CdkDropList) placeholder: CdkDropList;
  @ViewChild('contentTemplate') contentTemplate: TemplateRef<any>;
  private isDropElemRemoved = false;
  @ViewChild('elementToCheck') set elementToCheck (evt) {
    if (this.placeholder && !this.isDropElemRemoved) {
      this.isDropElemRemoved = true;
      const phElement = this.placeholder.element.nativeElement;
      phElement.style.display = 'none';
      phElement.parentElement.removeChild(phElement);
    }
  }
  public target: CdkDropList;
  public targetIndex: number;
  public source: CdkDropList;
  public sourceIndex: number;
  public activeContainer;
  lockStatus: boolean = true;
  currentWpObs: any;
  currentWp: IWp;
  section: ISection;
  loading: boolean = true;
  box: IBox;
  user: IUser;
  DialogRef: NbDialogRef<SectionComponent>;
  createBoxForm: FormGroup;
  IsEditMode: boolean = false;
  formRules: object = {
    name: ['', [Validators.required, Validators.pattern(/^[^'"]*$/)]],
    color: ['#ffffff'],
    backgroundColor: ['#a0a0a0'],
    urlBg: ['', [Validators.required, Validators.pattern(/^[^'"]*$/)]],
    url: ['', [Validators.required, Validators.pattern(/^[^'"]*$/)]],
    iframe: [false, Validators.required],
    autoExpand: [false, Validators.required],
    authMethod: [''],
    login: this.formBuilder.group({
      username: [''],
      password: [''],
    }),
  };
  formRulesEdit: object = {
    name: ['', [Validators.required, Validators.pattern(/^[^'"]*$/)]],
    color: ['#ffffff'],
    backgroundColor: ['#a0a0a0'],
    boxId: ['', [Validators.required]],
    urlBg: ['', [Validators.required, Validators.pattern(/^[^'"]*$/)]],
    url: ['', [Validators.required, Validators.pattern(/^[^'"]*$/)]],
    iframe: [false, Validators.required],
    autoExpand: [false, Validators.required],
    authMethod: [''],
    login: this.formBuilder.group({
      username: [''],
      password: [''],
    }),
  };

  constructor(
    private auth: AuthService,
    public toast: NbToastrService,
    private router: Router,
    private dialogService: NbDialogService,
    private formBuilder: FormBuilder,
    private viewportRuler: ViewportRuler,
  ) {
    this.target = null;
    this.source = null;
    this.createForm(false);
  }

  ngOnDestroy() {
    this.delete();
  }

  delete() {
    if (this.currentWpObs) {
      this.currentWpObs.unsubscribe();
    }
  }

  cIndexOf(collection, node) {
    return Array.prototype.indexOf.call(collection, node);
  }

  cIsTouchEvent(event: MouseEvent | TouchEvent): event is TouchEvent {
    return event.type.startsWith('touch');
  }

  cIsInsideDropListClientRect(dropList: CdkDropList, x: number, y: number) {
    const { top, bottom, left, right } = dropList.element.nativeElement.getBoundingClientRect();
    return y >= top && y <= bottom && x >= left && x <= right;
  }

  dragMoved(e: CdkDragMove) {
    const point = this.getPointerPositionOnPage(e.event);
    this.listGroup._items.forEach((dropList) => {
      if (this.cIsInsideDropListClientRect(dropList, point.x, point.y)) {
        this.activeContainer = dropList;
        return;
      }
    });
  }

  updateBoxPositions(boxWithPosition) {
    this.auth.updateBoxPositions(boxWithPosition).then((updatedSection) => {
      this.section.box = updatedSection.section.box;
      this.stopLoad();
      this.toast.show('Move boxes', 'Box moved successfully', { status: 'primary' });
    }).catch((err) => {
      this.stopLoad();
      this.toast.show('Move boxes', 'Box move failed', { status: 'danger' });
    });
  }

  dropListDropped(event) {
    if (!this.target) {
      return;
    }

    const phElement = this.placeholder.element.nativeElement;
    const parent = phElement.parentElement;

    phElement.style.display = 'none';

    parent.removeChild(phElement);
    parent.appendChild(phElement);
    parent.insertBefore(this.source.element.nativeElement, parent.children[this.sourceIndex]);

    this.target = null;
    this.source = null;

    if (this.sourceIndex !== this.targetIndex) {
      moveItemInArray(this.section.box, this.sourceIndex, this.targetIndex);
      const updatedBoxPositionWithIds = this.section.box.map((b, i) => {
        return { id : b._id, position: i };
      });
      this.updateBoxPositions(updatedBoxPositionWithIds);
    }
  }

  dropListEnterPredicate = (drag: CdkDrag, drop: CdkDropList) => {
    if (drop === this.placeholder) {
      return true;
    }

    if (drop !== this.activeContainer) {
      return false;
    }

    const phElement = this.placeholder.element.nativeElement;
    const sourceElement = drag.dropContainer.element.nativeElement;
    const dropElement = drop.element.nativeElement;

    const dragIndex = this.cIndexOf(dropElement.parentElement.children, (this.source ? phElement : sourceElement));
    const dropIndex = this.cIndexOf(dropElement.parentElement.children, dropElement);

    if (!this.source) {
      this.sourceIndex = dragIndex;
      this.source = drag.dropContainer;

      phElement.style.width = `${sourceElement.clientWidth}px`;
      phElement.style.height = `${sourceElement.clientHeight}px`;

      sourceElement.parentElement.removeChild(sourceElement);
    }

    this.targetIndex = dropIndex;
    this.target = drop;

    phElement.style.display = '';
    dropElement.parentElement.insertBefore(phElement, (dropIndex > dragIndex
      ? dropElement.nextSibling : dropElement));

    this.placeholder._dropListRef.enter(drag._dragRef, drag.element.nativeElement.offsetLeft, drag.element.nativeElement.offsetTop);
    return false;
  }

  getPointerPositionOnPage(event: MouseEvent | TouchEvent) {
    // `touches` will be empty for start/end events so we have to fall back to `changedTouches`.
    const point = this.cIsTouchEvent(event) ? (event.touches[0] || event.changedTouches[0]) : event;
    const scrollPosition = this.viewportRuler.getViewportScrollPosition();

    return {
      x: point.pageX - scrollPosition.left,
      y: point.pageY - scrollPosition.top,
    };
  }

  onFileUploaded = (file) => {
    const urlBg = `${environment.api}/files/${file.name}`;
    this.createBoxForm = this.formBuilder.group({ ...this.createBoxForm.value, urlBg });
  }

  get nameColor(): any {
    return this.createBoxForm.get('color');
  }

  setNameColor = (color) => {
    this.createBoxForm = this.formBuilder.group({ ...this.createBoxForm.value, color });
  }

  get nameBgColor(): any {
    return this.createBoxForm.get('backgroundColor');
  }

  setNameBgColor = (color) => {
    const backgroundColor = color;
    this.createBoxForm = this.formBuilder.group({ ...this.createBoxForm.value, backgroundColor });
  }

  createForm(EditMode: boolean) {
    const formRules = (EditMode) ? this.formRulesEdit : this.formRules;
    this.createBoxForm = this.formBuilder.group(formRules);
  }

  async initSectionBox(currentWp) {
    const sectionBox = await this.auth.getCurrentSectionBox(currentWp);
    this.section = sectionBox.section;
    this.setBox(sectionBox.box);
    this.stopLoad();
  }

  init() {
    this.currentWpObs = this.auth.currentWpObs.subscribe(async (currentWp) => {
      this.currentWp = currentWp;
      try {
        await this.initSectionBox(this.currentWp);
        // this.favifier();
      } catch (err) {
        console.error('section Error', err);
      }
    });
  }

  async reload() {
    await this.initSectionBox(this.currentWp);
    // this.favifier();
  }

  ngOnInit() {
    this.init();
    this.getUser();
  }

  getUrlBg(boxx) {
    return `url(${boxx.urlBg})`;
  }

  setBox(box: IBox) {
    this.box = null;
    setTimeout(() => {
      this.box = box;
    }, 10);
  }
  stopLoad() {
    setTimeout(() => {
      this.loading = false;
    }, 500);
  }

  selectFav(box: IBox) {
    if (this.currentWp) {
      const newFav: IFavorite = {
        name: box.name,
        description: null,
        attachement: box.urlBg,
        attachement_type: 'image',
        wp: {
          box: box._id,
          id: this.currentWp.id,
          section: this.section.id,
        },
        column: 12,
      };
      const fav = this.auth.isFav({ id: this.currentWp.id, box: box._id, section: this.section.id });
      this.loading = true;
      if (fav) {
        this.auth.delFav(fav)
          .then((sectionBox) => {
            this.section = sectionBox.section;
            this.setBox(sectionBox.box);
            this.stopLoad();
            this.toast.show(box.name, 'Delete favorite', { status: 'primary' });
          }).catch((err) => {
            console.error(err);
            this.stopLoad();
            this.toast.show(box.name, 'Delete favorite fail', { status: 'danger' });
          });
      } else {
        this.auth.addFav(newFav)
          .then((sectionBox) => {
            this.section = sectionBox.section;
            this.setBox(sectionBox.box);
            this.stopLoad();
            this.toast.show(box.name, 'Box added to home page', { status: 'primary' });
          }).catch((err) => {
            console.error(err);
            this.stopLoad();
            this.toast.show(box.name, 'Fail add favorite', { status: 'danger' });
          });
      }
    }
  }

  getBoxes() {
    return this.section.box;
  }

  getFavClass(box: IBox) {
    const fav = this.auth.isFav({ id: this.currentWp.id, box: box._id, section: this.section.id });
    if (fav) {
      return 'fas fa-star position-absolute text-success';
    }
    return 'far fa-star position-absolute text-white';
  }

  selectBox(box: IBox) {
    this.router.navigate([`/${this.currentWp.id}/section/${this.section.id}/box/${box._id}`]);
  }

  back() {
    this.router.navigate([`/${this.currentWp.id}/section/${this.section.id}/box/0`]);
  }
  initPopUp(mode: boolean) {
    if (this.lockStatus) {
      return;
    }
    this.IsEditMode = (mode || false);
    this.DialogRef = this.dialogService.open(
      this.contentTemplate,
      { closeOnEsc: true },
    );
    this.createForm(mode);
  }
  submitHandler(IsEditMode: boolean) {
    this.loading = true;
    const newBox = this.createBoxForm.value;
    if (IsEditMode) {
      const thisBox = this.section.box.find(el => el._id === newBox.boxId);
      this.auth.editBox(newBox.boxId, {
        name: newBox.name,
        urlBg: newBox.urlBg, url: newBox.url,
        iframe: newBox.iframe,
        autoExpand: newBox.autoExpand,
        position: thisBox.position,
        color: newBox.color,
        backgroundColor: newBox.backgroundColor,
        authMethod: newBox.authMethod,
        login: newBox.login,
      }).then((updatedSection) => {
        this.section.box = updatedSection.section.box;
        this.stopLoad();
        this.toast.show(newBox.name, 'box name changed successfully', { status: 'primary' });
      }).catch((err) => {
        this.stopLoad();
        this.toast.show(newBox.name, 'box name change failed', { status: 'danger' });
      });
    } else {
      // push new boxes via API
      this.auth.addNewBoxToWorkSpace(newBox).then((updatedSection) => {
        this.section.box = updatedSection.section.box;
        this.stopLoad();
        this.toast.show(newBox.name, 'new box added successfully', { status: 'primary' });
      }).catch((err) => {
        this.stopLoad();
        this.toast.show(newBox.name, 'add new box failed', { status: 'danger' });
      });
    }
    if (this.DialogRef) {
      this.DialogRef.close();
      this.DialogRef = null;
    }
  }
  async boxActions(box: IBox, action: string) {
    if (['edit', 'delete'].includes(action)) {
      if (this.lockStatus) {
        return;
      }
    }

    switch (action) {
      case 'edit': {
        this.initPopUp(true);
        this.createBoxForm.setValue({
          name: box.name, boxId: box._id,
          urlBg: box.urlBg, url: box.url,
          iframe: box.iframe,
          autoExpand: box.autoExpand,
          color: box.color || '#ffffff',
          backgroundColor: box.backgroundColor || '#a0a0a0',
          authMethod: box.authMethod || '',
          login: {
            username: box.login?.username || '',
            password: box.login?.password || '',
          },
        });
        break;
      }
      case 'copy': {
        if (window.confirm(`Are you sure you want to copy the box
    ${box.name} ?`)) {
          delete box._id;
          box.name = `${box.name} - Copy`;
          this.loading = true;
          this.auth.addNewBoxToWorkSpace(box).then((updatedSection) => {
            this.section.box = updatedSection.section.box;
            this.stopLoad();
            this.toast.show(box.name, 'new box added successfully', { status: 'primary' });
            // Immidiate rename the Box id the user is admin
            if (this.user.role && this.user.role === 'admin') {
              const lastBox = this.getTheRecentBoxDetails();
              this.initPopUp(true);
              this.createBoxForm.setValue(
                {
                  name: lastBox.name, boxId: lastBox._id,
                  urlBg: box.urlBg, url: box.url,
                  iframe: box.iframe,
                  autoExpand: box.autoExpand,
                  color: box.color || '#ffffff',
                  backgroundColor: box.backgroundColor || '#a0a0a0',
                  authMethod: box.authMethod || '',
                  login: {
                    username: box.login?.username || '',
                    password: box.login?.password || '',
                  },
                });

            }
          }).catch((err) => {
            this.stopLoad();
            this.toast.show(box.name, 'add new box failed', { status: 'danger' });
          });
        }
        break;
      }
      case 'delete': {
        if (window.confirm(`Are you sure you want to permanently delete the box
    ${box.name} ?`)) {
          this.loading = true;
          this.auth.removeBoxFromSection(box._id).then((updatedSection) => {
            this.section.box = updatedSection.section.box;
            this.stopLoad();
            this.toast.show(box.name, 'Box removed successfully', { status: 'primary' });
          }).catch((err) => {
            this.stopLoad();
            this.toast.show(box.name, 'box removal failed', { status: 'danger' });
          });
        }
        break;
      }
    }
  }
  getUser() {
    this.auth.currentUserObs.subscribe((user) => {
      this.user = user;
    });
  }

  getTheRecentBoxDetails() {
    const { [this.section.box.length - 1]: lastElement } = this.section.box;
    return lastElement;
  }

  changeLockStatus($event: any) {
    this.lockStatus = $event;
  }
}
