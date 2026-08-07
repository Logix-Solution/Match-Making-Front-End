import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface ReligionPreferenceInterface {
  userID: number;
  spType: string;
  religionJson: string;
}

@Component({
  selector: 'app-admin-prefernces-religion',
  templateUrl: './admin-prefernces-religion.component.html',
  styleUrls: ['./admin-prefernces-religion.component.scss'],
})
export class AdminPreferncesReligionComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() religionList: any[] = [];
  @Input() sectList: any[] = [];
  @Input() religionImportanceList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedReligion: any = '';
  selectedSect: any = '';
  selectedReligionImportance: any = '';

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: ReligionPreferenceInterface = {
    userID: 0,
    spType: 'insert',
    religionJson: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]', msg: '', type: 'hidden', required: false }, // 2 religionJson
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

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const religionArray: { typeID: number; subTypeID: number }[] = [];

    if (this.selectedReligion)
      religionArray.push({
        typeID: 7,
        subTypeID: Number(this.selectedReligion),
      });
    if (this.selectedSect)
      religionArray.push({ typeID: 8, subTypeID: Number(this.selectedSect) });
    if (this.selectedReligionImportance)
      religionArray.push({
        typeID: 9,
        subTypeID: Number(this.selectedReligionImportance),
      });

    this.formFields[2].value = JSON.stringify(religionArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    if (!this.userID) {
      this.toastr.error(
        'User not found. Please complete the Personal Info step first.',
      );
      return;
    }

    this.syncFormFields();
    this.formFields[0].value = this.userID;

    this.pageFields.userID = this.formFields[0].value;
    this.pageFields.spType = this.formFields[1].value;
    this.pageFields.religionJson = this.formFields[2].value;

    this.dataService
      .saveHttp(
        this.pageFields,
        this.formFields,
        'core-api/Preferences/saveUserReligionPreference',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse(
              'Religion Preferences Saved Successfully',
            );
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) =>
          console.log('Religion Preference Save Error:', err),
      });
  }
}
