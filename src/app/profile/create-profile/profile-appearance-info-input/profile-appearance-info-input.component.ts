import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface AppearanceProfileInterface {
  userID:                number; // 0
  spType:                string; // 1
  disabilityDescription: string; // 2
  appearanceJson:        string; // 3 
}

@Component({
  selector: 'app-profile-appearance-info-input',
  templateUrl: './profile-appearance-info-input.component.html',
  styleUrls: ['./profile-appearance-info-input.component.scss']
})
export class ProfileAppearanceInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() heightList:     any[] = [];
  @Input() bodyTypeList:   any[] = [];
  @Input() skinToneList:   any[] = [];
  @Input() disabilityList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); // Advances parent to step 6

  // ─── Dropdown & Text Field Value Bindings ─────────────────────────────────
  selectedHeight:        any = '';
  selectedBodyType:      any = '';
  selectedSkinTone:      any = '';
  selectedDisability:    any = '';
  disabilityDescription: string = '';

  // ─── Page Fields (API Payload Template) ───────────────────────────────────
  appearancePageFields: AppearanceProfileInterface = {
    userID:                0,
    spType:                'insert',
    disabilityDescription: 'No',
    appearanceJson:        '[]',
  };

  // ─── Form Fields (Structural Data Validation Array) ──────────────────────
  appearanceFormFields: any[] = [
    { value: 0,        msg: '',                                  type: 'hidden',  required: false }, // 0 userID
    { value: 'insert', msg: '',                                  type: 'hidden',  required: false }, // 1 spType
    { value: 'No',     msg: 'Please describe your disabilities', type: 'textbox', required: false }, // 2 disabilityDescription
    { value: '[]',     msg: '',                                  type: 'hidden',  required: false }, // 3 appearanceJson
  ];

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr:              ToastrService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {}

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Helper checking if "Yes" is actively selected ────────────────────────
  isDisabilityYes(): boolean {
    const activeItem = this.disabilityList.find(item => item.subTypeID == this.selectedDisability);
    return activeItem?.subTypeTitle?.trim().toLowerCase() === 'yes';
  }

  // ─── Synchronize Variables with Payload Arrays ────────────────────────────
  syncFormFields(): void {
    // Determine context value for description property
    if (this.isDisabilityYes()) {
      this.appearanceFormFields[2].value = this.disabilityDescription ? this.disabilityDescription.trim() : '';
    } else {
      this.appearanceFormFields[2].value = 'No'; // Default when No disability
    }

    // Build absolute lookups array
    const appearanceIds = [
      this.selectedHeight,
      this.selectedBodyType,
      this.selectedSkinTone,
      this.selectedDisability
    ].filter(v => v !== '' && v !== null && v !== undefined);

    this.appearanceFormFields[3].value = '[' + appearanceIds.map((v: any) => Number(v)).join(',') + ']';
  }

  // ─── Save Implementation Method ───────────────────────────────────────────
  save(): void {
    // ─── Frontend Validations ───────────────────────────────────────────────
    if (!this.selectedHeight) {
      this.toastr.warning('Please select your height'); return;
    }
    if (!this.selectedBodyType) {
      this.toastr.warning('Please select your body type'); return;
    }
    if (!this.selectedSkinTone) {
      this.toastr.warning('Please select your skin tone'); return;
    }
    if (!this.selectedDisability) {
      this.toastr.warning('Please select your disability status'); return;
    }
    if (this.isDisabilityYes() && (!this.disabilityDescription || this.disabilityDescription.trim() === '')) {
      this.toastr.warning('Please describe your disabilities'); return;
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
    this.appearancePageFields.userID                = this.appearanceFormFields[0].value;
    this.appearancePageFields.spType                = this.appearanceFormFields[1].value;
    this.appearancePageFields.disabilityDescription = this.appearanceFormFields[2].value;
    this.appearancePageFields.appearanceJson        = this.appearanceFormFields[3].value;

    console.log('Appearance Submission payload:', this.appearancePageFields);

    // ─── POST request submission ────────────────────────────────────────────
    this.dataService.saveHttp(
      this.appearancePageFields,
      this.appearanceFormFields,
      'core-api/Profile/saveUserAppearance'
    ).subscribe({
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
      }
    });
  }
}