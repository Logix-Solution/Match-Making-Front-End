import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

// ─── Interface (matches Admin/saveUserPersonalInfoByAdmin payload exactly) ──
interface AdminSaveUserPersonalInfoInterface {
  userID:             number;
  fullName:           string;
  email:              string;
  adress:             string;
  DOB:                string;
  userCNIC:           string;
  eDoc:               string;
  eDocPath:           string;
  eDocExt:            string;
  profileID:          number | null;
  aboutMe:            string;
  documentType:       string | null;
  CNICFronteDoc:      string;
  CNICFronteDocPath:  string;
  CNICFronteDocExt:   string;
  CNICBackeDoc:       string;
  CNICBackeDocPath:   string;
  CNICBackeDocExt:    string;
  PassporteDoc:       string;
  PassporteDocPath:   string;
  PassporteDocExt:    string;
  hidePhoto:          number;
  phoneNumber:        string;
  countryCodeID:      number;
  profileAttributeID: number | null;
  cityID:             number;
  nationality:        number;
  galleryImageID:     number | null;
  subTypeJson:        string;
  galleryImages:      string | null;
  newUserID:          number ;
  password:           string;
  userRoleID:         number ;
  instaLink:          string;
  faceBookLink:       string;
  tiktokLink:         string;
  snapchatLink:       string;
  parentPhoneNo:      string;
  spType:             string;
}

@Component({
  selector: 'app-admin-profile-info',
  templateUrl: './admin-profile-info.component.html',
  styleUrls: ['./admin-profile-info.component.scss'],
})
export class AdminProfileInfoComponent {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() castList:        any[] = [];
  @Input() ethnicityList:   any[] = [];
  @Input() genderList:      any[] = [];
  @Input() countryList:     any[] = [];
  @Input() cityList:        any[] = [];

  // ─── Outputs to Parent ────────────────────────────────────────────────────
  @Output() countrySelected = new EventEmitter<number>();
  @Output() saveSuccess     = new EventEmitter<void>();

  // ─── Admin-only Fields (Gmail + Password) ─────────────────────────────────
  email:    string = '';
  password: string = '';

  // ─── Text Fields ──────────────────────────────────────────────────────────
  fullName:    string  = '';
  phoneNumber: string  = '';
  dob:         string  = '';
  cnic:        string  = '';
  aboutMe:     string  = '';
  hidePhoto:   boolean = false;
  profileID:   number  = 0;

  // ─── Dropdown Selections ────────────────────────────────────────────────
  selectedGender:      any    = null;
  selectedNationality: any    = null;
  selectedCast:        any    = null;
  selectedEthnicity:   any    = null;
  selectedCountry:     any    = null;
  selectedCity:        any    = null;
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
  profilePicturePreview: string      = '';
  profilePictureFile:    File | null = null;
  cnicFrontPreview:      string      = '';
  cnicBackPreview:       string      = '';
  passportPreview:       string      = '';

  // ─── Gallery ──────────────────────────────────────────────────────────────
  galleryImages: {
    galleryImageID:  number;
    galleryEdoc:     string;
    galleryEdocPath: string;
    galleryEdocExt:  string;
    preview:         string;
  }[] = [];

  // ─── Page Fields (API payload) ────────────────────────────────────────────
personalPageFields: AdminSaveUserPersonalInfoInterface = {
  userID: 0, fullName: '', email: '', adress: '', DOB: '', userCNIC: '',
  eDoc: '', eDocPath: '', eDocExt: '', profileID: 0, aboutMe: '',
  documentType: null,
  CNICFronteDoc: '', CNICFronteDocPath: '', CNICFronteDocExt: '',
  CNICBackeDoc: '', CNICBackeDocPath: '', CNICBackeDocExt: '',
  PassporteDoc: '', PassporteDocPath: '', PassporteDocExt: '',
  hidePhoto: 0, phoneNumber: '', countryCodeID: 0, profileAttributeID: null,
  cityID: 0, nationality: 0, galleryImageID: null, subTypeJson: '[]',
  galleryImages: null, newUserID: 0, password: '', userRoleID: 3,
  instaLink: '', faceBookLink: '', tiktokLink: '', snapchatLink: '',
  parentPhoneNo: '', spType: 'INSERT',
};

  // ─── Form Fields (only email is required now) ──────────────────────────────
  personalFormFields: any[] = [
    { value: 0,        msg: '',                            type: 'hidden',     required: false }, // 0  userID
    { value: '',       msg: '',                             type: 'textbox',    required: false }, // 1  fullName
    { value: '',       msg: 'Please enter Gmail address',   type: 'textbox',    required: true  }, // 2  email
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 3  adress
    { value: '',       msg: '',                             type: 'datePicker', required: false }, // 4  DOB
    { value: '',       msg: '',                             type: 'textbox',    required: false }, // 5  userCNIC
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 6  eDoc
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 7  eDocPath
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 8  eDocExt
    { value: 0,        msg: '',                             type: 'hidden',     required: false }, // 9  profileID
    { value: '',       msg: '',                             type: 'textbox',    required: false }, // 10 aboutMe
    { value: null,     msg: '',                             type: 'hidden',     required: false }, // 11 documentType
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 12 CNICFronteDoc
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 13 CNICFronteDocPath
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 14 CNICFronteDocExt
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 15 CNICBackeDoc
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 16 CNICBackeDocPath
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 17 CNICBackeDocExt
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 18 PassporteDoc
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 19 PassporteDocPath
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 20 PassporteDocExt
    { value: 0,        msg: '',                             type: 'hidden',     required: false }, // 21 hidePhoto
    { value: '',       msg: '',                             type: 'textbox',    required: false }, // 22 phoneNumber
    { value: 0,        msg: '',                             type: 'selectbox',  required: false }, // 23 countryCodeID
    { value: null,     msg: '',                             type: 'hidden',     required: false }, // 24 profileAttributeID
    { value: 0,        msg: '',                             type: 'selectbox',  required: false }, // 25 cityID
    { value: 0,        msg: '',                             type: 'selectbox',  required: false }, // 26 nationality
    { value: null,     msg: '',                             type: 'hidden',     required: false }, // 27 galleryImageID
    { value: '[]',     msg: '',                             type: 'hidden',     required: false }, // 28 subTypeJson
    { value: null,     msg: '',                             type: 'hidden',     required: false }, // 29 galleryImages
    { value: null,     msg: '',                             type: 'hidden',     required: false }, // 30 newUserID
    { value: '',       msg: '',                             type: 'textbox',    required: false }, // 31 password
    { value: null,     msg: '',                             type: 'hidden',     required: false }, // 32 userRoleID
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 33 instaLink
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 34 faceBookLink
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 35 tiktokLink
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 36 snapchatLink
    { value: '',       msg: '',                             type: 'hidden',     required: false }, // 37 parentPhoneNo
    { value: 'INSERT', msg: '',                             type: 'hidden',     required: false }, // 38 spType
  ];

  // ─── Phone number length per country code (unchanged) ─────────────────────
  private countryPhoneLengths: { [code: string]: number } = {
    '+93':  9, '+355': 9, '+213': 9, '+376': 6, '+244': 9, '+54':  10, '+374': 8,
    '+61':  9, '+43':  10, '+994': 9, '+973': 8, '+880': 10, '+375': 9, '+32':  9,
    '+501': 7, '+229': 8, '+975': 8, '+591': 8, '+387': 8, '+267': 8, '+55':  11,
    '+673': 7, '+359': 9, '+226': 8, '+257': 8, '+238': 7, '+855': 9, '+237': 9,
    '+1':   10, '+236': 8, '+235': 8, '+56':  9, '+86':  11, '+57':  10, '+269': 7,
    '+242': 9, '+506': 8, '+385': 9, '+53':  8, '+357': 8, '+420': 9, '+45':  8,
    '+253': 8, '+593': 9, '+20':  10, '+503': 8, '+240': 9, '+291': 7, '+372': 8,
    '+251': 9, '+679': 7, '+358': 9, '+33':  9, '+995': 9, '+49':  10, '+233': 9,
    '+30':  10, '+502': 8, '+224': 9, '+245': 7, '+592': 7, '+509': 8, '+504': 8,
    '+36':  9, '+91':  10, '+62':  10, '+98':  10, '+964': 10, '+353': 9, '+972': 9,
    '+39':  10, '+81':  10, '+962': 9, '+7':   10, '+254': 9, '+965': 8, '+996': 9,
    '+856': 9, '+371': 8, '+961': 8, '+266': 8, '+231': 8, '+218': 9, '+423': 7,
    '+370': 8, '+352': 9, '+60':  9, '+960': 7, '+223': 8, '+356': 8, '+52':  10,
    '+373': 8, '+976': 8, '+212': 9, '+258': 9, '+95':  9, '+977': 10, '+31':  9,
    '+64':  9, '+234': 10, '+47':  8, '+968': 8, '+92':  10, '+970': 9, '+507': 8,
    '+595': 9, '+51':  9, '+63':  10, '+48':  9, '+351': 9, '+974': 8, '+40':  9,
    '+250': 9, '+966': 9, '+221': 9, '+381': 9, '+65':  8, '+421': 9, '+386': 8,
    '+27':  9, '+82':  10, '+34':  9, '+94':  9, '+249': 9, '+46':  9, '+41':  9,
    '+963': 9, '+886': 9, '+992': 9, '+255': 9, '+66':  9, '+228': 8, '+216': 8,
    '+90':  10, '+993': 8, '+256': 9, '+380': 9, '+971': 9, '+44':  10, '+598': 8,
    '+998': 9, '+58':  10, '+84':  9, '+967': 9, '+260': 9, '+263': 9,
  };

  private defaultPhoneLength = 15;

  get currentPhoneMaxLength(): number {
    return this.countryPhoneLengths[this.selectedCountryCode] || this.defaultPhoneLength;
  }

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr:              ToastrService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  // ─── Document Type Switcher ───────────────────────────────────────────────
  setDocumentType(type: 'selection' | 'cnic' | 'passport'): void {
    this.documentType = type;
    this.syncFormFields();
  }

  // ─── Country Change (for Country dropdown — city cascade) ────────────────
  onCountryChange(): void {
    const country = this.countryList.find((c) => c.country_id == this.selectedCountry);
    this.selectedCountryCode = country ? country.country_code : '';
    this.selectedCity = null;
    this.countrySelected.emit(this.selectedCountry);
    this.syncFormFields();
  }

  onCountryCodeChange(): void {
    this.formatPhoneNumber();
  }

  formatPhoneNumber(): void {
    let value = (this.phoneNumber || '').replace(/\D/g, '');
    const maxLen = this.currentPhoneMaxLength;
    value = value.slice(0, maxLen);
    this.phoneNumber = value;
    this.syncFormFields();
  }

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync ─────────────────────────────────────────────────────────────────
  // ─── Sync ─────────────────────────────────────────────────────────────────
  syncFormFields(): void {
    this.personalFormFields[0].value  = this.sharedGlobalService.getUserID(); // userLoginId
    this.personalFormFields[1].value  = this.fullName;
    this.personalFormFields[2].value  = this.email;
    this.personalFormFields[3].value  = '';
    this.personalFormFields[4].value  = this.dob;
    this.personalFormFields[5].value  = this.cnic;
    this.personalFormFields[6].value  = this.eDoc;
    this.personalFormFields[7].value  = environment.imageUrl + 'userProfile';
    this.personalFormFields[8].value  = this.eDocExt;
    this.personalFormFields[9].value  = this.profileID;
    this.personalFormFields[10].value = this.aboutMe;
    this.personalFormFields[11].value = this.documentType === 'selection' ? null : this.documentType.toUpperCase();
    this.personalFormFields[12].value = this.cnicFrontDoc;
    this.personalFormFields[13].value = environment.imageUrl + 'userCNICF';
    this.personalFormFields[14].value = this.cnicFrontDocExt;
    this.personalFormFields[15].value = this.cnicBackDoc;
    this.personalFormFields[16].value = environment.imageUrl + 'userCNICB';
    this.personalFormFields[17].value = this.cnicBackDocExt;
    this.personalFormFields[18].value = this.passportDoc;
    this.personalFormFields[19].value = environment.imageUrl + 'userPassport';
    this.personalFormFields[20].value = this.passportDocExt;
    this.personalFormFields[21].value = this.hidePhoto ? 1 : 0;
    this.personalFormFields[22].value = this.phoneNumber;
    this.personalFormFields[23].value = Number(this.selectedCountry) || 0;
    this.personalFormFields[24].value = null;
    this.personalFormFields[25].value = Number(this.selectedCity) || 0;
    this.personalFormFields[26].value = Number(this.selectedNationality) || 0;
    this.personalFormFields[27].value = null;

    const subTypeEntries = [
      { typeID: 22, subTypeID: this.selectedGender    },
      { typeID: 1,  subTypeID: this.selectedCast      },
      { typeID: 3,  subTypeID: this.selectedEthnicity },
    ]
      .filter((item) => item.subTypeID !== '' && item.subTypeID !== null && item.subTypeID !== undefined)
      .map((item) => ({ typeID: item.typeID, subTypeID: Number(item.subTypeID) }));
    this.personalFormFields[28].value = JSON.stringify(subTypeEntries);

    // ── Gallery images — same logic as before, just no "originalGalleryImageIDs"
    //    diffing since this admin flow never prefills existing images. Any
    //    images added by the admin get sent; empty array otherwise. ──
    if (this.galleryImages.length === 0) {
      this.personalFormFields[29].value = null;
    } else {
      const gallery = this.galleryImages.map((img) => ({
        galleryImageID:  img.galleryImageID,
        galleryEdoc:     img.galleryEdoc,
        galleryEdocExt:  img.galleryEdocExt,
        galleryEdocPath: environment.imageUrl + 'Galleryimages',
      }));
      this.personalFormFields[29].value = JSON.stringify(gallery);
    }

    this.personalFormFields[30].value = 0;   // newUserID
    this.personalFormFields[31].value = this.password;
    this.personalFormFields[32].value = 3;   // userRoleID
    this.personalFormFields[33].value = '';
    this.personalFormFields[34].value = '';
    this.personalFormFields[35].value = '';
    this.personalFormFields[36].value = '';
    this.personalFormFields[37].value = this.phoneNumber;
    this.personalFormFields[38].value = 'INSERT';
  }
  // ─── Save ─────────────────────────────────────────────────────────────────
  save(): void {
    if (!this.email?.trim()) {
      this.toastr.warning('Please enter Gmail address');
      return;
    }

    this.syncFormFields();

    this.personalPageFields.userID             = this.personalFormFields[0].value;
    this.personalPageFields.fullName            = this.personalFormFields[1].value;
    this.personalPageFields.email               = this.personalFormFields[2].value;
    this.personalPageFields.adress              = this.personalFormFields[3].value;
    this.personalPageFields.DOB                 = this.personalFormFields[4].value;
    this.personalPageFields.userCNIC            = this.personalFormFields[5].value;
    this.personalPageFields.eDoc                = this.personalFormFields[6].value;
    this.personalPageFields.eDocPath            = this.personalFormFields[7].value;
    this.personalPageFields.eDocExt             = this.personalFormFields[8].value;
    this.personalPageFields.profileID           = this.personalFormFields[9].value;
    this.personalPageFields.aboutMe             = this.personalFormFields[10].value;
    this.personalPageFields.documentType        = this.personalFormFields[11].value;
    this.personalPageFields.CNICFronteDoc       = this.personalFormFields[12].value;
    this.personalPageFields.CNICFronteDocPath   = this.personalFormFields[13].value;
    this.personalPageFields.CNICFronteDocExt    = this.personalFormFields[14].value;
    this.personalPageFields.CNICBackeDoc        = this.personalFormFields[15].value;
    this.personalPageFields.CNICBackeDocPath    = this.personalFormFields[16].value;
    this.personalPageFields.CNICBackeDocExt     = this.personalFormFields[17].value;
    this.personalPageFields.PassporteDoc        = this.personalFormFields[18].value;
    this.personalPageFields.PassporteDocPath    = this.personalFormFields[19].value;
    this.personalPageFields.PassporteDocExt     = this.personalFormFields[20].value;
    this.personalPageFields.hidePhoto           = this.personalFormFields[21].value;
    this.personalPageFields.phoneNumber         = this.personalFormFields[22].value;
    this.personalPageFields.countryCodeID       = this.personalFormFields[23].value;
    this.personalPageFields.profileAttributeID  = this.personalFormFields[24].value;
    this.personalPageFields.cityID              = this.personalFormFields[25].value;
    this.personalPageFields.nationality         = this.personalFormFields[26].value;
    this.personalPageFields.galleryImageID      = this.personalFormFields[27].value;
    this.personalPageFields.subTypeJson         = this.personalFormFields[28].value;
    this.personalPageFields.galleryImages       = this.personalFormFields[29].value;
    this.personalPageFields.newUserID           = this.personalFormFields[30].value;
    this.personalPageFields.password            = this.personalFormFields[31].value;
    this.personalPageFields.userRoleID          = this.personalFormFields[32].value;
    this.personalPageFields.instaLink           = this.personalFormFields[33].value;
    this.personalPageFields.faceBookLink        = this.personalFormFields[34].value;
    this.personalPageFields.tiktokLink          = this.personalFormFields[35].value;
    this.personalPageFields.snapchatLink        = this.personalFormFields[36].value;
    this.personalPageFields.parentPhoneNo       = this.personalFormFields[37].value;
    this.personalPageFields.spType              = this.personalFormFields[38].value;

    this.dataService.saveHttp(
      this.personalPageFields,
      this.personalFormFields,
      'core-api/Admin/saveUserPersonalInfoByAdmin',
    ).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Personal Profile Saved Successfully');
          // Pass the email forward so later steps can look this user up
          this.sharedGlobalService.setAdminEmail(this.email.trim());
          this.saveSuccess.emit();
        } else {
          this.valid.apiErrorResponse(apiResponse);
        }
      },
      error: (err: any) => console.log('Personal Save Error:', err),
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
      this.eDocPath = environment.imageUrl + 'userProfile';
      this.eDocExt  = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeProfilePicture(): void {
    this.profilePicturePreview = '';
    this.profilePictureFile    = null;
    this.eDoc = ''; this.eDocPath = ''; this.eDocExt = '';
    this.syncFormFields();
  }

  // ─── CNIC Front Handler ───────────────────────────────────────────────────
  onCnicFrontSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cnicFrontPreview = e.target.result;
      this.cnicFrontDoc     = e.target.result.split(',')[1];
      this.cnicFrontDocPath = environment.imageUrl + 'userCNICF';
      this.cnicFrontDocExt  = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeCnicFront(): void {
    this.cnicFrontPreview = ''; this.cnicFrontDoc = '';
    this.cnicFrontDocPath = ''; this.cnicFrontDocExt = '';
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
      this.cnicBackDocPath = environment.imageUrl + 'userCNICB';
      this.cnicBackDocExt  = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeCnicBack(): void {
    this.cnicBackPreview = ''; this.cnicBackDoc = '';
    this.cnicBackDocPath = ''; this.cnicBackDocExt = '';
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
      this.passportDocPath = environment.imageUrl + 'userPassport';
      this.passportDocExt  = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removePassport(): void {
    this.passportPreview = ''; this.passportDoc = '';
    this.passportDocPath = ''; this.passportDocExt = '';
    this.syncFormFields();
  }

  onGallerySelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.galleryImages.push({
          galleryImageID:  0,
          galleryEdoc:     e.target.result.split(',')[1],
          galleryEdocPath: environment.imageUrl + 'Galleryimages',
          galleryEdocExt:  file.name.split('.').pop() || '',
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