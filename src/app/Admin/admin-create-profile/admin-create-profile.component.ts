import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { ToastrService } from 'ngx-toastr';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { AdminProfileInfoComponent } from '../admin-create-profile/admin-profile-info/admin-profile-info.component';
import { AdminProfileCareerComponent } from '../admin-create-profile/admin-profile-career/admin-profile-career.component';
import { AdminProfileReligionComponent } from '../admin-create-profile/admin-profile-religion/admin-profile-religion.component';
import { AdminProfileFamilyComponent } from '../admin-create-profile/admin-profile-family/admin-profile-family.component';
import { AdminProfileAppereanceComponent } from '../admin-create-profile/admin-profile-appereance/admin-profile-appereance.component';
import { AdminProfileLifestyleComponent } from '../admin-create-profile/admin-profile-lifestyle/admin-profile-lifestyle.component';

@Component({
  selector: 'app-admin-create-profile',
  templateUrl: './admin-create-profile.component.html',
  styleUrls: ['./admin-create-profile.component.scss'],
})
export class AdminCreateProfileComponent implements OnInit {
  // ─── References to children ───────────────────────────────────────────────
  @ViewChild(AdminProfileInfoComponent)
  personalInfoChild!: AdminProfileInfoComponent;

  @ViewChild(AdminProfileCareerComponent)
  careerInfoChild!: AdminProfileCareerComponent;

  @ViewChild(AdminProfileReligionComponent)
  religionInfoChild!: AdminProfileReligionComponent;

  @ViewChild(AdminProfileFamilyComponent)
  familyInfoChild!: AdminProfileFamilyComponent;

  @ViewChild(AdminProfileAppereanceComponent)
  appearanceInfoChild!: AdminProfileAppereanceComponent;

  @ViewChild(AdminProfileLifestyleComponent)
  lifestyleInfoChild!: AdminProfileLifestyleComponent;

  stepper: number = 1;

  // ─── Dropdown Lists ───────────────────────────────────────────────────────
  castList: any[] = [];
  nationalityList: any[] = [];
  ethnicityList: any[] = [];
  genderList: any[] = [];
  countryList: any[] = [];
  cityList: any[] = [];
  educationList: any[] = [];
  occupationList: any[] = [];
  monthlyIncomeList: any[] = [];
  religionList: any[] = [];
  sectList: any[] = [];
  religionImportanceList: any[] = [];
  maritalStatusList: any[] = [];
  housingSituationList: any[] = [];
  fatherOccupationList: any[] = [];
  motherOccupationList: any[] = [];
  noOfSiblingsList: any[] = [];
  familyInvolvementList: any[] = [];
  appearanceHeightList: any[] = [];
  bodyTypeList: any[] = [];
  skinToneList: any[] = [];
  disabilityList: any[] = [];
  smokeList: any[] = [];
  alcoholList: any[] = [];
  wantKidsList: any[] = [];
  willingRelocateList: any[] = [];
  timelineForMarriageList: any[] = [];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr: ToastrService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.stepper = 1;
    this.getSubTypes();
  }

  // ─── Save & Continue dispatcher ───────────────────────────────────────────
  save(): void {
    switch (this.stepper) {
      case 1:
        this.personalInfoChild.save();
        break;
      case 2:
        this.careerInfoChild.save();
        break;
      case 3:
        this.religionInfoChild.save();
        break;
      case 4:
        this.familyInfoChild.save();
        break;
      case 5:
        this.appearanceInfoChild.save();
        break;
      case 6:
        this.lifestyleInfoChild.save();
        break;
    }
  }

  // ─── Personal child emits saveSuccess → advance stepper ──────────────────
  onPersonalSaveSuccess(): void {
    this.stepper = 2;
  }

  // ─── Career child emits saveSuccess → advance stepper ────────────────────
  onCareerSaveSuccess(): void {
    this.stepper = 3;
  }

  onReligionSaveSuccess(): void {
    this.stepper = 4;
  }
  onFamilySaveSuccess(): void {
    this.stepper = 5;
  }
  onAppearanceSaveSuccess(): void {
    this.stepper = 6; // Route step indicator onward to lifestyle
  }

  onLifestyleSaveSuccess(): void {
    console.log('User Profile Completed Successfully.');
  }

  // ─── Stubs for remaining steps ────────────────────────────────────────────
  onReligionInfoChange(event: any) {
    console.log('Religion Info:', event);
  }
  onFamilyInfoChange(event: any) {
    console.log('Family Info:', event);
  }
  onAppearanceInfoChange(event: any) {
    console.log('Appearance Info:', event);
  }
  onLifestyleInfoChange(event: any) {
    console.log('Lifestyle Info:', event);
  }

  religionSave() {
    console.log('Religion save');
  }
  familySave() {
    console.log('Family save');
  }
  appearanceSave() {
    console.log('Appearance save');
  }
  lifestyleSave() {
    console.log('Lifestyle save');
  }

  // ─── Country → load cities ────────────────────────────────────────────────
  getCities(countryID: number): void {
    this.dataService
      .getHttp('cmis-api/company/getCity', { countryID })
      .subscribe({
        next: (res: any) => (this.cityList = res),
        error: (err) => console.error('Error loading cities:', err),
      });
  }

  // ─── API Loaders ──────────────────────────────────────────────────────────
  getSubTypes(): void {
    this.getSubType(1); // Cast
    this.getSubType(2); // Nationality
    this.getSubType(3); // Ethnicity
    this.getSubType(22); // Gender
    this.getCountries();

    this.getSubType(4); // Education
    this.getSubType(5); // Occupation
    this.getSubType(6); // Monthly Income

    this.getSubType(7); // Religion
    this.getSubType(8); // Sect
    this.getSubType(9); // Religion Importance

    this.getSubType(10); // Marital Status
    this.getSubType(11); // Housing Situation
    this.getSubType(12); // Father Occupation
    this.getSubType(13); // Mother Occupation
    this.getSubType(14); // Family Involvement
    this.getSubType(25); // No of Siblings

    this.getSubType(26); // Height
    this.getSubType(15); // Body Type
    this.getSubType(16); // Skin Tone
    this.getSubType(30); // Disability

    this.getSubType(17); // Smoke
    this.getSubType(18); // Alcohol
    this.getSubType(19); // Want Kids
  }

  getCountries(): void {
    this.dataService.getHttp('cmis-api/company/getCountry', {}).subscribe({
      next: (res: any) => (this.countryList = res),
      error: (err) => console.error('Error loading countries:', err),
    });
  }

  getSubType(typeID: number): void {
    this.dataService
      .getHttp('core-api/Profile/getSubType', { typeID })
      .subscribe({
        next: (res: any) => this.assignSubType(typeID, res),
        error: (err) => console.error(`Error loading typeID ${typeID}:`, err),
      });
  }

  assignSubType(typeID: number, data: any[]): void {
    switch (typeID) {
      case 1:
        this.castList = data;
        break;
      case 2:
        this.nationalityList = data;
        break;
      case 3:
        this.ethnicityList = data;
        break;
      case 22:
        this.genderList = data;
        break;
      case 4:
        this.educationList = data;
        break;
      case 5:
        this.occupationList = data;
        break;
      case 6:
        this.monthlyIncomeList = data;
        break;
      case 7:
        this.religionList = data;
        break;
      case 8:
        this.sectList = data;
        break;
      case 9:
        this.religionImportanceList = data;
        break;
      case 10:
        this.maritalStatusList = data;
        break;
      case 11:
        this.housingSituationList = data;
        break;
      case 12:
        this.fatherOccupationList = data;
        break;
      case 13:
        this.motherOccupationList = data;
        break;
      case 14:
        this.familyInvolvementList = data;
        break;
      case 25:
        this.noOfSiblingsList = data;
        break;
      case 26:
        this.appearanceHeightList = data;
        break;
      case 15:
        this.bodyTypeList = data;
        break;
      case 16:
        this.skinToneList = data;
        break;
      case 30:
        this.disabilityList = data;
        break;
      case 17:
        this.smokeList = data;
        break;
      case 18:
        this.alcoholList = data;
        break;
      case 19:
        this.wantKidsList = data;
        break;
      default:
        console.warn(`Unhandled typeID ${typeID}`);
    }
  }
}
