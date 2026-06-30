import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';

@Component({
  selector: 'app-find-your-match',
  templateUrl: './find-your-match.component.html',
  styleUrls: ['./find-your-match.component.scss']
})
export class FindYourMatchComponent implements OnInit {

  filters = {
    gender:        '',
    country:       '',
    qualification: '',
    profession:    ''
  };

  // ── Dropdown lists from API ──────────────────────────────────────────────
  genderList:        any[] = [];
  countryList:       any[] = [];
  qualificationList: any[] = [];
  professionList:    any[] = [];

  // ── Passed to child on search ────────────────────────────────────────────
  activeFilters: any = null;

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.getCountries();
    this.getSubType(22); // Gender
    this.getSubType(4);  // Education Level
    this.getSubType(5);  // Occupation
  }

  // ── Countries ─────────────────────────────────────────────────────────────
  getCountries(): void {
    this.dataService.getHttp('cmis-api/getCountry', {}).subscribe({
      next: (res: any) => this.countryList = res,
      error: (err) => console.error('Error loading countries:', err)
    });
  }

  // ── SubTypes ──────────────────────────────────────────────────────────────
  getSubType(typeID: number): void {
    (this.dataService.getHttp('user-api/getSubType?', { typeID }) as any)
      .subscribe((res: any) => {
        const data = Array.isArray(res) ? res : [];
        switch (typeID) {
          case 22: this.genderList        = data; break;
          case 4:  this.qualificationList = data; break;
          case 5:  this.professionList    = data; break;
        }
      });
  }

  // ── Search — passes filters to child ──────────────────────────────────────
  onSearch(): void {
    this.activeFilters = { ...this.filters };
  }

  onReset(): void {
    this.filters = { gender: '', country: '', qualification: '', profession: '' };
    this.activeFilters = null;
  }
}