import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FullscreenLockService {

  private fullscreenLock: boolean;

  constructor() {
    this.fullscreenLock = false;
  }

  isLock() {
    return this.fullscreenLock;
  }

  lock() {
    if (!this.fullscreenLock) {
      this.fullscreenLock = true;
    }
  }
}
