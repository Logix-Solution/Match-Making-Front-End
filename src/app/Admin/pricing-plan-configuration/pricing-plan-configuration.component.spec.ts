import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingPlanConfigurationComponent } from './pricing-plan-configuration.component';

describe('PricingPlanConfigurationComponent', () => {
  let component: PricingPlanConfigurationComponent;
  let fixture: ComponentFixture<PricingPlanConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PricingPlanConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PricingPlanConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
