import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { Router } from '@angular/router';

interface LifestyleProfileInterface {
  userID: number;
  spType: string;
  facebooklink: string;
  instagramlink: string;
  tiktoklink: string;
  snapchatlink: string;
  lifeStyleJson: string;
}

@Component({
  selector: 'app-admin-profile-lifestyle',
  templateUrl: './admin-profile-lifestyle.component.html',
  styleUrls: ['./admin-profile-lifestyle.component.scss'],
})
export class AdminProfileLifestyleComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() smokeList: any[] = [];
  @Input() alcoholList: any[] = [];
  @Input() wantKidsList: any[] = [];
  @Input() maritalStatusList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Dropdown & Social Field Bindings ─────────────────────────────────────
  selectedSmoke: any = '';
  selectedAlcohol: any = '';
  selectedWantKids: any = '';
  selectedMaritalStatus: any = '';

  facebookLink: string = '';
  instagramLink: string = '';
  tiktokLink: string = '';
  snapchatLink: string = '';

  private userID: number = 0;

  // ─── Page Fields (API Payload Template) ───────────────────────────────────
  lifestylePageFields: LifestyleProfileInterface = {
    userID: 0,
    spType: 'insert',
    facebooklink: '',
    instagramlink: '',
    tiktoklink: '',
    snapchatlink: '',
    lifeStyleJson: '[]',
  };

  // ─── Form Fields (structural shape only — no required flags) ──────────────
  lifestyleFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '', msg: '', type: 'textbox', required: false }, // 2 facebooklink
    { value: '', msg: '', type: 'textbox', required: false }, // 3 instagramlink
    { value: '', msg: '', type: 'textbox', required: false }, // 4 tiktoklink
    { value: '', msg: '', type: 'textbox', required: false }, // 5 snapchatlink
    { value: '[]', msg: '', type: 'hidden', required: false }, // 6 lifeStyleJson
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

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Synchronize Variables with Payload Arrays ────────────────────────────
  syncFormFields(): void {
    this.lifestyleFormFields[2].value = this.facebookLink
      ? this.facebookLink.trim()
      : '';
    this.lifestyleFormFields[3].value = this.instagramLink
      ? this.instagramLink.trim()
      : '';
    this.lifestyleFormFields[4].value = this.tiktokLink
      ? this.tiktokLink.trim()
      : '';
    this.lifestyleFormFields[5].value = this.snapchatLink
      ? this.snapchatLink.trim()
      : '';

    const lifestyleEntries = [
      { typeID: 17, subTypeID: this.selectedSmoke },
      { typeID: 18, subTypeID: this.selectedAlcohol },
      { typeID: 19, subTypeID: this.selectedWantKids },
      { typeID: 10, subTypeID: this.selectedMaritalStatus },
    ]
      .filter(
        (item) =>
          item.subTypeID !== '' &&
          item.subTypeID !== null &&
          item.subTypeID !== undefined,
      )
      .map((item) => ({
        typeID: item.typeID,
        subTypeID: Number(item.subTypeID),
      }));

    this.lifestyleFormFields[6].value = JSON.stringify(lifestyleEntries);
  }

  // ─── Save Implementation Method ───────────────────────────────────────────
  save(): void {
    if (!this.userID) {
      this.toastr.error(
        'User not found. Please complete the Personal Info step first.',
      );
      return;
    }

    this.syncFormFields();
    this.lifestyleFormFields[0].value = this.userID;
    this.lifestyleFormFields[1].value = 'insert';

    this.lifestylePageFields.userID = this.lifestyleFormFields[0].value;
    this.lifestylePageFields.spType = this.lifestyleFormFields[1].value;
    this.lifestylePageFields.facebooklink = this.lifestyleFormFields[2].value;
    this.lifestylePageFields.instagramlink = this.lifestyleFormFields[3].value;
    this.lifestylePageFields.tiktoklink = this.lifestyleFormFields[4].value;
    this.lifestylePageFields.snapchatlink = this.lifestyleFormFields[5].value;
    this.lifestylePageFields.lifeStyleJson = this.lifestyleFormFields[6].value;

    this.dataService
      .saveHttp(
        this.lifestylePageFields,
        this.lifestyleFormFields,
        'core-api/Profile/saveUserLifeStyle',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse(
              'Lifestyle Profile Completed Successfully',
            );
           this.router.navigate(['/admin-prefernces-configuration']);
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          console.error('Lifestyle Save Error:', err);
        },
      });
  }
}
