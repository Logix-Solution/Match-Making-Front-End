import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { ToastrService } from 'ngx-toastr';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { PreferencesPersonalComponent } from '../preferences-configuration/preferences-personal/preferences-personal.component';
import { PreferencesReligionComponent } from '../preferences-configuration/preferences-religion/preferences-religion.component';
import { PreferencesLifestyleComponent } from '../preferences-configuration/preferences-lifestyle/preferences-lifestyle.component';
import { PreferencesAppearanceComponent } from '../preferences-configuration/preferences-appearance/preferences-appearance.component';
import { PreferencesFamilyComponent } from '../preferences-configuration/preferences-family/preferences-family.component';
import { PreferencesCareerComponent } from '../preferences-configuration/preferences-career/preferences-career.component';
@Component({
  selector: 'app-preferences-configuration',
  templateUrl: './preferences-configuration.component.html',
  styleUrls: ['./preferences-configuration.component.scss'],
})
export class PreferencesConfigurationComponent implements OnInit {
  // ─── References to children ───────────────────────────────────────────────
  @ViewChild(PreferencesPersonalComponent)
  personalPrefChild!: PreferencesPersonalComponent;
  @ViewChild(PreferencesReligionComponent)
  religionPrefChild!: PreferencesReligionComponent;
  @ViewChild(PreferencesLifestyleComponent)
  lifestylePrefChild!: PreferencesLifestyleComponent;
  @ViewChild(PreferencesAppearanceComponent)
  appearancePrefChild!: PreferencesAppearanceComponent;

  @ViewChild(PreferencesFamilyComponent)
  familyPrefChild!: PreferencesFamilyComponent;
  @ViewChild(PreferencesCareerComponent)
  careerPrefChild!: PreferencesCareerComponent;

  stepper: number = 1;

  // ─── Dropdown Lists ───────────────────────────────────────────────────────
  castList: any[] = [];
  nationalityList: any[] = [];
  ethnicityList: any[] = [];
  countryList: any[] = [];
  cityList: any[] = [];
  minAgeList: any[] = [];
  maxAgeList: any[] = [];
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
  acceptKidsList: any[] = []; // typeID=27
  relocateList: any[] = []; // typeID=20
  marriageTimelineList: any[] = []; // typeID=21
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
        this.personalPrefChild.save();
        break;
      case 2:
        this.careerPrefChild.save();
        break;
      case 3:
        this.religionPrefChild.save();
        break;
      case 4:
        this.familyPrefChild.save();
        break;
      case 5:
        this.appearancePrefChild.save();
        break;
      case 6:
        this.lifestylePrefChild.save();
        break;
    }
  }

  // ─── Child saveSuccess handlers ───────────────────────────────────────────
  onPersonalPrefSaveSuccess(): void {
    this.stepper = 2;
  }
  onCareerPrefSaveSuccess(): void {
    this.stepper = 3;
  }
  onReligionPrefSaveSuccess(): void {
    this.stepper = 4;
  }
  onFamilyPrefSaveSuccess(): void {
    this.stepper = 5;
  }
  onAppearancePrefSaveSuccess(): void {
    this.stepper = 6;
  }
  onLifestylePrefSaveSuccess(): void {
    console.log('All preferences saved.');
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
    this.getCountries();

    this.getSubType(31); // Min Age
    this.getSubType(32); // Max Age

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

    this.getSubType(27); // Accept Partner with Kids
    this.getSubType(20); // Willing to Relocate
    this.getSubType(21); // Timeline for Marriage
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
      case 31:
        this.minAgeList = data;
        break;
      case 32:
        this.maxAgeList = data;
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

      case 27:
        this.acceptKidsList = data;
        break;
      case 20:
        this.relocateList = data;
        break;
      case 21:
        this.marriageTimelineList = data;
        break;
      default:
        console.warn(`Unhandled typeID ${typeID}`);
    }
  }
}
