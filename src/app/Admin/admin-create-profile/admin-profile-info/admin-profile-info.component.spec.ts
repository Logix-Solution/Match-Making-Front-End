import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfileInfoComponent } from './admin-profile-info.component';

describe('AdminProfileInfoComponent', () => {
  let component: AdminProfileInfoComponent;
  let fixture: ComponentFixture<AdminProfileInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminProfileInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfileInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
