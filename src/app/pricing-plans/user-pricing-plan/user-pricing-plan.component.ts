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

interface ContactItem {
  icon: string;
  label: string;
  value: string;
  subValue?: string;
  actionLabel: string;
}

@Component({
  selector: 'app-user-pricing-plan',
  templateUrl: './user-pricing-plan.component.html',
  styleUrls: ['./user-pricing-plan.component.scss']
})
export class UserPricingPlanComponent implements OnInit {
  userName: string = '';
  matchedProfiles: number = 12;
  profileID: number | null = null;

  plans: DisplayPlan[] = [];
  selectedPlanId: number | null = null;

  // TODO: wire to real endpoints once provided
  stats: StatItem[] = [
    { value: 2, icon: 'bi-eye', label: 'Profile Views' },
    { value: 4, icon: 'bi-heart', label: 'Interests Sent' },
    { value: 5, icon: 'bi-chat', label: 'Messages' },
    { value: 2, icon: 'bi-star', label: 'Shortlisted' },
  ];

  // TODO: wire to real endpoint once provided
  contacts: ContactItem[] = [
    { icon: 'bi-envelope', label: 'Email Us', value: 'support@example.com', actionLabel: 'Send Email' },
    { icon: 'bi-telephone', label: 'Call Us', value: '+1 234 567 8900', actionLabel: 'Call Now' },
    { icon: 'bi-geo-alt', label: 'Our office', value: 'Berlin,Germeny', actionLabel: 'Get Direction' },
  ];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserAndPlans(); // Placeholder for currencyTypeID, will be set after user details are loaded
  }

 private loadUserAndPlans(): void {
  const userID = this.sharedGlobalService.getUserID();

  this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
    next: (res: any) => {
      console.log('getUserDetails raw response:', res);

      const user = Array.isArray(res) ? res[0] : res;
      console.log('getUserDetails resolved user object:', user);

      if (!user) return;

      this.profileID = 0;
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
      },
    });
  }
}