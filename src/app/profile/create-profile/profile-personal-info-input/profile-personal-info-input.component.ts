import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

// ─── Interface ────────────────────────────────────────────────────────────────
interface PersonalProfileInterface {
  userID: number;          // 0
  spType: string;             // 1
  fullName: string;          // 2
  lastName: string;           // 3
  email: string;              // 4
  phoneNumber: string;        // 5
  adress: string;             // 6
  dob: string;                // 7
  userCNIC: string;           // 8
  countryCodeID: number;      // 9
  cityID: number;             // 10
  nationality: number;        // 11
  aboutMe: string;            // 12
  eDoc: string;               // 13
  eDocPath: string;           // 14
  eDocExt: string;            // 15
  documentType: string;       // 16
  cnicFronteDoc: string;      // 17
  cnicFronteDocPath: string;  // 18
  cnicFronteDocExt: string;   // 19
  cnicBackeDoc: string;       // 20
  cnicBackeDocPath: string;   // 21
  cnicBackeDocExt: string;    // 22
  passporteDoc: string;       // 23
  passporteDocPath: string;   // 24
  passporteDocExt: string;    // 25
  hidePhoto: number;          // 26
  parentPhoneNo: string;      // 27
  subTypeJson: string;        // 28
  galleryImages: string;      // 29
  profileID: number           // 30
}

@Component({
  selector: 'app-profile-personal-info-input',
  templateUrl: './profile-personal-info-input.component.html',
  styleUrls: ['./profile-personal-info-input.component.scss']
})
export class ProfilePersonalInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() castList: any[]        = [];
  @Input() nationalityList: any[] = [];
  @Input() ethnicityList: any[]   = [];
  @Input() genderList: any[]      = [];
  @Input() countryList: any[]     = [];
  @Input() cityList: any[]        = [];

  // ─── Outputs to Parent ────────────────────────────────────────────────────
  @Output() countrySelected = new EventEmitter<number>();   // load cities
  @Output() saveSuccess     = new EventEmitter<void>();     // tell parent to advance stepper

  // ─── Text Fields ──────────────────────────────────────────────────────────
  fullName:   string  = '';
  email:       string  = '';
  phoneNumber: string  = '';
  dob:         string  = '';
  cnic:        string  = '';
  aboutMe:     string  = '';
  hidePhoto:   boolean = false;
  profileID:   number  = 0;

  // ─── Dropdown Selections ──────────────────────────────────────────────────
  selectedGender:      any    = '';
  selectedNationality: any    = '';
  selectedCast:        any    = '';
  selectedEthnicity:   any    = '';
  selectedCountry:     any    = '';
  selectedCity:        any    = '';
  selectedCountryCode: string = '';

  // ─── Document Fields ──────────────────────────────────────────────────────
  documentType: 'selection' | 'cnic' | 'passport' = 'selection';

  cnicFrontDoc:     string = '';
  cnicFrontDocPath: string = '';
  cnicFrontDocExt:  string = '';
  cnicBackDoc:      string = '';
  cnicBackDocPath:  string = '';
  cnicBackDocExt:   string = '';

  passportDoc:     string = '';
  passportDocPath: string = '';
  passportDocExt:  string = '';

  eDoc:     string = '';
  eDocPath: string = '';
  eDocExt:  string = '';

  // ─── Previews ─────────────────────────────────────────────────────────────
  profilePicturePreview: string = '';
  profilePictureFile: File | null = null;
  cnicFrontPreview:  string = '';
  cnicBackPreview:   string = '';
  passportPreview:   string = '';

  // ─── Gallery ──────────────────────────────────────────────────────────────
  galleryImages: {
    galleryEdoc: string;
    galleryEdocPath: string;
    galleryEdocExt: string;
    preview: string;
  }[] = [];

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  personalPageFields: PersonalProfileInterface = {
    userID:         0,
    spType:            'insert',
    fullName:         '',
    lastName:          '',
    email:             '',
    phoneNumber:       '',
    adress:            '',
    dob:               '',
    userCNIC:          '',
    countryCodeID:     0,
    cityID:            0,
    nationality:       0,
    aboutMe:           '',
    eDoc:              '',
    eDocPath:          '',
    eDocExt:           '',
    documentType:      'CNIC',
    cnicFronteDoc:     '',
    cnicFronteDocPath: '',
    cnicFronteDocExt:  '',
    cnicBackeDoc:      '',
    cnicBackeDocPath:  '',
    cnicBackeDocExt:   '',
    passporteDoc:      '',
    passporteDocPath:  '',
    passporteDocExt:   '',
    hidePhoto:         0,
    parentPhoneNo:     '',
    subTypeJson:       '[]',
    galleryImages:     '[]',
     profileID:         0,
  };

  // ─── Form Fields (for saveHttp validation) ────────────────────────────────
  personalFormFields: any[] = [
    { value: 0,        msg: '',                                   type: 'hidden',     required: false }, // 0  userID
    { value: 'insert', msg: '',                                   type: 'hidden',     required: false }, // 1  spType
    { value: '',       msg: 'Please enter your full name',        type: 'textbox',    required: true  }, // 2  fullName
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 3  lastName
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 4  email
    { value: '',       msg: 'Please enter your phone number',     type: 'textbox',    required: true  }, // 5  phoneNumber
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 6  adress
    { value: '',       msg: 'Please select your date of birth',   type: 'datePicker', required: true  }, // 7  dob
    { value: '',       msg: 'Please enter your CNIC number',      type: 'textbox',    required: true  }, // 8  userCNIC
    { value: 0,        msg: 'Please select your country',         type: 'selectbox',  required: true  }, // 9  countryCodeID
    { value: 0,        msg: 'Please select your city',            type: 'selectbox',  required: true  }, // 10 cityID
    { value: 0,        msg: 'Please select your nationality',     type: 'selectbox',  required: true  }, // 11 nationality
    { value: '',       msg: 'Please tell us about yourself',      type: 'textbox',    required: true  }, // 12 aboutMe
    { value: '',       msg: 'Please upload your profile picture', type: 'textbox',    required: true  }, // 13 eDoc
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 14 eDocPath
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 15 eDocExt
    { value: 'CNIC',   msg: '',                                   type: 'hidden',     required: false }, // 16 documentType
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 17 cnicFronteDoc
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 18 cnicFronteDocPath
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 19 cnicFronteDocExt
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 20 cnicBackeDoc
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 21 cnicBackeDocPath
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 22 cnicBackeDocExt
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 23 passporteDoc
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 24 passporteDocPath
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 25 passporteDocExt
    { value: 0,        msg: '',                                   type: 'hidden',     required: false }, // 26 hidePhoto
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 27 parentPhoneNo
    { value: '[]',     msg: '',                                   type: 'hidden',     required: false }, // 28 subTypeJson
    { value: '[]',     msg: '',                                   type: 'hidden',     required: false }, // 29 galleryImages
     { value: 0,        msg: '',                                   type: 'hidden',     required: false },//30 ProfileID
  ];

  constructor(
    private dataService:        SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr:              ToastrService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {

     const currentUser = this.sharedGlobalService.getUser();
    if (currentUser && currentUser.loginName) {
      this.email = currentUser.loginName;
    }

     this.loadUserDetails();
  }


   loadUserDetails(): void {
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) return;
 
    this.dataService.getHttp(`user-api/User/getUserDetails?UserID=${userID}`).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        this.profileID = apiResponse?.profileID ?? 0;
        this.personalFormFields[30].value = this.profileID;
      },
      error: (err: any) => {
        console.log('Get User Details Error:', err);
      }
    });
  }

  // ─── Document Type Switcher ───────────────────────────────────────────────
  setDocumentType(type: 'selection' | 'cnic' | 'passport'): void {
    this.documentType = type;
    this.syncFormFields();
  }

  // ─── Country Change ───────────────────────────────────────────────────────
  onCountryChange(): void {
    const country = this.countryList.find(c => c.country_id == this.selectedCountry);
    this.selectedCountryCode = country ? country.country_code : '';
    this.selectedCity = '';
    this.countrySelected.emit(this.selectedCountry);
    this.syncFormFields();
  }

  // ─── CNIC Formatter ───────────────────────────────────────────────────────
  formatCNIC(): void {
    let value = this.cnic.replace(/\D/g, '');
    if (value.length > 5)  value = value.slice(0, 5)  + '-' + value.slice(5);
    if (value.length > 13) value = value.slice(0, 13) + '-' + value.slice(13);
    this.cnic = value.slice(0, 15);
    this.syncFormFields();
  }

  // ─── Phone Formatter ──────────────────────────────────────────────────────
  formatPhone(): void {
    let value = this.phoneNumber.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    this.phoneNumber = value.slice(0, 12);
    this.syncFormFields();
  }

  // ─── Alias — HTML templates call onFieldChange(); TS internals call syncFormFields()
  onFieldChange(): void { this.syncFormFields(); }

  // ─── Sync all bound fields into formFields[] ─────────────────────────────
  syncFormFields(): void {
    this.personalFormFields[2].value  = this.fullName;
    this.personalFormFields[4].value  = this.email;
    this.personalFormFields[5].value  = this.phoneNumber;
    this.personalFormFields[7].value  = this.dob;
    this.personalFormFields[8].value  = this.cnic;
    this.personalFormFields[9].value  = this.selectedCountry     || 0;
    this.personalFormFields[10].value = this.selectedCity        || 0;
    this.personalFormFields[11].value = this.selectedNationality || 0;
    this.personalFormFields[12].value = this.aboutMe;
    this.personalFormFields[13].value = this.eDoc;
    this.personalFormFields[14].value = this.eDocPath;
    this.personalFormFields[15].value = this.eDocExt;
    this.personalFormFields[16].value = this.documentType === 'selection' ? 'CNIC' : this.documentType.toUpperCase();
    this.personalFormFields[17].value = this.cnicFrontDoc;
    this.personalFormFields[18].value = this.cnicFrontDocPath;
    this.personalFormFields[19].value = this.cnicFrontDocExt;
    this.personalFormFields[20].value = this.cnicBackDoc;
    this.personalFormFields[21].value = this.cnicBackDocPath;
    this.personalFormFields[22].value = this.cnicBackDocExt;
    this.personalFormFields[23].value = this.passportDoc;
    this.personalFormFields[24].value = this.passportDocPath;
    this.personalFormFields[25].value = this.passportDocExt;
    this.personalFormFields[26].value = this.hidePhoto ? 1 : 0;
    this.personalFormFields[27].value = this.phoneNumber; 

    this.personalFormFields[30].value = this.profileID;

    // subTypeJson: [genderID, castID, ethnicityID]
    const subTypeIds = [this.selectedGender, this.selectedCast, this.selectedEthnicity]
      .filter(v => v !== '' && v !== null && v !== undefined);
    this.personalFormFields[28].value =
      '[' + subTypeIds.map((v: any) => Number(v)).join(',') + ']';

    // galleryImages JSON
    const gallery = this.galleryImages.map(img => ({
      galleryEdoc:     img.galleryEdoc,
      galleryEdocPath: img.galleryEdocPath,
      galleryEdocExt:  img.galleryEdocExt,
    }));
    this.personalFormFields[29].value = JSON.stringify(gallery);
  }

 
  save(): void {

    // ─── Manual validations (dropdowns not covered by saveHttp) ──────────
    if (!this.selectedCast) {
      this.toastr.warning('Please select your cast'); return;
    }
    if (!this.selectedEthnicity) {
      this.toastr.warning('Please select your ethnicity'); return;
    }
    if (!this.eDoc) {
      this.toastr.warning('Please upload your profile picture'); return;
    }

    const hasCnic     = this.cnicFrontDoc && this.cnicBackDoc;
    const hasPassport = this.passportDoc;

    if (!hasCnic && !hasPassport) {
      this.toastr.warning('Please upload your CNIC (front & back) or Passport'); return;
    }
    if (this.documentType === 'cnic' && !this.cnicFrontDoc) {
      this.toastr.warning('Please upload the front side of your CNIC'); return;
    }
    if (this.documentType === 'cnic' && !this.cnicBackDoc) {
      this.toastr.warning('Please upload the back side of your CNIC'); return;
    }
    if (this.documentType === 'passport' && !this.passportDoc) {
      this.toastr.warning('Please upload your passport'); return;
    }

    // ─── Get userLoginId ──────────────────────────────────────────────────
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    // ─── Sync all fields ──────────────────────────────────────────────────
    this.syncFormFields();
    this.personalFormFields[0].value = userID;  // userID

    // ─── Sync formFields → pageFields ────────────────────────────────────
    this.personalPageFields.userID         = this.personalFormFields[0].value;
    this.personalPageFields.spType            = this.personalFormFields[1].value;
    this.personalPageFields.fullName         = this.personalFormFields[2].value;
    this.personalPageFields.lastName          = this.personalFormFields[3].value;
    this.personalPageFields.email             = this.personalFormFields[4].value || '';
    this.personalPageFields.phoneNumber       = this.personalFormFields[5].value;
    this.personalPageFields.adress            = this.personalFormFields[6].value;
    this.personalPageFields.dob               = this.personalFormFields[7].value;
    this.personalPageFields.userCNIC          = this.personalFormFields[8].value;
    this.personalPageFields.countryCodeID     = this.personalFormFields[9].value;
    this.personalPageFields.cityID            = this.personalFormFields[10].value;
    this.personalPageFields.nationality       = this.personalFormFields[11].value;
    this.personalPageFields.aboutMe           = this.personalFormFields[12].value;
    this.personalPageFields.eDoc              = this.personalFormFields[13].value;
    this.personalPageFields.eDocPath          = this.personalFormFields[14].value;
    this.personalPageFields.eDocExt           = this.personalFormFields[15].value;
    this.personalPageFields.documentType      = this.personalFormFields[16].value;
    this.personalPageFields.cnicFronteDoc     = this.personalFormFields[17].value;
    this.personalPageFields.cnicFronteDocPath = this.personalFormFields[18].value;
    this.personalPageFields.cnicFronteDocExt  = this.personalFormFields[19].value;
    this.personalPageFields.cnicBackeDoc      = this.personalFormFields[20].value;
    this.personalPageFields.cnicBackeDocPath  = this.personalFormFields[21].value;
    this.personalPageFields.cnicBackeDocExt   = this.personalFormFields[22].value;
    this.personalPageFields.passporteDoc      = this.personalFormFields[23].value;
    this.personalPageFields.passporteDocPath  = this.personalFormFields[24].value;
    this.personalPageFields.passporteDocExt   = this.personalFormFields[25].value;
    this.personalPageFields.hidePhoto         = this.personalFormFields[26].value;
    this.personalPageFields.parentPhoneNo     = this.personalFormFields[27].value;
    this.personalPageFields.subTypeJson       = this.personalFormFields[28].value;
    this.personalPageFields.galleryImages     = this.personalFormFields[29].value;
    this.personalPageFields.profileID         = this.personalFormFields[30].value;

    console.log('Personal PageFields:', this.personalPageFields);
    console.log('Personal FormFields:', this.personalFormFields);

    // ─── API Call ─────────────────────────────────────────────────────────
    this.dataService.saveHttp(
      this.personalPageFields,
      this.personalFormFields,
      'auth-api/saveUser'
    ).subscribe({
      next: (response: any) => {
        console.log('API Response:', response);
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Personal Profile Saved Successfully');
          this.saveSuccess.emit();   // ← tell parent to go stepper = 2
        } else {
          this.valid.apiErrorResponse(apiResponse);
        }
      },
      error: (err: any) => {
        console.log('Personal Save Error:', err);
      }
    });
  }

  // ─── Profile Picture Handler ──────────────────────────────────────────────
  onProfilePictureSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profilePictureFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.profilePicturePreview = e.target.result;
      this.eDoc     = e.target.result.split(',')[1];
      this.eDocPath = file.name;
      this.eDocExt  = '.' + (file.name.split('.').pop() || '');
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeProfilePicture(): void {
    this.profilePicturePreview = '';
    this.profilePictureFile    = null;
    this.eDoc     = '';
    this.eDocPath = '';
    this.eDocExt  = '';
    this.syncFormFields();
  }

  // ─── CNIC Front Handler ───────────────────────────────────────────────────
  onCnicFrontSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cnicFrontPreview   = e.target.result;
      this.cnicFrontDoc       = e.target.result.split(',')[1];
      this.cnicFrontDocPath   = file.name;
      this.cnicFrontDocExt    = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeCnicFront(): void {
    this.cnicFrontPreview = '';
    this.cnicFrontDoc     = '';
    this.cnicFrontDocPath = '';
    this.cnicFrontDocExt  = '';
    this.syncFormFields();
  }

  // ─── CNIC Back Handler ────────────────────────────────────────────────────
  onCnicBackSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cnicBackPreview = e.target.result;
      this.cnicBackDoc     = e.target.result.split(',')[1];
      this.cnicBackDocPath = file.name;
      this.cnicBackDocExt  = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeCnicBack(): void {
    this.cnicBackPreview = '';
    this.cnicBackDoc     = '';
    this.cnicBackDocPath = '';
    this.cnicBackDocExt  = '';
    this.syncFormFields();
  }

  // ─── Passport Handler ─────────────────────────────────────────────────────
  onPassportSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.passportPreview = e.target.result;
      this.passportDoc     = e.target.result.split(',')[1];
      this.passportDocPath = file.name;
      this.passportDocExt  = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removePassport(): void {
    this.passportPreview = '';
    this.passportDoc     = '';
    this.passportDocPath = '';
    this.passportDocExt  = '';
    this.syncFormFields();
  }

  // ─── Gallery Handlers ─────────────────────────────────────────────────────
  onGallerySelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.galleryImages.push({
          galleryEdoc:     e.target.result.split(',')[1],
          galleryEdocPath: file.name,
          galleryEdocExt:  '.' + (file.name.split('.').pop() || ''),
          preview:         e.target.result,
        });
        this.syncFormFields();
      };
      reader.readAsDataURL(file);
    });
  }

  removeGalleryImage(index: number): void {
    this.galleryImages.splice(index, 1);
    this.syncFormFields();
  }
}