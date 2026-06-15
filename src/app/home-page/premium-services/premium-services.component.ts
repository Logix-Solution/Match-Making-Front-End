import { Component } from '@angular/core';

interface ServiceItem {
  id: string;
  title: string;
  imageUrl: string;
}

@Component({
  selector: 'app-premium-services',
  templateUrl: './premium-services.component.html',
  styleUrls: ['./premium-services.component.scss']
})
export class PremiumServicesComponent {

  // ── Service cards ─────────────────────────────────────────────────────────
  services: ServiceItem[] = [
    { id: 'match-making',        title: 'Matchmaking',        imageUrl: 'assets/images/matchmaking.svg' },
    { id: 'event-planning',      title: 'Event Planning',     imageUrl: 'assets/images/eventPlaning.svg' },
    { id: 'destination-wedding', title: 'Destination Wedding',imageUrl: 'assets/images/destinationwedding.svg' },
    { id: 'honeymoon',           title: 'Honeymoon',          imageUrl: 'assets/images/honeymoon.svg' }
  ];

  // ── Modal ─────────────────────────────────────────────────────────────────
  isModalOpen = false;

  openOverlay(): void  { this.isModalOpen = true;  }
  closeOverlay(): void { this.isModalOpen = false; }

  // ── Slider images (add/remove URLs here — slider auto-adjusts) ────────────
  sliderImages: string[] = [
    'assets/images/matchmaking.svg',
    'assets/images/eventPlaning.svg',
    'assets/images/destinationwedding.svg',
    'assets/images/honeymoon.svg',
    'assets/images/matchmaking.svg',
  ];

  readonly visibleCount = 3;   // how many slides shown at once
  currentSlide = 0;

  /** Dot count = total images minus the visible window */
  get sliderDots(): number[] {
    const count = Math.max(0, this.sliderImages.length - this.visibleCount + 1);
    return Array.from({ length: count }, (_, i) => i);
  }

  prevSlide(): void {
    if (this.currentSlide > 0) this.currentSlide--;
  }

  nextSlide(): void {
    const max = this.sliderImages.length - this.visibleCount;
    if (this.currentSlide < max) this.currentSlide++;
  }
}