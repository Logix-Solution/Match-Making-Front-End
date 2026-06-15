import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRequestManagementComponent } from './admin-request-management.component';

describe('AdminRequestManagementComponent', () => {
  let component: AdminRequestManagementComponent;
  let fixture: ComponentFixture<AdminRequestManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminRequestManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRequestManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
