import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';

interface ApiUserPlan {
  planID: number;
  planName: string;
  planDescription: string;
  planCurrencyID: number;
  planFee: string;
  durationID: number;
  durationTitle: string;
  currencyTypeID: string;
  currencyTypeTitle: string;
}

interface DisplayPlan {
  id: number;
  name: string;
  price: string;
  duration: string;
  billingText: string;
  features: string[];
  badge?: string;
  highlighted?: boolean;
  rawFee: number;
}

interface StatItem {
  value: string | number;
  unit?: string;
  icon: string;
  label: string;
}

interface ApiDashboardCounts {
  userID: number;
  profileView: string;
  mutualLike: string;
  countries: string;
  avgResponse: string;
}

interface ApiSupport {
  supportID: number;
  email: string;
  contactNo: string;
  address: string;
}

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  actionLabel: string;
  link: string;
  target?: string;
}

@Component({
  selector: 'app-user-pricing-plan',
  templateUrl: './user-pricing-plan.component.html',
  styleUrls: ['./user-pricing-plan.component.scss']
})
export class UserPricingPlanComponent implements OnInit {
  userName: string = '';
  matchedProfiles: number = 12;

  // Real profileID from getUserDetails — used for loading plans AND save/navigate
  profileID: number | null = null;

  plans: DisplayPlan[] = [];
  selectedPlanId: number | null = null;

  // Populated from core-api/Profile/getUserDashboardCounts
  stats: StatItem[] = [];

  // Populated from core-api/Admin/getSupport
  contacts: ContactItem[] = [];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserAndPlans();
    this.loadDashboardCounts();
    this.loadSupport();
  }

  private loadDashboardCounts(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService
      .getHttp(`core-api/Profile/getUserDashboardCounts?userID=${userID}`, {})
      .subscribe({
        next: (res: any) => {
          console.log('getUserDashboardCounts raw response:', res);
          const counts: ApiDashboardCounts = Array.isArray(res) ? res[0] : res;
          if (!counts) return;

          this.stats = this.mapCountsToStats(counts);
          console.log('Mapped stats:', this.stats);
        },
        error: (err) => console.error('getUserDashboardCounts error:', err),
      });
  }

 private mapCountsToStats(counts: ApiDashboardCounts): StatItem[] {
  return [
    { value: counts.profileView ?? '0', icon: 'bi-graph-up', label: 'Profile Views' },
    { value: counts.mutualLike ?? '0', icon: 'bi-star', label: 'Mutual Likes' },
    { value: counts.countries ?? '0', icon: 'bi-globe', label: 'Countries' },
    { value: counts.avgResponse ?? '0', unit: 'h', icon: 'bi-clock', label: 'Avg Response' },
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

  private mapSupportToContacts(support: ApiSupport): ContactItem[] {
    const email = this.splitLeading(support.email, /^\S+@\S+/);
    const phone = this.splitLeading(support.contactNo, /^[+\d][\d\s\-]*\d/);
    const address = this.splitAddress(support.address);

    const whatsappDigits = phone.main.replace(/[^\d]/g, '');

    return [
      {
        icon: 'bi-envelope',
        label: 'Email Us',
        value: email.main,
        subValue: email.rest,
        actionLabel: 'Send Email',
        link: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email.main)}`,
        target: '_blank',
      },
      {
        icon: 'bi-telephone',
        label: 'Call Us',
        value: phone.main,
        subValue: phone.rest,
        actionLabel: 'Message on WhatsApp',
        link: `https://wa.me/${whatsappDigits}`,
        target: '_blank',
      },
      {
        icon: 'bi-geo-alt',
        label: 'Our office',
        value: address.main,
        subValue: address.rest,
        actionLabel: 'Get Direction',
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

  // --- existing logic below is unchanged ---

  private loadUserAndPlans(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
      next: (res: any) => {
        console.log('getUserDetails raw response:', res);

        const user = Array.isArray(res) ? res[0] : res;
        console.log('getUserDetails resolved user object:', user);

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

        console.log('Extracted profileID:', this.profileID);
        console.log('Extracted currencyTypeID:', currencyTypeID);

        if (this.profileID && currencyTypeID) {
          this.loadPlans(this.profileID, currencyTypeID);
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
          console.log('getUserPlans response:', res);
          const data: ApiUserPlan[] = Array.isArray(res) ? res : [];
          this.plans = data
            .filter((p) => {
              const nameLower = (p.planName || '').toLowerCase();
              return !nameLower.includes('free') && !nameLower.includes('registration');
            })
            .map((p) => this.mapApiPlanToDisplay(p));
        },
        error: (err) => console.error('getUserPlans error:', err),
      });
  }

  private mapApiPlanToDisplay(p: ApiUserPlan): DisplayPlan {
    const fee = +p.planFee || 0;
    return {
      id: p.planID,
      name: p.planName,
      price: `${p.currencyTypeTitle} ${fee.toLocaleString()}`,
      duration: p.durationTitle,
      billingText: `Billed ${p.durationTitle}`,
      features: (p.planDescription || '')
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      rawFee: fee,
    };
  }

  choosePlan(plan: DisplayPlan): void {
    this.selectedPlanId = plan.id;
    this.router.navigate(['/Upgrade-Pricing-Plans'], {
      queryParams: {
        planID: plan.id,
        profileID: this.profileID,
        planName: plan.name,
        planFee: plan.rawFee,
        userplanID: 0,
      },
    });
  }
}