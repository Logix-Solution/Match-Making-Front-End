import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface CareerProfileInterface {
  userID:        number;  // 0
  spType:        string;  // 1
  instituteName: string;  // 2
  careerJson:    string;  // 3 
}

@Component({
  selector: 'app-profile-career-info-input',
  templateUrl: './profile-career-info-input.component.html',
  styleUrls: ['./profile-career-info-input.component.scss']
})
export class ProfileCareerInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() educationList:     any[] = [];
  @Input() occupationList:    any[] = [];
  @Input() monthlyIncomeList: any[] = [];

  // ─── Output to Parent ─────────────────────────────────────────────────────
  @Output() saveSuccess = new EventEmitter<void>(); // tell parent to advance stepper

  // ─── Text Fields ──────────────────────────────────────────────────────────
  instituteName: string = '';

  // ─── Dropdown Selections ──────────────────────────────────────────────────
  selectedEducation:    any = '';
  selectedOccupation:   any = '';
  selectedMonthlyIncome: any = '';

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  careerPageFields: CareerProfileInterface = {
    userID:        0,
    spType:        'insert',
    instituteName: '',
    careerJson:    '[]',
  };

  // ─── Form Fields (for saveHttp validation) ────────────────────────────────
  careerFormFields: any[] = [
    { value: 0,        msg: '',                                   type: 'hidden',  required: false }, // 0 userID
    { value: 'insert', msg: '',                                   type: 'hidden',  required: false }, // 1 spType
    { value: '',       msg: 'Please enter your institution name', type: 'textbox', required: true  }, // 2 instituteName
    { value: '[]',     msg: '',                                   type: 'hidden',  required: false }, // 3 careerJson
  ];

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr:              ToastrService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {}

  // ─── Alias — HTML templates call onFieldChange() ──────────────────────────
  onFieldChange(): void { this.syncFormFields(); }

  // ─── Sync bound fields → formFields[] ────────────────────────────────────
  syncFormFields(): void {
    this.careerFormFields[2].value = this.instituteName;

    // careerJson: [educationID, occupationID, monthlyIncomeID]
    const careerIds = [
      this.selectedEducation,
      this.selectedOccupation,
      this.selectedMonthlyIncome
    ].filter(v => v !== '' && v !== null && v !== undefined);

    this.careerFormFields[3].value =
      '[' + careerIds.map((v: any) => Number(v)).join(',') + ']';
  }

  // ─── SAVE ─────────────────────────────────────────────────────────────────
  save(): void {

    // ─── Manual validations (dropdowns not covered by saveHttp) ──────────
    if (!this.selectedEducation) {
      this.toastr.warning('Please select your education level'); return;
    }
    if (!this.selectedOccupation) {
      this.toastr.warning('Please select your occupation'); return;
    }
    if (!this.selectedMonthlyIncome) {
      this.toastr.warning('Please select your monthly income'); return;
    }

    // ─── Get userLoginId ──────────────────────────────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    // ─── Sync all fields ──────────────────────────────────────────────────
    this.syncFormFields();
    this.careerFormFields[0].value = userID;   // userID
    this.careerFormFields[1].value = 'insert'; // spType

    // ─── Sync formFields → pageFields ────────────────────────────────────
    this.careerPageFields.userID        = this.careerFormFields[0].value;
    this.careerPageFields.spType        = this.careerFormFields[1].value;
    this.careerPageFields.instituteName = this.careerFormFields[2].value;
    this.careerPageFields.careerJson    = this.careerFormFields[3].value;

    console.log('Career PageFields:', this.careerPageFields);
    console.log('Career FormFields:', this.careerFormFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService.saveHttp(
      this.careerPageFields,
      this.careerFormFields,
      'core-api/Profile/saveCareer'
    ).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Career Profile Saved Successfully');
          this.saveSuccess.emit();  // ← tell parent to go stepper = 3
        } else {
          this.valid.apiErrorResponse(apiResponse);
        }
      },
      error: (err: any) => {
        console.log('Career Save Error:', err);
      }
    });
  }
}