import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkspaceService } from 'app/services/workspace.service';

@Component({
  selector: 'ngx-request-access',
  templateUrl: './request-access.component.html',
})
export class RequestAccessComponent implements OnInit {
  constructor(
    private router: Router,
    private wsService: WorkspaceService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    return;
  }

  goBack() {
    location.href = '/';
  }

  requestAccess() {
    const requestData = { id: location.pathname.split('/')[1] };
    this.wsService.addRequest(requestData).subscribe(async () => {
      location.href = '/';
    });
  }

}
