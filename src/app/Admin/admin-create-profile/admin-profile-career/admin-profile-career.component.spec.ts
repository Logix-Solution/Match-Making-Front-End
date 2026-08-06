import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminProfileCareerComponent } from './admin-profile-career.component';

describe('AdminProfileCareerComponent', () => {
  let component: AdminProfileCareerComponent;
  let fixture: ComponentFixture<AdminProfileCareerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminProfileCareerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminProfileCareerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
