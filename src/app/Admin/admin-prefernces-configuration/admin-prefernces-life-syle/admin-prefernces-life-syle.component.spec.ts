import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesLifeSyleComponent } from './admin-prefernces-life-syle.component';

describe('AdminPreferncesLifeSyleComponent', () => {
  let component: AdminPreferncesLifeSyleComponent;
  let fixture: ComponentFixture<AdminPreferncesLifeSyleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesLifeSyleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesLifeSyleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
