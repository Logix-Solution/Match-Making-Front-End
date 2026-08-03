import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { environment } from 'src/envirnment/environment';

// ─── Raw API interfaces ─────────────────────────────────────────────
interface MatchedProfileRaw {
  MatchedProfileID: number;
  MatchedProfileName: string;
  Age: number;
  MatchedeDoc?: string;
  Gender: string;
  Occupation?: string;
  CityID: number;
  CityName: string;
  CountryID: number;
  CountryName: string;
  MatchedAttributes: number;
  TotalAttributeCount: number;
  MatchPercentage: number;
}

interface BaseProfileInfoRaw {
  Age?: number;
  eDoc?: string;
  Gender?: string;
  Occupation?: string;
  CityID?: number;
  CityName?: string;
  CountryID?: number;
  CountryName?: string;
}

interface BaseProfileApiRow {
  baseProfileID: number;
  baseProfileName: string;
  baseProfileInfo: string;
  totalCount: number;
  matchedProfiles: string | null;
}

// ─── View models ─────────────────────────────────────────────────────
interface MatchCard {
  id: number;
  name: string;
  image: string;
  age: number;
  gender: string;
  occupation: string;
  city: string;
  nationality: string;
  matchPercentage: number;
}

interface GridProfile {
  id: number;
  name: string;
  image: string;
  gender: string;
  occupation: string;
  age: number;
  location: string;
  maxMatchPercentage: number;
  matches: MatchCard[];
}

@Component({
  selector: 'app-admin-best-match',
  templateUrl: './admin-best-match.component.html',
  styleUrls: ['./admin-best-match.component.scss'],
})
export class AdminBestMatchComponent implements OnInit {

  currentView: 'grid' | 'detail' = 'grid';

  profiles: GridProfile[] = [];
  filteredProfiles: GridProfile[] = [];
  searchQuery: string = '';

  selectedProfile: GridProfile | null = null;
  bestMatchesList: MatchCard[] = [];

  isLoading: boolean = false;

  private readonly imageBasePath = 'assets/user-images/userProfile/';
  private readonly defaultImage = 'assets/img/default-avatar.png';

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadBestMatchProfiles();
  }

  // ─── Fetch + Parse ──────────────────────────────────────────────────
  loadBestMatchProfiles(): void {
    this.isLoading = true;

    (this.dataService.getHttp('core-api/Admin/getBestMatchProfiles') as any)
      .subscribe({
        next: (res: BaseProfileApiRow[]) => {
          this.profiles = (res || []).map((row) => this.mapToGridProfile(row));
          this.filteredProfiles = [...this.profiles];
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading best match profiles:', err);
          this.isLoading = false;
        },
      });
  }

  private mapToGridProfile(row: BaseProfileApiRow): GridProfile {
    let info: BaseProfileInfoRaw = {};
    try {
      info = row.baseProfileInfo ? JSON.parse(row.baseProfileInfo) : {};
    } catch {
      info = {};
    }

    let matchedRaw: MatchedProfileRaw[] = [];
    try {
      matchedRaw = row.matchedProfiles ? JSON.parse(row.matchedProfiles) : [];
    } catch {
      matchedRaw = [];
    }

    const matches: MatchCard[] = matchedRaw.map((m) => ({
      id: m.MatchedProfileID,
      name: m.MatchedProfileName?.trim() || 'Unknown',
      image: this.buildImageUrl(m.MatchedeDoc),
      age: m.Age,
      gender: m.Gender,
      occupation: m.Occupation || '-',
      city: m.CityName,
      nationality: m.CountryName,
      matchPercentage: m.MatchPercentage,
    }));

    // Highest match % among this base profile's matches (0 if none)
    const maxMatchPercentage = matches.length
      ? Math.max(...matches.map((m) => m.matchPercentage))
      : 0;

    return {
      id: row.baseProfileID,
      name: row.baseProfileName?.trim() || 'Unknown',
      image: this.buildImageUrl(info.eDoc),
      gender: info.Gender || '-',
      occupation: info.Occupation || '-',
      age: info.Age ?? 0,
      location: info.CityName ? `${info.CityName}, ${info.CountryName}` : '-',
      maxMatchPercentage,
      matches,
    };
  }

  private buildImageUrl(eDoc?: string): string {
    if (!eDoc) return this.defaultImage;
    return environment.productUrl + this.imageBasePath + eDoc;
  }

  // ─── Search (grid view) ───────────────────────────────────────────
  onSearchFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredProfiles = !q
      ? [...this.profiles]
      : this.profiles.filter((p) => p.name.toLowerCase().includes(q));
  }

  // ─── View switching (same old pattern, no modal) ──────────────────
  viewProfileDetails(profile: GridProfile): void {
    this.selectedProfile = profile;
    this.bestMatchesList = profile.matches;
    this.currentView = 'detail';
  }

  backToGridView(): void {
    this.currentView = 'grid';
    this.selectedProfile = null;
    this.bestMatchesList = [];
  }

  onRedirectToFullProfile(match: MatchCard): void {
    console.log('Redirect to full profile for:', match.id);
  }
}