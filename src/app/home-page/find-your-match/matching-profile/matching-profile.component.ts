import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SharedDataService } from '../../../../shared/services/shared-data.service';

export interface Profile {
  id:            number;
  name:          string;
  gender:        string;
  age:           number;
  height:        string;
  maritalStatus: string;
  location:      string;
  profession:    string;
  education:     string;
  country:       string;
  religion:      string;
  avatar:        string;
}

@Component({
  selector: 'app-matching-profile',
  templateUrl: './matching-profile.component.html',
  styleUrls: ['./matching-profile.component.scss']
})
export class MatchingProfileComponent implements OnInit, OnChanges {

  // ── Filters passed from parent ────────────────────────────────────────────
  @Input() filters: any = null;

  allProfiles:     Profile[] = [];
  profiles:        Profile[] = [];

  // ── Slider state ──────────────────────────────────────────────────────────
  currentIndex = 0;
  private readonly CHUNK_SIZE = 6;

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  // ── Re-filter when parent changes filters ─────────────────────────────────
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filters']) {
      this.applyFilters();
    }
  }

  // ── Load profiles from API ────────────────────────────────────────────────
  loadProfiles(): void {
    (this.dataService.getHttp('user-api/FindOutMatch', {}) as any)
      .subscribe((res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allProfiles = data.map((p: any) => ({
          id:            p.profileID,
          name:          p.fullName || 'Unknown',
          gender:        p.gender   || '---',
          age:           this.calculateAge(p.dateOfBirth),
          height:        p.height   || '---',
          maritalStatus: p.marital_Status || '---',
          location:      [p.city_Name, p.country_Name].filter(Boolean).join(', ') || '---',
          profession:    p.occupation      || '---',
          education:     p.education_Level || '---',
          country:       p.country_Name    || '',
          religion:      p.religion        || '---',
          avatar:        p.eDoc            || 'assets/images/profile1.png',
        }));
        this.applyFilters();
      });
  }

  // ── Apply filters from parent ─────────────────────────────────────────────
  applyFilters(): void {
    const f = this.filters;

    if (!f || (!f.gender && !f.country && !f.qualification && !f.profession)) {
      // No active filters — show all
      this.profiles = [...this.allProfiles];
    } else {
      this.profiles = this.allProfiles.filter(p => {
        const genderMatch        = !f.gender        || p.gender.toLowerCase()    === f.gender.toLowerCase();
        const countryMatch       = !f.country       || p.country.toLowerCase()   === f.country.toLowerCase();
        const qualificationMatch = !f.qualification || p.education.toLowerCase() === f.qualification.toLowerCase();
        const professionMatch    = !f.profession    || p.profession.toLowerCase()=== f.profession.toLowerCase();
        return genderMatch && countryMatch && qualificationMatch && professionMatch;
      });
    }

    // Reset slider to first page on new filter result
    this.currentIndex = 0;
  }

  // ── Age Calculator ────────────────────────────────────────────────────────
  calculateAge(dob: string): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return 0;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  // ── Slider ────────────────────────────────────────────────────────────────
  get useSlider(): boolean {
    return this.profiles.length > this.CHUNK_SIZE;
  }

  get slideChunks(): Profile[][] {
    const chunks: Profile[][] = [];
    for (let i = 0; i < this.profiles.length; i += this.CHUNK_SIZE) {
      chunks.push(this.profiles.slice(i, i + this.CHUNK_SIZE));
    }
    return chunks;
  }

  get totalSlides(): number {
    return this.slideChunks.length;
  }

  get translateX(): string {
    return `translateX(-${this.currentIndex * 100}%)`;
  }

  prevSlide(): void {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  nextSlide(): void {
    if (this.currentIndex < this.totalSlides - 1) this.currentIndex++;
  }
}