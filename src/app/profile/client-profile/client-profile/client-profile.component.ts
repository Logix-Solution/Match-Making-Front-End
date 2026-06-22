import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';

interface InfoItem {
  description: string;
  value: string;
}

interface ProfileSection {
  title: string;
  iconClass: string;
  items: InfoItem[];
}

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'],
})
export class ClientProfileComponent implements OnInit {

  showAboutModal = false;

  profileHeader = {
    name: '',
    age: '',
    location: '',
    occupation: '',
    status: '',
    avatar: '../../../../assets/images/client-profile-main.png'
  };

  aboutText1: string = '';
  profileSections: ProfileSection[] = [];

  constructor(
    private router: Router,
    private sharedDataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }
loadProfile(): void {
  const userID = this.sharedGlobalService.getUserID();
  (this.sharedDataService.getHttp(`user-api/User/getUserDetails?UserID=${userID}`) as any)
    .subscribe({
      next: (res: any) => {
        if (res && res.length > 0) {
     console.log(res,'loadprofile');
          this.mapUserData(res[0]);
        }

      },
      error: () => {
        // API failed (no internet) — load fallback so page still renders
        this.loadFallback();
      }
    });
}

loadFallback(): void {
  // Keep whatever is already in profileHeader from a previous session
  // or set safe defaults so the page is not blank
  if (!this.profileHeader.name) {
    this.profileHeader.name    = 'My Profile';
    this.profileHeader.age     = '';
    this.profileHeader.location = '';
    this.profileHeader.occupation = '';
    this.profileHeader.status  = '';
  }

  // Build empty sections so cards still render with '-'
  this.profileSections = [
    { title: 'Education & Career',   iconClass: 'bi bi-briefcase', items: [
        { description: 'Education Level', value: '-' },
        { description: 'Institute Name',  value: '-' },
        { description: 'Occupation',      value: '-' },
        { description: 'Monthly Income',  value: '-' }
    ]},
    { title: 'Personal Information', iconClass: 'bi bi-person', items: [
        { description: 'Gender',       value: '-' },
        { description: 'Phone Number', value: '-' },
        { description: 'Caste',        value: '-' },
        { description: 'Ethnicity',    value: '-' }
    ]},
    { title: 'Lifestyle',  iconClass: 'bi bi-cup-hot', items: [
        { description: 'Smoke',        value: '-' },
        { description: 'Drink Alcohol',value: '-' },
        { description: 'Wants Kids',   value: '-' }
    ]},
    { title: 'Appearance', iconClass: 'bi bi-eye', items: [
        { description: 'Height',      value: '-' },
        { description: 'Body Type',   value: '-' },
        { description: 'Skin Tone',   value: '-' },
        { description: 'Disabilities',value: '-' }
    ]},
    { title: 'Religion', iconClass: 'bi bi-moon', items: [
        { description: 'Religion',               value: '-' },
        { description: 'Sect',                   value: '-' },
        { description: 'Importance of Religion', value: '-' }
    ]},
    { title: 'Family', iconClass: 'bi bi-people', items: [
        { description: "Father's Occupation", value: '-' },
        { description: "Mother's Occupation", value: '-' },
        { description: 'Housing Situation',   value: '-' },
        { description: 'No. of Siblings',     value: '-' },
        { description: 'Family Involvement',  value: '-' },
        { description: 'Marital Status',      value: '-' }
    ]}
  ];
}

onAvatarError(event: Event): void {
  (event.target as HTMLImageElement).src = '../../../../assets/images/client-profile-main.png';
}

  mapUserData(user: any): void {
    if (user.eDoc) {
      this.profileHeader.avatar = user.eDoc;
    }

    this.profileHeader.name = user.fullname || `${user.firstName || ''} ${user.lastName || ''}`.trim();
    this.aboutText1 = user.aboutme || '';

    if (user.dob) {
      const age = new Date().getFullYear() - new Date(user.dob).getFullYear();
      this.profileHeader.age = `${age} years`;
    }

    let profileItems: any[] = [];
    try {
      profileItems = JSON.parse(user.userProfile || '[]');
    } catch (e) {
      profileItems = [];
    }

    const get = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0);

    const occupation  = get(5);
    const marital     = get(10);
    const gender      = get(22);
    const education   = get(4);
    const income      = get(6);
    const height      = get(26);
    const bodyType    = get(15);
    const skinTone    = get(16);
    const disability  = get(30);
    const religion    = get(7);
    const sect        = get(8);
    const religionImp = get(9);
    const cast        = get(1);
    const ethnicity   = get(3);
    const smoke       = get(17);
    const alcohol     = get(18);
    const wantKids    = get(19);
    const fatherOcc   = get(12);
    const motherOcc   = get(13);
    const housing     = get(11);
    const siblings    = get(25);
    const family      = get(14);

    this.profileHeader.occupation = occupation?.subTypeTitle || '';
    this.profileHeader.status     = marital?.subTypeTitle   || '';

    this.profileSections = [
      {
        title: 'Education & Career',
        iconClass: 'bi bi-briefcase',
        items: [
          { description: 'Education Level', value: education?.subTypeTitle  || '-' },
          { description: 'Institute Name',  value: education?.instituteName || '-' },
          { description: 'Occupation',      value: occupation?.subTypeTitle  || '-' },
          { description: 'Monthly Income',  value: income?.subTypeTitle     || '-' }
        ]
      },
      {
        title: 'Personal Information',
        iconClass: 'bi bi-person',
        items: [
          { description: 'Gender',        value: gender?.subTypeTitle    || '-' },
          { description: 'Phone Number',  value: user.phoneNo || user.phoneNumber || '-' },
          { description: 'Caste',         value: cast?.subTypeTitle      || '-' },
          { description: 'Ethnicity',     value: ethnicity?.subTypeTitle || '-' }
        ]
      },
      {
        title: 'Lifestyle',
        iconClass: 'bi bi-cup-hot',
        items: [
          { description: 'Smoke',        value: smoke?.subTypeTitle    || '-' },
          { description: 'Drink Alcohol', value: alcohol?.subTypeTitle || '-' },
          { description: 'Wants Kids',   value: wantKids?.subTypeTitle || '-' }
        ]
      },
      {
        title: 'Appearance',
        iconClass: 'bi bi-eye',
        items: [
          { description: 'Height',       value: height?.subTypeTitle    || '-' },
          { description: 'Body Type',    value: bodyType?.subTypeTitle  || '-' },
          { description: 'Skin Tone',    value: skinTone?.subTypeTitle  || '-' },
          { description: 'Disabilities', value: disability?.subTypeTitle || '-' }
        ]
      },
      {
        title: 'Religion',
        iconClass: 'bi bi-moon',
        items: [
          { description: 'Religion',               value: religion?.subTypeTitle    || '-' },
          { description: 'Sect',                   value: sect?.subTypeTitle        || '-' },
          { description: 'Importance of Religion', value: religionImp?.subTypeTitle || '-' }
        ]
      },
      {
        title: 'Family',
        iconClass: 'bi bi-people',
        items: [
          { description: "Father's Occupation",  value: fatherOcc?.subTypeTitle || '-' },
          { description: "Mother's Occupation",  value: motherOcc?.subTypeTitle || '-' },
          { description: 'Housing Situation',    value: housing?.subTypeTitle   || '-' },
          { description: 'No. of Siblings',      value: siblings?.subTypeTitle  || '-' },
          { description: 'Family Involvement',   value: family?.subTypeTitle    || '-' },
          { description: 'Marital Status',       value: marital?.subTypeTitle   || '-' }
        ]
      }
    ];
  }

  getSectionByTitle(title: string): ProfileSection | undefined {
    return this.profileSections.find(s => s.title === title);
  }

  goToEditProfile(): void {
    this.router.navigate(['/create-profile']);
  }

  openAboutModal(): void {
    this.showAboutModal = true;
  }

  closeAboutModal(): void {
    this.showAboutModal = false;
  }
}