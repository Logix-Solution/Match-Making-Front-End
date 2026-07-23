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

interface ApiMatchProfile {
  userProfileStatusID: number;
  statusID: number;
  statusTitle: string;
  sourceProfileID: string;
  destinationprofileID: string;
  match: string;
  fullName: string;
  address: string;
  maritalStatus: string;
  height: string;
  occupation: string;
  dateofbirth: string;
  destinationProfileName: string;
  destinationprofileGender: string;
  destinationprofileeDoc: string;
  userInterest: string;
}

interface MatchCard {
  sourceProfileID: number;
  destinationProfileID: number;
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

@Component({
  selector: 'app-user-active-plan',
  templateUrl: './user-active-plan.component.html',
  styleUrls: ['./user-active-plan.component.scss']
})
export class UserActivePlanComponent implements OnInit {

    // environment = environment;

currentPlanLabel: string = 'Free Plan'; 
  userName = '';
  matchedProfiles = 12;

  profileID: number | null = null;

  stats: StatCard[] = [];

  plans: PricingPlan[] = [];
  selectedPlanId: number | null = null;
  currentPlanId: number | null = null;
  isOnFreePlan: boolean = false;

  // Populated from core-api/Admin/getSupport
  contacts: ContactCard[] = [];

  // Populated from core-api/Admin/getUserMatchProfile
  bestMatches: MatchCard[] = [];

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
          // console.log('getUserDashboardCounts raw response:', res);
          const counts: ApiDashboardCounts = Array.isArray(res) ? res[0] : res;
          if (!counts) return;

          this.stats = this.mapCountsToStats(counts);
          // console.log('Mapped stats:', this.stats);
        },
        error: (err) => console.error('getUserDashboardCounts error:', err),
      });
  }

  private mapCountsToStats(counts: ApiDashboardCounts): StatCard[] {
    return [
      { value: counts.profileView ?? '0', label: 'Profile Views', icon: 'bi-graph-up' },
      { value: counts.mutualLike ?? '0', label: 'Mutual Likes', icon: 'bi-star' },
      { value: counts.countries ?? '0', label: 'Countries', icon: 'bi-globe' },
      { value: counts.avgResponse ?? '0', unit: 'h', label: 'Avg Response', icon: 'bi-clock' },
    ];
  }

  private loadSupport(): void {
    this.dataService.getHttp('core-api/Admin/getSupport', {}).subscribe({
      next: (res: any) => {
        console.log('getSupport raw response:', res);
        const support: ApiSupport = Array.isArray(res) ? res[0] : res;
        if (!support) return;

        this.contacts = this.mapSupportToContacts(support);
        console.log('Mapped contacts:', this.contacts);
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

  private splitLeading(str: string, regex: RegExp): { main: string; rest: string } {
    if (!str) return { main: '', rest: '' };
    const match = str.match(regex);
    if (!match) return { main: str.trim(), rest: '' };
    const main = match[0].trim();
    const rest = str.slice(match[0].length).trim();
    return { main, rest };
  }

  private splitAddress(str: string): { main: string; rest: string } {
    if (!str) return { main: '', rest: '' };
    const parts = str.split(/\s{2,}/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 2) {
      return { main: parts[0], rest: parts.slice(1).join(', ') };
    }
    return { main: str.trim(), rest: '' };
  }

  private loadUserAndPlans(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
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
          (p: any) => p.currencyTypeID !== undefined && p.currencyTypeID !== null,
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
    .getHttp(`core-api/Payment/getUserPlans?profileID=${profileID}&currencyTypeID=${currencyTypeID}`, {})
    .subscribe({
      next: (res: any) => {
        const data: ApiUserPlan[] = Array.isArray(res) ? res : [];

        this.plans = data
          .filter((p) => {
            const nameLower = (p.planName || '').toLowerCase();
            return !nameLower.includes('free') && !nameLower.includes('registration');
          })
          .map((p) => this.mapApiPlanToDisplay(p));

        // Find the current plan from the FULL list (not the filtered `plans`),
        // so Registration/Free still shows correctly in the badge even though
        // it's excluded from the purchasable plans grid.
        const currentItem = data.find((p) => p.currentPlan === 1);

        this.currentPlanId = currentItem && this.plans.some((dp) => dp.id === currentItem.planID)
          ? currentItem.planID
          : null; // only highlight a card as "selected" if it's actually shown in the grid

        if (this.currentPlanId) {
          this.selectedPlanId = this.currentPlanId;
        }

        // Badge text always reflects the real current plan, Registration included.
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

  // ---------- Best Matches ----------

  private loadBestMatches(profileID: number): void {
    this.dataService
      .getHttp(`core-api/Admin/getUserMatchProfile?profileID=${profileID}`, {})
      .subscribe({
        next: (res: any) => {
          // console.log('getUserMatchProfile raw response:', res);
          const data: ApiMatchProfile[] = Array.isArray(res) ? res : (res ? [res] : []);
          this.bestMatches = data.map((m) => this.mapMatchProfileToCard(m));
          console.log('Mapped bestMatches:', this.bestMatches);
        },
        error: (err) => console.error('getUserMatchProfile error:', err),
      });
  }
private mapMatchProfileToCard(m: ApiMatchProfile): MatchCard {
  const imageDoc = environment.productUrl + 'assets/user-images/userProfile/' + (m.destinationprofileeDoc || '');

  // console.log('Mapping match profile:', m, 'to card with imageDoc:', imageDoc, 'userInterest raw:', m.userInterest);

  return {
    sourceProfileID: +m.sourceProfileID || 0,
    destinationProfileID: +m.destinationprofileID || 0,
    name: m.destinationProfileName || '',
    gender: m.destinationprofileGender || '',
    age: this.calculateAge(m.dateofbirth),
    height: m.height || '',
    maritalStatus: m.maritalStatus || '',
    occupation: m.occupation || '',
    address: m.address || '',
    imageDoc: imageDoc,
    isInterested: String(m.userInterest ?? '0') === '1',
    isTogglingInterest: false,
  };
}
  private calculateAge(dob: string): number | null {
    if (!dob) return null;
    const parsed = new Date(dob);
    if (isNaN(parsed.getTime())) return null;
    const diff = Date.now() - parsed.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  // Toggles Send/Withdraw interest for a match card.
  // spType is always 'insert' per backend requirement.
  toggleInterest(match: MatchCard): void {
    if (match.isTogglingInterest) return;

    const nextState = !match.isInterested;
    match.isTogglingInterest = true;

    // const senderID = this.sharedGlobalService.getUserID();

    const payload = {
      senderID: match.sourceProfileID,
      receiverID: match.destinationProfileID,
      interestStatusID: nextState ? 1 : 0,
      spType: 'insert',
    };
  // console.log('toggleInterest payload:', payload);  

   this.dataService.postDirect('core-api/Admin/saveUserInterest', payload).subscribe({
  next: (res: any) => {
    match.isTogglingInterest = false;

    if (res?.apiErrorResponse) {
      this.validationService.validateToastr(res.apiErrorResponse);
      return;
    }

    match.isInterested = nextState;

    const message = nextState
      ? (res?.apiInfoResponse || 'Interest sent successfully')
      : (res?.apiInfoResponse || 'Interest withdrawn successfully');
    this.validationService.validateToastr(message);
  },
  error: (err) => {
    match.isTogglingInterest = false;
    console.error('saveUserInterest error:', err);
    // this.validationService.validateToastr('Something went wrong, please try again');
  },
});
}
}