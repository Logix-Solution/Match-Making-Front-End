import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesReligionComponent } from './preferences-religion.component';

describe('PreferencesReligionComponent', () => {
  let component: PreferencesReligionComponent;
  let fixture: ComponentFixture<PreferencesReligionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesReligionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesReligionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
