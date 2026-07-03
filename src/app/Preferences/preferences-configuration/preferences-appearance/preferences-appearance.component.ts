import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface AppearancePreferenceInterface {
  userID:               number;  // 0
  spType:               string;  // 1
  appearancePrefrence:  string;  // 2 

}

@Component({
  selector: 'app-preferences-appearance',
  templateUrl: './preferences-appearance.component.html',
  styleUrls: ['./preferences-appearance.component.scss']
})
export class PreferencesAppearanceComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() appearanceHeightList: any[] = [];  // typeID=26 (min/max height dropdowns)
  @Input() bodyTypeList:         any[] = [];  // typeID=15 (pills, up to 3 priorities)
  @Input() skinToneList:         any[] = [];  // typeID=16 (pills, up to 3 priorities)
  @Input() disabilityList:       any[] = [];  // typeID=30 (single select)

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedMinHeight:   any = '';
  selectedMaxHeight:   any = '';
  selectedDisability:  any = '';

  // ─── Pill Selections (ordered arrays of subTypeIDs; index 0 = priority 1) ──
  selectedBodyTypes: number[] = [];
  selectedSkinTones: number[] = [];

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: AppearancePreferenceInterface = {
    userID:              0,
    spType:              'INSERT',
    appearancePrefrence: '[]',
  
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0,        msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]',     msg: '', type: 'hidden', required: false }, // 2 appearancePrefrence
   
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

  // ─── Pill Toggle Handlers ──────────────────────────────────────────────────
  toggleBodyType(subTypeID: number): void {
    const idx = this.selectedBodyTypes.indexOf(subTypeID);
    if (idx > -1) {
      // already selected → deselect it
      this.selectedBodyTypes.splice(idx, 1);
    } else {
      // not selected → add it, max 3
      if (this.selectedBodyTypes.length >= 3) {
        this.toastr.warning('You can select up to 3 body type preferences only');
        return;
      }
      this.selectedBodyTypes.push(subTypeID);
    }
    this.onFieldChange();
  }

  toggleSkinTone(subTypeID: number): void {
    const idx = this.selectedSkinTones.indexOf(subTypeID);
    if (idx > -1) {
      this.selectedSkinTones.splice(idx, 1);
    } else {
      if (this.selectedSkinTones.length >= 3) {
        this.toastr.warning('You can select up to 3 skin tone preferences only');
        return;
      }
      this.selectedSkinTones.push(subTypeID);
    }
    this.onFieldChange();
  }

  isBodyTypeSelected(subTypeID: number): boolean {
    return this.selectedBodyTypes.includes(subTypeID);
  }

  isSkinToneSelected(subTypeID: number): boolean {
    return this.selectedSkinTones.includes(subTypeID);
  }

  // Returns 1, 2, or 3 based on selection order — used to show "Priority N" badge
  getBodyTypePriority(subTypeID: number): number {
    return this.selectedBodyTypes.indexOf(subTypeID) + 1;
  }

  getSkinTonePriority(subTypeID: number): number {
    return this.selectedSkinTones.indexOf(subTypeID) + 1;
  }

  // ─── Lookup helpers for the priority dropdown labels ───────────────────────
  getBodyTypeTitle(subTypeID: number | undefined): string {
    if (!subTypeID) return '';
    return this.bodyTypeList.find(b => b.subTypeID === subTypeID)?.subTypeTitle || '';
  }

  getSkinToneTitle(subTypeID: number | undefined): string {
    if (!subTypeID) return '';
    return this.skinToneList.find(s => s.subTypeID === subTypeID)?.subTypeTitle || '';
  }

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void { this.syncFormFields(); }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const appearanceArray: { typeID: number; subTypeID: number; priority: number }[] = [];

    // Height — typeID 26 (single min, treated as priority 1; adjust if you need both min & max sent)
    if (this.selectedMinHeight) {
      appearanceArray.push({ typeID: 26, subTypeID: Number(this.selectedMinHeight), priority: 1 });
    }

    // Body Type — typeID 15, priority = selection order (1,2,3)
    this.selectedBodyTypes.forEach((subTypeID, i) => {
      appearanceArray.push({ typeID: 15, subTypeID: Number(subTypeID), priority: i + 1 });
    });

    // Skin Tone — typeID 16, priority = selection order (1,2,3)
    this.selectedSkinTones.forEach((subTypeID, i) => {
      appearanceArray.push({ typeID: 16, subTypeID: Number(subTypeID), priority: i + 1 });
    });

    // Disability — typeID 30
    if (this.selectedDisability) {
      appearanceArray.push({ typeID: 30, subTypeID: Number(this.selectedDisability), priority: 1 });
    }

    this.formFields[2].value = JSON.stringify(appearanceArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {

    // ─── Manual validations ───────────────────────────────────────────────
    if (!this.selectedMinHeight) {
      this.toastr.warning('Please select preferred min height'); return;
    }
    if (this.selectedBodyTypes.length === 0) {
      this.toastr.warning('Please select at least one body type preference'); return;
    }
    if (this.selectedSkinTones.length === 0) {
      this.toastr.warning('Please select at least one skin tone preference'); return;
    }
    if (!this.selectedDisability) {
      this.toastr.warning('Please select disability preference'); return;
    }

    // ─── Get userLoginId ──────────────────────────────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.'); return;
    }

    // ─── Sync all fields ──────────────────────────────────────────────────
    this.syncFormFields();
    this.formFields[0].value = userID;

    // ─── Sync formFields → pageFields ─────────────────────────A───────────
    this.pageFields.userID              = this.formFields[0].value;
    this.pageFields.spType              = this.formFields[1].value;
    this.pageFields.appearancePrefrence = this.formFields[2].value;
    

    console.log('Appearance Preference PageFields:', this.pageFields);
    console.log('Appearance Preference FormFields:', this.formFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService.saveHttp(
      this.pageFields,
      this.formFields,
      'core-api/Preferences/saveUserAppearancePreference'
    ).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Appearance Preferences Saved Successfully');
          this.saveSuccess.emit();
        } else {
          this.valid.apiErrorResponse(apiResponse);
        }
      },
      error: (err: any) => console.log('Appearance Preference Save Error:', err)
    });
  }


loadUserDetails(): void {
  const userID = this.sharedGlobalService.getUserID();
  if (!userID) return;

  this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`).subscribe({
    next: (response: any) => {
      const user = Array.isArray(response) ? response[0] : response;
      if (!user) return;

      this.formFields[1].value = 'INSERT';
      this.pageFields.spType   = 'INSERT';

      let prefItems: any[] = [];
      try { prefItems = JSON.parse(user.userPreference || '[]'); } catch { prefItems = []; }

      const get = (typeID: number) =>
        prefItems.find((p: any) => p.typeID === typeID && p.isPreference === 1)?.subTypeID;

      // Single selects — String() to match [value]="item.subTypeID" in template
      this.selectedMinHeight  = get(26) ? String(get(26)) : '';
      this.selectedDisability = get(30) ? String(get(30)) : '';

      // Body Type — multi priority typeID=15, stays Number[] for toggleBodyType()
      this.selectedBodyTypes = prefItems
        .filter((p: any) => p.typeID === 15 && p.isPreference === 1)
        .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
        .map((p: any) => Number(p.subTypeID));

      // Skin Tone — multi priority typeID=16, stays Number[] for toggleSkinTone()
      this.selectedSkinTones = prefItems
        .filter((p: any) => p.typeID === 16 && p.isPreference === 1)
        .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
        .map((p: any) => Number(p.subTypeID));

      this.syncFormFields();
    },
    error: (err: any) => console.log('Appearance Preference Load Error:', err)
  });
}
}