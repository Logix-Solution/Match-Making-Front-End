import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserUpgradePricePlanComponent } from './user-upgrade-price-plan.component';

describe('UserUpgradePricePlanComponent', () => {
  let component: UserUpgradePricePlanComponent;
  let fixture: ComponentFixture<UserUpgradePricePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserUpgradePricePlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserUpgradePricePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
