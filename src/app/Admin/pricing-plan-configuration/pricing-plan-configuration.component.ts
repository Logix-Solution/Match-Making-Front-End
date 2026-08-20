import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface CurrencyType {
  currencyTypeID: number;
  currencyTypeTitle: string;
}

interface DurationType {
  durationID: number;
  durationTitle: string;
}

interface TierFee {
  planCurrencyID?: number;       // present only on rows loaded from getPlans
  currencyTypeID: number | null;
  currencyTypeTitle?: string;
  fee: number | null;
  durationID: number | null;
  durationTitle?: string;
}

interface PlanTier {
  id: number;                    // planID — 0 = not saved yet
  name: string;
  fees: TierFee[];
  details: string;               // planDescription — feature bullets shown on card
  isFreePlan: boolean;
  isRegistration: boolean;
  totalClientsPaid: number;
  totalClients: number;
  activeClients: number;
  planShareCount: number; 
}

@Component({
  selector: 'app-pricing-plan-configuration',
  templateUrl: './pricing-plan-configuration.component.html',
  styleUrls: ['./pricing-plan-configuration.component.scss']
})
export class PricingPlanConfigurationComponent implements OnInit {
   // ─── Lookup data from API ───────────────────────────────────────────────
  currencyTypes: CurrencyType[] = [];
  durationOptions: DurationType[] = [];

  // Backend only sends a title, so map common titles to a display symbol
  private symbolMap: { [key: string]: string } = {
    dollor: '$',
    dollar: '$',
    usd: '$',
    euro: '€',
    eur: '€',
    pkr: 'Rs',
    rupees: 'Rs',
    rupee: 'Rs',
  };

  // Card price-line display order — by currencyTypeID ascending
  get cardDisplayOrder(): number[] {
    return [...this.currencyTypes]
      .sort((a, b) => a.currencyTypeID - b.currencyTypeID)
      .map((c) => c.currencyTypeID);
  }

  // ─── Master plan tier list — single source of truth ────────────────────
  planTiers: PlanTier[] = [];
  loadingPlans = false;

  // ─── Modal State — edits ONE tier at a time ─────────────────────────────
  isModalOpen = false;
  editingTierId: number | null = null; // null = creating new
  workingTier: PlanTier = this.makeTier({});

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadPlans();
  }
    // ─── Lookups: Currency + Duration dropdowns ─────────────────────────────
  loadLookups(): void {
    this.dataService.getHttp('cmis-api/company/getCurrencyType', {}).subscribe({
      next: (res: any) => {
        this.currencyTypes = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('getCurrencyType error:', err),
    });

    this.dataService.getHttp('core-api/Payment/getDuration', {}).subscribe({
      next: (res: any) => {
        this.durationOptions = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('getDuration error:', err),
    });
  }

  // ─── Plans (cards) ───────────────────────────────────────────────────────
  loadPlans(): void {
    this.loadingPlans = true;
    this.dataService.getHttp('core-api/Payment/getPlans', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.planTiers = data.map((p: any) => this.mapApiPlanToTier(p));
        this.loadingPlans = false;
      },
      error: (err) => {
        console.error('getPlans error:', err);
        this.loadingPlans = false;
      },
    });
  }
    private mapApiPlanToTier(p: any): PlanTier {
    let details: any[] = [];
    try {
      details = JSON.parse(p.planDetails || '[]');
    } catch {
      details = [];
    }

    const fees: TierFee[] = details.map((d: any) => ({
      planCurrencyID: d.planCurrencyID,
      currencyTypeID: d.currencyTypeID,
      currencyTypeTitle: d.currencyTypeTitle,
      fee: d.planFee !== undefined && d.planFee !== null ? +d.planFee : null,
      durationID: d.durationID,
      durationTitle: d.durationTitle,
    }));

    const nameLower = (p.planName || '').toLowerCase();

    return {
      id: p.planID,
      name: p.planName || '',
      fees,
      details: p.planDescription || '',
      isFreePlan: nameLower.includes('free'),
      isRegistration: nameLower.includes('registration'),
      totalClientsPaid: +(p.totalClientsPaid || 0),
      totalClients: +(p.totalClients || 0),
      activeClients: +(p.activeClients || 0),
      planShareCount: +(p.planShareCount || 0),
    };
  }
    private makeTier(partial: Partial<PlanTier>): PlanTier {
    return {
      id: partial.id ?? 0,
      name: partial.name || '',
      fees: partial.fees || this.currencyTypes.map((c) => ({
        currencyTypeID: c.currencyTypeID,
        currencyTypeTitle: c.currencyTypeTitle,
        fee: null,
        durationID: null,
      })),
      details: partial.details || '',
      isFreePlan: partial.isFreePlan || false,
      isRegistration: partial.isRegistration || false,
      totalClientsPaid: partial.totalClientsPaid || 0,
      totalClients: partial.totalClients || 0,
      activeClients: partial.activeClients || 0,
      planShareCount: partial.planShareCount || 0,
    };
  }

  getSymbol(title: string | undefined): string {
    if (!title) return '';
    return this.symbolMap[title.trim().toLowerCase()] || title;
  }

  getFee(tier: PlanTier, currencyTypeID: number): TierFee | undefined {
    return tier.fees.find((f) => f.currencyTypeID === currencyTypeID);
  }

  // ─── Formatted price line, e.g. "€ 500/ $ 400/ Rs 200,000" ─────────────
  priceLine(tier: PlanTier): string {
    return this.cardDisplayOrder
      .map((currencyTypeID) => {
        const fee = this.getFee(tier, currencyTypeID);
        const symbol = this.getSymbol(fee?.currencyTypeTitle);
        const value =
          fee && fee.fee !== null && fee.fee !== undefined
            ? fee.fee.toLocaleString()
            : '____';
        return `${symbol} ${value}`;
      })
      .join('/ ');
  }
   // ─── Duration shown under the price line ────────────────────────────────
  primaryDuration(tier: PlanTier): string {
    const withDuration = tier.fees.find((f) => f.durationTitle);
    return withDuration ? withDuration.durationTitle! : '';
  }

  featureLines(details: string): string[] {
    return (details || '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  // ─── Regular tiers — Free Plan & Registration get their own row ────────
  get regularTiers(): PlanTier[] {
    return this.planTiers.filter((t) => !t.isFreePlan && !t.isRegistration);
  }

  get freeTier(): PlanTier | null {
    return this.planTiers.find((t) => t.isFreePlan) || null;
  }

  get registrationTier(): PlanTier | null {
    return this.planTiers.find((t) => t.isRegistration) || null;
  }

  // ─── Modal — open for Create ─────────────────────────────────────────────
  openCreateModal(): void {
    this.editingTierId = null;
    this.workingTier = this.makeTier({});
    this.isModalOpen = true;
  }

  // ─── Modal — open for Edit ───────────────────────────────────────────────
  openEditModal(tier: PlanTier): void {
    this.editingTierId = tier.id;
    this.workingTier = {
      ...tier,
      fees: tier.fees.map((f) => ({ ...f })),
    };
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }
    // ─── Modal — Save / Upload Plan ─────────────────────────────────────────
  uploadPlan(): void {
    const planJson = this.workingTier.fees
      .filter((f) => f.currencyTypeID != null)
      .map((f) => ({
        currencyTypeID: f.currencyTypeID,
        planFee: f.fee != null ? String(f.fee) : '0',
        durationID: f.durationID,
      }));

    const payload = {
      planID: this.workingTier.id || 0,
      planName: this.workingTier.name,
      planDescription: this.workingTier.details,
      planShareCount: this.workingTier.planShareCount || 0,
      planJson: JSON.stringify(planJson),
      userID: this.sharedGlobalService.getUserID(),
      spType: this.editingTierId ? 'UPDATE' : 'INSERT',
    };

    this.dataService.postDirect('core-api/Payment/savePlan', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Plan Saved Successfully');
          this.isModalOpen = false;
          this.loadPlans(); // refresh cards so IDs / client counts stay accurate
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong.');
        console.error(err);
      },
    });
  }
   // ─── Delete a single plan card ───────────────────────────────────────────
// ─── Delete a single plan card ───────────────────────────────────────────
deleteTier(tier: PlanTier): void {
  const payload = {
    planID: tier.id,
    planName: tier.name,
    planDescription: tier.details,
    planJson: '',
    userID: this.sharedGlobalService.getUserID(),
    spType: 'DELETE',
  };

  this.dataService.postDirect('core-api/Payment/savePlan', payload).subscribe({
    next: (res: any) => {
      const response = Array.isArray(res) ? res[0] : res;
      if (response?.includes('Success')) {
        this.valid.apiInfoResponse('Plan Deleted Successfully');
        this.planTiers = this.planTiers.filter((t) => t.id !== tier.id);
      } else {
        this.valid.apiErrorResponse(response);
      }
    },
    error: (err) => {
      this.valid.apiErrorResponse('Something went wrong.');
      console.error(err);
    },
  });
}
}