import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneStepAwayComponent } from './one-step-away.component';

describe('OneStepAwayComponent', () => {
  let component: OneStepAwayComponent;
  let fixture: ComponentFixture<OneStepAwayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneStepAwayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneStepAwayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
