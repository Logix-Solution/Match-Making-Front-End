import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEventGalleryComponent } from './admin-event-gallery.component';

describe('AdminEventGalleryComponent', () => {
  let component: AdminEventGalleryComponent;
  let fixture: ComponentFixture<AdminEventGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminEventGalleryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEventGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
