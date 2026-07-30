import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import{ environment } from 'src/envirnment/environment';

interface BankDetailsAPIResponse {
  bankDetailID?: number;
  bankName?: string;
  accountNumber?: string;
  accountHolderName?: string;
  active?: number;
}

@Component({
  selector: 'app-user-upgrade-price-plan',
  templateUrl: './user-upgrade-price-plan.component.html',
  styleUrls: ['./user-upgrade-price-plan.component.scss']
})
export class UserUpgradePricePlanComponent implements OnInit, OnDestroy {
  planName: string = '';
  planFee: number = 0;

  planID: number | null = null;
  profileID: number | null = null;

  // ── Bank selection ─────────────────────────────────────────────────────
  bankDetailsList: BankDetailsAPIResponse[] = [];
  selectedBankDetailID: number | null = null;
  bankDetails: BankDetailsAPIResponse = {};

  referenceNumber: string = '';
  paidAmount: number | null = null;
  selectedFile: File | null = null;

  // ── Image preview ────────────────────────────────────────────────────
  filePreviewUrl: string | null = null;
  isImageFile = false;

  // ── Validation state ───────────────────────────────────────────────────
  formSubmitted = false;
  paidAmountError = '';

  constructor(
    private route: ActivatedRoute,
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      this.planID = params.get('planID') ? +params.get('planID')! : null;
      this.profileID = params.get('profileID') ? +params.get('profileID')! : null;
      this.planName = params.get('planName') || '';
      this.planFee = params.get('planFee') ? +params.get('planFee')! : 0;
    });

    this.fetchSystemBankDetails();
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

  copyToClipboard(value: string | undefined): void {
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

  // ── Paid amount: numbers only ────────────────────────────────────────
  onPaidAmountChange(value: string): void {
    if (value && !/^\d+(\.\d+)?$/.test(value)) {
      this.paidAmountError = 'Please enter a valid number';
    } else {
      this.paidAmountError = '';
    }
  }

  submitUpgradeRequest(): void {
    this.formSubmitted = true;

    if (this.paidAmount !== null && !/^\d+(\.\d+)?$/.test(String(this.paidAmount))) {
      this.paidAmountError = 'Please enter a valid number';
    }

    if (!this.referenceNumber || !this.paidAmount || !this.selectedFile || !this.planID || this.paidAmountError) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = (reader.result as string).split(',')[1]; // strip data:...;base64,
      const fileName = this.selectedFile!.name;
      const fileExt = fileName.split('.').pop() || '';

      const payload = {
        userplanID: 0,
        profileID: this.profileID,
        planID: this.planID,
        referenceNo: this.referenceNumber,
        paidAmount: String(this.paidAmount),
        eDoc: base64Data,      
        // eDocPath: fileName,   environment.imageUrl + 'upgradePlan',
         eDocPath: environment.imageUrl + 'PaymentImage',
        eDocExt: fileExt,
        userID: this.sharedGlobalService.getUserID(),
        spType: 'INSERT',
      };
      console.log('Upgrade Request Payload:', payload); 

      this.dataService.postDirect('core-api/Payment/saveUpgradePlan', payload).subscribe({
        next: (res: any) => {
          const response = Array.isArray(res) ? res[0] : res;
          if (response?.includes('Success')) {

            this.valid.apiInfoResponse('Upgrade Request Submitted Successfully');
            this.router.navigate(['/user-active-plan']);
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

  ngOnDestroy(): void {
    if (this.filePreviewUrl) {
      URL.revokeObjectURL(this.filePreviewUrl);
    }
  }
}