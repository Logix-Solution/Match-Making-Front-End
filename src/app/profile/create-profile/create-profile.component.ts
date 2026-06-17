import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { MyFormField } from '../../../shared/interfaces/myFormFields';
import { ToastrService } from 'ngx-toastr';


// ─── Interface ───────────────────────────────────────────
interface PersonalProfileInterface {
  newUserID: number;       // 0
  spType: string;          // 1
  firstName: string;       // 2
  lastName: string;        // 3
  email: string;           // 4
  phoneNumber: string;     // 5
  adress: string;          // 6
  dob: string;             // 7
  userCNIC: string;        // 8
  eDoc: string;            // 9
  eDocPath: string;        // 10
  eDocExt: string;         // 11
  aboutMe: string;         // 12
  documentType: string;    // 13
  cnicFronteDoc: string;       // 14
  cnicFronteDocPath: string;   // 15
  cnicFronteDocExt: string;    // 16
  cnicBackeDoc: string;        // 17
  cnicBackeDocPath: string;    // 18
  cnicBackeDocExt: string;     // 19
  passporteDoc: string;        // 20
  passporteDocPath: string;    // 21
  passporteDocExt: string;     // 22
  hidePhoto: number;           // 23
  parentPhoneNo: string;       // 24
  countryCodeID: number;       // 25
  cityID: number;              // 26
  nationality: number;         // 27
  subTypeJson: string;         // 28
  galleryImages: string;       // 29
}

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.scss'],
})
export class CreateProfileComponent implements OnInit {

  stepper: number = 1;
  personalData: any = {};

  // ─── Page Interface ───────────────────────────────────
  personalPageFields: PersonalProfileInterface = {
    newUserID:        0,
    spType:           'insert',
    firstName:        '',
    lastName:         '',
    email:            '',
    phoneNumber:      '',
    adress:           '',
    dob:              '',
    userCNIC:         '',
    eDoc:             '',
    eDocPath:         '',
    eDocExt:          '',
    aboutMe:          '',
    documentType:     'CNIC',
    cnicFronteDoc:        '',
    cnicFronteDocPath:    '',
    cnicFronteDocExt:     '',
    cnicBackeDoc:         '',
    cnicBackeDocPath:     '',
    cnicBackeDocExt:      '',
    passporteDoc:         '',
    passporteDocPath:     '',
    passporteDocExt:      '',
    hidePhoto:            0,
    parentPhoneNo:        '',
    countryCodeID:        0,
    cityID:               0,
    nationality:          0,
    subTypeJson:          '[]',
    galleryImages:        '[]',
  };

  // ─── Form Fields ──────────────────────────────────────
  personalFormFields: any[] = [
    { value: 0,        msg: '',                         type: 'hidden',    required: false }, // 0  newUserID
    { value: 'insert', msg: '',                         type: 'hidden',    required: false }, // 1  spType
    { value: '',       msg: 'Enter first name',         type: 'textbox',   required: true  }, // 2  firstName
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 3  lastName
    { value: '',       msg: 'Enter email',              type: 'textbox',   required: false }, // 4  email
    { value: '',       msg: 'Enter phone number',       type: 'textbox',   required: true  }, // 5  phoneNumber
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 6  adress
    { value: '',       msg: 'Select date of birth',     type: 'datePicker',required: true  }, // 7  dob
    { value: '',       msg: 'Enter CNIC',               type: 'textbox',   required: true  }, // 8  userCNIC
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 9  eDoc
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 10 eDocPath
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 11 eDocExt
    { value: '',       msg: 'Enter about me',           type: 'textbox',   required: true  }, // 12 aboutMe
    { value: 'CNIC',   msg: 'Select document type',     type: 'selectbox', required: true  }, // 13 documentType
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 14 cnicFronteDoc
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 15 cnicFronteDocPath
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 16 cnicFronteDocExt
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 17 cnicBackeDoc
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 18 cnicBackeDocPath
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 19 cnicBackeDocExt
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 20 passporteDoc
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 21 passporteDocPath
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 22 passporteDocExt
    { value: 0,        msg: '',                         type: 'hidden',    required: false }, // 23 hidePhoto
    { value: '',       msg: '',                         type: 'hidden',    required: false }, // 24 parentPhoneNo
    { value: 0,        msg: 'Select country',           type: 'selectbox', required: true  }, // 25 countryCodeID
    { value: 0,        msg: 'Select city',              type: 'selectbox', required: true  }, // 26 cityID
    { value: 0,        msg: 'Select nationality',       type: 'selectbox', required: true  }, // 27 nationality
    { value: '[]',     msg: '',                         type: 'hidden',    required: false }, // 28 subTypeJson
    { value: '[]',     msg: '',                         type: 'hidden',    required: false }, // 29 galleryImages
  ];

  // ─── Dropdown Lists ───────────────────────────────────
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
     private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.stepper = 1;
    this.getSubTypes();
  }

  // ─── Receive from child ───────────────────────────────
 onPersonalInfoChange(event: any) {
  this.personalData = event;

  this.personalFormFields[2].value  = event.firstName    || '';
  // email field — removed, no validation needed
  this.personalFormFields[5].value  = event.phoneNumber  || '';
  this.personalFormFields[7].value  = event.dob          || '';
  this.personalFormFields[8].value  = event.cnic         || '';
  this.personalFormFields[9].value  = event.eDoc         || '';
  this.personalFormFields[10].value = event.eDocPath     || '';
  this.personalFormFields[11].value = event.eDocExt      || '';
  this.personalFormFields[12].value = event.aboutMe      || '';
  // documentType: if 'selection' keep default 'CNIC', else use what child sends
  this.personalFormFields[13].value = event.documentType || 'CNIC';
  this.personalFormFields[14].value = event.cnicFrontDoc      || '';
  this.personalFormFields[15].value = event.cnicFrontDocPath  || '';
  this.personalFormFields[16].value = event.cnicFrontDocExt   || '';
  this.personalFormFields[17].value = event.cnicBackDoc       || '';
  this.personalFormFields[18].value = event.cnicBackDocPath   || '';
  this.personalFormFields[19].value = event.cnicBackDocExt    || '';
  this.personalFormFields[20].value = event.passportDoc       || '';
  this.personalFormFields[21].value = event.passportDocPath   || '';
  this.personalFormFields[22].value = event.passportDocExt    || '';
  this.personalFormFields[23].value = event.hidePhoto ? 1 : 0;
  this.personalFormFields[25].value = event.country      || 0;
  this.personalFormFields[26].value = event.city         || 0;
  this.personalFormFields[27].value = event.nationality  || 0;

  // subTypeJson: gender + cast + ethnicity IDs
  const subTypeIds = [event.gender, event.cast, event.ethnicity]
    .filter(v => v !== '' && v !== null && v !== undefined);
 this.personalFormFields[28].value = '[' + subTypeIds.map((v: any) => Number(v)).join(',') + ']';

  // Gallery JSON — backend field is typed as string, so it must be stringified
  const gallery = (event.galleryImages || []).map((img: any) => ({
    galleryEdoc:     img.galleryEdoc,
    galleryEdocPath: img.galleryEdocPath,
    galleryEdocExt:  img.galleryEdocExt,
  }));

  const galleryJsonString = JSON.stringify(gallery);

  this.personalPageFields.galleryImages = galleryJsonString;
  this.personalFormFields[29].value     = galleryJsonString;
}
  onCareerInfoChange(event: any)     { console.log('Career Info:', event); }
  onReligionInfoChange(event: any)   { console.log('Religion Info:', event); }
  onFamilyInfoChange(event: any)     { console.log('Family Info:', event); }
  onAppearanceInfoChange(event: any) { console.log('Appearance Info:', event); }
  onLifestyleInfoChange(event: any)  { console.log('Lifestyle Info:', event); }

  // ─── Save & Continue ──────────────────────────────────
  save() {
    switch (this.stepper) {
      case 1: this.personalSave();   break;
      case 2: this.careerSave();     break;
      case 3: this.religionSave();   break;
      case 4: this.familySave();     break;
      case 5: this.appearanceSave(); break;
      case 6: this.lifestyleSave();  break;
    }
  }

  // ─── Personal Save ────────────────────────────────────
  personalSave() {
    // Sync formFields → pageFields
    this.personalPageFields.newUserID       = this.personalFormFields[0].value;
    this.personalPageFields.spType          = this.personalFormFields[1].value;
    this.personalPageFields.firstName       = this.personalFormFields[2].value;
    this.personalPageFields.lastName        = this.personalFormFields[3].value;
    this.personalPageFields.email           = this.personalFormFields[4].value  || '';
    this.personalPageFields.phoneNumber     = this.personalFormFields[5].value;
    this.personalPageFields.adress          = this.personalFormFields[6].value;
    this.personalPageFields.dob             = this.personalFormFields[7].value;
    this.personalPageFields.userCNIC        = this.personalFormFields[8].value;
    this.personalPageFields.eDoc            = this.personalFormFields[9].value;
    this.personalPageFields.eDocPath        = this.personalFormFields[10].value;
    this.personalPageFields.eDocExt         = this.personalFormFields[11].value;
    this.personalPageFields.aboutMe         = this.personalFormFields[12].value;
    this.personalPageFields.documentType    = this.personalFormFields[13].value;
    this.personalPageFields.cnicFronteDoc       = this.personalFormFields[14].value;
    this.personalPageFields.cnicFronteDocPath   = this.personalFormFields[15].value;
    this.personalPageFields.cnicFronteDocExt    = this.personalFormFields[16].value;
    this.personalPageFields.cnicBackeDoc        = this.personalFormFields[17].value;
    this.personalPageFields.cnicBackeDocPath    = this.personalFormFields[18].value;
    this.personalPageFields.cnicBackeDocExt     = this.personalFormFields[19].value;
    this.personalPageFields.passporteDoc        = this.personalFormFields[20].value;
    this.personalPageFields.passporteDocPath    = this.personalFormFields[21].value;
    this.personalPageFields.passporteDocExt     = this.personalFormFields[22].value;
    this.personalPageFields.hidePhoto           = this.personalFormFields[23].value;
    this.personalPageFields.parentPhoneNo       = this.personalFormFields[24].value;
    this.personalPageFields.countryCodeID       = this.personalFormFields[25].value;
    this.personalPageFields.cityID              = this.personalFormFields[26].value;
    this.personalPageFields.nationality         = this.personalFormFields[27].value;
    this.personalPageFields.subTypeJson         = this.personalFormFields[28].value;
    this.personalPageFields.galleryImages       = this.personalFormFields[29].value;

    console.log('Personal PageFields:', this.personalPageFields);
    console.log('Personal FormFields:', this.personalFormFields);
  

    this.dataService.saveHttp(
      this.personalPageFields,
      this.personalFormFields,
      'auth-api/saveUser'
    ).subscribe({
       next: (res: any) => {
        console.log('Personal saved:', res);
 
        // API returns something like: "Success|||80"
        const raw = Array.isArray(res) ? res[0] : res;
        const parts = (raw || '').toString().split('|||').map((p: string) => p.trim());
        const status = parts[0];
        const newID  = parts[1];
 
        if (status?.toLowerCase() === 'success') {
          if (newID) {
            this.personalFormFields[0].value = newID;
            this.personalPageFields.newUserID = newID;
          }
          this.toastr.success('Profile saved successfully', 'Success');
          this.stepper = 2;
        } else {
          this.toastr.error(raw || 'Something went wrong', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Personal save error:', err);
      }
    });
  }

  careerSave()     { console.log('Career save'); }
  religionSave()   { console.log('Religion save'); }
  familySave()     { console.log('Family save'); }
  appearanceSave() { console.log('Appearance save'); }
  lifestyleSave()  { console.log('Lifestyle save'); }

  // ─── API Loaders ──────────────────────────────────────
  getSubTypes() {
    this.getSubType(1);  this.getSubType(2);  this.getSubType(3);
    this.getSubType(22); this.getCountries();
    this.getSubType(4);  this.getSubType(5);  this.getSubType(6);
    this.getSubType(7);  this.getSubType(8);  this.getSubType(9);
    this.getSubType(10); this.getSubType(11); this.getSubType(12);
    this.getSubType(13); this.getSubType(14); this.getSubType(25);
    this.getSubType(26); this.getSubType(15); this.getSubType(16);
    this.getSubType(30); this.getSubType(17); this.getSubType(18);
    this.getSubType(19);
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
      case 1:  this.castList               = data; break;
      case 2:  this.nationalityList        = data; break;
      case 3:  this.ethnicityList          = data; break;
      case 22: this.genderList             = data; break;
      case 4:  this.educationList          = data; break;
      case 5:  this.occupationList         = data; break;
      case 6:  this.monthlyIncomeList      = data; break;
      case 7:  this.religionList           = data; break;
      case 8:  this.sectList               = data; break;
      case 9:  this.religionImportanceList = data; break;
      case 10: this.maritalStatusList      = data; break;
      case 11: this.housingSituationList   = data; break;
      case 12: this.fatherOccupationList   = data; break;
      case 13: this.motherOccupationList   = data; break;
      case 14: this.familyInvolvementList  = data; break;
      case 25: this.noOfSiblingsList       = data; break;
      case 26: this.appearanceHeightList   = data; break;
      case 15: this.bodyTypeList           = data; break;
      case 16: this.skinToneList           = data; break;
      case 30: this.disabilityList         = data; break;
      case 17: this.smokeList              = data; break;
      case 18: this.alcoholList            = data; break;
      case 19: this.wantKidsList           = data; break;
      default: console.warn(`Unhandled typeID ${typeID}`);
    }
  }
}