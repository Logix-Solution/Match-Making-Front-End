import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from '../../../shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

interface ApiUserPlan {
  planID: number;
  planName: string;
  planDescription: string;
  planCurrencyID: number;
  profileID: number;
  currentPlan: number;
  planFee: string;
  durationID: number;
  durationTitle: string;
  currencyTypeID: string;
  currencyTypeTitle: string;
}

interface StatCard {
  value: string;
  unit?: string;
  label: string;
  icon: string;
}

interface ApiDashboardCounts {
  userID: number;
  profileView: string;
  mutualLike: string;
  countries: string;
  avgResponse: string;
}

interface PricingPlan {
  id: number;
  name: string;
  price: string;
  duration: string;
  billingText: string;
  badge?: string;
  highlighted?: boolean;
  features: string[];
  rawFee: number;
}

interface ApiSupport {
  supportID: number;
  email: string;
  contactNo: string;
  address: string;
}

interface ContactCard {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  actionLabel: string;
  link: string;
  target?: string;
}

// ---------- getUserShownProfiles response shapes ----------

interface ApiUserShownResponse {
  baseProfileID: number;
  baseProfileName: string;
  userShownProfiles: string; // JSON-stringified array of ApiUserShownProfile
  userShownProfilesCount: string;
}

interface ApiUserShownProfile {
  UserID: number;
  ProfileID: number;
  ProfileName: string;
  Age: number;
  Gender: string;
  Occupation?: string;
  InterestStatusID: number; // 1 = liked/shown as interested, 0 = not
  CityID?: number;
  CityName?: string;
  CountryID?: number;
  CountryName?: string;
  eDoc?: string;
}

interface MatchCard {
  sourceProfileID: number;
  destinationProfileID: number;
  userID: number; // needed to fetch full profile details on click
  name: string;
  gender: string;
  age: number | null;
  height: string;
  maritalStatus: string;
  occupation: string;
  address: string;
  imageDoc: string;
  isInterested: boolean;
  isTogglingInterest: boolean; // disables the heart button while a save is in-flight
}

// ---------- Profile Details / Preferences modal shapes ----------

interface DetailField {
  label: string;
  value: string;
}

interface DetailRow {
  fields: DetailField[]; // 1 field = full-width row, 2 fields = split row
}

interface DetailSection {
  icon: string;
  title: string;
  rows: DetailRow[];
}

@Component({
  selector: 'app-user-active-plan',
  templateUrl: './user-active-plan.component.html',
  styleUrls: ['./user-active-plan.component.scss'],
})
export class UserActivePlanComponent implements OnInit {
  currentPlanLabel: string = 'Free Plan';
  userName = '';
  matchedProfiles = 0; // now driven by userShownProfilesCount from getUserShownProfiles

  profileID: number | null = null;

  stats: StatCard[] = [];

  plans: PricingPlan[] = [];
  selectedPlanId: number | null = null;
  currentPlanId: number | null = null;
  isOnFreePlan: boolean = false;

  // Populated from core-api/Admin/getSupport
  contacts: ContactCard[] = [];

  // Populated from core-api/Profile/getUserShownProfiles
  bestMatches: MatchCard[] = [];

  private readonly defaultImage = 'assets/images/profile1.png';

  // ---------- Profile Details / Preferences modal state ----------
  isProfileModalOpen = false;
  isProfileModalLoading = false;
  profileModalActiveTab: 'details' | 'preferences' = 'details';

  profileModalHeader: {
    name: string;
    ageLabel: string;
    address: string;
    imageDoc: string;
    occupation: string;
    status: string;
    aboutMe: string;
    educationCareerRows: DetailRow[];
  } | null = null;

  profileDetailSections: DetailSection[] = [];
  profilePreferenceSections: DetailSection[] = [];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private validationService: SharedFormFieldValidationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserAndPlans();
    this.loadSupport();
    this.loadDashboardCounts();
  }

  private loadDashboardCounts(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService
      .getHttp(`core-api/Profile/getUserDashboardCounts?userID=${userID}`, {})
      .subscribe({
        next: (res: any) => {
          const counts: ApiDashboardCounts = Array.isArray(res) ? res[0] : res;
          if (!counts) return;

          this.stats = this.mapCountsToStats(counts);
        },
        error: (err) => console.error('getUserDashboardCounts error:', err),
      });
  }

  private mapCountsToStats(counts: ApiDashboardCounts): StatCard[] {
    return [
      {
        value: counts.profileView ?? '0',
        label: 'Profile Views',
        icon: 'bi-graph-up',
      },
      {
        value: counts.mutualLike ?? '0',
        label: 'Mutual Likes',
        icon: 'bi-star',
      },
      { value: counts.countries ?? '0', label: 'Countries', icon: 'bi-globe' },
      {
        value: counts.avgResponse ?? '0',
        unit: 'h',
        label: 'Avg Response',
        icon: 'bi-clock',
      },
    ];
  }

  private loadSupport(): void {
    this.dataService.getHttp('core-api/Admin/getSupport', {}).subscribe({
      next: (res: any) => {
        const support: ApiSupport = Array.isArray(res) ? res[0] : res;
        if (!support) return;

        this.contacts = this.mapSupportToContacts(support);
      },
      error: (err) => console.error('getSupport error:', err),
    });
  }

  private mapSupportToContacts(support: ApiSupport): ContactCard[] {
    const email = this.splitLeading(support.email, /^\S+@\S+/);
    const phone = this.splitLeading(support.contactNo, /^[+\d][\d\s\-]*\d/);
    const address = this.splitAddress(support.address);

    const whatsappDigits = phone.main.replace(/[^\d]/g, '');

    return [
      {
        icon: 'bi-envelope',
        label: 'EMAIL US',
        value: email.main,
        subValue: email.rest,
        actionLabel: 'Send email',
        link: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.main)}`,
        target: '_blank',
      },
      {
        icon: 'bi-telephone',
        label: 'CALL US',
        value: phone.main,
        subValue: phone.rest,
        actionLabel: 'Message on WhatsApp',
        link: `https://wa.me/${whatsappDigits}`,
        target: '_blank',
      },
      {
        icon: 'bi-geo-alt',
        label: 'OUR OFFICE',
        value: address.main,
        subValue: address.rest,
        actionLabel: 'Get directions',
        link: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(support.address)}`,
        target: '_blank',
      },
    ];
  }

  private splitLeading(
    str: string,
    regex: RegExp,
  ): { main: string; rest: string } {
    if (!str) return { main: '', rest: '' };
    const match = str.match(regex);
    if (!match) return { main: str.trim(), rest: '' };
    const main = match[0].trim();
    const rest = str.slice(match[0].length).trim();
    return { main, rest };
  }

  private splitAddress(str: string): { main: string; rest: string } {
    if (!str) return { main: '', rest: '' };
    const parts = str
      .split(/\s{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      return { main: parts[0], rest: parts.slice(1).join(', ') };
    }
    return { main: str.trim(), rest: '' };
  }

  private loadUserAndPlans(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService
      .getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {})
      .subscribe({
        next: (res: any) => {
          const user = Array.isArray(res) ? res[0] : res;
          if (!user) return;

          this.profileID = user.profileID;
          this.userName = user.fullname || user.firstName || '';

          let profileItems: any[] = [];
          try {
            profileItems = JSON.parse(user.userProfile || '[]');
          } catch {
            profileItems = [];
          }

          const currencyItem = profileItems.find(
            (p: any) =>
              p.currencyTypeID !== undefined && p.currencyTypeID !== null,
          );
          const currencyTypeID = currencyItem?.currencyTypeID;

          if (this.profileID && currencyTypeID) {
            this.loadPlans(this.profileID, currencyTypeID);
            this.loadBestMatches(this.profileID);
          } else {
            console.error('Missing profileID or currencyTypeID', {
              profileID: this.profileID,
              currencyTypeID,
            });
          }
        },
        error: (err) => console.error('getUserDetails error:', err),
      });
  }

  private loadPlans(profileID: number, currencyTypeID: number | string): void {
    this.dataService
      .getHttp(
        `core-api/Payment/getUserPlans?profileID=${profileID}&currencyTypeID=${currencyTypeID}`,
        {},
      )
      .subscribe({
        next: (res: any) => {
          const data: ApiUserPlan[] = Array.isArray(res) ? res : [];

          this.plans = data
            .filter((p) => {
              const nameLower = (p.planName || '').toLowerCase();
              return (
                !nameLower.includes('free') &&
                !nameLower.includes('registration')
              );
            })
            .map((p) => this.mapApiPlanToDisplay(p));

          const currentItem = data.find((p) => p.currentPlan === 1);

          this.currentPlanId =
            currentItem && this.plans.some((dp) => dp.id === currentItem.planID)
              ? currentItem.planID
              : null;

          if (this.currentPlanId) {
            this.selectedPlanId = this.currentPlanId;
          }

          this.currentPlanLabel = currentItem
            ? `${currentItem.planName} · ${currentItem.durationTitle}`
            : 'Free Plan';
        },
        error: (err) => console.error('getUserPlans error:', err),
      });
  }

  private mapApiPlanToDisplay(p: ApiUserPlan): PricingPlan {
    const fee = +p.planFee || 0;
    return {
      id: p.planID,
      name: p.planName,
      price: `${p.currencyTypeTitle} ${fee.toLocaleString()}`,
      duration: `/ ${p.durationTitle}`,
      billingText: `Billed ${p.durationTitle}`,
      features: (p.planDescription || '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      rawFee: fee,
    };
  }

  isCurrentPlan(planId: number): boolean {
    return this.currentPlanId === planId;
  }

  choosePlan(plan: PricingPlan): void {
    this.selectedPlanId = plan.id;
    this.router.navigate(['/Upgrade-Pricing-Plans'], {
      queryParams: {
        planID: plan.id,
        profileID: this.profileID,
        planName: plan.name,
        planFee: plan.rawFee,
      },
    });
  }

  // ---------- Best Matches (core-api/Profile/getUserShownProfiles) ----------

  private loadBestMatches(profileID: number): void {
    this.dataService
      .getHttp(
        `core-api/Profile/getUserShownProfiles?profileID=${profileID}`,
        {},
      )
      .subscribe({
        next: (res: any) => {
          const data: ApiUserShownResponse = Array.isArray(res) ? res[0] : res;
          if (!data) return;

          // userShownProfilesCount drives the "Profiles" stat shown in the banner
          this.matchedProfiles = Number(data.userShownProfilesCount) || 0;

          let shown: ApiUserShownProfile[] = [];
          try {
            shown = JSON.parse(data.userShownProfiles || '[]');
          } catch {
            shown = [];
          }

          this.bestMatches = shown.map((m) =>
            this.mapShownProfileToCard(profileID, m),
          );
        },
        error: (err) => console.error('getUserShownProfiles error:', err),
      });
  }

  private mapShownProfileToCard(
    baseProfileID: number,
    m: ApiUserShownProfile,
  ): MatchCard {
    const address = [m.CityName, m.CountryName].filter(Boolean).join(', ');

    return {
      sourceProfileID: baseProfileID, // senderID
      destinationProfileID: +m.ProfileID || 0, // receiverID
      userID: +m.UserID || 0, // used to fetch full profile details on click
      name: m.ProfileName || '',
      gender: m.Gender || '',
      age: m.Age !== undefined && m.Age !== null && m.Age > 0 ? m.Age : null,
      height: '',
      maritalStatus: '',
      occupation: m.Occupation || '',
      address: address,
      imageDoc: m.eDoc
        ? environment.productUrl + 'assets/user-images/userProfile/' + m.eDoc
        : this.defaultImage, // no eDoc field provided by this endpoint
      isInterested: +m.InterestStatusID === 1,
      isTogglingInterest: false,
    };
  }

  // Toggles Send/Withdraw interest for a match card.
  // spType is always 'insert' per backend requirement.
  toggleInterest(match: MatchCard): void {
    if (match.isTogglingInterest) return;

    const nextState = !match.isInterested;
    match.isTogglingInterest = true;

    const payload = {
      senderID: match.sourceProfileID,
      receiverID: match.destinationProfileID,
      interestStatusID: nextState ? 1 : 0,
      spType: 'insert',
    };

    this.dataService
      .postDirect('core-api/Admin/saveUserInterest', payload)
      .subscribe({
        next: (res: any) => {
          match.isTogglingInterest = false;

          if (res?.apiErrorResponse) {
            this.validationService.validateToastr(res.apiErrorResponse);
            return;
          }

          match.isInterested = nextState;

          const message = nextState
            ? res?.apiInfoResponse || 'Interest sent successfully'
            : res?.apiInfoResponse || 'Interest withdrawn successfully';
          this.validationService.validateToastr(message);
        },
        error: (err) => {
          match.isTogglingInterest = false;
          console.error('saveUserInterest error:', err);
        },
      });
  }

  // ---------- Profile Details / Profile Preferences modal ----------

  openProfileDetail(match: MatchCard): void {
    if (!match.userID) return;

    this.isProfileModalOpen = true;
    this.isProfileModalLoading = true;
    this.profileModalActiveTab = 'details';
    this.profileModalHeader = null;
    this.profileDetailSections = [];
    this.profilePreferenceSections = [];

    this.dataService
      .getHttp(`core-api/Profile/getUserDetails?UserID=${match.userID}`, {})
      .subscribe({
        next: (res: any) => {
          this.isProfileModalLoading = false;
          const user = Array.isArray(res) ? res[0] : res;
          if (!user) return;

          let profileItems: any[] = [];
          try {
            profileItems = JSON.parse(user.userProfile || '[]');
          } catch {
            profileItems = [];
          }

          let preferenceItems: any[] = [];
          try {
            preferenceItems = JSON.parse(user.userPreference || '[]');
          } catch {
            preferenceItems = [];
          }

          const profileMap = this.buildTypeMap(profileItems);
          const preferenceMap = this.buildTypeMap(preferenceItems);

          this.profileModalHeader = this.buildModalHeader(
            match,
            user,
            profileMap,
            profileItems,
          );
          this.profileDetailSections = this.buildDetailSections(profileMap);
          this.profilePreferenceSections =
            this.buildPreferenceSections(preferenceMap);
        },
        error: (err) => {
          this.isProfileModalLoading = false;
          console.error('getUserDetails (profile modal) error:', err);
        },
      });
  }

  closeProfileModal(): void {
    this.isProfileModalOpen = false;
    this.profileModalHeader = null;
    this.profileDetailSections = [];
    this.profilePreferenceSections = [];
  }

  setProfileModalTab(tab: 'details' | 'preferences'): void {
    this.profileModalActiveTab = tab;
  }

  // Groups userProfile / userPreference JSON items by typeID.
  // Multiple entries for the same typeID (e.g. preference priorities) are
  // collected as separate values and joined with ", " when displayed.
  private buildTypeMap(items: any[]): Map<number, string[]> {
    const map = new Map<number, string[]>();
    for (const item of items) {
      if (item?.typeID === undefined || item?.typeID === null) continue;
      const title = (item.subTypeTitle ?? '').toString().trim();
      if (!title) continue;

      const existing = map.get(item.typeID) || [];
      if (!existing.includes(title)) existing.push(title);
      map.set(item.typeID, existing);
    }
    return map;
  }

  private getValue(
    map: Map<number, string[]>,
    typeID: number,
    fallback = '—',
  ): string {
    const vals = map.get(typeID);
    return vals && vals.length ? vals.join(', ') : fallback;
  }

  private singleColRows(fields: DetailField[]): DetailRow[] {
    return fields.map((f) => ({ fields: [f] }));
  }

  private pairColRows(fields: DetailField[]): DetailRow[] {
    const rows: DetailRow[] = [];
    for (let i = 0; i < fields.length; i += 2) {
      rows.push({ fields: fields.slice(i, i + 2) });
    }
    return rows;
  }

  private buildModalHeader(
    match: MatchCard,
    user: any,
    profileMap: Map<number, string[]>,
    profileItems: any[],
  ) {
    const eduItem = profileItems.find((p) => p.typeID === 4);
    const occItem = profileItems.find((p) => p.typeID === 5);
    const institute =
      eduItem?.instituteName || occItem?.instituteName || '—';

    return {
      name: match.name || user.fullname || '',
      ageLabel: match.age !== null ? `${match.age} years` : '',
      address: match.address || '',
      imageDoc: match.imageDoc || this.defaultImage,
      occupation: this.getValue(profileMap, 5),
      status: this.getValue(profileMap, 10),
      aboutMe: user.aboutme || '',
      educationCareerRows: this.pairColRows([
        { label: 'Education', value: this.getValue(profileMap, 4) },
        { label: 'Institute', value: institute },
        { label: 'Occupation', value: this.getValue(profileMap, 5) },
        { label: 'Monthly Income', value: this.getValue(profileMap, 6) },
      ]),
    };
  }

  private buildDetailSections(map: Map<number, string[]>): DetailSection[] {
    return [
      {
        icon: 'bi-person-vcard',
        title: 'Personal Information',
        rows: this.singleColRows([
          { label: 'Cast', value: this.getValue(map, 1) },
          { label: 'Ethnicity', value: this.getValue(map, 3) },
          { label: 'Gender', value: this.getValue(map, 22) },
          { label: 'Marital Status', value: this.getValue(map, 10) },
          { label: 'Height', value: this.getValue(map, 26) },
          { label: 'No of Siblings', value: this.getValue(map, 25) },
          { label: 'Disability', value: this.getValue(map, 30) },
        ]),
      },
      {
        icon: 'bi-cup-straw',
        title: 'Lifestyle',
        rows: this.singleColRows([
          { label: 'Smoke', value: this.getValue(map, 17) },
          { label: 'Alcohol', value: this.getValue(map, 18) },
          { label: 'Want Kids', value: this.getValue(map, 19) },
        ]),
      },
      {
        icon: 'bi-person-bounding-box',
        title: 'Appearance',
        rows: this.singleColRows([
          { label: 'Body Type', value: this.getValue(map, 15) },
          { label: 'Skin Tone', value: this.getValue(map, 16) },
          { label: 'Height', value: this.getValue(map, 26) },
          { label: 'Disability', value: this.getValue(map, 30) },
        ]),
      },
      {
        icon: 'bi-moon-stars',
        title: 'Religion',
        rows: this.singleColRows([
          { label: 'Religion', value: this.getValue(map, 7) },
          { label: 'Sect', value: this.getValue(map, 8) },
          { label: 'Religion Importance', value: this.getValue(map, 9) },
        ]),
      },
      {
        icon: 'bi-house-heart',
        title: 'Family',
        rows: this.pairColRows([
          { label: 'Housing Situation', value: this.getValue(map, 11) },
          { label: 'Father Occupation', value: this.getValue(map, 12) },
          { label: 'Mother Occupation', value: this.getValue(map, 13) },
          { label: 'Family Involvement', value: this.getValue(map, 14) },
          { label: 'No of Siblings', value: this.getValue(map, 25) },
          { label: 'Want Kids', value: this.getValue(map, 19) },
        ]),
      },
    ];
  }

  private buildPreferenceSections(
    map: Map<number, string[]>,
  ): DetailSection[] {
    const minAge = this.getValue(map, 31, '');
    const maxAge = this.getValue(map, 32, '');
    const ageRange = minAge && maxAge ? `${minAge} - ${maxAge}` : '—';

    return [
      {
        icon: 'bi-person-vcard',
        title: 'Personal Information',
        rows: this.singleColRows([
          { label: 'Nationality', value: this.getValue(map, 2) },
          { label: 'Cast', value: this.getValue(map, 1) },
          { label: 'Ethnicity', value: this.getValue(map, 3) },
          { label: 'Age Range', value: ageRange },
          { label: 'Marital Status', value: this.getValue(map, 10) },
        ]),
      },
      {
        icon: 'bi-house-heart',
        title: 'Family',
        rows: this.singleColRows([
          { label: 'Housing Situation', value: this.getValue(map, 11) },
          { label: 'Family Involvement', value: this.getValue(map, 14) },
          { label: 'Willing to Relocate', value: this.getValue(map, 20) },
        ]),
      },
      {
        icon: 'bi-moon-stars',
        title: 'Religion',
        rows: this.singleColRows([
          { label: 'Religion', value: this.getValue(map, 7) },
          { label: 'Sect', value: this.getValue(map, 8) },
          { label: 'Religion Importance', value: this.getValue(map, 9) },
        ]),
      },
      {
        icon: 'bi-mortarboard',
        title: 'Education & Career',
        rows: this.singleColRows([
          { label: 'Education Level', value: this.getValue(map, 4) },
          { label: 'Occupation', value: this.getValue(map, 5) },
          { label: 'Monthly Income', value: this.getValue(map, 6) },
        ]),
      },
      {
        icon: 'bi-person-bounding-box',
        title: 'Appearance',
        rows: this.singleColRows([
          { label: 'Height', value: this.getValue(map, 26) },
          { label: 'Body Type', value: this.getValue(map, 15) },
          { label: 'Skin Tone', value: this.getValue(map, 16) },
          {
            label: 'Open to Partner With Disabilities?',
            value: this.getValue(map, 30),
          },
        ]),
      },
      {
        icon: 'bi-cup-straw',
        title: 'Lifestyle',
        rows: this.singleColRows([
          { label: 'Smoking Acceptable?', value: this.getValue(map, 17) },
          { label: 'Drink Alcohol Acceptable?', value: this.getValue(map, 18) },
          { label: 'Partner Want Kids?', value: this.getValue(map, 19) },
          {
            label: 'Accept Partner With Kids?',
            value: this.getValue(map, 27),
          },
          { label: 'Timeline For Marriage', value: this.getValue(map, 21) },
        ]),
      },
    ];
  }
}