import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileLifestyleInfoInputComponent } from './profile-lifestyle-info-input.component';

describe('ProfileLifestyleInfoInputComponent', () => {
  let component: ProfileLifestyleInfoInputComponent;
  let fixture: ComponentFixture<ProfileLifestyleInfoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileLifestyleInfoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileLifestyleInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
