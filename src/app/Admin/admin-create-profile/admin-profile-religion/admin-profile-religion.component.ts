import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface ReligionProfileInterface {
  userID: number;
  spType: string;
  religionJson: string;
}

@Component({
  selector: 'app-admin-profile-religion',
  templateUrl: './admin-profile-religion.component.html',
  styleUrls: ['./admin-profile-religion.component.scss'],
})
export class AdminProfileReligionComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() religionList: any[] = [];
  @Input() sectList: any[] = [];
  @Input() religionImportanceList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Dropdown Selections ──────────────────────────────────────────────────
  selectedReligion: any = '';
  selectedSect: any = '';
  selectedReligionImportance: any = '';

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  religionPageFields: ReligionProfileInterface = {
    userID: 0,
    spType: 'insert',
    religionJson: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  religionFormFields: any[] = [
    { value: 0,        msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]',     msg: '', type: 'hidden', required: false }, // 2 religionJson
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
      .getHttp(`Admin/getUserDetailsByAdmin?email=${encodeURIComponent(email)}`)
      .subscribe({
        next: (response: any) => {
          const user = Array.isArray(response) ? response[0] : response;
          this.userID = user?.userID || 0;
        },
        error: (err) => console.log('Get userID by email error:', err),
      });
  }

  // ─── Alias — HTML templates call onFieldChange() ──────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const religionEntries = [
      { typeID: 7, subTypeID: this.selectedReligion },
      { typeID: 8, subTypeID: this.selectedSect },
      { typeID: 9, subTypeID: this.selectedReligionImportance },
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

    this.religionFormFields[2].value = JSON.stringify(religionEntries);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    if (!this.userID) {
      this.toastr.error('User not found. Please complete the Personal Info step first.');
      return;
    }

    this.syncFormFields();
    this.religionFormFields[0].value = this.userID;
    this.religionFormFields[1].value = 'insert';

    this.religionPageFields.userID       = this.religionFormFields[0].value;
    this.religionPageFields.spType       = this.religionFormFields[1].value;
    this.religionPageFields.religionJson = this.religionFormFields[2].value;

    this.dataService
      .saveHttp(
        this.religionPageFields,
        this.religionFormFields,
        'core-api/Profile/saveUserReligion',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Religious Profile Saved Successfully');
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Religion Save Error:', err);
        },
      });
  }
}