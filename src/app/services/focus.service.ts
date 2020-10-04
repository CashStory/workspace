import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FocusService {

  private currentFocus: boolean;

  constructor() {
    this.currentFocus = false;
  }

  isFocus() {
    return this.currentFocus;
  }

  toggle() {
    this.currentFocus = !this.currentFocus;
  }

  focus() {
    if (!this.currentFocus) {
      this.currentFocus = true;
    }
  }

  unFocus() {
    this.currentFocus = false;
  }
}
