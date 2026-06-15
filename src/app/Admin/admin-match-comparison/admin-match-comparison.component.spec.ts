import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminMatchComparisonComponent } from './admin-match-comparison.component';

describe('AdminMatchComparisonComponent', () => {
  let component: AdminMatchComparisonComponent;
  let fixture: ComponentFixture<AdminMatchComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminMatchComparisonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminMatchComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
