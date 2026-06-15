import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesLifestyleComponent } from './preferences-lifestyle.component';

describe('PreferencesLifestyleComponent', () => {
  let component: PreferencesLifestyleComponent;
  let fixture: ComponentFixture<PreferencesLifestyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesLifestyleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesLifestyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
