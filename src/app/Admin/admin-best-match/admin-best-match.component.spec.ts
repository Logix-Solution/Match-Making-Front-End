import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminBestMatchComponent } from './admin-best-match.component';

describe('AdminBestMatchComponent', () => {
  let component: AdminBestMatchComponent;
  let fixture: ComponentFixture<AdminBestMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminBestMatchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminBestMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
