import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SharedDataService } from '../../../shared/services/shared-data.service';

interface TestimonialVideo {
  id:           number;
  personName:   string;
  date:         string;
  videoLink:    string;
  thumbnailUrl: string;
  embedUrl:     SafeResourceUrl;
}

@Component({
  selector: 'app-testimonials-videos',
  templateUrl: './testimonials-videos.component.html',
  styleUrls: ['./testimonials-videos.component.scss']
})
export class TestimonialsVideosComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('sliderRef') sliderRef!: ElementRef<HTMLDivElement>;

  videos:       TestimonialVideo[]      = [];
  isPaused:     boolean                 = false;
  isPlayerOpen: boolean                 = false;
  activeVideo:  TestimonialVideo | null = null;

  // Dots — driven by scroll position, 4 dots always, cycling per page of 5 cards
  activeDot = 0;

  private intervalRef:        any     = null;
  private scrollListenerRef:  any     = null;
  private dataLoaded:         boolean = false;
  private viewReady:          boolean = false;
  private readonly SLIDE_INTERVAL     = 15000;
  private readonly CARDS_PER_PAGE     = 5;
  private readonly DOT_COUNT          = 4;

  constructor(
    private dataService: SharedDataService,
    private sanitizer:   DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadVideos();
  }

  // ── AfterViewInit guarantees sliderRef is available ───────────────────────
  ngAfterViewInit(): void {
    this.viewReady = true;
    this.tryStartScroll();
    this.attachScrollListener();
  }

  ngOnDestroy(): void {
    this.stopAutoScroll();
    if (this.scrollListenerRef && this.sliderRef) {
      this.sliderRef.nativeElement.removeEventListener('scroll', this.scrollListenerRef);
    }
  }

  // ── Load Videos ───────────────────────────────────────────────────────────
  loadVideos(): void {
    (this.dataService.getHttp('user-api/getFeedback', {}) as any)
      .subscribe((res: any) => {
        const data = Array.isArray(res) ? res : [];

        this.videos = data
          // ── Accept rows that have a videoLink (mediaTypeID may be 0 or 2)
          .filter((f: any) => f.videoLink && f.videoLink.trim() !== '')
          .map((f: any) => {
            const fileId = this.extractFileId(f.videoLink);
            return {
              id:           f.feedbackID,
              personName:   f.personName || 'Member',
              date:         this.formatDate(f.date),
              videoLink:    f.videoLink,
              thumbnailUrl: fileId
                ? `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`
                : '',
              embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(
                fileId
                  ? `https://drive.google.com/file/d/${fileId}/preview`
                  : f.videoLink
              )
            };
          });

        this.dataLoaded = true;
        this.tryStartScroll();
      });
  }

  // ── Only start once BOTH view and data are ready ──────────────────────────
  private tryStartScroll(): void {
    if (this.viewReady && this.dataLoaded && this.videos.length > 0) {
      // Small timeout lets Angular render the *ngFor cards first
      setTimeout(() => this.startAutoScroll(), 200);
    }
  }

  // ── Auto Scroll ───────────────────────────────────────────────────────────
  startAutoScroll(): void {
    this.stopAutoScroll();
    this.intervalRef = setInterval(() => {
      if (this.isPaused || !this.sliderRef) return;
      this.nextSlide();
    }, this.SLIDE_INTERVAL);
  }

  stopAutoScroll(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  // ── Manual forward / backward navigation (one page = 5 cards) ─────────────
  nextSlide(): void {
    if (!this.sliderRef) return;
    const el        = this.sliderRef.nativeElement;
    const pageWidth = this.getPageWidth();
    if (!pageWidth) return;

    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: pageWidth, behavior: 'smooth' });
    }
    this.restartAutoScrollTimer();
  }

  prevSlide(): void {
    if (!this.sliderRef) return;
    const el        = this.sliderRef.nativeElement;
    const pageWidth = this.getPageWidth();
    if (!pageWidth) return;

    if (el.scrollLeft <= 4) {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: -pageWidth, behavior: 'smooth' });
    }
    this.restartAutoScrollTimer();
  }

  // Manual click resets the auto-scroll countdown so it doesn't jump again immediately
  private restartAutoScrollTimer(): void {
    if (this.intervalRef) {
      this.startAutoScroll();
    }
  }

  private getPageWidth(): number {
    if (!this.sliderRef) return 0;
    const el   = this.sliderRef.nativeElement;
    const card = el.querySelector('.video-card') as HTMLElement | null;
    const cardStep = card ? card.offsetWidth + 12 : 180;
    return cardStep * this.CARDS_PER_PAGE;
  }

  // ── Update activeDot from scroll position (page-based, cycles through 4 dots) ─
  private attachScrollListener(): void {
    if (!this.sliderRef) return;
    const el = this.sliderRef.nativeElement;
    this.scrollListenerRef = () => {
      const pageWidth = this.getPageWidth();
      if (!pageWidth) return;
      const page      = Math.round(el.scrollLeft / pageWidth);
      this.activeDot  = page % this.DOT_COUNT;
    };
    el.addEventListener('scroll', this.scrollListenerRef, { passive: true });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private extractFileId(link: string): string {
    const match = link.match(/\/d\/([^/]+)/);
    return match ? match[1] : '';
  }

  private formatDate(raw: string): string {
    if (!raw) return '';
    return raw.split(' ')[0];
  }

  get dots(): number[] {
    return [0, 1, 2, 3];
  }

  // ── Player Modal ──────────────────────────────────────────────────────────
  openPlayer(video: TestimonialVideo): void {
    this.activeVideo  = video;
    this.isPlayerOpen = true;
  }

  closePlayer(): void {
    this.isPlayerOpen = false;
    this.activeVideo  = null;
  }
}