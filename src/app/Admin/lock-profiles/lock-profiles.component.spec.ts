import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LockProfilesComponent } from './lock-profiles.component';

describe('LockProfilesComponent', () => {
  let component: LockProfilesComponent;
  let fixture: ComponentFixture<LockProfilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LockProfilesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LockProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
