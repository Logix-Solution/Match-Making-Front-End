import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfileLifestyleComponent } from './admin-profile-lifestyle.component';

describe('AdminProfileLifestyleComponent', () => {
  let component: AdminProfileLifestyleComponent;
  let fixture: ComponentFixture<AdminProfileLifestyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminProfileLifestyleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfileLifestyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
