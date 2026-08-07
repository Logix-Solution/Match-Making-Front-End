import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface FamilyProfileInterface {
  userID: number;
  spType: string;
  parentPhoneNumber: string;
  familyJson: string;
  parentCountryCode: any;
}

@Component({
  selector: 'app-admin-profile-family',
  templateUrl: './admin-profile-family.component.html',
  styleUrls: ['./admin-profile-family.component.scss'],
})
export class AdminProfileFamilyComponent implements OnInit {
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
  selectedParentCountryCode: any = '';
  parentPhoneNumber: string = '';

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  familyPageFields: FamilyProfileInterface = {
    userID: 0,
    spType: 'INSERT',
    parentPhoneNumber: '',
    familyJson: '[]',
    parentCountryCode: '',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  familyFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '', msg: '', type: 'textbox', required: false }, // 2 parentPhoneNumber
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 familyJson
    { value: '', msg: '', type: 'hidden', required: false }, // 4 parentCountryCode
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

  // ─── Sync bindings to specific fields ─────────────────────────────────────
  syncFormFields(): void {
    this.familyFormFields[2].value = this.parentPhoneNumber
      ? this.parentPhoneNumber.trim()
      : '';

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
    this.familyFormFields[4].value = this.selectedParentCountryCode;
  }

  // ─── Save Action ──────────────────────────────────────────────────────────
  save(): void {
    if (!this.userID) {
      this.toastr.error(
        'User not found. Please complete the Personal Info step first.',
      );
      return;
    }

    this.syncFormFields();
    this.familyFormFields[0].value = this.userID;
    this.familyFormFields[1].value = 'INSERT';

    this.familyPageFields.userID = this.familyFormFields[0].value;
    this.familyPageFields.spType = this.familyFormFields[1].value;
    this.familyPageFields.parentPhoneNumber = this.familyFormFields[2].value;
    this.familyPageFields.familyJson = this.familyFormFields[3].value;
    this.familyPageFields.parentCountryCode = this.familyFormFields[4].value;

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
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Family Save Error:', err);
        },
      });
  }
}
