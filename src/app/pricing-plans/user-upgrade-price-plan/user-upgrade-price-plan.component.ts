import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface BankDetailsAPIResponse {
  accountHolder?: string;
  iban?: string;
  bankName?: string;
}

@Component({
  selector: 'app-user-upgrade-price-plan',
  templateUrl: './user-upgrade-price-plan.component.html',
  styleUrls: ['./user-upgrade-price-plan.component.scss']
})
export class UserUpgradePricePlanComponent implements OnInit {
  planName: string = '';
  planFee: number = 0;

  planID: number | null = null;
  profileID: number | null = null;

  bankDetails: BankDetailsAPIResponse = {};

  referenceNumber: string = '';
  paidAmount: number | null = null;
  selectedFile: File | null = null;

  constructor(
    private route: ActivatedRoute,
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
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
    this.bankDetails = {
      accountHolder: 'Muslim Matchmaking International Ltd',
      iban: 'DE89 3704 0044 0532 1234 00',
      bankName: 'Deutsche Bank Berlin'
    };
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
    } else {
      alert('Invalid file format. Please upload a PNG, JPG, or PDF file.');
    }
  }

  submitUpgradeRequest(): void {
    if (!this.referenceNumber || !this.paidAmount || !this.selectedFile || !this.planID) {
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
        eDocPath: fileName,
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
}