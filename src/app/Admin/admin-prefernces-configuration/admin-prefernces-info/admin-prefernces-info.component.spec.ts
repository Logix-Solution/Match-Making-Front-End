import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesInfoComponent } from './admin-prefernces-info.component';

describe('AdminPreferncesInfoComponent', () => {
  let component: AdminPreferncesInfoComponent;
  let fixture: ComponentFixture<AdminPreferncesInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
