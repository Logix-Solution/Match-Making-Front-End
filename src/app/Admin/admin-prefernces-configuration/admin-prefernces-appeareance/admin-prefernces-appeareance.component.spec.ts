import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesAppeareanceComponent } from './admin-prefernces-appeareance.component';

describe('AdminPreferncesAppeareanceComponent', () => {
  let component: AdminPreferncesAppeareanceComponent;
  let fixture: ComponentFixture<AdminPreferncesAppeareanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesAppeareanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesAppeareanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
