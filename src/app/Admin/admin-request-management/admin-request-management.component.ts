import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment.prod';

interface UserRequest {
  id: number;
  userID: number;
  name: string;
  age: number;
  location: string;
  image: string;
  status: 'pending' | 'accepted' | 'rejected';
  statusID: number;
  email: string;
  phone: string;
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
  selector: 'app-admin-request-management',
  templateUrl: './admin-request-management.component.html',
  styleUrls: ['./admin-request-management.component.scss']
})
export class AdminRequestManagementComponent implements OnInit {

  activeTab: 'pending' | 'accepted' | 'rejected' = 'pending';
  allRequests: UserRequest[] = [];
  filteredRequests: UserRequest[] = [];

  // ─── Detail Modal ─────────────────────────────────────────────────────────
  isDetailModalOpen = false;
  detailLoading = false;
  profileHeader: ProfileHeader = { avatar: '', name: '', age: '', location: '', occupation: '', status: '' };
  aboutText1 = '';
  profileSections: ProfileSection[] = [];
  showAboutModal = false;

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

 loadRequests(): void {
    this.dataService.getHttp(`core-api/Admin/getRequestManagement`, {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allRequests = data.map((u: any) => ({
          id:       u.profileID,
          userID:   u.userID,
          name:     u.fullname || u.firstName || 'Unknown',
          age:      this.calculateAge(u.dob),
          location: u.address || 'N/A',
          image:    u.eDoc || 'assets/images/default-avatar.png',
          status:   this.mapStatus(u.statusID),
          statusID: u.statusID,
          email:    u.email,
          phone:    u.phoneNumber
        }));
        this.filterRequestsByActiveTab();
      },
      error: (err) => console.error('Request Management load error:', err)
    });
  }

  mapStatus(statusID: number): 'pending' | 'accepted' | 'rejected' {
    switch (statusID) {
      case 2:  return 'accepted';
      case 3:  return 'rejected';
      default: return 'pending';
    }
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  setTab(tabName: 'pending' | 'accepted' | 'rejected'): void {
    this.activeTab = tabName;
    this.filterRequestsByActiveTab();
  }

  filterRequestsByActiveTab(): void {
    this.filteredRequests = this.allRequests.filter(item => item.status === this.activeTab);
  }

  // ─── View Details ─────────────────────────────────────────────────────────
  onViewDetails(item: UserRequest): void {
    this.isDetailModalOpen = true;
    this.detailLoading = true;
    this.profileSections = [];
    this.aboutText1 = '';
    document.body.classList.add('modal-open');

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${item.userID}`, {}).subscribe({
      next: (res: any) => {
        const user = Array.isArray(res) ? res[0] : res;
        if (!user) { this.detailLoading = false; return; }
        this.buildProfile(user);
        this.detailLoading = false;
      },
      error: (err) => {
        console.error('getUserDetails error:', err);
        this.detailLoading = false;
      }
    });
  }

  closeDetailModal(): void {
    this.isDetailModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  openAboutModal(): void  { this.showAboutModal = true; }
  closeAboutModal(): void { this.showAboutModal = false; }

  getSectionByTitle(title: string): ProfileSection | undefined {
    return this.profileSections.find(s => s.title === title);
  }

  // ─── Build Profile from API ───────────────────────────────────────────────
  buildProfile(user: any): void {
    let profileItems: any[] = [];
    try { profileItems = JSON.parse(user.userProfile || '[]'); } catch { profileItems = []; }

    const get = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0)?.subTypeTitle || '—';

    const getInstitute = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0);

    const locationItem = profileItems.find((p: any) => p.cityID !== undefined && p.isPreference === 0);
    const location = locationItem ? `${locationItem.cityName}, ${locationItem.countryName}` : '—';

    const eduItem = getInstitute(4);
    const occItem = getInstitute(5);
    const incItem = getInstitute(6);

    this.aboutText1 = user.aboutme || '';

    this.profileHeader = {
      avatar: user.eDoc && user.eDoc.trim() !== ''
    ? environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc
    : 'assets/images/default-avatar.png',
      name:       user.fullname || user.firstName || 'Unknown',
      age:        `${this.calculateAge(user.dob)} years`,
      location:   location,
      occupation: occItem?.subTypeTitle || '—',
      status:     get(10)
    };

    this.profileSections = [
      {
        title: 'Education & Career',
        iconClass: 'bi bi-briefcase',
        items: [
          { description: 'Education',     value: eduItem?.subTypeTitle  || '—' },
          { description: 'Institute',     value: eduItem?.instituteName || '—' },
          { description: 'Occupation',    value: occItem?.subTypeTitle  || '—' },
          { description: 'Monthly Income',value: incItem?.subTypeTitle  || '—' },
        ]
      },
      {
        title: 'Personal Information',
        iconClass: 'bi bi-person',
        items: [
          { description: 'Cast',          value: get(1)  },
          { description: 'Ethnicity',     value: get(3)  },
          { description: 'Gender',        value: get(22) },
          { description: 'Marital Status',value: get(10) },
          { description: 'Height',        value: get(26) },
          { description: 'No of Siblings',value: get(25) },
          { description: 'Disability',    value: get(30) },
        ]
      },
      {
        title: 'Religion',
        iconClass: 'bi bi-moon',
        items: [
          { description: 'Religion',            value: get(7) },
          { description: 'Sect',                value: get(8) },
          { description: 'Religion Importance', value: get(9) },
        ]
      },
      {
        title: 'Family',
        iconClass: 'bi bi-house',
        items: [
          { description: 'Housing Situation',  value: get(11) },
          { description: 'Father Occupation',  value: get(12) },
          { description: 'Mother Occupation',  value: get(13) },
          { description: 'Family Involvement', value: get(14) },
          { description: 'No of Siblings',     value: get(25) },
          { description: 'Want Kids',          value: get(19) },
        ]
      },
      {
        title: 'Appearance',
        iconClass: 'bi bi-person-bounding-box',
        items: [
          { description: 'Body Type',  value: get(15) },
          { description: 'Skin Tone',  value: get(16) },
          { description: 'Height',     value: get(26) },
          { description: 'Disability', value: get(30) },
        ]
      },
      {
        title: 'Lifestyle',
        iconClass: 'bi bi-cup-hot',
        items: [
          { description: 'Smoke',     value: get(17) },
          { description: 'Alcohol',   value: get(18) },
          { description: 'Want Kids', value: get(19) },
        ]
      },
    ];
  }

  // ─── Accept / Reject ──────────────────────────────────────────────────────
  onAccept(item: UserRequest): void {
    const adminID = this.sharedGlobalService.getUserID();
    const payload = { userID: item.userID, statusID: 2, adminID: adminID, spType: 'update' };
    this.dataService.postDirect('user-api/User/saveUserRequest', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Request Accepted Successfully');
          item.status = 'accepted'; item.statusID = 2;
          this.filterRequestsByActiveTab();
        } else { this.valid.apiErrorResponse(response); }
      },
      error: (err) => { this.valid.apiErrorResponse('Something went wrong.'); console.error(err); }
    });
  }

  onReject(item: UserRequest): void {
    const adminID = this.sharedGlobalService.getUserID();
    const payload = { userID: item.userID, statusID: 3, adminID: adminID, spType: 'update' };
    this.dataService.postDirect('user-api/User/saveUserRequest', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Request Rejected Successfully');
          item.status = 'rejected'; item.statusID = 3;
          this.filterRequestsByActiveTab();
        } else { this.valid.apiErrorResponse(response); }
      },
      error: (err) => { this.valid.apiErrorResponse('Something went wrong.'); console.error(err); }
    });
  }
}