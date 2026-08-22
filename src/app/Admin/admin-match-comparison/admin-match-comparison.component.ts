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

// "matches" array entries — carries MatchPercentage per compare profile
interface MatchInfoRaw {
  profileID: number;
  fullName: string;
  eDoc?: string;
  Age: number;
  MatchedAttributes: number;
  TotalAttributes: number;
  MatchPercentage: number;
}

interface MatchCompareApiItem {
  baseProfile: string;
  compareProfile: string;
  matches: string;                // JSON string (array of MatchInfoRaw)
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

interface AttributeRow {
  label: string;
  value: string;
}

interface AttributeSection {
  icon: string;
  title: string;
  rows: AttributeRow[];
}

interface ComparisonColumnData {
  profileID: number;
  matchPercentage: number | null; // null for the base profile (nothing to match against itself)
  matchedCount: number | null;
  totalCount: number | null;
  values: { [typeName: string]: string }; // flat lookup, used for header pills
  sections: AttributeSection[];           // full grouped attribute breakdown
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

  // Ordered section config — every TypeName in the API that matters shows up
  // under one of these; any TypeName not listed here is simply skipped.
  private readonly sectionConfig: { icon: string; title: string; typeNames: string[] }[] = [
    {
      icon: 'bi-person-vcard',
      title: 'Personal Information',
      typeNames: ['Cast', 'Nationality', 'Ethnicity', 'Gender', 'Marital Status', 'Age Range', 'No Of Siblings'],
    },
    {
      icon: 'bi-moon-stars',
      title: 'Religion',
      typeNames: ['Religion', 'Sect', 'Religion Importance'],
    },
    {
      icon: 'bi-person-bounding-box',
      title: 'Appearance',
      typeNames: ['Height', 'Body Type', 'Skin Tone', 'Disability'],
    },
    {
      icon: 'bi-cup-straw',
      title: 'Lifestyle',
      typeNames: ['Smoke', 'Alcohol', 'Want Kids', 'Accept Patner With Kids', 'Willing Relocate', 'Timeline For Marriage'],
    },
    {
      icon: 'bi-house-heart',
      title: 'Family',
      typeNames: ['Housing Situation', 'Father Occupation', 'Mother Occupation', 'Family involvment'],
    },
    {
      icon: 'bi-mortarboard',
      title: 'Education & Career',
      typeNames: ['Education Level', 'Occupation', 'Monthly Income'],
    },
  ];

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
        try {
          const data: BestMatchApiItem[] = Array.isArray(res) ? res : [];
          this.profiles = data
            .filter(item => item.totalCount > 0)
            .map(item => this.mapToProfileItem(item));
        } catch (mapErr) {
          console.error('Failed to map getBestMatchProfiles response:', mapErr, res);
          this.profiles = [];
        }
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
      this.selectedProfiles = this.selectedProfiles.filter(p => p.id !== profile.id);
    } else {
      if (this.getSelectedCount() >= 3) {
        alert('You can select a maximum of 3 profiles to compare at once.');
        return;
      }
      profile.selected = true;
      this.selectedProfiles = [...this.selectedProfiles, profile];
    }
  }

  getSelectedCount(): number {
    return this.selectedProfiles.length;
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
    let matchInfos: MatchInfoRaw[] = [];

    if (entry) {
      try { matchedGroups = JSON.parse(entry.matchedAttributes || '[]'); } catch { matchedGroups = []; }
      try { differentGroups = JSON.parse(entry.differentAttributes || '[]'); } catch { differentGroups = []; }
      try { matchInfos = JSON.parse(entry.matches || '[]'); } catch { matchInfos = []; }
    }

    const [baseProfile, ...compareProfiles] = this.selectedProfiles;
    const compareProfileIDs = compareProfiles.map(p => p.id);

    // Base column: a given TypeName may only appear in one pairing's diff/matched
    // groups (not all), so merge the base-side map across every pairing to make
    // sure the base profile's card shows everything, not just what's shared
    // with whichever compare profile happens to carry that attribute.
    const baseMap = new Map<string, Set<string>>();
    compareProfileIDs.forEach(cid => {
      this.mergeAttributeMap(
        baseMap,
        this.buildAttributeMap(cid, 'base', matchedGroups, differentGroups),
      );
    });
    this.applyAgeRange(baseMap);

    const columns: ComparisonColumnData[] = [];
    columns.push({
      profileID: baseProfile.id,
      matchPercentage: null,
      matchedCount: null,
      totalCount: null,
      values: this.mapToFlatValues(baseMap),
      sections: this.buildSections(baseMap),
    });

    compareProfiles.forEach(cp => {
      const map = this.buildAttributeMap(cp.id, 'compare', matchedGroups, differentGroups);
      this.applyAgeRange(map);

      const info = matchInfos.find(m => m.profileID === cp.id);

      columns.push({
        profileID: cp.id,
        matchPercentage: info ? Math.round(info.MatchPercentage) : null,
        matchedCount: info ? info.MatchedAttributes : null,
        totalCount: info ? info.TotalAttributes : null,
        values: this.mapToFlatValues(map),
        sections: this.buildSections(map),
      });
    });

    return columns;
  }

  // Collects every TypeName -> value(s) pairing available for one compareProfileID.
  // 'base' reads BaseValue from differentAttributes; 'compare' reads CompareValue.
  // Shared (matched) attributes come from matchedAttributes' MatchedValue either way.
  // Multiple distinct values for the same TypeName (e.g. multi-select preferences
  // like Occupation with several priorities) are kept as a Set and joined on display.
  private buildAttributeMap(
    compareProfileID: number,
    side: 'base' | 'compare',
    matchedGroups: CompareAttributeGroup[],
    differentGroups: CompareAttributeGroup[],
  ): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();
    const addVal = (name: string, val?: string) => {
      if (!val) return;
      if (!map.has(name)) map.set(name, new Set());
      map.get(name)!.add(val);
    };

    const diffGroup = differentGroups.find(g => g.CompareProfileID === compareProfileID);
    diffGroup?.Attributes.forEach(a => addVal(a.TypeName, side === 'base' ? a.BaseValue : a.CompareValue));

    const matchGroup = matchedGroups.find(g => g.CompareProfileID === compareProfileID);
    matchGroup?.Attributes.forEach(a => addVal(a.TypeName, a.MatchedValue));

    return map;
  }

  private mergeAttributeMap(target: Map<string, Set<string>>, source: Map<string, Set<string>>): void {
    source.forEach((vals, key) => {
      if (!target.has(key)) target.set(key, new Set());
      vals.forEach(v => target.get(key)!.add(v));
    });
  }

  // Combines Minimum Age / Maximum Age into a single "Age Range" entry, e.g. "27 - 30"
  private applyAgeRange(map: Map<string, Set<string>>): void {
    const min = this.firstValue(map, 'Minimum Age');
    const max = this.firstValue(map, 'Maximum Age');
    if (min || max) {
      map.set('Age Range', new Set([`${min || '—'} - ${max || '—'}`]));
    }
  }

  private firstValue(map: Map<string, Set<string>>, key: string): string {
    const vals = map.get(key);
    return vals && vals.size ? Array.from(vals)[0] : '';
  }

  private getValue(map: Map<string, Set<string>>, key: string): string {
    const vals = map.get(key);
    return vals && vals.size ? Array.from(vals).join(', ') : '—';
  }

  private mapToFlatValues(map: Map<string, Set<string>>): { [typeName: string]: string } {
    const out: { [typeName: string]: string } = {};
    map.forEach((_, key) => { out[key] = this.getValue(map, key); });
    return out;
  }

  private buildSections(map: Map<string, Set<string>>): AttributeSection[] {
    return this.sectionConfig
      .map(cfg => ({
        icon: cfg.icon,
        title: cfg.title,
        rows: cfg.typeNames
          .filter(name => map.has(name))
          .map(name => ({ label: name, value: this.getValue(map, name) })),
      }))
      .filter(section => section.rows.length > 0); // drop empty sections entirely
  }
    getColumn(i: number): ComparisonColumnData | null {
    return this.comparisonColumns[i] ?? null;
  }
}