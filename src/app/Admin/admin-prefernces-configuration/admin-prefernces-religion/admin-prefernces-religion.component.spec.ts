import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesReligionComponent } from './admin-prefernces-religion.component';

describe('AdminPreferncesReligionComponent', () => {
  let component: AdminPreferncesReligionComponent;
  let fixture: ComponentFixture<AdminPreferncesReligionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesReligionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesReligionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
