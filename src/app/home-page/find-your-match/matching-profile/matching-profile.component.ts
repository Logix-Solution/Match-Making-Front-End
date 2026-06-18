import { Component, OnInit } from '@angular/core';

export interface Profile {
  id: number;
  name: string;
  gender: string;
  age: number;
  height: string;
  maritalStatus: string;
  location: string;
  profession: string;
  avatar: string;
}

@Component({
  selector: 'app-matching-profile',
  templateUrl: './matching-profile.component.html',
  styleUrls: ['./matching-profile.component.scss']
})
export class MatchingProfileComponent implements OnInit {

  profiles: Profile[] = [
    { id: 1, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 2, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 3, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 4, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 5, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 6, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 7, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
    { id: 8, name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", maritalStatus: 'Unmarried', location: 'London', profession: 'Software Engineer', avatar: 'assets/images/profile1.png' },
  ];

  // ── Slider state ──────────────────────────────────────────────────────────
  currentIndex = 0;
  private readonly CHUNK_SIZE = 6;    // 3 cols × 2 rows per page

  // ── Computed ──────────────────────────────────────────────────────────────

  /** Whether to show the slider at all */
  get useSlider(): boolean {
    return this.profiles.length > this.CHUNK_SIZE;
  }

  /** Profiles split into pages of 6 */
  get slideChunks(): Profile[][] {
    const chunks: Profile[][] = [];
    for (let i = 0; i < this.profiles.length; i += this.CHUNK_SIZE) {
      chunks.push(this.profiles.slice(i, i + this.CHUNK_SIZE));
    }
    return chunks;
  }

  /** Total number of pages */
  get totalSlides(): number {
    return this.slideChunks.length;
  }

  /** CSS transform translation calculation */
  get translateX(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  ngOnInit(): void {}

  // ── Manual Control Operations ─────────────────────────────────────────────

  /** Shifts slide track container window leftwards */
  prevSlide(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  /** Shifts slide track container window rightwards */
  nextSlide(): void {
    if (this.currentIndex < this.totalSlides - 1) {
      this.currentIndex++;
    }
  }
}