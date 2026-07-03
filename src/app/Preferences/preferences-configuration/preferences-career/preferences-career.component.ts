import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface CareerPreferenceInterface {
  userID: number; // 0
  spType: string; // 1
  careerPrefrence: string; // 2
}

@Component({
  selector: 'app-preferences-career',
  templateUrl: './preferences-career.component.html',
  styleUrls: ['./preferences-career.component.scss'],
})
export class PreferencesCareerComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() educationList: any[] = []; // typeID=4  (single select)
  @Input() monthlyIncomeList: any[] = []; // typeID=6  (single select)
  @Input() occupationList: any[] = []; // typeID=5  (pills, up to 3 priorities)

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedMinEducation: any = '';
  selectedMinIncome: any = '';

  // ─── Pill Selections (ordered array of subTypeIDs; index 0 = priority 1) ───
  selectedOccupations: number[] = [];

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: CareerPreferenceInterface = {
    userID: 0,
    spType: 'INSERT',
    careerPrefrence: '[]',
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]', msg: '', type: 'hidden', required: false }, // 2 careerPrefrence
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

  // ─── Pill Toggle Handler (Occupation) ──────────────────────────────────────
  toggleOccupation(subTypeID: number): void {
    const idx = this.selectedOccupations.indexOf(subTypeID);
    if (idx > -1) {
      this.selectedOccupations.splice(idx, 1);
    } else {
      if (this.selectedOccupations.length >= 3) {
        this.toastr.warning(
          'You can select up to 3 occupation preferences only',
        );
        return;
      }
      this.selectedOccupations.push(subTypeID);
    }
    this.onFieldChange();
  }

  isOccupationSelected(subTypeID: number): boolean {
    return this.selectedOccupations.includes(subTypeID);
  }

  // Returns 1, 2, or 3 based on selection order — used to show "(N)" badge
  getOccupationPriority(subTypeID: number): number {
    return this.selectedOccupations.indexOf(subTypeID) + 1;
  }

  // ─── Lookup helper for the priority dropdown labels ────────────────────────
  getOccupationTitle(subTypeID: number | undefined): string {
    if (!subTypeID) return '';
    return (
      this.occupationList.find((o) => o.subTypeID === subTypeID)
        ?.subTypeTitle || ''
    );
  }

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const careerArray: {
      typeID: number;
      subTypeID: number;
      priority: number;
    }[] = [];

    // Min Education Level — typeID 4
    if (this.selectedMinEducation) {
      careerArray.push({
        typeID: 4,
        subTypeID: Number(this.selectedMinEducation),
        priority: 1,
      });
    }

    // Min Monthly Income — typeID 6
    if (this.selectedMinIncome) {
      careerArray.push({
        typeID: 6,
        subTypeID: Number(this.selectedMinIncome),
        priority: 1,
      });
    }

    // Preferred Occupations — typeID 5, priority = selection order (1,2,3)
    this.selectedOccupations.forEach((subTypeID, i) => {
      careerArray.push({
        typeID: 5,
        subTypeID: Number(subTypeID),
        priority: i + 1,
      });
    });

    this.formFields[2].value = JSON.stringify(careerArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    // ─── Manual validations ───────────────────────────────────────────────
    if (!this.selectedMinEducation) {
      this.toastr.warning('Please select preferred minimum education level');
      return;
    }
    if (!this.selectedMinIncome) {
      this.toastr.warning('Please select preferred minimum monthly income');
      return;
    }
    if (this.selectedOccupations.length === 0) {
      this.toastr.warning('Please select at least one occupation preference');
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

    // ─── Sync formFields → pageFields ─────────────────────────────────────
    this.pageFields.userID = this.formFields[0].value;
    this.pageFields.spType = this.formFields[1].value;
    this.pageFields.careerPrefrence = this.formFields[2].value;

    console.log('Career Preference PageFields:', this.pageFields);
    console.log('Career Preference FormFields:', this.formFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService
      .saveHttp(
        this.pageFields,
        this.formFields,
        'core-api/Preferences/saveUserCareerPreference',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Career Preferences Saved Successfully');
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => console.log('Career Preference Save Error:', err),
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

          // String() to match [value]="item.subTypeID" in template
          this.selectedMinEducation = get(4) ? String(get(4)) : '';
          this.selectedMinIncome = get(6) ? String(get(6)) : '';

          // Occupations — multi priority, sorted, stored as numbers (toggleOccupation uses indexOf)
          this.selectedOccupations = prefItems
            .filter((p: any) => p.typeID === 5 && p.isPreference === 1)
            .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
            .map((p: any) => Number(p.subTypeID));

          this.syncFormFields();
        },
        error: (err: any) => console.log('Career Preference Load Error:', err),
      });
  }
}
