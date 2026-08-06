import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { Router } from '@angular/router';

interface LifestylePreferenceInterface {
  userID: number;
  spType: string;
  lifeStylePrefrence: string;
}

@Component({
  selector: 'app-admin-prefernces-life-syle',
  templateUrl: './admin-prefernces-life-syle.component.html',
  styleUrls: ['./admin-prefernces-life-syle.component.scss'],
})
export class AdminPreferncesLifeSyleComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() smokeList: any[] = [];
  @Input() alcoholList: any[] = [];
  @Input() wantKidsList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Bound Fields ─────────────────────────────────────────────────────────
  selectedSmoke: any = '';
  selectedAlcohol: any = '';
  selectedWantKids: any = '';

  private userID: number = 0;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: LifestylePreferenceInterface = {
    userID: 0,
    spType: 'insert',
    lifeStylePrefrence: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  formFields: any[] = [
    { value: 0,        msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '[]',     msg: '', type: 'hidden', required: false }, // 2 lifeStylePrefrence
  ];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr: ToastrService,
    private valid: SharedFormFieldValidationService,
    private router: Router,
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

  // ─── Alias ────────────────────────────────────────────────────────────────
  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    const lifestyleArray: { typeID: number; subTypeID: number }[] = [];

    if (this.selectedSmoke)
      lifestyleArray.push({ typeID: 17, subTypeID: Number(this.selectedSmoke) });
    if (this.selectedAlcohol)
      lifestyleArray.push({ typeID: 18, subTypeID: Number(this.selectedAlcohol) });
    if (this.selectedWantKids)
      lifestyleArray.push({ typeID: 19, subTypeID: Number(this.selectedWantKids) });

    this.formFields[2].value = JSON.stringify(lifestyleArray);
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {
    if (!this.userID) {
      this.toastr.error('User not found. Please complete the Personal Info step first.');
      return;
    }

    this.syncFormFields();
    this.formFields[0].value = this.userID;

    this.pageFields.userID             = this.formFields[0].value;
    this.pageFields.spType             = this.formFields[1].value;
    this.pageFields.lifeStylePrefrence = this.formFields[2].value;

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
            this.valid.apiInfoResponse('Lifestyle Preferences Saved Successfully');
            this.saveSuccess.emit();
            this.checkRegistrationPlanAndNavigate(this.userID);
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => console.log('Lifestyle Preference Save Error:', err),
      });
  }

  // ─── Checks whether the user already has a registration plan on file.
  // If the API returns data, they already have a plan → don't redirect to the fee page.
  // If the API returns an empty array, they don't have one yet → send them to pay it.
  private checkRegistrationPlanAndNavigate(userID: number): void {
    this.dataService
      .getHttp(`core-api/Profile/userRegistrationPlan?userID=${userID}`)
      .subscribe({
        next: (response: any) => {
          const hasPlan = Array.isArray(response) ? response.length > 0 : !!response;

          if (!hasPlan) {
            this.router.navigate(['/Consultation']);
          }
        },
        error: (err: any) => {
          console.log('userRegistrationPlan check error:', err);
        },
      });
  }
}