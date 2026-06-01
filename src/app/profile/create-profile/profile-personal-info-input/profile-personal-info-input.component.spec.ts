import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePersonalInfoInputComponent } from './profile-personal-info-input.component';

describe('ProfilePersonalInfoInputComponent', () => {
  let component: ProfilePersonalInfoInputComponent;
  let fixture: ComponentFixture<ProfilePersonalInfoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilePersonalInfoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePersonalInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
