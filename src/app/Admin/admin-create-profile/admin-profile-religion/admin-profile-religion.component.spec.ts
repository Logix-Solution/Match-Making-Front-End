import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfileReligionComponent } from './admin-profile-religion.component';

describe('AdminProfileReligionComponent', () => {
  let component: AdminProfileReligionComponent;
  let fixture: ComponentFixture<AdminProfileReligionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminProfileReligionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfileReligionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
