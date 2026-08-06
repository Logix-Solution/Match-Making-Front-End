import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPreferncesConfigurationComponent } from './admin-prefernces-configuration.component';

describe('AdminPreferncesConfigurationComponent', () => {
  let component: AdminPreferncesConfigurationComponent;
  let fixture: ComponentFixture<AdminPreferncesConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminPreferncesConfigurationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPreferncesConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
