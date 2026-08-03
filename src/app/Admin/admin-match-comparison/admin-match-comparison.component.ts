import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { environment } from 'src/envirnment/environment';

// ─── Raw API shapes (core-api/Admin/getBestMatchProfiles) ─────────────────
interface BestMatchApiItem {
  baseProfileID: number;
  baseProfileName: string;
  baseProfileInfo: string;       // JSON string
  totalCount: number;
  matchedProfiles: string | null; // JSON string (array) or null
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

interface MatchedProfileRaw {
  MatchedProfileID: number;
  MatchedProfileName: string;
  Age: number;
  MatchedeDoc?: string;
  MatchPercentage: number;
}

// ─── Raw API shapes (core-api/Admin/getMatchCompare) ───────────────────────
interface CompareAttribute {
  TypeID: number;
  TypeName: string;
  MatchedValue?: string;
  BaseValue?: string;
  CompareValue?: string;
}

interface CompareAttributeGroup {
  CompareProfileID: number;
  Attributes: CompareAttribute[];
}

interface MatchCompareApiItem {
  baseProfile: string;
  compareProfile: string;
  matches: string;
  matchedAttributes: string;      // JSON string (array of CompareAttributeGroup)
  differentAttributes: string;    // JSON string (array of CompareAttributeGroup)
}

// ─── View models ────────────────────────────────────────────────────────────
interface ProfileItem {
  id: number;
  name: string;
  gender: string;
  occupation: string;
  age: number;
  location: string;
  image: string;
  matchPercentage: number;
  selected: boolean;
}

interface ComparisonColumnData {
  profileID: number;
  maritalStatus: string;
  ageRange: string;
  city: string;
  countries: string;
  castes: string;
  education: string;
  income: string;
}

@Component({
  selector: 'app-admin-match-comparison',
  templateUrl: './admin-match-comparison.component.html',
  styleUrls: ['./admin-match-comparison.component.scss']
})
export class AdminMatchComparisonComponent implements OnInit {

  currentStep: 'selection' | 'compare' = 'selection';
  searchQuery: string = '';

  profiles: ProfileItem[] = [];
  selectedProfiles: ProfileItem[] = [];
  comparisonColumns: ComparisonColumnData[] = [];

  isLoadingProfiles = false;
  isLoadingCompare = false;

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadProfiles();
  }

  get filteredProfiles(): ProfileItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) return this.profiles;
    return this.profiles.filter(p =>
      p.name.toLowerCase().includes(q) || p.location.toLowerCase().includes(q)
    );
  }

  // ─── Load selection cards ─────────────────────────────────────────────────
  private loadProfiles(): void {
    this.isLoadingProfiles = true;
    this.dataService.getHttp('core-api/Admin/getBestMatchProfiles', {}).subscribe({
      next: (res: any) => {
        const data: BestMatchApiItem[] = Array.isArray(res) ? res : [];
        this.profiles = data
          .filter(item => item.totalCount > 0) // skip profiles with no data/matches at all
          .map(item => this.mapToProfileItem(item));
        this.isLoadingProfiles = false;
      },
      error: (err) => {
        console.error('getBestMatchProfiles error:', err);
        this.isLoadingProfiles = false;
      }
    });
  }

  private mapToProfileItem(item: BestMatchApiItem): ProfileItem {
    let info: BaseProfileInfoRaw = {};
    try { info = JSON.parse(item.baseProfileInfo || '{}'); } catch { info = {}; }

    let topMatchPercentage = 0;
    if (item.matchedProfiles) {
      try {
        const matched: MatchedProfileRaw[] = JSON.parse(item.matchedProfiles);
        if (matched.length) {
          topMatchPercentage = Math.max(...matched.map(m => m.MatchPercentage || 0));
        }
      } catch { /* malformed matchedProfiles, ignore */ }
    }

    const location = [info.CityName, info.CountryName].filter(Boolean).join(', ') || 'Unknown';
    const image = info.eDoc
      ? environment.productUrl + 'assets/user-images/userProfile/' + info.eDoc
      : 'assets/img/default-avatar.png';

    return {
      id: item.baseProfileID,
      name: item.baseProfileName,
      gender: info.Gender || 'N/A',
      occupation: info.Occupation || 'N/A',
      age: info.Age ?? 0,
      location,
      image,
      matchPercentage: Math.round(topMatchPercentage),
      selected: false,
    };
  }

  // ─── Selection handling ────────────────────────────────────────────────────
  toggleProfileSelection(profile: ProfileItem): void {
    if (profile.selected) {
      profile.selected = false;
    } else {
      if (this.getSelectedCount() >= 3) {
        alert('You can select a maximum of 3 profiles to compare at once.');
        return;
      }
      profile.selected = true;
    }
    this.updateSelectedProfilesList();
  }

  getSelectedCount(): number {
    return this.profiles.filter(p => p.selected).length;
  }

  updateSelectedProfilesList(): void {
    this.selectedProfiles = this.profiles.filter(p => p.selected);
  }

  // ─── Navigation ─────────────────────────────────────────────────────────
  navigateToComparePage(): void {
    const totalSelectedCount = this.getSelectedCount();
    if (totalSelectedCount < 2) {
      alert('Please select a minimum of 2 profiles to initiate a side-by-side match evaluation.');
      return;
    }
    this.loadComparisonData();
  }

  backToSelection(): void {
    this.currentStep = 'selection';
  }

  // ─── Load comparison data ──────────────────────────────────────────────────
  // The first selected profile is treated as the base; the rest are the "compare" profiles.
  private loadComparisonData(): void {
    const [base, ...compares] = this.selectedProfiles;
    const compareIDs = compares.map(p => p.id).join(',');

    this.isLoadingCompare = true;
    this.dataService
      .getHttp(`core-api/Admin/getMatchCompare?baseProfileID=${base.id}&compareProfileIDs=${compareIDs}`)
      .subscribe({
        next: (res: any) => {
          this.comparisonColumns = this.buildComparisonColumns(res);
          this.isLoadingCompare = false;
          this.currentStep = 'compare';
        },
        error: (err) => {
          console.error('getMatchCompare error:', err);
          this.isLoadingCompare = false;
          alert('Could not load comparison data, please try again');
        }
      });
  }

  private buildComparisonColumns(res: any): ComparisonColumnData[] {
    const entry: MatchCompareApiItem | null = Array.isArray(res) && res.length ? res[0] : null;

    let matchedGroups: CompareAttributeGroup[] = [];
    let differentGroups: CompareAttributeGroup[] = [];

    if (entry) {
      try { matchedGroups = JSON.parse(entry.matchedAttributes || '[]'); } catch { matchedGroups = []; }
      try { differentGroups = JSON.parse(entry.differentAttributes || '[]'); } catch { differentGroups = []; }
    }

    // Looks up a TypeName's value for a given CompareProfileID pairing.
    // side='base' reads BaseValue (or the shared MatchedValue), side='compare' reads CompareValue.
    const findValue = (typeName: string, compareProfileID: number, side: 'base' | 'compare'): string => {
      const diffGroup = differentGroups.find(g => g.CompareProfileID === compareProfileID);
      if (diffGroup) {
        const attr = diffGroup.Attributes.find(a => a.TypeName === typeName);
        if (attr) return (side === 'base' ? attr.BaseValue : attr.CompareValue) || '—';
      }
      const matchGroup = matchedGroups.find(g => g.CompareProfileID === compareProfileID);
      if (matchGroup) {
        const attr = matchGroup.Attributes.find(a => a.TypeName === typeName);
        if (attr) return attr.MatchedValue || '—';
      }
      return '—';
    };

    const buildAgeRange = (compareProfileID: number, side: 'base' | 'compare'): string => {
      const min = findValue('Minimum Age', compareProfileID, side);
      const max = findValue('Maximum Age', compareProfileID, side);
      if (min === '—' && max === '—') return '—';
      return `Ages ${min} to ${max}`;
    };

    const [baseProfile, ...compareProfiles] = this.selectedProfiles;
    const columns: ComparisonColumnData[] = [];

    // BaseValue is identical across every pairing, so any compare-profile pairing works as the lookup key.
    const referenceCompareID = compareProfiles.length ? compareProfiles[0].id : 0;
    columns.push({
      profileID: baseProfile.id,
      maritalStatus: findValue('Marital Status', referenceCompareID, 'base'),
      ageRange: buildAgeRange(referenceCompareID, 'base'),
      city: baseProfile.location.split(',')[0]?.trim() || '—',
      countries: findValue('Nationality', referenceCompareID, 'base'),
      castes: findValue('Cast', referenceCompareID, 'base'),
      education: findValue('Education Level', referenceCompareID, 'base'),
      income: findValue('Monthly Income', referenceCompareID, 'base'),
    });

    compareProfiles.forEach(cp => {
      columns.push({
        profileID: cp.id,
        maritalStatus: findValue('Marital Status', cp.id, 'compare'),
        ageRange: buildAgeRange(cp.id, 'compare'),
        city: cp.location.split(',')[0]?.trim() || '—',
        countries: findValue('Nationality', cp.id, 'compare'),
        castes: findValue('Cast', cp.id, 'compare'),
        education: findValue('Education Level', cp.id, 'compare'),
        income: findValue('Monthly Income', cp.id, 'compare'),
      });
    });

    return columns;
  }
}