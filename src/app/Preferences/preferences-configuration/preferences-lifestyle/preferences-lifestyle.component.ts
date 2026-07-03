import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface LifestylePreferenceInterface {
  userID: number; // 0
  spType: string; // 1
  lifeStylePrefrence: string; // 2  → [{typeID:17,subTypeID},{typeID:18,subTypeID},{typeID:19,subTypeID}]
}

@Component({
  selector: 'app-preferences-lifestyle',
  templateUrl: './preferences-lifestyle.component.html',
  styleUrls: ['./preferences-lifestyle.component.scss'],
})
export class PreferencesLifestyleComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() smokeList: any[] = []; // typeID=17
  @Input() alcoholList: any[] = []; // typeID=18
  @Input() wantKidsList: any[] = []; // typeID=19

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedSmoke: any = '';
  selectedAlcohol: any = '';
  selectedWantKids: any = '';

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: LifestylePreferenceInterface = {
    userID: 0,
    spType: 'insert',
    lifeStylePrefrence: '[]',
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]', msg: '', type: 'hidden', required: false }, // 2 lifeStylePrefrence
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

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const lifestyleArray: { typeID: number; subTypeID: number }[] = [];

    if (this.selectedSmoke)
      lifestyleArray.push({
        typeID: 17,
        subTypeID: Number(this.selectedSmoke),
      });
    if (this.selectedAlcohol)
      lifestyleArray.push({
        typeID: 18,
        subTypeID: Number(this.selectedAlcohol),
      });
    if (this.selectedWantKids)
      lifestyleArray.push({
        typeID: 19,
        subTypeID: Number(this.selectedWantKids),
      });

    this.formFields[2].value = JSON.stringify(lifestyleArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    // ─── Manual validations ───────────────────────────────────────────────
    if (!this.selectedSmoke) {
      this.toastr.warning('Please select smoking preference');
      return;
    }
    if (!this.selectedAlcohol) {
      this.toastr.warning('Please select alcohol preference');
      return;
    }
    if (!this.selectedWantKids) {
      this.toastr.warning('Please select partner want kids preference');
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
    this.formFields[0].value = userID;

    // ─── Sync formFields → pageFields ────────────────────────────────────
    this.pageFields.userID = this.formFields[0].value;
    this.pageFields.spType = this.formFields[1].value;
    this.pageFields.lifeStylePrefrence = this.formFields[2].value;

    console.log('Lifestyle Preference PageFields:', this.pageFields);
    console.log('Lifestyle Preference FormFields:', this.formFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService
      .saveHttp(
        this.pageFields,
        this.formFields,
        'core-api/Preferences/saveUserLifeStylePreference',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse(
              'Lifestyle Preferences Saved Successfully',
            );
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) =>
          console.log('Lifestyle Preference Save Error:', err),
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

          this.formFields[1].value = 'insert';
          this.pageFields.spType = 'insert';

          let prefItems: any[] = [];
          try {
            prefItems = JSON.parse(user.userPreference || '[]');
          } catch {
            prefItems = [];
          }

          const get = (typeID: number) =>
            prefItems.find(
              (p: any) => p.typeID === typeID && p.isPreference === 1,
            )?.subTypeID;

          // String() to match [value]="item.subTypeID" in template
          this.selectedSmoke = get(17) ? String(get(17)) : '';
          this.selectedAlcohol = get(18) ? String(get(18)) : '';
          this.selectedWantKids = get(19) ? String(get(19)) : '';

          this.syncFormFields();
        },
        error: (err: any) =>
          console.log('Lifestyle Preference Load Error:', err),
      });
  }
}
