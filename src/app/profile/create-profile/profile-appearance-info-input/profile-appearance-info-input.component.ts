import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface AppearanceProfileInterface {
  userID: number; // 0
  spType: string; // 1
  disabilityDescription: string; // 2
  appearanceJson: string; // 3
}

interface AppearanceTouchedState {
  height:                 boolean;
  bodyType:               boolean;
  skinTone:               boolean;
  disability:             boolean;
  disabilityDescription:  boolean;
}

@Component({
  selector: 'app-profile-appearance-info-input',
  templateUrl: './profile-appearance-info-input.component.html',
  styleUrls: ['./profile-appearance-info-input.component.scss'],
})
export class ProfileAppearanceInfoInputComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() heightList: any[] = [];
  @Input() bodyTypeList: any[] = [];
  @Input() skinToneList: any[] = [];
  @Input() disabilityList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); // Advances parent to step 6

  // ─── Dropdown & Text Field Value Bindings ─────────────────────────────────
  selectedHeight: any = '';
  selectedBodyType: any = '';
  selectedSkinTone: any = '';
  selectedDisability: any = '';
  disabilityDescription: string = '';

  // ─── Validation: touched state per field ───────────────────────────────────
  touched: AppearanceTouchedState = {
    height:                false,
    bodyType:               false,
    skinTone:               false,
    disability:             false,
    disabilityDescription:  false,
  };

  // ─── Page Fields (API Payload Template) ───────────────────────────────────
  appearancePageFields: AppearanceProfileInterface = {
    userID: 0,
    spType: 'insert',
    disabilityDescription: 'No',
    appearanceJson: '[]',
  };

  // ─── Form Fields (Structural Data Validation Array) ──────────────────────
  appearanceFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    {
      value: 'No',
      msg: 'Please describe your disabilities',
      type: 'textbox',
      required: false,
    }, // 2 disabilityDescription
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 appearanceJson
  ];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr: ToastrService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Helper checking if "Yes" is actively selected ────────────────────────
  isDisabilityYes(): boolean {
    const activeItem = this.disabilityList.find(
      (item) => item.subTypeID == this.selectedDisability,
    );
    return activeItem?.subTypeTitle?.trim().toLowerCase() === 'yes';
  }

  // ─── Touched Helpers ────────────────────────────────────────────────────
  markTouched(field: keyof AppearanceTouchedState): void {
    this.touched[field] = true;
  }

  private markAllTouched(): void {
    (Object.keys(this.touched) as (keyof AppearanceTouchedState)[]).forEach(
      (key) => (this.touched[key] = true),
    );
  }

  // ─── Inline Error Getters (template-only, no toastr) ──────────────────────
  get heightError(): string {
    if (!this.touched.height) return '';
    return this.selectedHeight ? '' : 'Height is required';
  }

  get bodyTypeError(): string {
    if (!this.touched.bodyType) return '';
    return this.selectedBodyType ? '' : 'Body type is required';
  }

  get skinToneError(): string {
    if (!this.touched.skinTone) return '';
    return this.selectedSkinTone ? '' : 'Skin tone is required';
  }

  get disabilityError(): string {
    if (!this.touched.disability) return '';
    return this.selectedDisability ? '' : 'Disability status is required';
  }

  get disabilityDescriptionError(): string {
    if (!this.isDisabilityYes()) return '';
    if (!this.touched.disabilityDescription) return '';
    return this.disabilityDescription?.trim()
      ? ''
      : 'Please describe your disabilities';
  }

  private isFormValid(): boolean {
    return (
      !this.heightError &&
      !this.bodyTypeError &&
      !this.skinToneError &&
      !this.disabilityError &&
      !this.disabilityDescriptionError
    );
  }

  // ─── Synchronize Variables with Payload Arrays ────────────────────────────
  syncFormFields(): void {
    // Determine context value for description property
    if (this.isDisabilityYes()) {
      this.appearanceFormFields[2].value = this.disabilityDescription
        ? this.disabilityDescription.trim()
        : '';
    } else {
      this.appearanceFormFields[2].value = 'No'; // Default when No disability
    }

    // Build absolute lookups array
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
    this.markAllTouched();

    if (!this.isFormValid()) {
      this.toastr.warning('Fill All Required Fields');
      return;
    }

    // ─── Get Active Authentication UserID Session ───────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    this.syncFormFields();
    this.appearanceFormFields[0].value = userID;
    this.appearanceFormFields[1].value = 'insert';

    // Map properties directly to API signature interface
    this.appearancePageFields.userID = this.appearanceFormFields[0].value;
    this.appearancePageFields.spType = this.appearanceFormFields[1].value;
    this.appearancePageFields.disabilityDescription =
      this.appearanceFormFields[2].value;
    this.appearancePageFields.appearanceJson =
      this.appearanceFormFields[3].value;

    console.log('Appearance Submission payload:', this.appearancePageFields);

    // ─── POST request submission ────────────────────────────────────────────
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
            this.saveSuccess.emit(); // Navigate layout forward to step 6
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Appearance Save Error:', err);
        },
      });
  }

  loadUserDetails(): void {
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) return;

    this.dataService
      .getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`)
      .subscribe({
        next: (response: any) => {
          const user = Array.isArray(response) ? response[0] : response;
          if (!user) return;

          this.appearanceFormFields[0].value = userID;
          this.appearanceFormFields[1].value = 'Insert';

          let profileItems: any[] = [];
          try {
            profileItems = JSON.parse(user.userProfile || '[]');
          } catch {
            profileItems = [];
          }

          const get = (typeID: number) =>
            profileItems.find(
              (p: any) => p.typeID === typeID && p.isPreference === 0,
            )?.subTypeID;

          this.selectedHeight = get(26) || '';
          this.selectedBodyType = get(15) || '';
          this.selectedSkinTone = get(16) || '';
          this.selectedDisability = get(30) || '';

          this.syncFormFields();
        },
        error: (err) => console.log('Appearance load error:', err),
      });
  }
}