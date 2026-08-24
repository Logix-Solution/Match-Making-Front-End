import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface PersonalPreferenceInterface {
  userID: number; // 0
  spType: string; // 1
  nationalityID: number; // 2  → 0, unused (kept for compatibility)
  personalPrefrence: string; // 3  → [{typeID,subTypeID}, ...]
  cityID: number; // 4
  nationality: number; // 5  → NEW, dedicated country_id field (same as ProfilePersonalInfoInputComponent)
}

@Component({
  selector: 'app-admin-prefernces-info',
  templateUrl: './admin-prefernces-info.component.html',
  styleUrls: ['./admin-prefernces-info.component.scss'],
})
export class AdminPreferncesInfoComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() countryList: any[] = [];
  @Input() cityList: any[] = [];
  @Input() minAgeList: any[] = [];
  @Input() maxAgeList: any[] = [];
  @Input() nationalityList: any[] = []; // no longer used for nationality dropdown, kept in case parent still passes it
  @Input() castList: any[] = [];
  @Input() ethnicityList: any[] = [];

  // ─── Outputs to Parent ────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); // advance stepper
  @Output() countrySelected = new EventEmitter<number>(); // load cities

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedCountry: any = '';
  selectedCity: any = '';
  selectedMinAge: any = ''; // subTypeID from typeID=31
  selectedMaxAge: any = ''; // subTypeID from typeID=32
  selectedNationality: any = ''; // ── country_id, matched against countryList (same as ProfilePersonalInfoInputComponent) ──
  selectedCast: any = ''; // → personalPrefrence JSON only
  selectedEthnicity: any = ''; // → personalPrefrence JSON only

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: PersonalPreferenceInterface = {
    userID: 0,
    spType: 'INSERT',
    nationalityID: 0,
    personalPrefrence: '[]',
    cityID: 0,
    nationality: 0,
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: 0, msg: '', type: 'hidden', required: false }, // 2 nationalityID (unused)
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 personalPrefrence
    { value: 0, msg: '', type: 'hidden', required: false }, // 4 cityID
    { value: 0, msg: '', type: 'hidden', required: false }, // 5 nationality (country_id) — NEW
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

  // Look up the userID via the email captured in the Personal Info step,
  // then prefill this step's fields from that user's existing preferences.
  private loadUserIDByEmail(): void {
    const email = this.sharedGlobalService.getAdminEmail();

    if (!email) {
      this.toastr.warning('User email not set. Please complete the profile first.');
      this.userID = 0;
      return;
    }

    this.dataService
      .getHttp(`core-api/Admin/getUserDetailsByAdmin?email=${encodeURIComponent(email)}`)
      .subscribe({
        next: (response: any) => {
          const user = Array.isArray(response) ? response[0] : response;
          this.userID = user?.userID || 0;

          if (!this.userID) {
            this.toastr.warning('Could not resolve user from email. Please re-enter email in Personal Info.');
            return;
          }

          this.applyUserPreferences(user);
        },
        error: (err) => {
          console.log('Get userID by email error:', err);
          this.toastr.error('Failed to fetch user by email.');
        },
      });
  }

  // ─── Populate selects from the resolved user's existing preferences ───────
  private applyUserPreferences(user: any): void {
    this.formFields[1].value = 'INSERT';
    this.pageFields.spType = 'INSERT';

    let prefItems: any[] = [];
    try {
      prefItems = JSON.parse(user.userPreference || '[]');
    } catch {
      prefItems = [];
    }

    const get = (typeID: number) =>
      prefItems.find((p: any) => p.typeID === typeID && p.isPreference === 1)?.subTypeID;

    this.selectedMinAge = get(31) ? String(get(31)) : '';
    this.selectedMaxAge = get(32) ? String(get(32)) : '';
    this.selectedCast = get(1) ? String(get(1)) : '';
    this.selectedEthnicity = get(3) ? String(get(3)) : '';
    // ── selectedNationality is NOT set from `get(2)` anymore ──
    // it's derived below from locationItem.nationality, matched
    // against countryList — same pattern as ProfilePersonalInfoInputComponent.

    // city/country/nationality — stored in userPreference with countryID key
    const locationItem = prefItems.find(
      (p: any) => p.cityID !== undefined && p.isPreference === 1,
    );

    // ── Nationality — matched against countryList's "nationality" field ──
    if (locationItem?.nationality) {
      const matchedNationality = this.countryList.find(
        (c: any) => c.nationality === locationItem.nationality
      );
      this.selectedNationality = matchedNationality ? matchedNationality.country_id : '';
    } else {
      this.selectedNationality = '';
    }

    if (locationItem) {
      this.selectedCountry = String(locationItem.countryID || '');

      if (this.selectedCountry) {
        this.countrySelected.emit(Number(this.selectedCountry));
        setTimeout(() => {
          this.selectedCity = String(locationItem.cityID || '');
          this.syncFormFields();
        }, 600); // Wait for parent to load city list
      }
    }

    this.syncFormFields();
  }

  // ─── Alias — HTML calls onFieldChange() ──────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Country change → emit for city load ─────────────────────────────────
  onCountryChange(): void {
    this.selectedCity = '';
    this.countrySelected.emit(this.selectedCountry);
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    this.formFields[4].value = this.selectedCity || 0; // cityID
    this.formFields[5].value = Number(this.selectedNationality) || 0; // nationality (country_id) — NEW

    // personalPrefrence: build JSON from remaining selections
    // typeID=31 → minAge, typeID=32 → maxAge
    // typeID=1  → cast, typeID=3 → ethnicity
    // NOTE: nationality (typeID=2) intentionally REMOVED from this array —
    // it's now sent as its own dedicated `nationality` field (country_id),
    // not as a subtype, same as ProfilePersonalInfoInputComponent.
    const prefArray: { typeID: number; subTypeID: number }[] = [];

    if (this.selectedMinAge)
      prefArray.push({ typeID: 31, subTypeID: Number(this.selectedMinAge) });
    if (this.selectedMaxAge)
      prefArray.push({ typeID: 32, subTypeID: Number(this.selectedMaxAge) });
    if (this.selectedCast)
      prefArray.push({ typeID: 1, subTypeID: Number(this.selectedCast) });
    if (this.selectedEthnicity)
      prefArray.push({ typeID: 3, subTypeID: Number(this.selectedEthnicity) });

    this.formFields[3].value = JSON.stringify(prefArray);
  }

  // ─── SAVE (no field validation — sends whatever is currently in the form) ──
  save(): void {
    if (!this.userID) {
      this.toastr.error('User not found. Please complete the Personal Info step first.');
      return;
    }

    this.syncFormFields();
    this.formFields[0].value = this.userID;

    this.pageFields.userID = this.formFields[0].value;
    this.pageFields.spType = this.formFields[1].value;
    this.pageFields.nationalityID = this.formFields[2].value; // unused, always 0
    this.pageFields.personalPrefrence = this.formFields[3].value;
    this.pageFields.cityID = this.formFields[4].value;
    this.pageFields.nationality = this.formFields[5].value; // NEW — country_id

    console.log('Personal Preference PageFields:', this.pageFields);
    console.log('Personal Preference FormFields:', this.formFields);

    this.dataService
      .saveHttp(
        this.pageFields,
        this.formFields,
        'core-api/Preferences/saveUserPsersonalPreference',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Personal Preferences Saved Successfully');
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.log('Personal Preference Save Error:', err);
        },
      });
  }
}