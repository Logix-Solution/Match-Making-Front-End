import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface FamilyPreferenceInterface {
  userID: number; // 0
  spType: string; // 1
  familyPrefrence: string; // 2
}

@Component({
  selector: 'app-preferences-family',
  templateUrl: './preferences-family.component.html',
  styleUrls: ['./preferences-family.component.scss'],
})
export class PreferencesFamilyComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  // TODO: confirm typeIDs for these 3, then load them in the parent's
  // getSubTypes()/assignSubType() the same way castList/nationalityList are loaded.
  @Input() acceptKidsList: any[] = []; // typeID=27 (single select)
  @Input() relocateList: any[] = []; // typeID=20 (single select)
  @Input() marriageTimelineList: any[] = []; // typeID=21 (single select)

  @Input() maritalStatusList: any[] = []; // typeID=10 (pills, up to 3 priorities)
  @Input() housingSituationList: any[] = []; // typeID=11 (single select)
  @Input() familyInvolvementList: any[] = []; // typeID=14 (single select)

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedAcceptKids: any = ''; // TODO typeID
  selectedRelocate: any = ''; // TODO typeID
  selectedTimeline: any = ''; // TODO typeID
  selectedHousingSituation: any = '';
  selectedFamilyInvolvement: any = '';

  // ─── Pill Selections (ordered array of subTypeIDs; index 0 = priority 1) ───
  selectedMaritalStatuses: number[] = [];

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: FamilyPreferenceInterface = {
    userID: 0,
    spType: 'INSERT',
    familyPrefrence: '[]',
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]', msg: '', type: 'hidden', required: false }, // 2 familyPrefrence
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

  // ─── Pill Toggle Handler (Marital Status) ──────────────────────────────────
  toggleMaritalStatus(subTypeID: number): void {
    const idx = this.selectedMaritalStatuses.indexOf(subTypeID);
    if (idx > -1) {
      this.selectedMaritalStatuses.splice(idx, 1);
    } else {
      if (this.selectedMaritalStatuses.length >= 3) {
        this.toastr.warning(
          'You can select up to 3 marital status preferences only',
        );
        return;
      }
      this.selectedMaritalStatuses.push(subTypeID);
    }
    this.onFieldChange();
  }

  isMaritalStatusSelected(subTypeID: number): boolean {
    return this.selectedMaritalStatuses.includes(subTypeID);
  }

  // Returns 1, 2, or 3 based on selection order — used to show "(N)" badge
  getMaritalStatusPriority(subTypeID: number): number {
    return this.selectedMaritalStatuses.indexOf(subTypeID) + 1;
  }

  // ─── Lookup helper for the priority dropdown labels ────────────────────────
  getMaritalStatusTitle(subTypeID: number | undefined): string {
    if (!subTypeID) return '';
    return (
      this.maritalStatusList.find((m) => m.subTypeID === subTypeID)
        ?.subTypeTitle || ''
    );
  }

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const familyArray: {
      typeID: number;
      subTypeID: number;
      priority: number;
    }[] = [];

    // Accept Partner with Kids — TODO: typeID
    // if (this.selectedAcceptKids) {
    //   familyArray.push({ typeID: <ACCEPT_KIDS_TYPE_ID>, subTypeID: Number(this.selectedAcceptKids), priority: 1 });
    // }

    // Willing to Relocate — TODO: typeID
    // if (this.selectedRelocate) {
    //   familyArray.push({ typeID: <RELOCATE_TYPE_ID>, subTypeID: Number(this.selectedRelocate), priority: 1 });
    // }

    // Timeline for a Marriage — TODO: typeID
    // if (this.selectedTimeline) {
    //   familyArray.push({ typeID: <TIMELINE_TYPE_ID>, subTypeID: Number(this.selectedTimeline), priority: 1 });
    // }

    // Marital Status — typeID 10, priority = selection order (1,2,3)
    this.selectedMaritalStatuses.forEach((subTypeID, i) => {
      familyArray.push({
        typeID: 10,
        subTypeID: Number(subTypeID),
        priority: i + 1,
      });
    });

    // Housing Status Preference — typeID 11
    if (this.selectedHousingSituation) {
      familyArray.push({
        typeID: 11,
        subTypeID: Number(this.selectedHousingSituation),
        priority: 1,
      });
    }

    // Family Involvement Preference — typeID 14
    if (this.selectedFamilyInvolvement) {
      familyArray.push({
        typeID: 14,
        subTypeID: Number(this.selectedFamilyInvolvement),
        priority: 1,
      });
    }

    if (this.selectedAcceptKids) {
      familyArray.push({
        typeID: 27,
        subTypeID: Number(this.selectedAcceptKids),
        priority: 1,
      });
    }

    // Willing to Relocate — typeID 20
    if (this.selectedRelocate) {
      familyArray.push({
        typeID: 20,
        subTypeID: Number(this.selectedRelocate),
        priority: 1,
      });
    }

    // Timeline for a Marriage — typeID 21
    if (this.selectedTimeline) {
      familyArray.push({
        typeID: 21,
        subTypeID: Number(this.selectedTimeline),
        priority: 1,
      });
    }

    this.formFields[2].value = JSON.stringify(familyArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    // ─── Manual validations ───────────────────────────────────────────────
    // TODO: uncomment once typeIDs for these 3 are wired and lists have data
    if (!this.selectedAcceptKids) {
      this.toastr.warning('Please select if you accept a partner with kids');
      return;
    }
    if (!this.selectedRelocate) {
      this.toastr.warning('Please select relocation preference');
      return;
    }
    if (!this.selectedTimeline) {
      this.toastr.warning('Please select timeline for marriage');
      return;
    }
    if (this.selectedMaritalStatuses.length === 0) {
      this.toastr.warning(
        'Please select at least one marital status preference',
      );
      return;
    }
    if (!this.selectedHousingSituation) {
      this.toastr.warning('Please select housing status preference');
      return;
    }
    if (!this.selectedFamilyInvolvement) {
      this.toastr.warning('Please select family involvement preference');
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
    this.pageFields.familyPrefrence = this.formFields[2].value;

    console.log('Family Preference PageFields:', this.pageFields);
    console.log('Family Preference FormFields:', this.formFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService
      .saveHttp(
        this.pageFields,
        this.formFields,
        'core-api/Preferences/saveUserFamilyPreference',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Family Preferences Saved Successfully');
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => console.log('Family Preference Save Error:', err),
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

          // Single select — String() to match [value]="item.subTypeID" in template
          this.selectedAcceptKids = get(27) ? String(get(27)) : '';
          this.selectedRelocate = get(20) ? String(get(20)) : '';
          this.selectedTimeline = get(21) ? String(get(21)) : '';
          this.selectedHousingSituation = get(11) ? String(get(11)) : '';
          this.selectedFamilyInvolvement = get(14) ? String(get(14)) : '';

          // Marital Status — multi priority typeID=10, stays as Number[] for toggleMaritalStatus()
          this.selectedMaritalStatuses = prefItems
            .filter((p: any) => p.typeID === 10 && p.isPreference === 1)
            .sort((a: any, b: any) => (a.priority || 0) - (b.priority || 0))
            .map((p: any) => Number(p.subTypeID));

          this.syncFormFields();
        },
        error: (err: any) => console.log('Family Preference Load Error:', err),
      });
  }
}
