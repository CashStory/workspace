import { Component, OnInit, QueryList, ContentChildren, ElementRef, Input, AfterContentInit, HostListener } from '@angular/core';
import { FloatingButtonItemComponent } from '../floating-button-item/floating-button-item.component';
@Component({
  selector: 'ngx-floating-button',
  styleUrls: ['./floating-button.component.scss'],
  templateUrl: './floating-button.component.html',
})
export class FloatingButtonComponent implements AfterContentInit {
  @ContentChildren(FloatingButtonItemComponent, { read: ElementRef, descendants: true }) FloatingButtonItemContentChild: QueryList<any>;
  @Input() img: string;
  @Input() icon: string = 'plus';
  @Input() status: string = 'control';
  @Input() label: string;
  isExpanded: boolean = false;
  constructor(private eRef: ElementRef) {
    // constructor
  }
  @HostListener('document:click', ['$event'])
  clickout(event: any): void {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.isExpanded = false;
      this.closeMe();
    }
  }
  @HostListener('window:blur', ['$event'])
  onWindowBlur(event: any): void {
    this.isExpanded = false;
    this.closeMe();
  }

  wrapperClass() {
    if (this.isExpanded) {
      return 'floating-button-wrapper float-wrapper-expanded';
    }
    return 'floating-button-wrapper float-wrapeper-closed';
  }

  clickAction() {
    this.isExpanded = !this.isExpanded;
    if (this.isExpanded) {
      this.FloatingButtonItemContentChild.forEach((itemNode, indx) => {
        itemNode.nativeElement.children[0].style.transform = `translate3d( 0px, ${indx * -55}px , 0px )`;
        itemNode.nativeElement.children[0].style.transitionDuration = `${190 + (indx * 100)}ms`;
        itemNode.nativeElement.children[0].style.opacity = 1;

      });
    } else {
      this.closeMe();
    }

  }
  ngAfterContentInit() {
    this.FloatingButtonItemContentChild.forEach((item) => {
      item.nativeElement.addEventListener('click', this.clickAction.bind(this));

    });
  }
  closeMe() {
    this.FloatingButtonItemContentChild.forEach((itemNode, indx) => {
      itemNode.nativeElement.children[0].style.transform = `translate3d( 0px, 0px , 0px )`;
      itemNode.nativeElement.children[0].style.transitionDuration = `${190 - (indx * 100)}ms`;
      itemNode.nativeElement.children[0].style.opacity = 0;

    });
  }
}
