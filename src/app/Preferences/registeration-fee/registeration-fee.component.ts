import { Component, OnInit,OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
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

interface BankDetailsAPIResponse {
  bankDetailID?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  ibanNumber?: string | null;
  swiftBIC?: string | null;
  institutionNumber?: string | null;
  sortNumber?: string | null;
  bsbNumber?: string | null;
  transitNumber?: string | null;
  routingNumber?: string | null;
  address?: string | null;
  active?: number;
}

@Component({
  selector: 'app-registeration-fee',
  templateUrl: './registeration-fee.component.html',
  styleUrls: ['./registeration-fee.component.scss']
})
export class RegisterationFeeComponent implements OnInit , OnDestroy{
  userName = '';
  matchedProfiles = 10; // TODO: wire to real endpoint once provided

  profileID: number | null = null;
  currencyTypeID: number | string | null = null;

  registrationPlan: ApiUserPlan | null = null;
  isLoadingPlan = true;

  // ── Bank selection ─────────────────────────────────────────────────────
  bankDetailsList: BankDetailsAPIResponse[] = [];
  selectedBankDetailID: number | null = null;
  bankDetails: BankDetailsAPIResponse = {};

  referenceNumber = '';
  paidAmount: number | null = null;
  selectedFile: File | null = null;

  // ── Image preview ────────────────────────────────────────────────────
  filePreviewUrl: string | null = null;
  isImageFile = false;

  // ── Validation state ───────────────────────────────────────────────────
  formSubmitted = false;
  paidAmountError = '';

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserAndRegistrationPlan();
    this.fetchSystemBankDetails();
  }

  // ── Load user -> profileID/currencyTypeID -> plans -> pick Registration plan ──
  private loadUserAndRegistrationPlan(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
      next: (res: any) => {
        const user = Array.isArray(res) ? res[0] : res;
        if (!user) {
          this.isLoadingPlan = false;
          return;
        }

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
        this.currencyTypeID = currencyItem?.currencyTypeID;

        if (this.profileID && this.currencyTypeID) {
          this.loadRegistrationPlan(this.profileID, this.currencyTypeID);
        } else {
          console.error('Missing profileID or currencyTypeID', {
            profileID: this.profileID,
            currencyTypeID: this.currencyTypeID,
          });
          this.isLoadingPlan = false;
        }
      },
      error: (err) => {
        console.error('getUserDetails error:', err);
        this.isLoadingPlan = false;
      },
    });
  }

  private loadRegistrationPlan(profileID: number, currencyTypeID: number | string): void {
    this.dataService
      .getHttp(`core-api/Payment/getUserPlans?profileID=${profileID}&currencyTypeID=${currencyTypeID}`, {})
      .subscribe({
        next: (res: any) => {
          const data: ApiUserPlan[] = Array.isArray(res) ? res : [];

          this.registrationPlan =
            data.find((p) => (p.planName || '').toLowerCase().includes('registration')) || null;

          // Pre-fill the Paid Amount field with the plan's fee so it matches
          // by default; the field itself stays editable and is still
          // validated against requiredFeeAmount on change/submit as before.
          if (this.registrationPlan) {
            this.paidAmount = +this.registrationPlan.planFee || null;
          }

          this.isLoadingPlan = false;
        },
        error: (err) => {
          console.error('getUserPlans error:', err);
          this.isLoadingPlan = false;
        },
      });
  }

  fetchSystemBankDetails(): void {
    this.dataService.getHttp('core-api/Payment/getBankDetails').subscribe({
      next: (res: any) => {
        const response: BankDetailsAPIResponse[] = Array.isArray(res) ? res : (res ? [res] : []);
        this.bankDetailsList = response.filter(b => b.active === 1 || b.active === undefined);

        if (this.bankDetailsList.length > 0) {
          this.onBankSelect(this.bankDetailsList[0].bankDetailID!);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Unable to load bank details.');
        console.error(err);
      },
    });
  }

  onBankSelect(bankDetailID: number | string): void {
    const id = Number(bankDetailID);
    this.selectedBankDetailID = id;
    const found = this.bankDetailsList.find(b => b.bankDetailID === id);
    this.bankDetails = found || {};
  }

  get formattedFee(): string {
    if (!this.registrationPlan) return '';
    const fee = +this.registrationPlan.planFee || 0;
    return `${this.registrationPlan.currencyTypeTitle} ${fee.toLocaleString()}`;
  }

  // Numeric fee value used for exact paidAmount comparison
  private get requiredFeeAmount(): number {
    return this.registrationPlan ? (+this.registrationPlan.planFee || 0) : 0;
  }

  copyToClipboard(value: string | undefined | null): void {
    if (!value) return;
    navigator.clipboard.writeText(value).then(() => {
      console.log('Value successfully synced to system clipboard');
    }).catch(err => {
      console.error('Could not copy data sequence: ', err);
    });
  }

  onFileDropped(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.validateAndSetFile(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.validateAndSetFile(input.files[0]);
    }
  }

  private validateAndSetFile(file: File): void {
    const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
    if (allowedTypes.includes(file.type)) {
      this.selectedFile = file;
      this.isImageFile = file.type === 'image/png' || file.type === 'image/jpeg';

      // Revoke any previous preview URL to avoid memory leaks
      if (this.filePreviewUrl) {
        URL.revokeObjectURL(this.filePreviewUrl);
        this.filePreviewUrl = null;
      }

      if (this.isImageFile) {
        this.filePreviewUrl = URL.createObjectURL(file);
      }
    } else {
      alert('Invalid file format. Please upload a PNG, JPG, or PDF file.');
    }
  }

  removeSelectedFile(event: Event): void {
    event.stopPropagation();
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
    }
    this.selectedFile = null;
    this.filePreviewUrl = null;
    this.isImageFile = false;
  }

  // ── Paid amount: numbers only + must equal the registration fee exactly ──
  onPaidAmountChange(value: string): void {
    if (value && !/^\d+(\.\d+)?$/.test(value)) {
      this.paidAmountError = 'Please enter a valid number';
      return;
    }

    if (value && this.registrationPlan) {
      const entered = +value;
      const required = this.requiredFeeAmount;
      if (entered > required) {
        this.paidAmountError = `Paid amount cannot be greater than ${this.formattedFee}`;
      } else if (entered < required) {
        this.paidAmountError = `Paid amount cannot be less than ${this.formattedFee}`;
      } else {
        this.paidAmountError = '';
      }
    } else {
      this.paidAmountError = '';
    }
  }

  submitRegistration(): void {
    this.formSubmitted = true;

    if (this.paidAmount !== null && !/^\d+(\.\d+)?$/.test(String(this.paidAmount))) {
      this.paidAmountError = 'Please enter a valid number';
    } else if (this.paidAmount !== null && this.registrationPlan) {
      const entered = +this.paidAmount;
      const required = this.requiredFeeAmount;
      if (entered > required) {
        this.paidAmountError = `Paid amount cannot be greater than ${this.formattedFee}`;
      } else if (entered < required) {
        this.paidAmountError = `Paid amount cannot be less than ${this.formattedFee}`;
      } else {
        this.paidAmountError = '';
      }
    }

    if (!this.referenceNumber || !this.paidAmount || !this.selectedFile || !this.registrationPlan || this.paidAmountError) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1];
      const fileName = this.selectedFile!.name;
      const fileExt = fileName.split('.').pop() || '';

      const payload = {
        userplanID: 0,
        profileID: this.profileID,
        planID: this.registrationPlan!.planID,
        referenceNo: this.referenceNumber,
        paidAmount: String(this.paidAmount),
        eDoc: base64Data,
        eDocPath: environment.imageUrl + 'PaymentImage',
        eDocExt: fileExt,
        userID: this.sharedGlobalService.getUserID(),
        spType: 'INSERT',
      };
      console.log(payload,'register fee');

      this.dataService.postDirect('core-api/Payment/saveUpgradePlan', payload).subscribe({
        next: (res: any) => {
          const response = Array.isArray(res) ? res[0] : res;
          if (response?.includes('Success')) {
            this.valid.apiInfoResponse('Profile Registered Successfully');
            this.navigateAfterRegistration();
          } else {
            this.valid.apiErrorResponse(response);
          }
        },
        error: (err) => {
          this.valid.apiErrorResponse('Something went wrong.');
          console.error(err);
        },
      });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  private navigateAfterRegistration(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
      next: (res: any) => {
        const user = Array.isArray(res) ? res[0] : res;
        const statusTitle = user?.statusTitle;

        if (statusTitle === 'Pending') {
          this.router.navigate(['/reguestSubmited']);
        } else if (statusTitle === 'Approved') {
          this.router.navigate(['/user-Pricing-Plans']);
        }
      },
      error: (err) => {
        console.error('getUserDetails (post-save status check) error:', err);
        this.router.navigate(['/user-Pricing-Plans']);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
    }
  }
}