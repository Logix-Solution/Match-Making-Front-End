import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsImagesComponent } from './testimonials-images.component';

describe('TestimonialsImagesComponent', () => {
  let component: TestimonialsImagesComponent;
  let fixture: ComponentFixture<TestimonialsImagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestimonialsImagesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsImagesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
