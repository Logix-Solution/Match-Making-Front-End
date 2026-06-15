import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesAppearanceComponent } from './preferences-appearance.component';

describe('PreferencesAppearanceComponent', () => {
  let component: PreferencesAppearanceComponent;
  let fixture: ComponentFixture<PreferencesAppearanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesAppearanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesAppearanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
