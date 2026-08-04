import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { environment } from 'src/envirnment/environment';

interface GalleryImage {
  src: string;
  alt: string;
  eventTypeTitle: string;
}

@Component({
  selector: 'app-event-gallery',
  templateUrl: './event-gallery.component.html',
  styleUrls: ['./event-gallery.component.scss']
})
export class EventGalleryComponent implements OnInit, OnDestroy {

  images: GalleryImage[] = [];
  activeIndex: number = 0;
  lightboxImage: GalleryImage | null = null;
  private galleryInterval!: ReturnType<typeof setInterval>;
  private readonly AUTOPLAY_SPEED_MS = 4000; 

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadGallery();
  }

  loadGallery(): void {
    (this.dataService.getHttp('user-api/getDashboardGalleryEvents', {}) as any)
      .subscribe((res: any) => {
        console.log(res,'event images')
        const data = Array.isArray(res) ? res : [];
        this.images = data.map((event: any) => ({
          src:        environment.productUrl + 'assets/user-images/Events/' +    event.eDoc,
          alt:            event.eventTitle      || 'Event Image',
          eventTypeTitle: event.eventTypeTitle  || ''
        }));
        this.startAutoPlay();
      });
  }

  startAutoPlay(): void {
    clearInterval(this.galleryInterval); // guard against duplicate intervals stacking
    this.galleryInterval = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.images.length;
    }, this.AUTOPLAY_SPEED_MS);
  }

  pauseAutoPlay(): void {
    clearInterval(this.galleryInterval);
  }

  resumeAutoPlay(): void {
    this.startAutoPlay();
  }

  setActive(i: number): void {
    this.activeIndex = i;
  }

  openLightbox(img: GalleryImage): void {
    this.lightboxImage = img;
    clearInterval(this.galleryInterval);
  }

  closeLightbox(): void {
    this.lightboxImage = null;
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    clearInterval(this.galleryInterval);
  }
}