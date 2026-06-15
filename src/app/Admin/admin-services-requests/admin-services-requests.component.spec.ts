import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminServicesRequestsComponent } from './admin-services-requests.component';

describe('AdminServicesRequestsComponent', () => {
  let component: AdminServicesRequestsComponent;
  let fixture: ComponentFixture<AdminServicesRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminServicesRequestsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminServicesRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
