import { AuthService } from '../../services/auth.service';
import { IWp } from '../../shared/models/workspace';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import { IFavorite } from '../../shared/models/favorite';
import { Router } from '@angular/router';

@Component({
  selector: 'ngx-news-fav',
  styleUrls: ['news-fav.component.scss'],
  templateUrl: 'news-fav.component.html',
})
export class NewsFavComponent implements OnInit {

  @Input() fav: IFavorite;
  cleanUrl: any;

  constructor(public sanitizer: DomSanitizer, public router: Router, public auth: AuthService) {
  }

  ngOnInit() {
    this.cleanUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fav.attachement);
  }

  openTarget() {
    if (this.fav.wp) {
      if (this.fav.wp.id) {
        const wp: IWp = {
          id: this.fav.wp.id,
        };
        let newPath = `/${this.fav.wp.id}/section`;
        if (this.fav.wp.section) {
          wp.section = this.fav.wp.section;
          newPath += `/${this.fav.wp.section}`;
          if (this.fav.wp.box) {
            wp.box = this.fav.wp.box;
            newPath += `/box/${this.fav.wp.box}`;
          }
        }
        this.router.navigate([newPath]);
      }
    } else if (this.fav.target && this.fav.target_type) {
      if (this.fav.target_type === 'external_same') {
        window.open(
          this.fav.target);
      } else if (this.fav.target_type === 'external') {
        window.open(
          this.fav.target,
          '_blank');
      } else if (this.fav.target_type === 'internal') {
        this.router.navigate([this.fav.target]);
      }
    }
    return false;
  }

  getClass() {
    if (this.fav.column) {
      return `hover`;
    }
    return 'hover col-12';
  }
}
