import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface FamilyProfileInterface {
  userID: number; // 0
  spType: string; // 1
  parentPhoneNumber: string; // 2 -> Just the numeric phone number
  familyJson: string; // 3 -> Strict numeric array "[1,2,3,4,5]" only, no country code
  parentCountryCode: any; // 4 -> Separate top-level field
}

interface FamilyTouchedState {
  maritalStatus:      boolean;
  housingSituation:   boolean;
  fatherOccupation:   boolean;
  motherOccupation:   boolean;
  parentCountryCode:  boolean;
  parentPhoneNumber:  boolean;
  noOfSiblings:        boolean;
  familyInvolvement:  boolean;
}

@Component({
  selector: 'app-profile-family-info-input',
  templateUrl: './profile-family-info-input.component.html',
  styleUrls: ['./profile-family-info-input.component.scss'],
})
export class ProfileFamilyInfoInputComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() maritalStatusList: any[] = [];
  @Input() housingSituationList: any[] = [];
  @Input() fatherOccupationList: any[] = [];
  @Input() motherOccupationList: any[] = [];
  @Input() noOfSiblingsList: any[] = [];
  @Input() familyInvolvementList: any[] = [];
  @Input() countryList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Dropdown & Contact Entry Fields ──────────────────────────────────────
  selectedMaritalStatus: any = '';
  selectedHousingSituation: any = '';
  selectedFatherOccupation: any = '';
  selectedMotherOccupation: any = '';
  selectedNoOfSiblings: any = '';
  selectedFamilyInvolvement: any = '';
  selectedParentCountryCode: any = ''; // Holds country code, e.g. '+92' or 103
  parentPhoneNumber: string = ''; // Holds numeric tail e.g., '03359154651'

  // ─── Validation: touched state per field ───────────────────────────────────
  touched: FamilyTouchedState = {
    maritalStatus:     false,
    housingSituation:  false,
    fatherOccupation:  false,
    motherOccupation:  false,
    parentCountryCode: false,
    parentPhoneNumber: false,
    noOfSiblings:      false,
    familyInvolvement: false,
  };

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  familyPageFields: FamilyProfileInterface = {
    userID: 0,
    spType: 'INSERT',
    parentPhoneNumber: '',
    familyJson: '[]',
    parentCountryCode: '',
  };

  // ─── Form Fields (for dataService saveHttp structural validation) ──────────
  familyFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    {
      value: '',
      msg: 'Please enter parent phone number',
      type: 'textbox',
      required: true,
    }, // 2 parentPhoneNumber
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 familyJson
    {
      value: '',
      msg: 'Please choose parent country prefix code',
      type: 'hidden',
      required: true,
    }, // 4 parentCountryCode
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

  // ─── Touched Helpers ────────────────────────────────────────────────────
  markTouched(field: keyof FamilyTouchedState): void {
    this.touched[field] = true;
  }

  private markAllTouched(): void {
    (Object.keys(this.touched) as (keyof FamilyTouchedState)[]).forEach(
      (key) => (this.touched[key] = true),
    );
  }

  // ─── Inline Error Getters (template-only, no toastr) ──────────────────────
  get maritalStatusError(): string {
    if (!this.touched.maritalStatus) return '';
    return this.selectedMaritalStatus ? '' : 'Marital status is required';
  }

  get housingSituationError(): string {
    if (!this.touched.housingSituation) return '';
    return this.selectedHousingSituation ? '' : 'Housing situation is required';
  }

  get fatherOccupationError(): string {
    if (!this.touched.fatherOccupation) return '';
    return this.selectedFatherOccupation
      ? ''
      : "Father's occupation is required";
  }

  get motherOccupationError(): string {
    if (!this.touched.motherOccupation) return '';
    return this.selectedMotherOccupation
      ? ''
      : "Mother's occupation is required";
  }

  get parentCountryCodeError(): string {
    if (!this.touched.parentCountryCode) return '';
    return this.selectedParentCountryCode ? '' : 'Country code is required';
  }

  get parentPhoneNumberError(): string {
    if (!this.touched.parentPhoneNumber) return '';
    return this.parentPhoneNumber?.trim() ? '' : 'Phone number is required';
  }

  get noOfSiblingsError(): string {
    if (!this.touched.noOfSiblings) return '';
    return this.selectedNoOfSiblings ? '' : 'Number of siblings is required';
  }

  get familyInvolvementError(): string {
    if (!this.touched.familyInvolvement) return '';
    return this.selectedFamilyInvolvement
      ? ''
      : 'Family involvement level is required';
  }

  private isFormValid(): boolean {
    return (
      !this.maritalStatusError &&
      !this.housingSituationError &&
      !this.fatherOccupationError &&
      !this.motherOccupationError &&
      !this.parentCountryCodeError &&
      !this.parentPhoneNumberError &&
      !this.noOfSiblingsError &&
      !this.familyInvolvementError
    );
  }

  // ─── Sync bindings to specific fields ─────────────────────────────────────
  syncFormFields(): void {
    // 1. Phone number field holds ONLY the number
    this.familyFormFields[2].value = this.parentPhoneNumber
      ? this.parentPhoneNumber.trim()
      : '';

    // 2. Collate clean database dropdown IDs strictly into familyJson array
    const familyEntries: any[] = [
      { typeID: 10, subTypeID: this.selectedMaritalStatus },
      { typeID: 11, subTypeID: this.selectedHousingSituation },
      { typeID: 12, subTypeID: this.selectedFatherOccupation },
      { typeID: 13, subTypeID: this.selectedMotherOccupation },
      { typeID: 25, subTypeID: this.selectedNoOfSiblings },
      { typeID: 14, subTypeID: this.selectedFamilyInvolvement },
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

    this.familyFormFields[3].value = JSON.stringify(familyEntries);

    // 3. Parent country code — its own separate top-level field
    this.familyFormFields[4].value = this.selectedParentCountryCode;
  }

  // ─── Save Action ──────────────────────────────────────────────────────────
  save(): void {
    this.markAllTouched();

    if (!this.isFormValid()) {
      this.toastr.warning('Fill All Required Fields');
      return;
    }

    // ─── Retrieve User Session Information ──────────────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    // ─── Complete payload serialization mapping ─────────────────────────────
    this.syncFormFields();
    this.familyFormFields[0].value = userID;
    this.familyFormFields[1].value = 'INSERT';

    this.familyPageFields.userID = this.familyFormFields[0].value;
    this.familyPageFields.spType = this.familyFormFields[1].value;
    this.familyPageFields.parentPhoneNumber = this.familyFormFields[2].value;
    this.familyPageFields.familyJson = this.familyFormFields[3].value;
    this.familyPageFields.parentCountryCode = this.familyFormFields[4].value;

    console.log('Family Final PageFields Structure:', this.familyPageFields);

    // ─── API Submission Pipeline ────────────────────────────────────────────
    this.dataService
      .saveHttp(
        this.familyPageFields,
        this.familyFormFields,
        'core-api/Profile/saveUserFamily',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Family Record Saved Successfully');
            this.saveSuccess.emit(); // Fire step transition hook to step 5
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Family Save Error:', err);
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

          this.familyFormFields[0].value = userID;
          this.familyFormFields[1].value = 'Insert';

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

          // Get parentCountryCode and parentPhoneNO directly — separate fields, no splitting
          // NOTE: getUserDetails returns the phone number as "parentPhoneNO" (not "parentPhoneNumber")
          this.selectedParentCountryCode = user.parentCountryCode || '';
          this.parentPhoneNumber = user.parentPhoneNO || '';

          this.selectedMaritalStatus = get(10) || '';
          this.selectedHousingSituation = get(11) || '';
          this.selectedFatherOccupation = get(12) || '';
          this.selectedMotherOccupation = get(13) || '';
          this.selectedNoOfSiblings = get(25) || '';
          this.selectedFamilyInvolvement = get(14) || '';

          this.syncFormFields();
        },
        error: (err) => console.log('Family load error:', err),
      });
  }
}