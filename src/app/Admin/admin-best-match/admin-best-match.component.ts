import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
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
  id: number; // profileID
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
  id: number; // profileID
  name: string;
  image: string;
  gender: string;
  occupation: string;
  age: number;
  location: string;
  maxMatchPercentage: number;
  matches: MatchCard[];
}

// ─── Comparison modal interfaces ───────────────────────────────────
interface AttributeItem {
  typeID: number;
  typeTitle: string;
  subTypeID: number;
  subTypeTitle: string;
}

interface ComparisonAttrRow {
  typeTitle: string;
  baseValue: string;
  baseMatchesPreference: boolean;
  matchValue: string;
  matchMatchesPreference: boolean;
}

interface ComparisonSection {
  title: string;
  iconClass: string;
  rows: ComparisonAttrRow[];
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

  // getBestMatchProfiles only returns profileIDs (baseProfileID / MatchedProfileID),
  // but getUserDetails requires the actual userID — this map resolves profileID -> userID,
  // built from getRequestManagement (same source admin-user-management uses for this).
  private profileToUserIdMap = new Map<number, number>();

  // ─── Comparison Modal state ─────────────────────────────────────────
  showComparisonModal = false;
  comparisonLoading = false;
  comparisonError = '';
  comparisonBaseName = '';
  comparisonMatchName = '';
  comparisonMatchImage = '';
  comparisonSections: ComparisonSection[] = [];

  // Groups attribute typeIDs into the same section layout used elsewhere in the app
  private readonly sectionTypeMap: { title: string; iconClass: string; typeIDs: number[] }[] = [
    { title: 'Personal Information', iconClass: 'bi bi-person', typeIDs: [1, 3, 22, 10, 26, 25, 30] },
    { title: 'Religion', iconClass: 'bi bi-moon', typeIDs: [7, 8, 9] },
    { title: 'Family', iconClass: 'bi bi-house', typeIDs: [11, 12, 13, 14, 19] },
    { title: 'Appearance', iconClass: 'bi bi-person-bounding-box', typeIDs: [15, 16] },
    { title: 'Lifestyle', iconClass: 'bi bi-cup-hot', typeIDs: [17, 18] },
    { title: 'Education & Career', iconClass: 'bi bi-briefcase', typeIDs: [4, 5, 6] },
  ];

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadBestMatchProfiles();
  }

  // ─── Fetch + Parse ──────────────────────────────────────────────────
  loadBestMatchProfiles(): void {
    this.isLoading = true;

    forkJoin({
      matches: this.dataService.getHttp('core-api/Admin/getBestMatchProfiles') as any,
      users: this.dataService.getHttp('core-api/Admin/getRequestManagement', {}) as any,
    }).subscribe({
      next: ({ matches, users }: any) => {
        this.buildProfileUserIdMap(users);

        const rows: BaseProfileApiRow[] = Array.isArray(matches) ? matches : [];
        this.profiles = rows.map((row) => this.mapToGridProfile(row));
        this.filteredProfiles = [...this.profiles];
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading best match profiles:', err);
        this.isLoading = false;
      },
    });
  }

  private buildProfileUserIdMap(users: any): void {
    const list = Array.isArray(users) ? users : [];
    this.profileToUserIdMap.clear();
    list.forEach((u: any) => {
      if (u?.profileID != null && u?.userID != null) {
        this.profileToUserIdMap.set(+u.profileID, +u.userID);
      }
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

  // ─── Comparison Modal ───────────────────────────────────────────────
  onRedirectToFullProfile(match: MatchCard): void {
    if (!this.selectedProfile) return;

    this.showComparisonModal = true;
    this.comparisonLoading = true;
    this.comparisonError = '';
    this.comparisonSections = [];
    this.comparisonBaseName = this.selectedProfile.name;
    this.comparisonMatchName = match.name;
    this.comparisonMatchImage = match.image;

    // Resolve profileID -> userID for both sides before calling getUserDetails,
    // since getBestMatchProfiles only gives us profileIDs.
    const baseUserID = this.profileToUserIdMap.get(this.selectedProfile.id);
    const matchUserID = this.profileToUserIdMap.get(match.id);

    if (!baseUserID || !matchUserID) {
      console.error(
        'Could not resolve userID for profileID(s):',
        this.selectedProfile.id, match.id,
      );
      this.comparisonError = 'Unable to load this profile — Profile is not completed.';
      this.comparisonLoading = false;
      return;
    }

    forkJoin({
      base: this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${baseUserID}`) as any,
      match: this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${matchUserID}`) as any,
    }).subscribe({
      next: ({ base, match: matchRes }: any) => {
        const baseUser = Array.isArray(base) ? base[0] : base;
        const matchUser = Array.isArray(matchRes) ? matchRes[0] : matchRes;
        this.comparisonSections = this.buildComparisonSections(baseUser, matchUser);
        this.comparisonLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading comparison profiles:', err);
        this.comparisonError = 'Something went wrong while loading this comparison.';
        this.comparisonLoading = false;
      },
    });
  }

  closeComparisonModal(): void {
    this.showComparisonModal = false;
    this.comparisonSections = [];
    this.comparisonError = '';
  }

  private parseAttributeList(json: string | null | undefined): AttributeItem[] {
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  private groupAcceptedSubTypes(prefs: AttributeItem[]): Map<number, Set<number>> {
    const map = new Map<number, Set<number>>();
    prefs.forEach((p) => {
      if (!map.has(p.typeID)) map.set(p.typeID, new Set());
      map.get(p.typeID)!.add(p.subTypeID);
    });
    return map;
  }

  private buildComparisonSections(baseUser: any, matchUser: any): ComparisonSection[] {
    const baseProfileAttrs = this.parseAttributeList(baseUser?.userProfile);
    const baseUserPrefs = this.parseAttributeList(baseUser?.userPreference);
    const matchProfileAttrs = this.parseAttributeList(matchUser?.userProfile);
    const matchUserPrefs = this.parseAttributeList(matchUser?.userPreference);

    const baseAcceptedByType = this.groupAcceptedSubTypes(baseUserPrefs);
    const matchAcceptedByType = this.groupAcceptedSubTypes(matchUserPrefs);

    const baseAttrByType = new Map<number, AttributeItem>();
    baseProfileAttrs.forEach((a) => baseAttrByType.set(a.typeID, a));

    const matchAttrByType = new Map<number, AttributeItem>();
    matchProfileAttrs.forEach((a) => matchAttrByType.set(a.typeID, a));

    const buildRow = (typeID: number): ComparisonAttrRow | null => {
      const baseAttr = baseAttrByType.get(typeID);
      const matchAttr = matchAttrByType.get(typeID);
      if (!baseAttr && !matchAttr) return null;

      const typeTitle = baseAttr?.typeTitle || matchAttr?.typeTitle || '';
      const matchAccepted = matchAcceptedByType.get(typeID);
      const baseAccepted = baseAcceptedByType.get(typeID);

      const baseMatchesPreference =
        !matchAccepted || !baseAttr ? true : matchAccepted.has(baseAttr.subTypeID);
      const matchMatchesPreference =
        !baseAccepted || !matchAttr ? true : baseAccepted.has(matchAttr.subTypeID);

      return {
        typeTitle,
        baseValue: baseAttr?.subTypeTitle || '-',
        baseMatchesPreference,
        matchValue: matchAttr?.subTypeTitle || '-',
        matchMatchesPreference,
      };
    };

    return this.sectionTypeMap
      .map((sec) => ({
        title: sec.title,
        iconClass: sec.iconClass,
        rows: sec.typeIDs
          .map((typeID) => buildRow(typeID))
          .filter((r): r is ComparisonAttrRow => r !== null),
      }))
      .filter((sec) => sec.rows.length > 0);
  }
}