import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileFamilyInfoInputComponent } from './profile-family-info-input.component';

describe('ProfileFamilyInfoInputComponent', () => {
  let component: ProfileFamilyInfoInputComponent;
  let fixture: ComponentFixture<ProfileFamilyInfoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileFamilyInfoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileFamilyInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
