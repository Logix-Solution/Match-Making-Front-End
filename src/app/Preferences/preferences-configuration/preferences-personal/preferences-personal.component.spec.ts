import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesPersonalComponent } from './preferences-personal.component';

describe('PreferencesPersonalComponent', () => {
  let component: PreferencesPersonalComponent;
  let fixture: ComponentFixture<PreferencesPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesPersonalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
