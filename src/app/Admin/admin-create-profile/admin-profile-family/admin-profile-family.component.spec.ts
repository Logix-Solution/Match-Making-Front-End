import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfileFamilyComponent } from './admin-profile-family.component';

describe('AdminProfileFamilyComponent', () => {
  let component: AdminProfileFamilyComponent;
  let fixture: ComponentFixture<AdminProfileFamilyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminProfileFamilyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfileFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
