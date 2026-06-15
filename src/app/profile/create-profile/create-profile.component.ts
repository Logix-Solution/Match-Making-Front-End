import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.scss'],
})
export class CreateProfileComponent implements OnInit {

  stepper: number = 1;

  // Personal
  castList: any[] = [];
  nationalityList: any[] = [];
  ethnicityList: any[] = [];
  genderList: any[] = [];

  countryList: any[] = [];
  cityList: any[] = [];

  // Career
  educationList: any[] = [];
  occupationList: any[] = [];
  monthlyIncomeList: any[] = [];

  // Religion
  religionList: any[] = [];
  sectList: any[] = [];
  religionImportanceList: any[] = [];

//Family & Lifestyle
maritalStatusList: any[] = [];
housingSituationList: any[] = [];
fatherOccupationList: any[] = [];
motherOccupationList: any[] = [];
noOfSiblingsList: any[] = [];
familyInvolvementList: any[] = [];

// Appearance
appearanceHeightList: any[] = [];
bodyTypeList: any[] = [];
skinToneList: any[] = [];
disabilityList: any[] = [];
 
  //lifestyle
smokeList: any[] = [];
alcoholList: any[] = [];
wantKidsList: any[] = [];
willingRelocateList: any[] = [];
timelineForMarriageList: any[] = [];

  constructor(private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
  ) {}

  ngOnInit() {
    this.stepper = 1;
    this.getSubTypes();
  }

  getSubTypes() {
        // Personal
    this.getSubType(1);   // Cast
    this.getSubType(2);   // Nationality
    this.getSubType(3);   // Ethnicity
    this.getSubType(22);  // Gender
    this.getCountries();   // Country

       // Career
    this.getSubType(4);   // Education Level
    this.getSubType(5);   // Occupation
    this.getSubType(6);   // Monthly Income
        // Religion
    this.getSubType(7);   // Religion
    this.getSubType(8);   // Sect
    this.getSubType(9);   // Religion Importance

         // Family & Lifestyle
    this.getSubType(10);  // Marital Status
    this.getSubType(11);  // Housing Situation
    this.getSubType(12);  // Father Occupation
    this.getSubType(13);  // Mother Occupation
    this.getSubType(14);  // Family Involvement
    this.getSubType(25);  // No of Siblings
         // Appearance
    this.getSubType(26);  // Height
    this.getSubType(15);  // Body Type
    this.getSubType(16);  // Skin Tone
    this.getSubType(30);  // Disability   
    
        // Lifestyle
        // Lifestyle
    this.getSubType(17);  // Smoke
    this.getSubType(18);  // Alcohol
    this.getSubType(19);  // Want Kids
  }


  getCountries() {
  this.dataService.getHttp('cmis-api/company/getCountry', {}).subscribe({
    next: (res: any) => this.countryList = res,
    error: (err) => console.error('Error loading countries:', err)
  });
}

getCities(countryID: number) {
  this.dataService.getHttp('cmis-api/company/getCity', { countryID }).subscribe({
    next: (res: any) => this.cityList = res,
    error: (err) => console.error('Error loading cities:', err)
  });
}

  getSubType(typeID: number) {
    this.dataService.getHttp('core-api/Profile/getSubType', { typeID }).subscribe({
      next: (res: any) => this.assignSubType(typeID, res),
      error: (err) => console.error(`Error loading typeID ${typeID}:`, err)
    });
  }

  assignSubType(typeID: number, data: any[]) {
    switch (typeID) {
      // Personal
      case 1:  this.castList              = data; break;
      case 2:  this.nationalityList       = data; break;
      case 3:  this.ethnicityList         = data; break;
      case 22: this.genderList            = data; break;
      // Career
      case 4:  this.educationList         = data; break;
      case 5:  this.occupationList        = data; break;
      case 6:  this.monthlyIncomeList     = data; break;
      // Religion
      case 7:  this.religionList          = data; break;
      case 8:  this.sectList              = data; break;
      case 9:  this.religionImportanceList = data; break;
      // Family & Lifestyle
      case 10: this.maritalStatusList     = data; break;
      case 11: this.housingSituationList  = data; break;
      case 12: this.fatherOccupationList  = data; break;
      case 13: this.motherOccupationList  = data; break;
      case 14: this.familyInvolvementList = data; break;
      case 25: this.noOfSiblingsList      = data; break;
      // Appearance
      case 26: this.appearanceHeightList  = data; break;
      case 15: this.bodyTypeList          = data; break;
      case 16: this.skinToneList          = data; break;
      case 30: this.disabilityList        = data; break;

      // Lifestyle
      case 17: this.smokeList               = data; break;
      case 18: this.alcoholList             = data; break;
      case 19: this.wantKidsList            = data; break;
     
      default:
        console.warn(`Unhandled typeID ${typeID} with data:`, data);
    }
  }

  onPersonalInfoChange(event: any) {
    console.log('Personal Info:', event);
  }

  onCareerInfoChange(event: any) {
    console.log('Career Info:', event);
  }

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

//////////////////////////Save //////////


save() {    }




personalSave(){}
careerSave(){}
religionSave(){}
familySave(){}
appearanceSave(){}
lifestyleSave(){}

}
