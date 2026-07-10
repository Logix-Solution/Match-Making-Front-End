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
  currentPlan: number;      // 1 = this is the user's current plan, 0 = not
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

interface ContactCard {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  actionLabel: string;
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

  // TODO: wire to real endpoint once provided
  stats: StatCard[] = [
    { value: '248', label: 'Profile Views', icon: 'bi-graph-up' },
    { value: '19', label: 'Mutual Likes', icon: 'bi-star' },
    { value: '14', label: 'Countries', icon: 'bi-globe' },
    { value: '2', unit: 'h', label: 'Avg Response', icon: 'bi-clock' },
  ];

  plans: PricingPlan[] = [];
  selectedPlanId: number | null = null;
  currentPlanId: number | null = null;

  // TODO: wire to real endpoint once provided
  contacts: ContactCard[] = [
    {
      icon: 'bi-envelope',
      label: 'EMAIL US',
      value: 'support@matchwell.eu',
      subValue: 'Response within 24 hours',
      actionLabel: 'Send email',
    },
    {
      icon: 'bi-telephone',
      label: 'CALL US',
      value: '+49 30 1234 5678',
      subValue: 'Mon – Fri, 9:00 – 18:00 CET',
      actionLabel: 'Call now',
    },
    {
      icon: 'bi-geo-alt',
      label: 'OUR OFFICE',
      value: 'Berlin, Germany',
      subValue: 'Friedrichstraße 123, 10115',
      actionLabel: 'Get directions',
    },
  ];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserAndPlans();
  }

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

        // currencyTypeID is nested inside userProfile JSON, not top-level
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

          // currentPlan is a per-item flag (1/0), not a top-level value
          const currentItem = data.find((p) => p.currentPlan === 1);
          this.currentPlanId = currentItem ? currentItem.planID : null;

          this.plans = data
            .filter((p) => {
              const nameLower = (p.planName || '').toLowerCase();
              return !nameLower.includes('free') && !nameLower.includes('registration');
            })
            .map((p) => this.mapApiPlanToDisplay(p));

          // Pre-select the user's current plan, if it's among the displayed plans
          if (this.currentPlanId) {
            const match = this.plans.find((p) => p.id === this.currentPlanId);
            if (match) {
              this.selectedPlanId = match.id;
            }
          }

          console.log('Final mapped plans:', this.plans);
          console.log('currentPlanId:', this.currentPlanId);
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