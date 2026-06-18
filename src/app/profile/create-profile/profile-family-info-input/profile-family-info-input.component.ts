import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface FamilyProfileInterface {
  userID:            number;  // 0
  spType:            string;  // 1
  parentPhoneNumber: string;  // 2 -> Combined format string "+92 03359154651"
  familyJson:        string;  // 3 -> Strict numeric array "[1,2,3,4,5]"
}

@Component({
  selector: 'app-profile-family-info-input',
  templateUrl: './profile-family-info-input.component.html',
  styleUrls: ['./profile-family-info-input.component.scss']
})
export class ProfileFamilyInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() maritalStatusList:     any[] = [];
  @Input() housingSituationList:  any[] = [];
  @Input() fatherOccupationList:  any[] = [];
  @Input() motherOccupationList:  any[] = [];
  @Input() noOfSiblingsList:      any[] = [];
  @Input() familyInvolvementList: any[] = [];
  @Input() countryList:           any[] = []; 

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); 

  // ─── Dropdown & Contact Entry Fields ──────────────────────────────────────
  selectedMaritalStatus:     any = '';
  selectedHousingSituation:  any = '';
  selectedFatherOccupation:  any = '';
  selectedMotherOccupation:  any = '';
  selectedNoOfSiblings:      any = '';
  selectedFamilyInvolvement: any = '';
  selectedParentCountryCode: string = ''; // Holds prefix e.g., '+92'
  parentPhoneNumber:         string = ''; // Holds numeric tail e.g., '03359154651'

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  familyPageFields: FamilyProfileInterface = {
    userID:            0,
    spType:            'INSERT',
    parentPhoneNumber: '',
    familyJson:        '[]',
  };

  // ─── Form Fields (for dataService saveHttp structural validation) ──────────
  familyFormFields: any[] = [
    { value: 0,        msg: '',                                 type: 'hidden',  required: false }, // 0 userID
    { value: 'INSERT', msg: '',                                 type: 'hidden',  required: false }, // 1 spType
    { value: '',       msg: 'Please enter parent phone number', type: 'textbox', required: true  }, // 2 parentPhoneNumber
    { value: '[]',     msg: '',                                 type: 'hidden',  required: false }, // 3 familyJson
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

  // ─── Sync bindings to specific fields ─────────────────────────────────────
  syncFormFields(): void {
    // 1. Concatenate Country Code and Phone Number into parentPhoneNumber
    if (this.selectedParentCountryCode && this.parentPhoneNumber) {
      this.familyFormFields[2].value = `${this.selectedParentCountryCode} ${this.parentPhoneNumber.trim()}`;
    } else {
      this.familyFormFields[2].value = '';
    }

    // 2. Collate clean database dropdown IDs strictly into familyJson array
    const familyIds = [
      this.selectedMaritalStatus,
      this.selectedHousingSituation,
      this.selectedFatherOccupation,
      this.selectedMotherOccupation,
      this.selectedNoOfSiblings,
      this.selectedFamilyInvolvement
    ].filter(v => v !== '' && v !== null && v !== undefined);

    this.familyFormFields[3].value = '[' + familyIds.map((v: any) => Number(v)).join(',') + ']';
  }

  // ─── Save Action ──────────────────────────────────────────────────────────
  save(): void {
    // ─── Form Interface Field Validations ───────────────────────────────────
    if (!this.selectedMaritalStatus) {
      this.toastr.warning('Please select your marital status'); return;
    }
    if (!this.selectedHousingSituation) {
      this.toastr.warning('Please select your housing situation'); return;
    }
    if (!this.selectedFatherOccupation) {
      this.toastr.warning("Please select your father's occupation"); return;
    }
    if (!this.selectedMotherOccupation) {
      this.toastr.warning("Please select your mother's occupation"); return;
    }
    if (!this.selectedParentCountryCode) {
      this.toastr.warning("Please choose parent country prefix code"); return;
    }
    if (!this.parentPhoneNumber || this.parentPhoneNumber.trim() === '') {
      this.toastr.warning("Please enter parent phone number"); return;
    }
    if (!this.selectedNoOfSiblings) {
      this.toastr.warning('Please select your number of siblings'); return;
    }
    if (!this.selectedFamilyInvolvement) {
      this.toastr.warning('Please select family involvement presence level'); return;
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

    this.familyPageFields.userID            = this.familyFormFields[0].value;
    this.familyPageFields.spType            = this.familyFormFields[1].value;
    this.familyPageFields.parentPhoneNumber = this.familyFormFields[2].value;
    this.familyPageFields.familyJson        = this.familyFormFields[3].value;

    console.log('Family Final PageFields Structure:', this.familyPageFields);

    // ─── API Submission Pipeline ────────────────────────────────────────────
    this.dataService.saveHttp(
      this.familyPageFields,
      this.familyFormFields,
      'core-api/Profile/saveUserFamily'
    ).subscribe({
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
      }
    });
  }
}