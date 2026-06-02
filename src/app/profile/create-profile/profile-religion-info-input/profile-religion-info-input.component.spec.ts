import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileReligionInfoInputComponent } from './profile-religion-info-input.component';

describe('ProfileReligionInfoInputComponent', () => {
  let component: ProfileReligionInfoInputComponent;
  let fixture: ComponentFixture<ProfileReligionInfoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileReligionInfoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileReligionInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
