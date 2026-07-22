import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment.prod';

interface StatusOption {
  statusID: number;
  statusTitle: string;
}

interface ProfileSide {
  userID: number;
  name: string;
  age: number;
  location: string;
  image: string;
}

interface LockProfileRecord {
  recordID: number;        // userProfileStatusID
  statusID: number;
  statusTitle: string;
  isLocked: boolean;
  lockedAt: string;
  source: ProfileSide;
  destination: ProfileSide;
  showDropdown: boolean;
}

interface ProfileSection {
  title: string;
  iconClass: string;
  items: { description: string; value: string }[];
}

interface ProfileHeader {
  avatar: string;
  name: string;
  age: string;
  location: string;
  occupation: string;
  status: string;
}

@Component({
  selector: 'app-lock-profiles',
  templateUrl: './lock-profiles.component.html',
  styleUrls: ['./lock-profiles.component.scss']
})
export class LockProfilesComponent implements OnInit {
  searchQuery = '';
  allProfiles: LockProfileRecord[] = [];
  filteredProfiles: LockProfileRecord[] = [];

  statusOptions: StatusOption[] = [];

  // ─── Confirm "Married" Modal ────────────────────────────────────────────
  isConfirmModalOpen = false;
  pendingRecord: LockProfileRecord | null = null;
  pendingOption: StatusOption | null = null;

  // ─── Full Page Detail Modal ──────────────────────────────────────────────
  isDetailModalOpen = false;
  detailLoading = false;
  profileHeader: ProfileHeader = {
    avatar: '',
    name: '',
    age: '',
    location: '',
    occupation: '',
    status: '',
  };
  aboutText1 = '';
  profileSections: ProfileSection[] = [];
  showAboutModal = false;

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadStatusOptions();
    this.loadLockProfiles();
  }

  loadStatusOptions(): void {
    this.dataService.getHttp('core-api/Admin/getProfileStatus', {}).subscribe({
      next: (res: any) => {
        this.statusOptions = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('getProfileStatus error:', err),
    });
  }

  loadLockProfiles(): void {
    this.dataService.getHttp('core-api/Admin/getLockProfile', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allProfiles = data.map((r: any) => this.mapRecord(r));
        this.applyFilter();
      },
      error: (err) => console.error('Lock Profiles load error:', err),
    });
  }

  private mapRecord(r: any): LockProfileRecord {
    return {
      recordID: r.userProfileStatusID,
      statusID: r.statusID,
      statusTitle: r.statusTitle,
      isLocked: r.statusTitle === 'Lock',
      lockedAt: 'N/A', // no date field in API response yet
      source: {
        userID: r.sourceProfileID,
        name: r.sourceProfileName || 'Unknown',
        age: this.calculateAge(r.sourceDOB),
        location: this.formatLocation(r.sourceCityName, r.sourceCountryName),
        image: this.buildImage(r.sourceeDoc),
      },
      destination: {
        userID: r.destinationProfileID,
        name: r.destinationProfileName || 'Unknown',
        age: this.calculateAge(r.destinationDOB),
        location: this.formatLocation(r.destinationCityName, r.destinationCountryName),
        image: this.buildImage(r.destinationeDoc),
      },
      showDropdown: false,
    };
  }

  private buildImage(eDoc: string | null): string {
    return eDoc && eDoc.trim() !== ''
      ? environment.productUrl + 'assets/user-images/userProfile/' + eDoc
      : 'assets/images/profile1.png';
  }

  private formatLocation(city: string | null, country: string | null): string {
    return city ? `${city}, ${country || ''}`.replace(/,\s*$/, '') : 'N/A';
  }

  calculateAge(dob: string | null): number {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  private applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredProfiles = !q
      ? [...this.allProfiles]
      : this.allProfiles.filter(
          (r) =>
            r.source.name.toLowerCase().includes(q) ||
            r.source.location.toLowerCase().includes(q) ||
            r.destination.name.toLowerCase().includes(q) ||
            r.destination.location.toLowerCase().includes(q),
        );
  }

  // ─── View Details (full page modal) ──────────────────────────────────────
  // Pass whichever side (source or destination) card was clicked
  onViewDetails(side: ProfileSide): void {
    this.isDetailModalOpen = true;
    this.detailLoading = true;
    this.profileSections = [];
    this.aboutText1 = '';
    document.body.classList.add('modal-open');

    this.dataService
      .getHttp(`core-api/Profile/getUserDetails?UserID=${side.userID}`, {})
      .subscribe({
        next: (res: any) => {
          const user = Array.isArray(res) ? res[0] : res;
          if (!user) {
            this.detailLoading = false;
            return;
          }
          this.buildProfile(user);
          this.detailLoading = false;
        },
        error: (err) => {
          console.error('getUserDetails error:', err);
          this.detailLoading = false;
        },
      });
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  openAboutModal(): void {
    this.showAboutModal = true;
  }
  closeAboutModal(): void {
    this.showAboutModal = false;
  }

  getSectionByTitle(title: string): ProfileSection | undefined {
    return this.profileSections.find((s) => s.title === title);
  }

  private buildProfile(user: any): void {
    let profileItems: any[] = [];
    try {
      profileItems = JSON.parse(user.userProfile || '[]');
    } catch {
      profileItems = [];
    }

    const get = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0)
        ?.subTypeTitle || '—';

    const getRaw = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0);

    const location = this.extractLocation(user.userProfile);

    const eduItem = getRaw(4);
    const occItem = getRaw(5);
    const incItem = getRaw(6);

    this.aboutText1 = user.aboutme || '';

    this.profileHeader = {
      avatar:
        user.eDoc && user.eDoc.trim() !== ''
          ? environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc
          : 'assets/images/profile1.png',
      name: user.fullname || user.firstName || 'Unknown',
      age: `${this.calculateAge(user.dob)} years`,
      location: location,
      occupation: occItem?.subTypeTitle || '—',
      status: get(10),
    };

    this.profileSections = [
      {
        title: 'Education & Career',
        iconClass: 'bi bi-briefcase',
        items: [
          { description: 'Education', value: eduItem?.subTypeTitle || '—' },
          { description: 'Institute', value: eduItem?.instituteName || '—' },
          { description: 'Occupation', value: occItem?.subTypeTitle || '—' },
          { description: 'Monthly Income', value: incItem?.subTypeTitle || '—' },
        ],
      },
      {
        title: 'Personal Information',
        iconClass: 'bi bi-person',
        items: [
          { description: 'Cast', value: get(1) },
          { description: 'Ethnicity', value: get(3) },
          { description: 'Gender', value: get(22) },
          { description: 'Marital Status', value: get(10) },
          { description: 'Height', value: get(26) },
          { description: 'No of Siblings', value: get(25) },
          { description: 'Disability', value: get(30) },
        ],
      },
      {
        title: 'Religion',
        iconClass: 'bi bi-moon',
        items: [
          { description: 'Religion', value: get(7) },
          { description: 'Sect', value: get(8) },
          { description: 'Religion Importance', value: get(9) },
        ],
      },
      {
        title: 'Family',
        iconClass: 'bi bi-house',
        items: [
          { description: 'Housing Situation', value: get(11) },
          { description: 'Father Occupation', value: get(12) },
          { description: 'Mother Occupation', value: get(13) },
          { description: 'Family Involvement', value: get(14) },
          { description: 'No of Siblings', value: get(25) },
          { description: 'Want Kids', value: get(19) },
        ],
      },
      {
        title: 'Appearance',
        iconClass: 'bi bi-person-bounding-box',
        items: [
          { description: 'Body Type', value: get(15) },
          { description: 'Skin Tone', value: get(16) },
          { description: 'Height', value: get(26) },
          { description: 'Disability', value: get(30) },
        ],
      },
      {
        title: 'Lifestyle',
        iconClass: 'bi bi-cup-hot',
        items: [
          { description: 'Smoke', value: get(17) },
          { description: 'Alcohol', value: get(18) },
          { description: 'Want Kids', value: get(19) },
        ],
      },
    ];
  }

  private extractLocation(userProfileJson: string): string {
    let profileItems: any[] = [];
    try {
      profileItems = JSON.parse(userProfileJson || '[]');
    } catch {
      profileItems = [];
    }
    const locationItem = profileItems.find(
      (p: any) => p.cityID !== undefined && p.isPreference === 0,
    );
    return locationItem
      ? `${locationItem.cityName}, ${locationItem.countryName}`
      : 'N/A';
  }

  // ─── Status Dropdown ─────────────────────────────────────────────────────
  toggleDropdown(record: LockProfileRecord): void {
    this.allProfiles.forEach((r) => {
      if (r !== record) r.showDropdown = false;
    });
    record.showDropdown = !record.showDropdown;
  }

  closeAllDropdowns(): void {
    this.allProfiles.forEach((r) => (r.showDropdown = false));
  }

  onSelectStatus(record: LockProfileRecord, option: StatusOption): void {
    record.showDropdown = false;

    if (option.statusTitle === 'Married') {
      // Married is irreversible — confirm before saving
      this.pendingRecord = record;
      this.pendingOption = option;
      this.isConfirmModalOpen = true;
      return;
    }

    this.saveStatus(record, option);
  }

  // ─── Confirm Married Modal ───────────────────────────────────────────────
  cancelMarriedConfirm(): void {
    this.isConfirmModalOpen = false;
    this.pendingRecord = null;
    this.pendingOption = null;
  }

  confirmMarried(): void {
    if (!this.pendingRecord || !this.pendingOption) return;
    this.saveStatus(this.pendingRecord, this.pendingOption);
    this.isConfirmModalOpen = false;
    this.pendingRecord = null;
    this.pendingOption = null;
  }

  // TODO: confirm whether "userID" in the payload should be the admin's ID
  // (used below) or the sourceProfileID — your sample had both equal to 6.
  private saveStatus(record: LockProfileRecord, option: StatusOption): void {
    const adminUserID = this.sharedGlobalService.getUserID();
    const payload = {
      userProfileStatusID: record.recordID || 0,
      statusID: option.statusID,
      sourceProfileID: record.source.userID,
      destinationProfileID: record.destination.userID,
      userID: adminUserID,
      spType:'insert',
    };
    console.log('saveMatchProfileStatus payload:', payload);

    this.dataService.postDirect('core-api/Admin/saveMatchProfileStatus', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          record.statusID = option.statusID;
          record.statusTitle = option.statusTitle;
          record.isLocked = option.statusTitle === 'Lock';
          this.valid.apiInfoResponse(`Status updated to ${option.statusTitle}`);
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('saveMatchProfileStatus error:', err);
      },
    });
  }
}