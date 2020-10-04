import { Component, Input } from '@angular/core';

import { NewsPost } from '../../services/news.service';

@Component({
  selector: 'ngx-news-post',
  styleUrls: ['news-post.component.scss'],
  templateUrl: 'news-post.component.html',
})
export class NewsPostComponent {

  @Input() post: NewsPost;

  getScoreClass(score) {
    if (score > 60) {
      return 'badge-success';
    }
    if (score > 40) {
      return 'badge-info';
    }
    return 'badge-warning';
  }
}
