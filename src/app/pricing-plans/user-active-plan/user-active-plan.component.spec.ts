import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivePlanComponent } from './user-active-plan.component';

describe('UserActivePlanComponent', () => {
  let component: UserActivePlanComponent;
  let fixture: ComponentFixture<UserActivePlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserActivePlanComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserActivePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
