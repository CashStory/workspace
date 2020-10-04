/**
 * @license
 * Copyright Akveo. All Rights Reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { of as observableOf } from 'rxjs';
import { filter, delay, takeWhile } from 'rxjs/operators';

import { NbOverlayRef, NbOverlayService, NbThemeService, NbPortalDirective } from '@nebular/theme';
import { NgxSearchService } from './ngx.search.service';
import { SpeechService } from './../../services/speech-service';
import { AuthService } from '../../services/auth.service';

/**
 * search-field-component is used under the hood by ngx-search component
 * can't be used itself
 */
@Component({
  selector: 'ngx-search-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: [
    'styles/search.component.modal-zoomin.scss',
    'styles/search.component.layout-rotate.scss',
    'styles/search.component.modal-move.scss',
    'styles/search.component.curtain.scss',
    'styles/search.component.column-curtain.scss',
    'styles/search.component.modal-drop.scss',
    'styles/search.component.modal-half.scss',
  ],
  template: `
    <div class="search" (keyup.esc)="emitClose()">
      <button (click)="emitClose()" nbButton ghost class="close-button">
        <nb-icon icon="close-outline" pack="nebular-essentials"></nb-icon>
      </button>
      <div class="form-wrapper">
        <form class="form" action="#" (ngSubmit)="submitSearch(searchInput.value)" (keyup.enter)="submitSearch(searchInput.value)">
          <div class="form-content">
          <h5 class="suggestion text-left text-dark pl-2 pb-2 font-weight-normal" *ngIf="suggestion">Did you mean?</h5>
            <input class="search-input"
                   #searchInput
                   type="text"
                   (input)="emitSearchInput(searchInput.value)"
                   autocomplete="off"
                   [attr.placeholder]="placeholder"
                   [(ngModel)]="searchValue"
                   [ngModelOptions]="{standalone: true}"
                   tabindex="-1"/>
                   <div *ngIf="bobVoice" class="d-inline">
                     <div *ngIf="!isListening" class="btn btn-link" (click)="speechRecognition()" >
                       <i class="far fa-microphone fa-2x text-dark"></i>
                     </div>
                     <div *ngIf="isListening" class="btn btn-link">
                       <i class="fas fa-circle text-danger"></i>
                     </div>
                   </div>
            <input class="d-none" type="submit" value="Submit">
          </div>
          <span class="info">{{ hint }}</span>
        </form>
      </div>
    </div>
  `,
})
export class NgxSearchFieldComponent implements OnChanges, AfterViewInit {

  constructor(
    private speechService: SpeechService,
    private ref: ChangeDetectorRef,
    private auth: AuthService,
  ) { }

  static readonly TYPE_MODAL_ZOOMIN = 'modal-zoomin';
  static readonly TYPE_ROTATE_LAYOUT = 'rotate-layout';
  static readonly TYPE_MODAL_MOVE = 'modal-move';
  static readonly TYPE_CURTAIN = 'curtain';
  static readonly TYPE_COLUMN_CURTAIN = 'column-curtain';
  static readonly TYPE_MODAL_DROP = 'modal-drop';
  static readonly TYPE_MODAL_HALF = 'modal-half';

  @Input() type: string;
  @Input() placeholder: string;
  @Input() hint: string;
  @Input() show = false;
  @Input() suggestion: string;
  searchValue: string = '';
  bobVoice: boolean = false;

  @Output() close = new EventEmitter();
  @Output() search = new EventEmitter();
  @Output() searchInput = new EventEmitter();
  isListening: boolean = false;

  @ViewChild('searchInput') inputElement: ElementRef<HTMLInputElement>;

  @HostBinding('class.show')
  get showClass() {
    return this.show;
  }

  @HostBinding('class.modal-zoomin')
  get modalZoomin() {
    return this.type === NgxSearchFieldComponent.TYPE_MODAL_ZOOMIN;
  }

  @HostBinding('class.rotate-layout')
  get rotateLayout() {
    return this.type === NgxSearchFieldComponent.TYPE_ROTATE_LAYOUT;
  }

  @HostBinding('class.modal-move')
  get modalMove() {
    return this.type === NgxSearchFieldComponent.TYPE_MODAL_MOVE;
  }

  @HostBinding('class.curtain')
  get curtain() {
    return this.type === NgxSearchFieldComponent.TYPE_CURTAIN;
  }

  @HostBinding('class.column-curtain')
  get columnCurtain() {
    return this.type === NgxSearchFieldComponent.TYPE_COLUMN_CURTAIN;
  }

  @HostBinding('class.modal-drop')
  get modalDrop() {
    return this.type === NgxSearchFieldComponent.TYPE_MODAL_DROP;
  }

  @HostBinding('class.modal-half')
  get modalHalf() {
    return this.type === NgxSearchFieldComponent.TYPE_MODAL_HALF;
  }

  ngOnChanges({ show }: SimpleChanges) {
    const becameHidden = !show.isFirstChange() && show.currentValue === false;
    if (becameHidden && this.inputElement) {
      this.inputElement.nativeElement.value = '';
    }
    this.searchValue = this.suggestion ? this.suggestion : '';
    this.focusInput();
  }

  ngAfterViewInit() {
    this.focusInput();

    this.auth.currentWorkspaceObs.subscribe((currentWorkspace) => {
      this.bobVoice = currentWorkspace.bobVoice ? currentWorkspace.bobVoice : false;
    });
  }

  speechRecognition() {
    this.isListening = true;
    this.speechService.record('en').subscribe((voice) => {
      this.isListening = false;
      // console.log('voice', voice);
      this.searchValue = voice;
      this.speechService.stop();
      this.ref.markForCheck();
      setTimeout(() => {
        this.submitSearch(this.searchValue);
      }, 1000);
    }, (err) => {
      this.isListening = false;
      this.speechService.stop();
      console.error('voice', err);
      this.ref.markForCheck();
    });
  }

  emitClose() {
    this.inputElement.nativeElement.blur();
    this.close.emit();
  }

  submitSearch(term) {
    // console.log('searchInput', this.inputElement);
    if (term) {
      this.inputElement.nativeElement.blur();
      this.search.emit(term);
    }
  }

  emitSearchInput(term: string) {
    this.searchInput.emit(term);
  }

  focusInput() {
    if (this.show && this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
  }
}

export type NbSearchType = 'modal-zoomin' | 'rotate-layout' | 'modal-move' |
  'curtain' | 'column-curtain' | 'modal-drop' | 'modal-half';

/**
 * Beautiful full-page search control.
 *
 * @stacked-example(Showcase, search/search-showcase.component)
 *
 * Basic setup:
 *
 * ```ts
 *  <ngx-search type="rotate-layout"></ngx-search>
 * ```
 * ### Installation
 *
 * Import `NgxSearchModule` to your feature module.
 * ```ts
 * @NgModule({
 *   imports: [
 *     // ...
 *     NgxSearchModule,
 *   ],
 * })
 * export class PageModule { }
 * ```
 * ### Usage
 *
 * Several animation types are available:
 * modal-zoomin, rotate-layout, modal-move, curtain, column-curtain, modal-drop, modal-half
 *
 * It is also possible to handle search event using `NbSearchService`:
 *
 * @stacked-example(Search Event, search/search-event.component)
 *
 * @styles
 *
 * search-background-color:
 * search-divider-color:
 * search-divider-style:
 * search-divider-width:
 * search-extra-background-color:
 * search-text-color:
 * search-text-font-family:
 * search-text-font-size:
 * search-text-font-weight:
 * search-text-line-height:
 * search-placeholder-text-color:
 * search-info-text-color:
 * search-info-text-font-family:
 * search-info-text-font-size:
 * search-info-text-font-weight:
 * search-info-text-line-height:
 */
@Component({
  selector: 'ngx-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['styles/search.component.scss'],
  template: `
    <button #searchButton class="start-search" (click)="emitActivate()" nbButton ghost>
      <nb-icon icon="search-outline" pack="nebular-essentials"></nb-icon>
    </button>
    <ngx-search-field
      *nbPortal
      [show]="showSearchField"
      [type]="type"
      [placeholder]="placeholder"
      [hint]="hint"
      [suggestion]="suggestion"
      (search)="search($event)"
      (searchInput)="emitInput($event)"
      (close)="emitDeactivate()">
    </ngx-search-field>
  `,
})
export class NgxSearchComponent implements OnInit, OnDestroy {

  private alive = true;
  private overlayRef: NbOverlayRef;
  showSearchField = false;
  suggestion: string;

  /**
   * Search input placeholder
   * @type {string}
   */
  @Input() placeholder: string = 'Search...';

  /**
   * Hint showing under the input field to improve user experience
   *
   * @type {string}
   */
  @Input() hint: string = '';

  /**
   * Search design type, available types are
   * modal-zoomin, rotate-layout, modal-move, curtain, column-curtain, modal-drop, modal-half
   * @type {string}
   */
  @Input() type: NbSearchType;

  @ViewChild(NbPortalDirective) searchFieldPortal: NbPortalDirective;
  @ViewChild('searchButton', { read: ElementRef }) searchButton: ElementRef<HTMLElement>;

  constructor(
    private searchService: NgxSearchService,
    private themeService: NbThemeService,
    private router: Router,
    private overlayService: NbOverlayService,
    private changeDetector: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.router.events
      .pipe(
        takeWhile(() => this.alive),
        filter(event => event instanceof NavigationEnd),
      )
      .subscribe(() => this.hideSearch());

    this.searchService.onSearchActivate()
      .pipe(
        takeWhile(() => this.alive),
      )
      .subscribe(data => this.openSearch(data));

    this.searchService.onSearchDeactivate()
      .pipe(
        takeWhile(() => this.alive),
      )
      .subscribe(() => this.hideSearch());
  }

  ngOnDestroy() {
    if (this.overlayRef && this.overlayRef.hasAttached()) {
      this.removeLayoutClasses();
      this.overlayRef.detach();
    }

    this.alive = false;
  }

  openSearch(data) {
    this.suggestion = data.suggestion;
    if (!this.overlayRef) {
      this.overlayRef = this.overlayService.create();
      this.overlayRef.attach(this.searchFieldPortal);
    }

    this.themeService.appendLayoutClass(this.type);
    observableOf(null).pipe(delay(0)).subscribe(() => {
      this.themeService.appendLayoutClass('with-search');
      this.showSearchField = true;
      this.changeDetector.detectChanges();
    });
  }

  hideSearch() {
    this.removeLayoutClasses();
    this.showSearchField = false;
    this.changeDetector.detectChanges();
    this.searchButton.nativeElement.focus();
  }

  search(term) {
    this.searchService.submitSearch(term);
    this.hideSearch();
  }

  emitInput(term: string) {
    this.searchService.searchInput(term);
  }

  emitActivate() {
    this.searchService.activateSearch(this.type);
  }

  emitDeactivate() {
    this.searchService.deactivateSearch(this.type);
  }

  private removeLayoutClasses() {
    this.themeService.removeLayoutClass('with-search');
    observableOf(null).pipe(delay(500)).subscribe(() => {
      this.themeService.removeLayoutClass(this.type);
    });
  }
}
