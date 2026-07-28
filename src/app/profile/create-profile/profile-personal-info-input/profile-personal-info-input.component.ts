import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

// ─── Interface ────────────────────────────────────────────────────────────────
interface PersonalProfileInterface {
  userID:            number;
  spType:            string;
  fullName:          string;
  lastName:          string;
  email:             string;
  phoneNumber:       string;
  adress:            string;
  dob:               string;
  userCNIC:          string;
  countryCodeID:     number;
  cityID:            number;
  nationality:       number;
  aboutMe:           string;
  eDoc:              string;
  eDocPath:          string;
  eDocExt:           string;
  documentType:      string;
  cnicFronteDoc:     string;
  cnicFronteDocPath: string;
  cnicFronteDocExt:  string;
  cnicBackeDoc:      string;
  cnicBackeDocPath:  string;
  cnicBackeDocExt:   string;
  passporteDoc:      string;
  passporteDocPath:  string;
  passporteDocExt:   string;
  hidePhoto:         number;
  parentPhoneNo:     string;
  subTypeJson:       string;
  galleryImages:     string;
  profileID:         number;
}
interface TouchedState {
  fullName:       boolean;
  gender:         boolean;
  dob:            boolean;
  phone:          boolean;
  cnic:           boolean;
  country:        boolean;
  city:           boolean;
  nationality:    boolean;
  cast:           boolean;
  ethnicity:      boolean;
  aboutMe:        boolean;
  document:       boolean;
  gallery:        boolean;
  profilePicture: boolean;
}

@Component({
  selector: 'app-profile-personal-info-input',
  templateUrl: './profile-personal-info-input.component.html',
  styleUrls: ['./profile-personal-info-input.component.scss'],
})
export class ProfilePersonalInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() castList:        any[] = [];
  @Input() ethnicityList:   any[] = [];
  @Input() genderList:      any[] = [];
  @Input() countryList:     any[] = [];
  @Input() cityList:        any[] = [];

  // ─── Outputs to Parent ────────────────────────────────────────────────────
  @Output() countrySelected = new EventEmitter<number>();
  @Output() saveSuccess     = new EventEmitter<void>();

  // ─── Text Fields ──────────────────────────────────────────────────────────
  fullName:    string  = '';
  email:       string  = '';
  phoneNumber: string  = '';
  dob:         string  = '';
  cnic:        string  = '';
  aboutMe:     string  = '';
  hidePhoto:   boolean = false;
  profileID:   number  = 0;

  // ─── Dropdown Selections (null = "nothing selected") ──────────────────────
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
  profilePicturePreview: string    = '';
  profilePictureFile:    File | null = null;
  cnicFrontPreview:      string    = '';
  cnicBackPreview:       string    = '';
  passportPreview:       string    = '';

  // ─── Gallery ──────────────────────────────────────────────────────────────
  galleryImages: {
    galleryImageID:  number;
    galleryEdoc:     string;
    galleryEdocPath: string;
    galleryEdocExt:  string;
    preview:         string;
  }[] = [];

  originalGalleryImageIDs: number[] = [];

  // ─── Validation: touched state per field ──────────────────────────────────
  touched: TouchedState = {
    fullName:       false,
    gender:         false,
    dob:            false,
    phone:          false,
    cnic:           false,
    country:        false,
    city:           false,
    nationality:    false,
    cast:           false,
    ethnicity:      false,
    aboutMe:        false,
    document:       false,
    gallery:        false,
    profilePicture: false,
  };

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  personalPageFields: PersonalProfileInterface = {
    userID: 0, spType: 'insert', fullName: '', lastName: '',
    email: '', phoneNumber: '', adress: '', dob: '', userCNIC: '',
    countryCodeID: 0, cityID: 0, nationality: 0, aboutMe: '',
    eDoc: '', eDocPath: '', eDocExt: '', documentType: 'CNIC',
    cnicFronteDoc: '', cnicFronteDocPath: '', cnicFronteDocExt: '',
    cnicBackeDoc: '', cnicBackeDocPath: '', cnicBackeDocExt: '',
    passporteDoc: '', passporteDocPath: '', passporteDocExt: '',
    hidePhoto: 0, parentPhoneNo: '', subTypeJson: '[]',
    galleryImages: '[]', profileID: 0,
  };

  // ─── Form Fields ──────────────────────────────────────────────────────────
  personalFormFields: any[] = [
    { value: 0,        msg: '',                                   type: 'hidden',     required: false }, // 0
    { value: 'insert', msg: '',                                   type: 'hidden',     required: false }, // 1
    { value: '',       msg: 'Please enter your full name',        type: 'textbox',    required: true  }, // 2
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 3
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 4
    { value: '',       msg: 'Please enter your phone number',     type: 'textbox',    required: true  }, // 5
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 6
    { value: '',       msg: 'Please select your date of birth',   type: 'datePicker', required: true  }, // 7
    { value: '',       msg: 'Please enter your CNIC/Passport number', type: 'textbox', required: true  }, // 8
    { value: 0,        msg: 'Please select your country',         type: 'selectbox',  required: true  }, // 9
    { value: 0,        msg: 'Please select your city',            type: 'selectbox',  required: true  }, // 10
    { value: 0,        msg: 'Please select your nationality',     type: 'selectbox',  required: true  }, // 11
    { value: '',       msg: 'Please tell us about yourself',      type: 'textbox',    required: true  }, // 12
    { value: '',       msg: '',               type: 'textbox',    required: false }, // 13
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 14
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 15
    { value: 'CNIC',   msg: '',                                   type: 'hidden',     required: false }, // 16
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 17
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 18
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 19
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 20
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 21
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 22
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 23
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 24
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 25
    { value: 0,        msg: '',                                   type: 'hidden',     required: false }, // 26
    { value: '',       msg: '',                                   type: 'hidden',     required: false }, // 27
    { value: '[]',     msg: '',                                   type: 'hidden',     required: false }, // 28
    { value: '[]',     msg: '',                                   type: 'hidden',     required: false }, // 29
    { value: 0,        msg: '',                                   type: 'hidden',     required: false }, // 30
  ];

  // ─── Phone number length per country code (national number length, digits only) ──
  private countryPhoneLengths: { [code: string]: number } = {
    '+93':  9,   // Afghanistan
    '+355': 9,   // Albania
    '+213': 9,   // Algeria
    '+376': 6,   // Andorra
    '+244': 9,   // Angola
    '+54':  10,  // Argentina
    '+374': 8,   // Armenia
    '+61':  9,   // Australia
    '+43':  10,  // Austria
    '+994': 9,   // Azerbaijan
    '+973': 8,   // Bahrain
    '+880': 10,  // Bangladesh
    '+375': 9,   // Belarus
    '+32':  9,   // Belgium
    '+501': 7,   // Belize
    '+229': 8,   // Benin
    '+975': 8,   // Bhutan
    '+591': 8,   // Bolivia
    '+387': 8,   // Bosnia and Herzegovina
    '+267': 8,   // Botswana
    '+55':  11,  // Brazil
    '+673': 7,   // Brunei
    '+359': 9,   // Bulgaria
    '+226': 8,   // Burkina Faso
    '+257': 8,   // Burundi
    '+238': 7,   // Cabo Verde
    '+855': 9,   // Cambodia
    '+237': 9,   // Cameroon
    '+1':   10,  // Canada / United States
    '+236': 8,   // Central African Republic
    '+235': 8,   // Chad
    '+56':  9,   // Chile
    '+86':  11,  // China
    '+57':  10,  // Colombia
    '+269': 7,   // Comoros
    '+242': 9,   // Congo
    '+506': 8,   // Costa Rica
    '+385': 9,   // Croatia
    '+53':  8,   // Cuba
    '+357': 8,   // Cyprus
    '+420': 9,   // Czech Republic
    '+45':  8,   // Denmark
    '+253': 8,   // Djibouti
    '+593': 9,   // Ecuador
    '+20':  10,  // Egypt
    '+503': 8,   // El Salvador
    '+240': 9,   // Equatorial Guinea
    '+291': 7,   // Eritrea
    '+372': 8,   // Estonia
    '+251': 9,   // Ethiopia
    '+679': 7,   // Fiji
    '+358': 9,   // Finland
    '+33':  9,   // France
    '+995': 9,   // Georgia
    '+49':  10,  // Germany
    '+233': 9,   // Ghana
    '+30':  10,  // Greece
    '+502': 8,   // Guatemala
    '+224': 9,   // Guinea
    '+245': 7,   // Guinea-Bissau
    '+592': 7,   // Guyana
    '+509': 8,   // Haiti
    '+504': 8,   // Honduras
    '+36':  9,   // Hungary
    '+91':  10,  // India
    '+62':  10,  // Indonesia
    '+98':  10,  // Iran
    '+964': 10,  // Iraq
    '+353': 9,   // Ireland
    '+972': 9,   // Israel
    '+39':  10,  // Italy
    '+81':  10,  // Japan
    '+962': 9,   // Jordan
    '+7':   10,  // Kazakhstan / Russia
    '+254': 9,   // Kenya
    '+965': 8,   // Kuwait
    '+996': 9,   // Kyrgyzstan
    '+856': 9,   // Laos
    '+371': 8,   // Latvia
    '+961': 8,   // Lebanon
    '+266': 8,   // Lesotho
    '+231': 8,   // Liberia
    '+218': 9,   // Libya
    '+423': 7,   // Liechtenstein
    '+370': 8,   // Lithuania
    '+352': 9,   // Luxembourg
    '+60':  9,   // Malaysia
    '+960': 7,   // Maldives
    '+223': 8,   // Mali
    '+356': 8,   // Malta
    '+52':  10,  // Mexico
    '+373': 8,   // Moldova
    '+976': 8,   // Mongolia
    '+212': 9,   // Morocco
    '+258': 9,   // Mozambique
    '+95':  9,   // Myanmar
    '+977': 10,  // Nepal
    '+31':  9,   // Netherlands
    '+64':  9,   // New Zealand
    '+234': 10,  // Nigeria
    '+47':  8,   // Norway
    '+968': 8,   // Oman
    '+92':  10,  // Pakistan
    '+970': 9,   // Palestine
    '+507': 8,   // Panama
    '+595': 9,   // Paraguay
    '+51':  9,   // Peru
    '+63':  10,  // Philippines
    '+48':  9,   // Poland
    '+351': 9,   // Portugal
    '+974': 8,   // Qatar
    '+40':  9,   // Romania
    '+250': 9,   // Rwanda
    '+966': 9,   // Saudi Arabia
    '+221': 9,   // Senegal
    '+381': 9,   // Serbia
    '+65':  8,   // Singapore
    '+421': 9,   // Slovakia
    '+386': 8,   // Slovenia
    '+27':  9,   // South Africa
    '+82':  10,  // South Korea
    '+34':  9,   // Spain
    '+94':  9,   // Sri Lanka
    '+249': 9,   // Sudan
    '+46':  9,   // Sweden
    '+41':  9,   // Switzerland
    '+963': 9,   // Syria
    '+886': 9,   // Taiwan
    '+992': 9,   // Tajikistan
    '+255': 9,   // Tanzania
    '+66':  9,   // Thailand
    '+228': 8,   // Togo
    '+216': 8,   // Tunisia
    '+90':  10,  // Turkey
    '+993': 8,   // Turkmenistan
    '+256': 9,   // Uganda
    '+380': 9,   // Ukraine
    '+971': 9,   // United Arab Emirates
    '+44':  10,  // United Kingdom
    '+598': 8,   // Uruguay
    '+998': 9,   // Uzbekistan
    '+58':  10,  // Venezuela
    '+84':  9,   // Vietnam
    '+967': 9,   // Yemen
    '+260': 9,   // Zambia
    '+263': 9,   // Zimbabwe
  };

  private defaultPhoneLength = 15; // E.164 fallback max if code not found

  get currentPhoneMaxLength(): number {
    return this.countryPhoneLengths[this.selectedCountryCode] || this.defaultPhoneLength;
  }

  constructor(
    private dataService:         SharedDataService,
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

  // ─── Load User Details ────────────────────────────────────────────────────
  loadUserDetails(): void {
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) return;

    (this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`) as any)
      .subscribe((response: any) => {
        const user = Array.isArray(response) ? response[0] : response;
        if (!user) return;

        this.profileID                    = user.profileID ?? 0;
        this.personalFormFields[30].value = this.profileID;
        this.personalFormFields[1].value  = 'insert';
        this.personalPageFields.spType    = 'insert';

        // ── Text fields ──────────────────────────────────────────────────
        this.fullName    = user.fullname  || '';
        this.email       = user.email     || '';
        this.dob         = user.dob       ? user.dob.split('T')[0] : '';
        this.cnic        = user.userCNIC  || '';
        this.aboutMe     = user.aboutme   || '';
        this.hidePhoto   = user.hidePhotos === 1;
        this.phoneNumber = user.phoneNo   || user.phoneNumber || '';

        // ── Profile picture ────────────────────────────────────────────────
        if (user.eDoc && user.eDoc.trim() !== '') {
          this.profilePicturePreview = environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc;
          this.eDoc     = '';
          this.eDocPath = '';
          this.eDocExt  = '';
        }

        // ── CNIC Front ───────────────────────────────────────────────────
        if (user.cnicFrontEDoc && user.cnicFrontEDoc.trim() !== '') {
          this.cnicFrontPreview = environment.productUrl + 'assets/user-images/userCNICF/' + user.cnicFrontEDoc;
          this.documentType     = 'cnic';
          this.cnicFrontDoc     = '';
          this.cnicFrontDocPath = '';
          this.cnicFrontDocExt  = '';
        }

        // ── CNIC Back ────────────────────────────────────────────────────
        if (user.cnicBackEDoc && user.cnicBackEDoc.trim() !== '') {
          this.cnicBackPreview = environment.productUrl + 'assets/user-images/userCNICB/' + user.cnicBackEDoc;
          this.documentType    = 'cnic';
          this.cnicBackDoc     = '';
          this.cnicBackDocPath = '';
          this.cnicBackDocExt  = '';
        }

        // ── Passport ─────────────────────────────────────────────────────
        if (user.passportEDoc && user.passportEDoc.trim() !== '' && !user.passportEDoc.endsWith('/')) {
          this.passportPreview = environment.productUrl + 'assets/user-images/userPassport/' + user.passportEDoc;
          this.documentType    = 'passport';
          this.passportDoc     = '';
          this.passportDocPath = '';
          this.passportDocExt  = '';
        }

        // ── Gallery images ─────────────────────────────────────────────────
        if (user.galleryImages) {
          try {
            const serverGallery = JSON.parse(user.galleryImages);
            this.galleryImages = serverGallery
              .filter((img: any) => img.galleryeDoc && img.galleryeDoc.trim() !== '')
              .map((img: any) => ({
                galleryImageID:  img.galleryImageID ?? 0,
                galleryEdoc:     '',
                galleryEdocPath: '',
                galleryEdocExt:  '',
                preview:         environment.productUrl + 'assets/user-images/Galleryimages/' + img.galleryeDoc
              }));

            this.originalGalleryImageIDs = this.galleryImages.map(img => img.galleryImageID);

          } catch (e) {
            this.galleryImages = [];
            this.originalGalleryImageIDs = [];
          }
        }

        // ── Parse userProfile subtypes ───────────────────────────────────
        let profileItems: any[] = [];
        try { profileItems = JSON.parse(user.userProfile || '[]'); } catch { profileItems = []; }

        const getSubTypeID = (typeID: number) =>
          profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0)?.subTypeID;

        this.selectedGender    = getSubTypeID(22) ?? null;
        this.selectedCast      = getSubTypeID(1)  ?? null;
        this.selectedEthnicity = getSubTypeID(3)  ?? null;

        // ── Location object ────────────────────────────────────────────────
        const locationItem = profileItems.find(
          (p: any) => p.cityID !== undefined && p.isPreference === 0
        );

        // ── Nationality — matched against countryList's "nationality" field ─
        if (locationItem?.nationality) {
          const matchedNationality = this.countryList.find(
            (c: any) => c.nationality === locationItem.nationality
          );
          this.selectedNationality = matchedNationality ? matchedNationality.country_id : null;
        } else {
          this.selectedNationality = null;
        }

        // ── Country ─────────────────────────────────────────────────────
        const countryID = user.countryCodeID || locationItem?.countryID || null;
        this.selectedCountry = countryID;

        if (this.selectedCountry) {
          const matchedCountry = this.countryList.find(
            (c: any) => c.country_id == this.selectedCountry
          );
          if (matchedCountry) {
            this.selectedCountryCode = matchedCountry.country_code;
          }

          this.countrySelected.emit(Number(this.selectedCountry));
          setTimeout(() => {
            this.selectedCity = locationItem?.cityID || null;
            this.syncFormFields();
          }, 600);
        }

        this.syncFormFields();
      });
  }

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
    this.markTouched('country');
    this.syncFormFields();
  }

  // ─── Country Code Change (for Phone country-code dropdown) ───────────────
  onCountryCodeChange(): void {
    // Re-trim existing phone number if it now exceeds the new country's length
    this.formatPhoneNumber();
  }

  // ─── Phone Formatter — strips non-digits, truncates to country's expected length ──
  formatPhoneNumber(): void {
    let value = (this.phoneNumber || '').replace(/\D/g, '');
    const maxLen = this.currentPhoneMaxLength;
    value = value.slice(0, maxLen);
    this.phoneNumber = value;
    this.syncFormFields();
  }

  onFieldChange(): void { this.syncFormFields(); }

  // ─── Touched Helpers ────────────────────────────────────────────────────
  markTouched(field: keyof TouchedState): void {
    this.touched[field] = true;
  }

  private markAllTouched(): void {
    (Object.keys(this.touched) as (keyof TouchedState)[])
      .forEach((key) => (this.touched[key] = true));
  }

  // ─── Inline Error Getters ─────────────────────────────────────────────────
  get fullNameError(): string {
    if (!this.touched.fullName) return '';
    return this.fullName?.trim() ? '' : 'Full name is required';
  }

  get genderError(): string {
    if (!this.touched.gender) return '';
    return this.selectedGender ? '' : 'Gender is required';
  }

  get dobError(): string {
    if (!this.touched.dob) return '';
    return this.dob ? '' : 'Date of birth is required';
  }

  get phoneError(): string {
    if (!this.touched.phone) return '';
    const digits = (this.phoneNumber || '').replace(/\D/g, '');
    if (!digits) return 'Phone number is required';
    const expectedLen = this.currentPhoneMaxLength;
    if (this.countryPhoneLengths[this.selectedCountryCode] && digits.length !== expectedLen) {
      return `Phone number must be exactly ${expectedLen} digits for ${this.selectedCountryCode}`;
    }
    return '';
  }

  // CNIC/Passport — masking removed, just required-check now
  get cnicError(): string {
    if (!this.touched.cnic) return '';
    return this.cnic?.trim() ? '' : 'CNIC/Passport number is required';
  }

  get countryError(): string {
    if (!this.touched.country) return '';
    return this.selectedCountry ? '' : 'Country is required';
  }

  get cityError(): string {
    if (!this.touched.city) return '';
    return this.selectedCity ? '' : 'City is required';
  }

  get nationalityError(): string {
    if (!this.touched.nationality) return '';
    return this.selectedNationality ? '' : 'Nationality is required';
  }

  get castError(): string {
    if (!this.touched.cast) return '';
    return this.selectedCast ? '' : 'Cast is required';
  }

  get ethnicityError(): string {
    if (!this.touched.ethnicity) return '';
    return this.selectedEthnicity ? '' : 'Ethnicity is required';
  }

  get aboutMeError(): string {
    if (!this.touched.aboutMe) return '';
    return this.aboutMe?.trim() ? '' : 'About Me is required';
  }

  get profilePictureError(): string {
    if (!this.touched.profilePicture) return '';
    const hasPicture = !!(this.eDoc || this.profilePicturePreview);
    return hasPicture ? '' : 'Profile picture is required';
  }

  get documentError(): string {
    if (!this.touched.document) return '';
    const hasCnic     = (this.cnicFrontDoc && this.cnicBackDoc) || (this.cnicFrontPreview && this.cnicBackPreview);
    const hasPassport = !!(this.passportDoc || this.passportPreview);

    if (!hasCnic && !hasPassport) return 'Please upload your CNIC (front & back) or Passport';
    if (this.documentType === 'cnic' && !(this.cnicFrontDoc || this.cnicFrontPreview)) {
      return 'Please upload the front side of your CNIC';
    }
    if (this.documentType === 'cnic' && !(this.cnicBackDoc || this.cnicBackPreview)) {
      return 'Please upload the back side of your CNIC';
    }
    if (this.documentType === 'passport' && !(this.passportDoc || this.passportPreview)) {
      return 'Please upload your passport';
    }
    return '';
  }

  get galleryError(): string {
    if (!this.touched.gallery) return '';
    return this.galleryImages.length >= 3 ? '' : 'Please upload at least 3 gallery images';
  }

  private isFormValid(): boolean {
    return !this.fullNameError && !this.genderError && !this.dobError && !this.phoneError &&
           !this.cnicError && !this.countryError && !this.cityError && !this.nationalityError &&
           !this.castError && !this.ethnicityError && !this.aboutMeError &&
           !this.documentError && !this.galleryError && !this.profilePictureError;
  }

  // ─── Sync ─────────────────────────────────────────────────────────────────
  syncFormFields(): void {
    this.personalFormFields[2].value  = this.fullName;
    this.personalFormFields[4].value  = this.email;
    this.personalFormFields[5].value  = this.phoneNumber;
    this.personalFormFields[7].value  = this.dob;
    this.personalFormFields[8].value  = this.cnic;
    this.personalFormFields[9].value  = Number(this.selectedCountry)     || 0;
    this.personalFormFields[10].value = Number(this.selectedCity)        || 0;
    this.personalFormFields[11].value = Number(this.selectedNationality) || 0;
    this.personalFormFields[12].value = this.aboutMe;
    this.personalFormFields[13].value = this.eDoc;
    this.personalFormFields[14].value = environment.imageUrl + 'userProfile';
    this.personalFormFields[15].value = this.eDocExt;
    this.personalFormFields[16].value = this.documentType === 'selection' ? 'CNIC' : this.documentType.toUpperCase();
    this.personalFormFields[17].value = this.cnicFrontDoc;
    this.personalFormFields[18].value = environment.imageUrl + 'userCNICF';
    this.personalFormFields[19].value = this.cnicFrontDocExt;
    this.personalFormFields[20].value = this.cnicBackDoc;
    this.personalFormFields[21].value = environment.imageUrl + 'userCNICB';
    this.personalFormFields[22].value = this.cnicBackDocExt;
    this.personalFormFields[23].value = this.passportDoc;
    this.personalFormFields[24].value = environment.imageUrl + 'userPassport';
    this.personalFormFields[25].value = this.passportDocExt;
    this.personalFormFields[26].value = this.hidePhoto ? 1 : 0;
    this.personalFormFields[27].value = this.phoneNumber;
    this.personalFormFields[30].value = this.profileID;

    const subTypeEntries = [
      { typeID: 22, subTypeID: this.selectedGender    },
      { typeID: 1,  subTypeID: this.selectedCast      },
      { typeID: 3,  subTypeID: this.selectedEthnicity },
    ]
      .filter((item) => item.subTypeID !== '' && item.subTypeID !== null && item.subTypeID !== undefined)
      .map((item) => ({ typeID: item.typeID, subTypeID: Number(item.subTypeID) }));

    this.personalFormFields[28].value = JSON.stringify(subTypeEntries);

    // ── Determine if gallery has any actual changes (add/remove) ──────────
    const currentGalleryIDs = this.galleryImages.map(img => img.galleryImageID);
    const hasNewImage = currentGalleryIDs.includes(0);
    const idsUnchanged =
      currentGalleryIDs.length === this.originalGalleryImageIDs.length &&
      [...currentGalleryIDs].sort().every(
        (id, i) => id === [...this.originalGalleryImageIDs].sort()[i]
      );

    if (!hasNewImage && idsUnchanged) {
      this.personalFormFields[29].value = '';
    } else {
      const gallery = this.galleryImages.map((img) => ({
        galleryImageID:  img.galleryImageID,
        galleryEdoc:     img.galleryImageID === 0 ? img.galleryEdoc : '',
        galleryEdocExt:  img.galleryImageID === 0 ? img.galleryEdocExt : '',
        galleryEdocPath: img.galleryImageID === 0 ? (environment.imageUrl + 'Galleryimages') : '',
      }));
      this.personalFormFields[29].value = JSON.stringify(gallery);
    }
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  save(): void {
    this.markAllTouched();

    if (!this.isFormValid()) {
      this.toastr.warning('Fill All Required Fields');
      return;
    }

    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.');
      return;
    }

    this.syncFormFields();
    this.personalFormFields[0].value = userID;

    // ── Map formFields → pageFields ───────────────────────────────────────
    this.personalPageFields.userID            = this.personalFormFields[0].value;
    this.personalPageFields.spType            = this.personalFormFields[1].value;
    this.personalPageFields.fullName          = this.personalFormFields[2].value;
    this.personalPageFields.lastName          = this.personalFormFields[3].value;
    this.personalPageFields.email             = this.personalFormFields[4].value || '';
    this.personalPageFields.phoneNumber       = this.phoneNumber;
    this.personalPageFields.adress            = this.personalFormFields[6].value;
    this.personalPageFields.dob               = this.personalFormFields[7].value;
    this.personalPageFields.userCNIC          = this.personalFormFields[8].value;
    this.personalPageFields.countryCodeID     = Number(this.personalFormFields[9].value);
    this.personalPageFields.cityID            = Number(this.personalFormFields[10].value);
    this.personalPageFields.nationality       = Number(this.personalFormFields[11].value);
    this.personalPageFields.aboutMe           = this.personalFormFields[12].value;
    this.personalPageFields.eDoc              = this.personalFormFields[13].value;
    this.personalPageFields.eDocPath          = environment.imageUrl + 'userProfile';
    this.personalPageFields.eDocExt           = this.personalFormFields[15].value;
    this.personalPageFields.documentType      = this.personalFormFields[16].value;
    this.personalPageFields.cnicFronteDoc     = this.personalFormFields[17].value;
    this.personalPageFields.cnicFronteDocPath = environment.imageUrl + 'userCNICF';
    this.personalPageFields.cnicFronteDocExt  = this.personalFormFields[19].value;
    this.personalPageFields.cnicBackeDoc      = this.personalFormFields[20].value;
    this.personalPageFields.cnicBackeDocPath  = environment.imageUrl + 'userCNICB';
    this.personalPageFields.cnicBackeDocExt   = this.personalFormFields[22].value;
    this.personalPageFields.passporteDoc      = this.personalFormFields[23].value;
    this.personalPageFields.passporteDocPath  = environment.imageUrl + 'userPassport';
    this.personalPageFields.passporteDocExt   = this.personalFormFields[25].value;
    this.personalPageFields.hidePhoto         = this.personalFormFields[26].value;
    this.personalPageFields.parentPhoneNo     = this.phoneNumber;
    this.personalPageFields.subTypeJson       = this.personalFormFields[28].value;
    this.personalPageFields.galleryImages     = this.personalFormFields[29].value;
    this.personalPageFields.profileID         = this.personalFormFields[30].value;

    this.dataService.saveHttp(
      this.personalPageFields,
      this.personalFormFields,
      'core-api/Profile/saveUserPersonalInfo',
    ).subscribe({
      next: (response: any) => {
        const apiResponse = Array.isArray(response) ? response[0] : response;
        if (apiResponse?.includes('Success')) {
          this.valid.apiInfoResponse('Personal Profile Saved Successfully');
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
      this.markTouched('profilePicture');
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeProfilePicture(): void {
    this.profilePicturePreview = '';
    this.profilePictureFile    = null;
    this.eDoc = ''; this.eDocPath = ''; this.eDocExt = '';
    this.markTouched('profilePicture');
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
      this.markTouched('document');
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
      this.markTouched('document');
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
      this.markTouched('document');
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
        this.markTouched('gallery');
        this.syncFormFields();
      };
      reader.readAsDataURL(file);
    });
  }

  removeGalleryImage(index: number): void {
    this.galleryImages.splice(index, 1);
    this.markTouched('gallery');
    this.syncFormFields();
  }
}