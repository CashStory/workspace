import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateWorkspaceComponent } from './duplicate-workspace.component';

describe('DuplicateWorkspaceComponent', () => {
  let component: DuplicateWorkspaceComponent;
  let fixture: ComponentFixture<DuplicateWorkspaceComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DuplicateWorkspaceComponent],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateWorkspaceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
