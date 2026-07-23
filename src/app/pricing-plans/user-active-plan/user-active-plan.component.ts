import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';

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

@Component({
  selector: 'app-user-active-plan',
  templateUrl: './user-active-plan.component.html',
  styleUrls: ['./user-active-plan.component.scss']
})
export class UserActivePlanComponent implements OnInit {
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
  

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
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
        console.log('getUserDashboardCounts raw response:', res);
        const counts: ApiDashboardCounts = Array.isArray(res) ? res[0] : res;
        if (!counts) return;

        this.stats = this.mapCountsToStats(counts);
        console.log('Mapped stats:', this.stats);
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

  const whatsappDigits = phone.main.replace(/[^\d]/g, ''); // strip +, spaces, dashes

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

  // Pulls the leading segment matching `regex` out as the main value,
  // treats whatever follows as the subValue (e.g. "support@x.com Response within 24 hours")
  private splitLeading(str: string, regex: RegExp): { main: string; rest: string } {
    if (!str) return { main: '', rest: '' };
    const match = str.match(regex);
    if (!match) return { main: str.trim(), rest: '' };
    const main = match[0].trim();
    const rest = str.slice(match[0].length).trim();
    return { main, rest };
  }

  // Address format has a double-space between city/country and street,
  // e.g. "Berlin, Germany  Friedrichstraße 123, 10117"
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

          const currentItem = data.find(
            (p) => p.currentPlan === 1 && this.plans.some((dp) => dp.id === p.planID),
          );
          this.currentPlanId = currentItem ? currentItem.planID : null;

          if (this.currentPlanId) {
            this.selectedPlanId = this.currentPlanId;
          }
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
}