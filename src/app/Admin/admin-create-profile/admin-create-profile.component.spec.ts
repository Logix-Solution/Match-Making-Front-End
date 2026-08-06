import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCreateProfileComponent } from './admin-create-profile.component';

describe('AdminCreateProfileComponent', () => {
  let component: AdminCreateProfileComponent;
  let fixture: ComponentFixture<AdminCreateProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminCreateProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCreateProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
