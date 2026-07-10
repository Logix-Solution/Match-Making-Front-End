import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPricingPlanComponent } from './user-pricing-plan.component';

describe('UserPricingPlanComponent', () => {
  let component: UserPricingPlanComponent;
  let fixture: ComponentFixture<UserPricingPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserPricingPlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPricingPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
