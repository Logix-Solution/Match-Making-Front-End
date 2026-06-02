import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCareerInfoInputComponent } from './profile-career-info-input.component';

describe('ProfileCareerInfoInputComponent', () => {
  let component: ProfileCareerInfoInputComponent;
  let fixture: ComponentFixture<ProfileCareerInfoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileCareerInfoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileCareerInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
