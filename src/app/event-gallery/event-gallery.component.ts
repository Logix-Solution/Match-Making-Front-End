import { Component, OnInit, OnDestroy } from '@angular/core';

interface GalleryImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-event-gallery',
  templateUrl: './event-gallery.component.html',
  styleUrls: ['./event-gallery.component.scss']
})
export class EventGalleryComponent implements OnInit, OnDestroy {

  images: GalleryImage[] = [
    { src: 'assets/images/aboutus.svg', alt: 'Couple by the lake' },
    { src: 'assets/images/aboutus.svg', alt: 'Wedding venue' },
    { src: 'assets/images/aboutus.svg', alt: 'Bridal bouquet' },
    { src: 'assets/images/aboutus.svg', alt: 'Happy couple' },
    { src: 'assets/images/aboutus.svg', alt: 'Holding hands' },
  ];

  activeIndex: number = 0;
  private galleryInterval!: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.galleryInterval = setInterval(() => {
      this.activeIndex = (this.activeIndex + 1) % this.images.length;
    }, 3000);
  }

  setActive(i: number): void {
    this.activeIndex = i;
  }

  ngOnDestroy(): void {
    clearInterval(this.galleryInterval);
  }
}