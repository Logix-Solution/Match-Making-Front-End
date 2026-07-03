import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { Router } from '@angular/router';

interface PreferenceItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-prefences-details',
  templateUrl: './prefences-details.component.html',
  styleUrls: ['./prefences-details.component.scss']
})
export class PrefencesDetailsComponent implements OnInit {

  constructor(
    private sharedDataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const userID = this.sharedGlobalService.getUserID();
    (this.sharedDataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`) as any)
      .subscribe({
        next: (res: any) => {
          if (res && res.length > 0) {
            this.mapPreferences(res[0]);
          }
        },
        error: () => {}
      });
  }

  mapPreferences(user: any): void {
    let prefItems: any[] = [];
    try { prefItems = JSON.parse(user.userPreference || '[]'); } catch { prefItems = []; }

    // isPreference === 1, no priority filter = all preference entries
    const get = (typeID: number) =>
      prefItems.find((p: any) => p.typeID === typeID && p.isPreference === 1);

    // multi-priority: get all entries for a typeID sorted by priority, joined
    const getAll = (typeID: number) =>
      prefItems
        .filter((p: any) => p.typeID === typeID && p.isPreference === 1)
        .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
        .map((p: any) => p.subTypeTitle)
        .join(', ') || '-';

    // ── Personal Information ─────────────────────────────────────────────
    this.personalInfo = [
      { label: 'Marital Status',  value: getAll(10) },
      { label: 'Housing',         value: getAll(11) },
      { label: 'Family Involvement', value: get(14)?.subTypeTitle || '-' },
      { label: 'Willing to Relocate', value: get(20)?.subTypeTitle || '-' },
    ];

    // ── Education & Career ───────────────────────────────────────────────
    this.educationInfo = [
      { label: 'Education Level',   value: get(4)?.subTypeTitle  || '-' },
      { label: 'Occupation',        value: getAll(5) },
      { label: 'Monthly Income',    value: get(6)?.subTypeTitle  || '-' },
    ];

    // ── Lifestyle ────────────────────────────────────────────────────────
    this.lifestyleInfo = [
      { label: 'Smoking Acceptable?',       value: get(17)?.subTypeTitle || '-' },
      { label: 'Drink Alcohol Acceptable?', value: get(18)?.subTypeTitle || '-' },
      { label: 'Partner Want Kids?',        value: get(19)?.subTypeTitle || '-' },
      { label: 'Accept Partner With Kids?', value: get(27)?.subTypeTitle || '-' },
      { label: 'Timeline For Marriage',     value: get(21)?.subTypeTitle || '-' },
    ];

    // ── Religion — not in userPreference, keep static or leave as-is ────
    // religionInfo stays unchanged (no religion pref in this user's data)

    // ── Additional Info ──────────────────────────────────────────────────
    this.additionalInfo = user.aboutme || '-';
  }

  // ── Personal Information ─────────────────────────────────────────────────
  personalInfo: PreferenceItem[] = [
    { label: 'Marital Status',       value: '-' },
    { label: 'Housing',              value: '-' },
    { label: 'Family Involvement',   value: '-' },
    { label: 'Willing to Relocate',  value: '-' },
  ];

  // ── Appearance ───────────────────────────────────────────────────────────
  appearanceInfo: PreferenceItem[] = [
    { label: 'Minimum Height',                     value: "5'7\"" },
    { label: 'Maximum Height',                     value: "6'0\"" },
    { label: 'Body Type',                          value: 'Slim, Average' },
    { label: 'Skin Tone',                          value: 'Fair' },
    { label: 'Open to Partner With Disabilities?', value: 'No' },
  ];

  // ── Education & Career ───────────────────────────────────────────────────
  educationInfo: PreferenceItem[] = [
    { label: 'Education Level',        value: '-' },
    { label: 'Occupation',             value: '-' },
    { label: 'Monthly Income',         value: '-' },
  ];

  // ── Lifestyle ────────────────────────────────────────────────────────────
  lifestyleInfo: PreferenceItem[] = [
    { label: 'Smoking Acceptable?',       value: '-' },
    { label: 'Drink Alcohol Acceptable?', value: '-' },
    { label: 'Partner Want Kids?',        value: '-' },
    { label: 'Accept Partner With Kids?', value: '-' },
    { label: 'Timeline For Marriage',     value: '-' },
  ];

  // ── Religion ─────────────────────────────────────────────────────────────
  religionInfo: PreferenceItem[] = [
    { label: 'Religion',               value: 'Islam' },
    { label: 'Sect',                   value: 'Sunni' },
    { label: 'Importance of Religion', value: 'Very Important' },
  ];

  additionalInfo = '-';

  goToEditPrefernces(): void {
    this.router.navigate(['/preferences-details']);
  }
}
