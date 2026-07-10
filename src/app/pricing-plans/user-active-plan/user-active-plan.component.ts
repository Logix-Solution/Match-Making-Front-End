import { Component } from '@angular/core';

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
export class UserActivePlanComponent {
  userName = 'Salif!';
  matchedProfiles = 12;

  stats: StatCard[] = [
    { value: '248', label: 'Profile Views', icon: 'bi-graph-up' },
    { value: '19', label: 'Mutual Likes', icon: 'bi-star' },
    { value: '14', label: 'Countries', icon: 'bi-globe' },
    { value: '2', unit: 'h', label: 'Avg Response', icon: 'bi-clock' },
  ];

  plans: PricingPlan[] = [
    {
      id: 1,
      name: 'Monthly',
      price: '€500',
      duration: '/ month',
      billingText: 'Billed monthly',
      features: [
        'Up to 20 profile views',
        'Basic match filters',
        'Email support',
        'Profile analytics',
      ],
    },
    {
      id: 2,
      name: 'Quarterly',
      price: '€1,500',
      duration: '/ quarter',
      billingText: 'Billed every 3 months',
      badge: 'Save 0%',
      features: [
        'Up to 60 profile views',
        'Advanced match filters',
        'Priority email support',
        'Detailed analytics',
      ],
    },
    {
      id: 3,
      name: 'Bi-Annual',
      price: '€2,000',
      duration: '/ 6 months',
      billingText: 'Billed every 6 months',
      badge: 'Save 33%',
      features: [
        'Unlimited profile views',
        'Premium match filters',
        'Phone & email support',
        'Full analytics suite',
      ],
    },
    {
      id: 4,
      name: 'Annual',
      price: '€3,000',
      duration: '/ year',
      billingText: 'Billed once per year',
      badge: 'Best Value',
      highlighted: true,
      features: [
        'Unlimited profile views',
        'AI-powered matching',
        'Dedicated account manager',
        'White-glove onboarding',
      ],
    },
  ];

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

  selectedPlanId: number | null = null;

  choosePlan(plan: PricingPlan): void {
    this.selectedPlanId = plan.id;
  }
}
