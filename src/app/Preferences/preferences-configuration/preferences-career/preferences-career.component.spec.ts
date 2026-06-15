import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesCareerComponent } from './preferences-career.component';

describe('PreferencesCareerComponent', () => {
  let component: PreferencesCareerComponent;
  let fixture: ComponentFixture<PreferencesCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesCareerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
