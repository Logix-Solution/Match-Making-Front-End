import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface FamilyPreferenceInterface {
  userID: number;
  spType: string;
  familyPrefrence: string;
}

@Component({
  selector: 'app-admin-prefernces-family',
  templateUrl: './admin-prefernces-family.component.html',
  styleUrls: ['./admin-prefernces-family.component.scss'],
})
export class AdminPreferncesFamilyComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() acceptKidsList: any[] = [];
  @Input() relocateList: any[] = [];
  @Input() marriageTimelineList: any[] = [];

  @Input() maritalStatusList: any[] = [];
  @Input() housingSituationList: any[] = [];
  @Input() familyInvolvementList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedAcceptKids: any = '';
  selectedRelocate: any = '';
  selectedTimeline: any = '';
  selectedHousingSituation: any = '';
  selectedFamilyInvolvement: any = '';

  // ─── Pill Selections (ordered array of subTypeIDs; index 0 = priority 1) ───
  selectedMaritalStatuses: number[] = [];

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: FamilyPreferenceInterface = {
    userID: 0,
    spType: 'INSERT',
    familyPrefrence: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  formFields: any[] = [
    { value: 0,        msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]',     msg: '', type: 'hidden', required: false }, // 2 familyPrefrence
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

  // ─── Pill Toggle Handler (Marital Status) ──────────────────────────────────
  toggleMaritalStatus(subTypeID: number): void {
    const idx = this.selectedMaritalStatuses.indexOf(subTypeID);
    if (idx > -1) {
      this.selectedMaritalStatuses.splice(idx, 1);
    } else {
      if (this.selectedMaritalStatuses.length >= 3) {
        this.toastr.warning('You can select up to 3 marital status preferences only');
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
      this.maritalStatusList.find((m) => m.subTypeID === subTypeID)?.subTypeTitle || ''
    );
  }

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const familyArray: { typeID: number; subTypeID: number; priority: number }[] = [];

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

    // Accept Partner with Kids — typeID 27
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
    if (!this.userID) {
      this.toastr.error('User not found. Please complete the Personal Info step first.');
      return;
    }

    this.syncFormFields();
    this.formFields[0].value = this.userID;

    this.pageFields.userID          = this.formFields[0].value;
    this.pageFields.spType          = this.formFields[1].value;
    this.pageFields.familyPrefrence = this.formFields[2].value;

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
}