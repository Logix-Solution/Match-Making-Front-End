import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';

interface Testimonial {
  quote: string;
  name: string;
  year: string;
}

@Component({
  selector: 'app-sucess-stories',
  templateUrl: './sucess-stories.component.html',
  styleUrls: ['./sucess-stories.component.scss']
})
export class SucessStoriesComponent implements OnInit, OnDestroy {

  testimonials: Testimonial[] = [
    { quote: "Nadia's Matchmaking Services made our search simple and secure. We found exactly the kind of family and partner we were looking for. Truly a blessed experience.", name: 'Sarah & Ahmed', year: 'Married in 2023' },
    { quote: "Nadia's Matchmaking Services made our search simple and secure. We found exactly the kind of family and partner we were looking for. Truly a blessed experience.", name: 'Sarah & Ahmed', year: 'Married in 2023' },
    { quote: "Nadia's Matchmaking Services made our search simple and secure. We found exactly the kind of family and partner we were looking for. Truly a blessed experience.", name: 'Sarah & Ahmed', year: 'Married in 2023' },
    { quote: "Nadia's Matchmaking Services made our search simple and secure. We found exactly the kind of family and partner we were looking for. Truly a blessed experience.", name: 'Sarah & Ahmed', year: 'Married in 2023' },
  ];

  currentIndex: number = 0;
  totalSlides: number = 2;
  isMobile: boolean = false;
  private slideInterval!: ReturnType<typeof setInterval>;

  @HostListener('window:resize')
  onResize(): void {
    this.isMobile = window.innerWidth <= 768;
    this.totalSlides = this.isMobile ? 4 : 2;
    if (this.currentIndex >= this.totalSlides) this.currentIndex = 0;
  }

  get translateX(): string {
    const slidePercent = this.isMobile ? 100 : 50;  // 100% per card on mobile, 50% per pair on desktop
    return `translateX(-${this.currentIndex * slidePercent}%)`;
  }

  ngOnInit(): void {
    this.onResize();
    this.slideInterval = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
    }, 5000);
  }

  goToSlide(i: number): void {
    this.currentIndex = i;
  }

  ngOnDestroy(): void {
    clearInterval(this.slideInterval);
  }
}