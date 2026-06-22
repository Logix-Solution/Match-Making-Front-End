import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface LifestyleProfileInterface {
  userID:        number; // 0
  spType:        string; // 1
  facebooklink:  string; // 2
  instagramlink: string; // 3
  tiktoklink:    string; // 4
  snapchatlink:  string; // 5
  lifeStyleJson: string; // 6 
}

@Component({
  selector: 'app-profile-lifestyle-info-input',
  templateUrl: './profile-lifestyle-info-input.component.html',
  styleUrls: ['./profile-lifestyle-info-input.component.scss']
})
export class ProfileLifestyleInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() smokeList:         any[] = [];
  @Input() alcoholList:       any[] = [];
  @Input() wantKidsList:      any[] = [];
  @Input() maritalStatusList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); // Finalizing layout trigger complete

  // ─── Dropdown & Social Field Bindings ─────────────────────────────────────
  selectedSmoke:         any = '';
  selectedAlcohol:       any = '';
  selectedWantKids:      any = '';
  selectedMaritalStatus: any = '';

  facebookLink:  string = '';
  instagramLink: string = '';
  tiktokLink:    string = '';
  snapchatLink:  string = '';

  // ─── Page Fields (API Payload Template) ───────────────────────────────────
  lifestylePageFields: LifestyleProfileInterface = {
    userID:        0,
    spType:        'insert',
    facebooklink:  '',
    instagramlink: '',
    tiktoklink:    '',
    snapchatlink:  '',
    lifeStyleJson: '[]',
  };

  // ─── Form Fields (Structural Data Validation Array) ──────────────────────
  lifestyleFormFields: any[] = [
    { value: 0,        msg: '', type: 'hidden',  required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden',  required: false }, // 1 spType
    { value: '',       msg: '', type: 'textbox', required: false }, // 2 facebooklink
    { value: '',       msg: '', type: 'textbox', required: false }, // 3 instagramlink
    { value: '',       msg: '', type: 'textbox', required: false }, // 4 tiktoklink
    { value: '',       msg: '', type: 'textbox', required: false }, // 5 snapchatlink
    { value: '[]',     msg: '', type: 'hidden',  required: false }, // 6 lifeStyleJson
  ];

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr:              ToastrService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {}

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Synchronize Variables with Payload Arrays ────────────────────────────
  syncFormFields(): void {
    this.lifestyleFormFields[2].value = this.facebookLink ? this.facebookLink.trim() : '';
    this.lifestyleFormFields[3].value = this.instagramLink ? this.instagramLink.trim() : '';
    this.lifestyleFormFields[4].value = this.tiktokLink ? this.tiktokLink.trim() : '';
    this.lifestyleFormFields[5].value = this.snapchatLink ? this.snapchatLink.trim() : '';

    const lifestyleEntries = [
  { typeID: 17, subTypeID: this.selectedSmoke         },
  { typeID: 18, subTypeID: this.selectedAlcohol       },
  { typeID: 19, subTypeID: this.selectedWantKids      },
  { typeID: 10, subTypeID: this.selectedMaritalStatus },
].filter(item => item.subTypeID !== '' && item.subTypeID !== null && item.subTypeID !== undefined)
 .map(item    => ({ typeID: item.typeID, subTypeID: Number(item.subTypeID) }));

this.lifestyleFormFields[6].value = JSON.stringify(lifestyleEntries);
  }

  // ─── Save Implementation Method ───────────────────────────────────────────
  save(): void {
    // ─── Dropdown Validation Validations ────────────────────────────────────
    if (!this.selectedSmoke) {
      this.toastr.warning('Select  smoke Feild'); return;
    }
    if (!this.selectedAlcohol) {
      this.toastr.warning('Select  Alcohol Feild'); return;
    }
    if (!this.selectedWantKids) {
      this.toastr.warning('Select  state your preferences for wanting children'); return;
    }
    if (!this.selectedMaritalStatus) {
      this.toastr.warning('Select Maritals Status'); return;
    }

    // ─── Get Active Authentication UserID Session ───────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User not found. Please login again.');
      return;
    }

    this.syncFormFields();
    this.lifestyleFormFields[0].value = userID;
    this.lifestyleFormFields[1].value = 'insert';

    // Map properties directly to API signature interface
    this.lifestylePageFields.userID        = this.lifestyleFormFields[0].value;
    this.lifestylePageFields.spType        = this.lifestyleFormFields[1].value;
    this.lifestylePageFields.facebooklink  = this.lifestyleFormFields[2].value;
    this.lifestylePageFields.instagramlink = this.lifestyleFormFields[3].value;
    this.lifestylePageFields.tiktoklink    = this.lifestyleFormFields[4].value;
    this.lifestylePageFields.snapchatlink  = this.lifestyleFormFields[5].value;
    this.lifestylePageFields.lifeStyleJson = this.lifestyleFormFields[6].value;

    console.log('Lifestyle Submission Payload:', this.lifestylePageFields);

    // ─── POST request submission ────────────────────────────────────────────
    this.dataService.saveHttp(
      this.lifestylePageFields,
      this.lifestyleFormFields,
      'core-api/Profile/saveUserLifeStyle'
    ).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Lifestyle Profile Completed Successfully');
          this.saveSuccess.emit(); // Profile completion final callback
        } else {
          this.valid.apiErrorResponse(apiResponse);
        }
      },
      error: (err: any) => {
        console.error('Lifestyle Save Error:', err);
      }
    });
  }
}