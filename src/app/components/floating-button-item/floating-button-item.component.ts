import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'ngx-floating-button-item',
  styleUrls: ['./floating-button-item.component.scss'],
  templateUrl: './floating-button-item.component.html',
})
export class FloatingButtonItemComponent implements OnInit {

  @Input() icon: string;
  @Input() status: string = 'primary';
  @Input() label: string;
  @Input() img: string;

  constructor() {
    // constructor
  }

  ngOnInit() {
  }
}
