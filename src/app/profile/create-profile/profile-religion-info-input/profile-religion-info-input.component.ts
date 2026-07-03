import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface ReligionProfileInterface {
  userID: number; // 0
  spType: string; // 1
  religionJson: string; // 2 -> [religionID, sectID, religionImportanceID]
}

@Component({
  selector: 'app-profile-religion-info-input',
  templateUrl: './profile-religion-info-input.component.html',
  styleUrls: ['./profile-religion-info-input.component.scss'],
})
export class ProfileReligionInfoInputComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() religionList: any[] = [];
  @Input() sectList: any[] = [];
  @Input() religionImportanceList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); // Tell parent to go stepper = 4

  // ─── Dropdown Selections ──────────────────────────────────────────────────
  selectedReligion: any = '';
  selectedSect: any = '';
  selectedReligionImportance: any = '';

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  religionPageFields: ReligionProfileInterface = {
    userID: 0,
    spType: 'insert',
    religionJson: '[]',
  };

  // ─── Form Fields (for dataService validation) ─────────────────────────────
  religionFormFields: any[] = [
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
    this.loadUserDetails();
  }

  // ─── Alias — HTML templates call onFieldChange() ──────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    // Collect dropdown values and filter empty/null choices out
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
    // ─── Manual validations ─────────────────────────────────────────────────
    if (!this.selectedReligion) {
      this.toastr.warning('Please select your religion');
      return;
    }
    if (!this.selectedSect) {
      this.toastr.warning('Please select your sect');
      return;
    }
    if (!this.selectedReligionImportance) {
      this.toastr.warning('Please prioritize your religious importance');
      return;
    }

    // ─── Get userLoginId ──────────────────────────────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    // ─── Sync all fields ──────────────────────────────────────────────────
    this.syncFormFields();
    this.religionFormFields[0].value = userID;
    this.religionFormFields[1].value = 'insert';

    // ─── Sync formFields → pageFields ────────────────────────────────────
    this.religionPageFields.userID = this.religionFormFields[0].value;
    this.religionPageFields.spType = this.religionFormFields[1].value;
    this.religionPageFields.religionJson = this.religionFormFields[2].value;

    console.log('Religion PageFields:', this.religionPageFields);
    console.log('Religion FormFields:', this.religionFormFields);

    // ─── API Call ─────────────────────────────────────────────────────────
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
            this.saveSuccess.emit(); // Fire step transition hook
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Religion Save Error:', err);
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

          this.religionFormFields[0].value = userID;
          this.religionFormFields[1].value = 'update';

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

          this.selectedReligion = get(7) || '';
          this.selectedSect = get(8) || '';
          this.selectedReligionImportance = get(9) || '';

          this.syncFormFields();
        },
        error: (err) => console.log('Religion load error:', err),
      });
  }
}
