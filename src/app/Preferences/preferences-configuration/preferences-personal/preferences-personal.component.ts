import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface PersonalPreferenceInterface {
  userID: number; // 0
  spType: string; // 1
  nationalityID: number; // 2  → 0 (not used directly, goes into JSON)
  personalPrefrence: string; // 3  → [{typeID,subTypeID}, ...]
  cityID: number; // 4
}

interface PersonalPreferenceTouchedState {
  country:     boolean;
  city:        boolean;
  minAge:      boolean;
  maxAge:      boolean;
  nationality: boolean;
  cast:        boolean;
  ethnicity:   boolean;
}

@Component({
  selector: 'app-preferences-personal',
  templateUrl: './preferences-personal.component.html',
  styleUrls: ['./preferences-personal.component.scss'],
})
export class PreferencesPersonalComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() countryList: any[] = [];
  @Input() cityList: any[] = [];
  @Input() minAgeList: any[] = [];
  @Input() maxAgeList: any[] = [];
  @Input() nationalityList: any[] = [];
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
  selectedNationality: any = ''; // → personalPrefrence JSON only
  selectedCast: any = ''; // → personalPrefrence JSON only
  selectedEthnicity: any = ''; // → personalPrefrence JSON only

  // ─── Validation: touched state per required field ──────────────────────────
  touched: PersonalPreferenceTouchedState = {
    country:     false,
    city:        false,
    minAge:      false,
    maxAge:      false,
    nationality: false,
    cast:        false,
    ethnicity:   false,
  };

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: PersonalPreferenceInterface = {
    userID: 0,
    spType: 'INSERT',
    nationalityID: 0,
    personalPrefrence: '[]',
    cityID: 0,
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType

    { value: 0, msg: '', type: 'hidden', required: false }, // 2 nationalityID (always 0)
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 personalPrefrence
    {
      value: 0,
      msg: 'Please select your preferred city',
      type: 'selectbox',
      required: true,
    }, // 4 cityID
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

  // ─── Alias — HTML calls onFieldChange() ──────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Country change → emit for city load ─────────────────────────────────
  onCountryChange(): void {
    this.selectedCity = '';
    this.markTouched('country');
    this.countrySelected.emit(this.selectedCountry);
    this.syncFormFields();
  }

  // ─── Touched Helpers ────────────────────────────────────────────────────
  markTouched(field: keyof PersonalPreferenceTouchedState): void {
    this.touched[field] = true;
  }

  private markAllTouched(): void {
    (
      Object.keys(this.touched) as (keyof PersonalPreferenceTouchedState)[]
    ).forEach((key) => (this.touched[key] = true));
  }

  // ─── Inline Error Getters (template-only, no toastr) ──────────────────────
  get countryError(): string {
    if (!this.touched.country) return '';
    return this.selectedCountry ? '' : 'Preferred country is required';
  }

  get cityError(): string {
    if (!this.touched.city) return '';
    return this.selectedCity ? '' : 'Preferred city is required';
  }

  get minAgeError(): string {
    if (!this.touched.minAge) return '';
    return this.selectedMinAge ? '' : 'Preferred minimum age is required';
  }

  get maxAgeError(): string {
    if (!this.touched.maxAge) return '';
    if (!this.selectedMaxAge) return 'Preferred maximum age is required';
    if (
      this.selectedMinAge &&
      Number(this.selectedMinAge) >= Number(this.selectedMaxAge)
    ) {
      return 'Max age must be greater than min age';
    }
    return '';
  }

  get nationalityError(): string {
    if (!this.touched.nationality) return '';
    return this.selectedNationality ? '' : 'Preferred nationality is required';
  }

  get castError(): string {
    if (!this.touched.cast) return '';
    return this.selectedCast ? '' : 'Preferred caste is required';
  }

  get ethnicityError(): string {
    if (!this.touched.ethnicity) return '';
    return this.selectedEthnicity ? '' : 'Preferred ethnicity is required';
  }

  private isFormValid(): boolean {
    return (
      !this.countryError &&
      !this.cityError &&
      !this.minAgeError &&
      !this.maxAgeError &&
      !this.nationalityError &&
      !this.castError &&
      !this.ethnicityError
    );
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    this.formFields[4].value = this.selectedCity || 0; // cityID

    // personalPrefrence: build JSON from all selections
    // typeID=31 → minAge, typeID=32 → maxAge
    // typeID=2  → nationality, typeID=1 → cast, typeID=3 → ethnicity
    const prefArray: { typeID: number; subTypeID: number }[] = [];

    if (this.selectedMinAge)
      prefArray.push({ typeID: 31, subTypeID: Number(this.selectedMinAge) });
    if (this.selectedMaxAge)
      prefArray.push({ typeID: 32, subTypeID: Number(this.selectedMaxAge) });
    if (this.selectedNationality)
      prefArray.push({
        typeID: 2,
        subTypeID: Number(this.selectedNationality),
      });
    if (this.selectedCast)
      prefArray.push({ typeID: 1, subTypeID: Number(this.selectedCast) });
    if (this.selectedEthnicity)
      prefArray.push({ typeID: 3, subTypeID: Number(this.selectedEthnicity) });

    this.formFields[3].value = JSON.stringify(prefArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    this.markAllTouched();

    if (!this.isFormValid()) {
      this.toastr.warning('Fill All Required Fields');
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

    this.pageFields.nationalityID = this.formFields[2].value; // always 0
    this.pageFields.personalPrefrence = this.formFields[3].value;
    this.pageFields.cityID = this.formFields[4].value;

    console.log('Personal Preference PageFields:', this.pageFields);
    console.log('Personal Preference FormFields:', this.formFields);

    // ─── API Call ─────────────────────────────────────────────────────────
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
            this.valid.apiInfoResponse(
              'Personal Preferences Saved Successfully',
            );
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

  loadUserDetails(): void {
    const userID = this.sharedGlobalService.getUserID();

    if (!userID) return;

    this.dataService
      .getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`)
      .subscribe({
        next: (response: any) => {
          const user = Array.isArray(response) ? response[0] : response;
          if (!user) return;

          this.formFields[1].value = 'INSERT';
          this.pageFields.spType = 'INSERT';

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

          this.selectedMinAge = get(31) ? String(get(31)) : '';
          this.selectedMaxAge = get(32) ? String(get(32)) : '';
          this.selectedNationality = get(2) ? String(get(2)) : '';
          this.selectedCast = get(1) ? String(get(1)) : '';
          this.selectedEthnicity = get(3) ? String(get(3)) : '';

          console.log('Loaded Preferences', {
            minAge: this.selectedMinAge,
            maxAge: this.selectedMaxAge,
            nationality: this.selectedNationality,
            cast: this.selectedCast,
            ethnicity: this.selectedEthnicity,
          });

          // city/country — now in userPreference with countryID key
          const locationItem = prefItems.find(
            (p: any) => p.cityID !== undefined && p.isPreference === 1,
          );
          if (locationItem) {
            this.selectedCountry = String(locationItem.countryID || '');

            if (this.selectedCountry) {
              // Emit to parent to load city list, then set city after short delay
              // (same pattern used in profile-personal-info-input.component.ts)
              this.countrySelected.emit(Number(this.selectedCountry));
              setTimeout(() => {
                this.selectedCity = String(locationItem.cityID || '');
                this.syncFormFields();
              }, 600); // Wait for parent to load city list
            }
          }
          this.syncFormFields();
        },
        error: (err: any) =>
          console.log('Personal Preference Load Error:', err),
      });
  }
}