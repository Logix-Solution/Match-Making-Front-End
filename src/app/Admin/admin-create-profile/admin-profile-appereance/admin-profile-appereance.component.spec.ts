import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfileAppereanceComponent } from './admin-profile-appereance.component';

describe('AdminProfileAppereanceComponent', () => {
  let component: AdminProfileAppereanceComponent;
  let fixture: ComponentFixture<AdminProfileAppereanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminProfileAppereanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfileAppereanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
