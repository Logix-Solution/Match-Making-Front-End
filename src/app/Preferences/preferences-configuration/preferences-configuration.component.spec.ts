import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesConfigurationComponent } from './preferences-configuration.component';

describe('PreferencesConfigurationComponent', () => {
  let component: PreferencesConfigurationComponent;
  let fixture: ComponentFixture<PreferencesConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
