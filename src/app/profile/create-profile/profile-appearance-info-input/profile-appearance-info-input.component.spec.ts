import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileAppearanceInfoInputComponent } from './profile-appearance-info-input.component';

describe('ProfileAppearanceInfoInputComponent', () => {
  let component: ProfileAppearanceInfoInputComponent;
  let fixture: ComponentFixture<ProfileAppearanceInfoInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfileAppearanceInfoInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileAppearanceInfoInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
