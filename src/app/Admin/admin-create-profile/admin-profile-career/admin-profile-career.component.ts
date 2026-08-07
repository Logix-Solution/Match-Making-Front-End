import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface CareerProfileInterface {
  userID: number;
  spType: string;
  instituteName: string;
  careerJson: string;
}

@Component({
  selector: 'app-admin-profile-career',
  templateUrl: './admin-profile-career.component.html',
  styleUrls: ['./admin-profile-career.component.scss'],
})
export class AdminProfileCareerComponent implements OnInit {
  @Input() educationList: any[] = [];
  @Input() occupationList: any[] = [];
  @Input() monthlyIncomeList: any[] = [];

  @Output() saveSuccess = new EventEmitter<void>();

  instituteName: string = '';
  selectedEducation: any = '';
  selectedOccupation: any = '';
  selectedMonthlyIncome: any = '';

  private userID: number = 0;

  careerPageFields: CareerProfileInterface = {
    userID: 0,
    spType: 'insert',
    instituteName: '',
    careerJson: '[]',
  };

  careerFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0 userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1 spType
    { value: '', msg: '', type: 'textbox', required: false }, // 2 instituteName
    { value: '[]', msg: '', type: 'hidden', required: false }, // 3 careerJson
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

  onFieldChange(): void {
    this.syncFormFields();
  }

  syncFormFields(): void {
    this.careerFormFields[2].value = this.instituteName;

    const careerEntries = [
      { typeID: 4, subTypeID: this.selectedEducation },
      { typeID: 5, subTypeID: this.selectedOccupation },
      { typeID: 6, subTypeID: this.selectedMonthlyIncome },
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

    this.careerFormFields[3].value = JSON.stringify(careerEntries);
  }

  save(): void {
    if (!this.userID) {
      this.toastr.error(
        'User not found. Please complete the Personal Info step first.',
      );
      return;
    }

    this.syncFormFields();
    this.careerFormFields[0].value = this.userID;
    this.careerFormFields[1].value = 'insert';

    this.careerPageFields.userID = this.careerFormFields[0].value;
    this.careerPageFields.spType = this.careerFormFields[1].value;
    this.careerPageFields.instituteName = this.careerFormFields[2].value;
    this.careerPageFields.careerJson = this.careerFormFields[3].value;

    this.dataService
      .saveHttp(
        this.careerPageFields,
        this.careerFormFields,
        'core-api/Profile/saveCareer',
      )
      .subscribe({
        next: (response: any) => {
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('Career Profile Saved Successfully');
            this.saveSuccess.emit();
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => console.log('Career Save Error:', err),
      });
  }
}
