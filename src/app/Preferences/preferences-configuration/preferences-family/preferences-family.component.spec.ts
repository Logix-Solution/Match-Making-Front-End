import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreferencesFamilyComponent } from './preferences-family.component';

describe('PreferencesFamilyComponent', () => {
  let component: PreferencesFamilyComponent;
  let fixture: ComponentFixture<PreferencesFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreferencesFamilyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreferencesFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
