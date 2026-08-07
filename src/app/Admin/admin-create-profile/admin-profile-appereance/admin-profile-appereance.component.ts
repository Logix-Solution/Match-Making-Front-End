import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface AppearanceProfileInterface {
  userID: number;
  spType: string;
  disabilityDescription: string;
  appearanceJson: string;
}

@Component({
  selector: 'app-admin-profile-appereance',
  templateUrl: './admin-profile-appereance.component.html',
  styleUrls: ['./admin-profile-appereance.component.scss'],
})
export class AdminProfileAppereanceComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() heightList: any[] = [];
  @Input() bodyTypeList: any[] = [];
  @Input() skinToneList: any[] = [];
  @Input() disabilityList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Dropdown & Text Field Value Bindings ─────────────────────────────────
  selectedHeight: any = '';
  selectedBodyType: any = '';
  selectedSkinTone: any = '';
  selectedDisability: any = '';
  disabilityDescription: string = '';

  private userID: number = 0;

  // ─── Page Fields (API Payload Template) ───────────────────────────────────
  appearancePageFields: AppearanceProfileInterface = {
    userID: 0,
    spType: 'insert',
    disabilityDescription: 'No',
    appearanceJson: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  appearanceFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: 'No', msg: '', type: 'textbox', required: false }, // 2 disabilityDescription
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 appearanceJson
  ];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr: ToastrService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadUserIDByEmail();
  }

  // Look up the userID via the email captured in the Personal Info step —
  // no field values are fetched or pre-filled, this is only to get the ID.
  private loadUserIDByEmail(): void {
    const email = this.sharedGlobalService.getAdminEmail();
    if (!email) return;

    this.dataService
      .getHttp(
        `core-api/Admin/getUserDetailsByAdmin?email=${encodeURIComponent(email)}`,
      )
      .subscribe({
        next: (response: any) => {
          const user = Array.isArray(response) ? response[0] : response;
          this.userID = user?.userID || 0;
        },
        error: (err) => console.log('Get userID by email error:', err),
      });
  }

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Helper checking if "Yes" is actively selected (drives textarea visibility) ──
  isDisabilityYes(): boolean {
    const activeItem = this.disabilityList.find(
      (item) => item.subTypeID == this.selectedDisability,
    );
    return activeItem?.subTypeTitle?.trim().toLowerCase() === 'yes';
  }

  // ─── Synchronize Variables with Payload Arrays ────────────────────────────
  syncFormFields(): void {
    if (this.isDisabilityYes()) {
      this.appearanceFormFields[2].value = this.disabilityDescription
        ? this.disabilityDescription.trim()
        : '';
    } else {
      this.appearanceFormFields[2].value = 'No';
    }

    const appearanceEntries = [
      { typeID: 26, subTypeID: this.selectedHeight },
      { typeID: 15, subTypeID: this.selectedBodyType },
      { typeID: 16, subTypeID: this.selectedSkinTone },
      { typeID: 30, subTypeID: this.selectedDisability },
    ]
      .filter(
        (item) =>
          item.subTypeID !== '' &&
          item.subTypeID !== null &&
          item.subTypeID !== undefined,
      )
      .map((item) => ({
        typeID: item.typeID,
        subTypeID: Number(item.subTypeID),
      }));

    this.appearanceFormFields[3].value = JSON.stringify(appearanceEntries);
  }

  // ─── Save Implementation Method ───────────────────────────────────────────
  save(): void {
    if (!this.userID) {
      this.toastr.error(
        'User not found. Please complete the Personal Info step first.',
      );
      return;
    }

    this.syncFormFields();
    this.appearanceFormFields[0].value = this.userID;
    this.appearanceFormFields[1].value = 'insert';

    this.appearancePageFields.userID = this.appearanceFormFields[0].value;
    this.appearancePageFields.spType = this.appearanceFormFields[1].value;
    this.appearancePageFields.disabilityDescription =
      this.appearanceFormFields[2].value;
    this.appearancePageFields.appearanceJson =
      this.appearanceFormFields[3].value;

    this.dataService
      .saveHttp(
        this.appearancePageFields,
        this.appearanceFormFields,
        'core-api/Profile/saveUserAppearance',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Appearance Profile Saved Successfully');
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Appearance Save Error:', err);
        },
      });
  }
}
