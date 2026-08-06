import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesCareerComponent } from './admin-prefernces-career.component';

describe('AdminPreferncesCareerComponent', () => {
  let component: AdminPreferncesCareerComponent;
  let fixture: ComponentFixture<AdminPreferncesCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesCareerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
