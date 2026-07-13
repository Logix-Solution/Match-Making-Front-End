import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { environment } from 'src/envirnment/environment';

interface TestimonialImage {
  id:         number;
  personName: string;
  imageUrl:   string;
}

@Component({
  selector: 'app-testimonials-images',
  templateUrl: './testimonials-images.component.html',
  styleUrls: ['./testimonials-images.component.scss']
})
export class TestimonialsImagesComponent implements OnInit, OnDestroy {

  images:   TestimonialImage[] = [];
  isPaused: boolean = false;

  // ── Swap-based slider state ──────────────────────────────────────────────
  currentIndex: number = 0;
  private intervalRef: any = null;
  private readonly SLIDE_INTERVAL = 5000; // 5 seconds between swaps
  private readonly SWAP_DURATION  = 700;  // matches CSS animation duration (ms)
  private outgoingTimer: any = null;

  // Holds the image that is currently animating OUT toward the text section
  outgoingImage: TestimonialImage | null = null;
  // Holds the image that is currently animating IN from the right
  incomingImage: TestimonialImage | null = null;

  // dots — purely decorative, matches design
  dots = [0, 1, 2, 3];
  activeDot = 0;

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadImages();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
    clearTimeout(this.outgoingTimer);
  }

  // ── Load only mediaTypeID = 1 (images) ────────────────────────────────────
  loadImages(): void {
    this.dataService.getHttp('user-api/getFeedback', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.images = data
          .filter((f: any) => f.mediaTypeID === 1)
          .map((f: any) => ({
            id:         f.feedbackID,
            personName: f.personName || 'Member',
            // imageUrl:   f.eImage || '',
             imageUrl:  environment.productUrl + 'assets/user-images/Feedback/' + f.eImage || '',
          }))
          .filter((f: TestimonialImage) => !!f.imageUrl);

        if (this.images.length > 1) {
          this.startAutoSlide();
        }
      },
      error: (err) => console.error('Testimonial images load error:', err)
    });
  }

  // ── Auto Slide every 5s ────────────────────────────────────────────────────
  startAutoSlide(): void {
    this.stopAutoSlide();
    this.intervalRef = setInterval(() => {
      if (!this.isPaused) {
        this.nextSlide();
      }
    }, this.SLIDE_INTERVAL);
  }

  stopAutoSlide(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  nextSlide(): void {
    if (this.images.length === 0) return;

    const nextIndex = (this.currentIndex + 1) % this.images.length;

    // Outgoing image — slides out toward the left (text section)
    this.outgoingImage = this.images[this.currentIndex];
    this.incomingImage = this.images[nextIndex];

    this.currentIndex = nextIndex;

    // Clear the outgoing image once its exit animation finishes
    clearTimeout(this.outgoingTimer);
    this.outgoingTimer = setTimeout(() => {
      this.outgoingImage = null;
    }, this.SWAP_DURATION);
  }

  // ── Current single image shown in the container ──────────────────────────
  get currentImage(): TestimonialImage | null {
    return this.images.length > 0 ? this.images[this.currentIndex] : null;
  }

  // ── Forces Angular to recreate the element on every index change,
  //    which retriggers the CSS slide-in animation naturally ───────────────
  trackByIndex = (): number => this.currentIndex;

  // ── Pause on hover — stops swap completely ────────────────────────────────
  onMouseEnter(): void { this.isPaused = true; }
  onMouseLeave(): void { this.isPaused = false; }

  lightboxImage: TestimonialImage | null = null;

openLightbox(img: TestimonialImage): void {
  this.lightboxImage = img;
  this.isPaused = true;           // pause slider while viewing
}

closeLightbox(): void {
  this.lightboxImage = null;
  this.isPaused = false;          // resume slider on close
}
}