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

// NEW: `matched` flags whether this row came from matchedAttributes (red)
// or differentAttributes (black — base/compare respectively).
interface AttributeRow {
  label: string;
  value: string;
  matched: boolean;
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

// NEW: per-TypeName bucket, keeps matched vs different values separate
// so the template can render matched in red and different in black.
interface AttributeEntry {
  matchedValues: Set<string>;
  differentValues: Set<string>;
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
    const baseMap = new Map<string, AttributeEntry>();
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

  // Collects every TypeName -> { matchedValues, differentValues } for one
  // compareProfileID. matchedValues comes from matchedAttributes (rendered
  // red on both sides — same value). differentValues comes from
  // differentAttributes: 'base' reads BaseValue, 'compare' reads CompareValue
  // (rendered black — each side shows its own value).
  // Multiple distinct values for the same TypeName (e.g. multi-select
  // preferences like Occupation with several priorities) are kept as a Set
  // and joined on display.
  private buildAttributeMap(
    compareProfileID: number,
    side: 'base' | 'compare',
    matchedGroups: CompareAttributeGroup[],
    differentGroups: CompareAttributeGroup[],
  ): Map<string, AttributeEntry> {
    const map = new Map<string, AttributeEntry>();

    const getEntry = (name: string): AttributeEntry => {
      if (!map.has(name)) {
        map.set(name, { matchedValues: new Set<string>(), differentValues: new Set<string>() });
      }
      return map.get(name)!;
    };

    const diffGroup = differentGroups.find(g => g.CompareProfileID === compareProfileID);
    diffGroup?.Attributes.forEach(a => {
      const val = side === 'base' ? a.BaseValue : a.CompareValue;
      if (val) getEntry(a.TypeName).differentValues.add(val);
    });

    const matchGroup = matchedGroups.find(g => g.CompareProfileID === compareProfileID);
    matchGroup?.Attributes.forEach(a => {
      if (a.MatchedValue) getEntry(a.TypeName).matchedValues.add(a.MatchedValue);
    });

    return map;
  }

  private mergeAttributeMap(target: Map<string, AttributeEntry>, source: Map<string, AttributeEntry>): void {
    source.forEach((entry, key) => {
      const t = target.has(key)
        ? target.get(key)!
        : { matchedValues: new Set<string>(), differentValues: new Set<string>() };
      entry.matchedValues.forEach(v => t.matchedValues.add(v));
      entry.differentValues.forEach(v => t.differentValues.add(v));
      target.set(key, t);
    });
  }

  // Combines Minimum Age / Maximum Age into a single "Age Range" entry, e.g.
  // "27 - 30" — done separately for the matched bucket and the different
  // bucket so the combined row still ends up on the correct (red/black) side.
  private applyAgeRange(map: Map<string, AttributeEntry>): void {
    this.combineAgeRange(map, 'differentValues');
    this.combineAgeRange(map, 'matchedValues');
  }

  private combineAgeRange(map: Map<string, AttributeEntry>, bucket: 'matchedValues' | 'differentValues'): void {
    const minEntry = map.get('Minimum Age');
    const maxEntry = map.get('Maximum Age');
    const min = minEntry && minEntry[bucket].size ? Array.from(minEntry[bucket])[0] : '';
    const max = maxEntry && maxEntry[bucket].size ? Array.from(maxEntry[bucket])[0] : '';
    if (min || max) {
      const entry = map.has('Age Range')
        ? map.get('Age Range')!
        : { matchedValues: new Set<string>(), differentValues: new Set<string>() };
      entry[bucket].add(`${min || '—'} - ${max || '—'}`);
      map.set('Age Range', entry);
    }
  }

  private mapToFlatValues(map: Map<string, AttributeEntry>): { [typeName: string]: string } {
    const out: { [typeName: string]: string } = {};
    map.forEach((entry, key) => {
      const combined = new Set<string>([...entry.matchedValues, ...entry.differentValues]);
      out[key] = combined.size ? Array.from(combined).join(', ') : '—';
    });
    return out;
  }

  // Builds rows for each section. A TypeName with matched values produces a
  // red row; the same TypeName with different values produces a separate
  // black row underneath it (this does happen — e.g. Occupation can be both
  // partially matched and partially different at once).
  private buildSections(map: Map<string, AttributeEntry>): AttributeSection[] {
    return this.sectionConfig
      .map(cfg => {
        const rows: AttributeRow[] = [];
        cfg.typeNames.forEach(name => {
          const entry = map.get(name);
          if (!entry) return;
          if (entry.matchedValues.size) {
            rows.push({ label: name, value: Array.from(entry.matchedValues).join(', '), matched: true });
          }
          if (entry.differentValues.size) {
            rows.push({ label: name, value: Array.from(entry.differentValues).join(', '), matched: false });
          }
        });
        return { icon: cfg.icon, title: cfg.title, rows };
      })
      .filter(section => section.rows.length > 0); // drop empty sections entirely
  }

  getColumn(i: number): ComparisonColumnData | null {
    return this.comparisonColumns[i] ?? null;
  }
}