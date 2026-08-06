import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesFamilyComponent } from './admin-prefernces-family.component';

describe('AdminPreferncesFamilyComponent', () => {
  let component: AdminPreferncesFamilyComponent;
  let fixture: ComponentFixture<AdminPreferncesFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesFamilyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
