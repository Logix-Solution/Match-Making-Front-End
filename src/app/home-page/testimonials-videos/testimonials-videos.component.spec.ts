import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestimonialsVideosComponent } from './testimonials-videos.component';

describe('TestimonialsVideosComponent', () => {
  let component: TestimonialsVideosComponent;
  let fixture: ComponentFixture<TestimonialsVideosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TestimonialsVideosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestimonialsVideosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
