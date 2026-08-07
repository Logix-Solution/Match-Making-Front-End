import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface AppearancePreferenceInterface {
  userID: number;
  spType: string;
  appearancePrefrence: string;
}

@Component({
  selector: 'app-admin-prefernces-appeareance',
  templateUrl: './admin-prefernces-appeareance.component.html',
  styleUrls: ['./admin-prefernces-appeareance.component.scss'],
})
export class AdminPreferncesAppeareanceComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() appearanceHeightList: any[] = [];
  @Input() bodyTypeList: any[] = [];
  @Input() skinToneList: any[] = [];
  @Input() disabilityList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedMinHeight: any = '';
  selectedMaxHeight: any = '';
  selectedDisability: any = '';

  // ─── Pill Selections (ordered arrays of subTypeIDs; index 0 = priority 1) ──
  selectedBodyTypes: number[] = [];
  selectedSkinTones: number[] = [];

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: AppearancePreferenceInterface = {
    userID: 0,
    spType: 'INSERT',
    appearancePrefrence: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  formFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'INSERT', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]', msg: '', type: 'hidden', required: false }, // 2 appearancePrefrence
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

  // ─── Pill Toggle Handlers ──────────────────────────────────────────────────
  toggleBodyType(subTypeID: number): void {
    const idx = this.selectedBodyTypes.indexOf(subTypeID);
    if (idx > -1) {
      this.selectedBodyTypes.splice(idx, 1);
    } else {
      if (this.selectedBodyTypes.length >= 3) {
        this.toastr.warning(
          'You can select up to 3 body type preferences only',
        );
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
        this.toastr.warning(
          'You can select up to 3 skin tone preferences only',
        );
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

  getBodyTypePriority(subTypeID: number): number {
    return this.selectedBodyTypes.indexOf(subTypeID) + 1;
  }

  getSkinTonePriority(subTypeID: number): number {
    return this.selectedSkinTones.indexOf(subTypeID) + 1;
  }

  // ─── Lookup helpers for the priority dropdown labels ───────────────────────
  getBodyTypeTitle(subTypeID: number | undefined): string {
    if (!subTypeID) return '';
    return (
      this.bodyTypeList.find((b) => b.subTypeID === subTypeID)?.subTypeTitle ||
      ''
    );
  }

  getSkinToneTitle(subTypeID: number | undefined): string {
    if (!subTypeID) return '';
    return (
      this.skinToneList.find((s) => s.subTypeID === subTypeID)?.subTypeTitle ||
      ''
    );
  }

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const appearanceArray: {
      typeID: number;
      subTypeID: number;
      priority: number;
    }[] = [];

    // Height — typeID 26
    if (this.selectedMinHeight) {
      appearanceArray.push({
        typeID: 26,
        subTypeID: Number(this.selectedMinHeight),
        priority: 1,
      });
    }

    // Body Type — typeID 15, priority = selection order (1,2,3)
    this.selectedBodyTypes.forEach((subTypeID, i) => {
      appearanceArray.push({
        typeID: 15,
        subTypeID: Number(subTypeID),
        priority: i + 1,
      });
    });

    // Skin Tone — typeID 16, priority = selection order (1,2,3)
    this.selectedSkinTones.forEach((subTypeID, i) => {
      appearanceArray.push({
        typeID: 16,
        subTypeID: Number(subTypeID),
        priority: i + 1,
      });
    });

    // Disability — typeID 30
    if (this.selectedDisability) {
      appearanceArray.push({
        typeID: 30,
        subTypeID: Number(this.selectedDisability),
        priority: 1,
      });
    }

    this.formFields[2].value = JSON.stringify(appearanceArray);
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
    this.pageFields.appearancePrefrence = this.formFields[2].value;

    this.dataService
      .saveHttp(
        this.pageFields,
        this.formFields,
        'core-api/Preferences/saveUserAppearancePreference',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse(
              'Appearance Preferences Saved Successfully',
            );
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) =>
          console.log('Appearance Preference Save Error:', err),
      });
  }
}
