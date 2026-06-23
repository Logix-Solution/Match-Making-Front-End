import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface ReligionPreferenceInterface {
  userID:      number;  // 0
  spType:      string;  // 1
  religionJson: string; // 2

}

@Component({
  selector: 'app-preferences-religion',
  templateUrl: './preferences-religion.component.html',
  styleUrls: ['./preferences-religion.component.scss']
})
export class PreferencesReligionComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() religionList:           any[] = [];  // typeID=7
  @Input() sectList:               any[] = [];  // typeID=8
  @Input() religionImportanceList: any[] = [];  // typeID=9

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedReligion:           any = '';
  selectedSect:               any = '';
  selectedReligionImportance: any = '';

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: ReligionPreferenceInterface = {
    userID:       0,
    spType:       'insert',
    religionJson: '[]',
  
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0,      msg: '',  type: 'hidden', required: false }, // 0 userID
     { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]',   msg: '',  type: 'hidden', required: false }, // 2 religionJson
   
  ];

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr:              ToastrService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void { this.syncFormFields(); }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const religionArray: { typeID: number; subTypeID: number }[] = [];

    if (this.selectedReligion)           religionArray.push({ typeID: 7, subTypeID: Number(this.selectedReligion)           });
    if (this.selectedSect)               religionArray.push({ typeID: 8, subTypeID: Number(this.selectedSect)               });
    if (this.selectedReligionImportance) religionArray.push({ typeID: 9, subTypeID: Number(this.selectedReligionImportance) });

    this.formFields[2].value = JSON.stringify(religionArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {

    // ─── Manual validations ───────────────────────────────────────────────
    if (!this.selectedReligion) {
      this.toastr.warning('Please select preferred religion'); return;
    }
    if (!this.selectedSect) {
      this.toastr.warning('Please select preferred sect'); return;
    }
    if (!this.selectedReligionImportance) {
      this.toastr.warning('Please select how important religion is to partner'); return;
    }

    // ─── Get userLoginId ──────────────────────────────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.'); return;
    }

    // ─── Sync all fields ──────────────────────────────────────────────────
    this.syncFormFields();
    this.formFields[0].value = userID;

    // ─── Sync formFields → pageFields ────────────────────────────────────
    this.pageFields.userID       = this.formFields[0].value;
    this.pageFields.spType       = this.formFields[1].value;
    this.pageFields.religionJson = this.formFields[2].value;
  
    console.log('Religion Preference PageFields:', this.pageFields);
    console.log('Religion Preference FormFields:', this.formFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService.saveHttp(
      this.pageFields,
      this.formFields,
      'core-api/Preferences/saveUserReligionPreference'
    ).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Religion Preferences Saved Successfully');
          this.saveSuccess.emit();
        } else {
          this.valid.apiErrorResponse(apiResponse);
        }
      },
      error: (err: any) => console.log('Religion Preference Save Error:', err)
    });
  }

  loadUserDetails(): void {
  const userID = this.sharedGlobalService.getUserID();
  if (!userID) return;

  this.dataService.getHttp(`user-api/User/getUserDetails?UserID=${userID}`).subscribe({
    next: (response: any) => {
      const user = Array.isArray(response) ? response[0] : response;
      if (!user) return;

      this.formFields[1].value = 'insert';
      this.pageFields.spType   = 'insert';

      let prefItems: any[] = [];
      try { prefItems = JSON.parse(user.userPreference || '[]'); } catch { prefItems = []; }

      const get = (typeID: number) =>
        prefItems.find((p: any) => p.typeID === typeID && p.isPreference === 1)?.subTypeID;

      // String() to match [value]="item.subTypeID" in template
      this.selectedReligion           = get(7) ? String(get(7)) : '';
      this.selectedSect               = get(8) ? String(get(8)) : '';
      this.selectedReligionImportance = get(9) ? String(get(9)) : '';

      this.syncFormFields();
    },
    error: (err: any) => console.log('Religion Preference Load Error:', err)
  });
}
}