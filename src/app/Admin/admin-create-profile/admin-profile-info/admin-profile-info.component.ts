import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';
import { Router } from '@angular/router';

// ─── Interface ────────────────────────────────────────────────────────────────
interface AdminPersonalProfileInterface {
  userID: number;
  spType: string;
  fullName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  adress: string;
  dob: string;
  userCNIC: string;
  countryCodeID: number;
  cityID: number;
  nationality: number;
  aboutMe: string;
  eDoc: string;
  eDocPath: string;
  eDocExt: string;
  documentType: string;
  cnicFronteDoc: string;
  cnicFronteDocPath: string;
  cnicFronteDocExt: string;
  cnicBackeDoc: string;
  cnicBackeDocPath: string;
  cnicBackeDocExt: string;
  passporteDoc: string;
  passporteDocPath: string;
  passporteDocExt: string;
  hidePhoto: number;
  parentPhoneNo: string;
  subTypeJson: string;
  galleryImages: string;
  profileID: number;
}

@Component({
  selector: 'app-admin-profile-info',
  templateUrl: './admin-profile-info.component.html',
  styleUrls: ['./admin-profile-info.component.scss'],
})
export class AdminProfileInfoComponent implements OnInit {
  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() castList: any[] = [];
  @Input() ethnicityList: any[] = [];
  @Input() genderList: any[] = [];
  @Input() countryList: any[] = [];
  @Input() cityList: any[] = [];

  // ─── Outputs to Parent ────────────────────────────────────────────────────
  @Output() countrySelected = new EventEmitter<number>();
  @Output() saveSuccess = new EventEmitter<void>();

  // ─── Email Gate Modal (opens first, on page load) ────────────────────────
  showEmailModal: boolean = true;
  modalEmail: string = '';
  modalPassword: string = '';

  // ─── Working userID for this admin-managed profile ────────────────────────
  // NOT the logged-in admin's own userID — this is the target user's ID,
  // resolved via getUserDetailsByAdmin after the modal step.
  adminUserID: number = 0;

  // ─── Text Fields ──────────────────────────────────────────────────────────
  fullName: string = '';
  email: string = '';
  phoneNumber: string = '';
  dob: string = '';
  cnic: string = '';
  aboutMe: string = '';
  hidePhoto: boolean = false;
  profileID: number = 0;

  // ─── Dropdown Selections (null = "nothing selected") ──────────────────────
  selectedGender: any = null;
  selectedNationality: any = null;
  selectedCast: any = null;
  selectedEthnicity: any = null;
  selectedCountry: any = null;
  selectedCity: any = null;
  selectedCountryCode: string = '';

  // ─── Document Fields ──────────────────────────────────────────────────────
  documentType: 'selection' | 'cnic' | 'passport' = 'selection';

  cnicFrontDoc: string = '';
  cnicFrontDocPath: string = '';
  cnicFrontDocExt: string = '';
  cnicBackDoc: string = '';
  cnicBackDocPath: string = '';
  cnicBackDocExt: string = '';

  passportDoc: string = '';
  passportDocPath: string = '';
  passportDocExt: string = '';

  eDoc: string = '';
  eDocPath: string = '';
  eDocExt: string = '';

  // ─── Previews ─────────────────────────────────────────────────────────────
  profilePicturePreview: string = '';
  profilePictureFile: File | null = null;
  cnicFrontPreview: string = '';
  cnicBackPreview: string = '';
  passportPreview: string = '';

  // ─── Gallery ──────────────────────────────────────────────────────────────
  galleryImages: {
    galleryImageID: number;
    galleryEdoc: string;
    galleryEdocPath: string;
    galleryEdocExt: string;
    preview: string;
  }[] = [];

  originalGalleryImageIDs: number[] = [];

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  personalPageFields: AdminPersonalProfileInterface = {
    userID: 0,
    spType: 'insert',
    fullName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    adress: '',
    dob: '',
    userCNIC: '',
    countryCodeID: 0,
    cityID: 0,
    nationality: 0,
    aboutMe: '',
    eDoc: '',
    eDocPath: '',
    eDocExt: '',
    documentType: 'CNIC',
    cnicFronteDoc: '',
    cnicFronteDocPath: '',
    cnicFronteDocExt: '',
    cnicBackeDoc: '',
    cnicBackeDocPath: '',
    cnicBackeDocExt: '',
    passporteDoc: '',
    passporteDocPath: '',
    passporteDocExt: '',
    hidePhoto: 0,
    parentPhoneNo: '',
    subTypeJson: '[]',
    galleryImages: '[]',
    profileID: 0,
  };

  // ─── Form Fields (no validation msgs enforced — save() no longer checks these) ──
  personalFormFields: any[] = [
    { value: 0, msg: '', type: 'hidden', required: false }, // 0  userID
    { value: 'insert', msg: '', type: 'hidden', required: false }, // 1  spType
    { value: '', msg: '', type: 'textbox', required: false }, // 2  fullName
    { value: '', msg: '', type: 'hidden', required: false }, // 3  lastName
    { value: '', msg: '', type: 'hidden', required: false }, // 4  email
    { value: '', msg: '', type: 'textbox', required: false }, // 5  phoneNumber
    { value: '', msg: '', type: 'hidden', required: false }, // 6  adress
    { value: '', msg: '', type: 'datePicker', required: false }, // 7  dob
    { value: '', msg: '', type: 'textbox', required: false }, // 8  userCNIC
    { value: 0, msg: '', type: 'selectbox', required: false }, // 9  countryCodeID
    { value: 0, msg: '', type: 'selectbox', required: false }, // 10 cityID
    { value: 0, msg: '', type: 'selectbox', required: false }, // 11 nationality
    { value: '', msg: '', type: 'textbox', required: false }, // 12 aboutMe
    { value: '', msg: '', type: 'textbox', required: false }, // 13 eDoc
    { value: '', msg: '', type: 'hidden', required: false }, // 14 eDocPath
    { value: '', msg: '', type: 'hidden', required: false }, // 15 eDocExt
    { value: 'CNIC', msg: '', type: 'hidden', required: false }, // 16 documentType
    { value: '', msg: '', type: 'hidden', required: false }, // 17 cnicFronteDoc
    { value: '', msg: '', type: 'hidden', required: false }, // 18 cnicFronteDocPath
    { value: '', msg: '', type: 'hidden', required: false }, // 19 cnicFronteDocExt
    { value: '', msg: '', type: 'hidden', required: false }, // 20 cnicBackeDoc
    { value: '', msg: '', type: 'hidden', required: false }, // 21 cnicBackeDocPath
    { value: '', msg: '', type: 'hidden', required: false }, // 22 cnicBackeDocExt
    { value: '', msg: '', type: 'hidden', required: false }, // 23 passporteDoc
    { value: '', msg: '', type: 'hidden', required: false }, // 24 passporteDocPath
    { value: '', msg: '', type: 'hidden', required: false }, // 25 passporteDocExt
    { value: 0, msg: '', type: 'hidden', required: false }, // 26 hidePhoto
    { value: '', msg: '', type: 'hidden', required: false }, // 27 parentPhoneNo
    { value: '[]', msg: '', type: 'hidden', required: false }, // 28 subTypeJson
    { value: '[]', msg: '', type: 'hidden', required: false }, // 29 galleryImages
    { value: 0, msg: '', type: 'hidden', required: false }, // 30 profileID
  ];

  // ─── Phone number length per country code (national number length, digits only) ──
  private countryPhoneLengths: { [code: string]: number } = {
    '+93': 9,
    '+355': 9,
    '+213': 9,
    '+376': 6,
    '+244': 9,
    '+54': 10,
    '+374': 8,
    '+61': 9,
    '+43': 10,
    '+994': 9,
    '+973': 8,
    '+880': 10,
    '+375': 9,
    '+32': 9,
    '+501': 7,
    '+229': 8,
    '+975': 8,
    '+591': 8,
    '+387': 8,
    '+267': 8,
    '+55': 11,
    '+673': 7,
    '+359': 9,
    '+226': 8,
    '+257': 8,
    '+238': 7,
    '+855': 9,
    '+237': 9,
    '+1': 10,
    '+236': 8,
    '+235': 8,
    '+56': 9,
    '+86': 11,
    '+57': 10,
    '+269': 7,
    '+242': 9,
    '+506': 8,
    '+385': 9,
    '+53': 8,
    '+357': 8,
    '+420': 9,
    '+45': 8,
    '+253': 8,
    '+593': 9,
    '+20': 10,
    '+503': 8,
    '+240': 9,
    '+291': 7,
    '+372': 8,
    '+251': 9,
    '+679': 7,
    '+358': 9,
    '+33': 9,
    '+995': 9,
    '+49': 10,
    '+233': 9,
    '+30': 10,
    '+502': 8,
    '+224': 9,
    '+245': 7,
    '+592': 7,
    '+509': 8,
    '+504': 8,
    '+36': 9,
    '+91': 10,
    '+62': 10,
    '+98': 10,
    '+964': 10,
    '+353': 9,
    '+972': 9,
    '+39': 10,
    '+81': 10,
    '+962': 9,
    '+7': 10,
    '+254': 9,
    '+965': 8,
    '+996': 9,
    '+856': 9,
    '+371': 8,
    '+961': 8,
    '+266': 8,
    '+231': 8,
    '+218': 9,
    '+423': 7,
    '+370': 8,
    '+352': 9,
    '+60': 9,
    '+960': 7,
    '+223': 8,
    '+356': 8,
    '+52': 10,
    '+373': 8,
    '+976': 8,
    '+212': 9,
    '+258': 9,
    '+95': 9,
    '+977': 10,
    '+31': 9,
    '+64': 9,
    '+234': 10,
    '+47': 8,
    '+968': 8,
    '+92': 10,
    '+970': 9,
    '+507': 8,
    '+595': 9,
    '+51': 9,
    '+63': 10,
    '+48': 9,
    '+351': 9,
    '+974': 8,
    '+40': 9,
    '+250': 9,
    '+966': 9,
    '+221': 9,
    '+381': 9,
    '+65': 8,
    '+421': 9,
    '+386': 8,
    '+27': 9,
    '+82': 10,
    '+34': 9,
    '+94': 9,
    '+249': 9,
    '+46': 9,
    '+41': 9,
    '+963': 9,
    '+886': 9,
    '+992': 9,
    '+255': 9,
    '+66': 9,
    '+228': 8,
    '+216': 8,
    '+90': 10,
    '+993': 8,
    '+256': 9,
    '+380': 9,
    '+971': 9,
    '+44': 10,
    '+598': 8,
    '+998': 9,
    '+58': 10,
    '+84': 9,
    '+967': 9,
    '+260': 9,
    '+263': 9,
  };

  private defaultPhoneLength = 15; // E.164 fallback max if code not found

  get currentPhoneMaxLength(): number {
    return (
      this.countryPhoneLengths[this.selectedCountryCode] ||
      this.defaultPhoneLength
    );
  }

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private toastr: ToastrService,
    private valid: SharedFormFieldValidationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Nothing loads until the email modal is completed — page opens on the modal.
    this.showEmailModal = true;
  }

  // ─── MODAL: Save Gmail + Password, then resolve the target user ───────────
  // ─── MODAL: Save Gmail + Password, then resolve the target user ───────────
  onModalSave(): void {
    if (!this.modalEmail || !this.modalPassword) {
      this.toastr.warning('Please enter Gmail and Password');
      return;
    }

    const payload = {
      fullName: '',
      email: this.modalEmail,
      phoneNumber: '',
      countryCodeID: 10,
      password: this.modalPassword,
      spType: 'insert',
    };

    console.log('saveUserByAdmin Payload:', payload);

    this.dataService
      .postDirect('core-api/Admin/saveUserByAdmin', payload)
      .subscribe({
        next: (response: any) => {
          console.log('saveUserByAdmin Response:', response);
          this.sharedGlobalService.setAdminEmail(this.modalEmail);
          console.log(
            'Admin email saved in SharedGlobalService:',
            this.modalEmail,
          );
          this.checkUserByEmail(this.modalEmail);
        },
        error: (err: any) => {
          console.log('saveUserByAdmin Error:', err);
          this.toastr.error('Failed to save user. Please try again.');
        },
      });
  }

  // ─── Look up the target user by email (existing or freshly created) ───────
  checkUserByEmail(email: string): void {
    this.dataService
      .getHttp(`core-api/Admin/getUserDetailsByAdmin?email=${email}`)
      .subscribe({
        next: (response: any) => {
          console.log('getUserDetailsByAdmin Response:', response);
          const user = Array.isArray(response) ? response[0] : response;
          if (user && user.userID) {
            this.applyUserData(user);
          } else {
            this.resetForNewUser(email);
          }
          this.showEmailModal = false;
        },
        error: (err: any) => {
          console.log('getUserDetailsByAdmin Error:', err);
          this.resetForNewUser(email);
          this.showEmailModal = false;
        },
      });
  }

  // ─── Populate the whole form from an existing user record ─────────────────
  private applyUserData(user: any): void {
    this.adminUserID = user.userID;
    this.profileID = user.profileID ?? 0;

    this.personalFormFields[30].value = this.profileID;
    this.personalFormFields[1].value = 'insert';
    this.personalPageFields.spType = 'insert';

    // ── Text fields ──────────────────────────────────────────────────────
    this.fullName = user.fullname || '';
    this.email = user.email || '';
    this.dob = user.dob ? user.dob.split('T')[0] : '';
    this.cnic = user.userCNIC || '';
    this.aboutMe = user.aboutme || '';
    this.hidePhoto = user.hidePhotos === 1;
    this.phoneNumber = user.phoneNo || user.phoneNumber || '';

    // ── Profile picture ────────────────────────────────────────────────
    if (user.eDoc && user.eDoc.trim() !== '') {
      this.profilePicturePreview =
        environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc;
      this.eDoc = '';
      this.eDocPath = '';
      this.eDocExt = '';
    }

    // ── CNIC Front ───────────────────────────────────────────────────
    if (user.cnicFrontEDoc && user.cnicFrontEDoc.trim() !== '') {
      this.cnicFrontPreview =
        environment.productUrl +
        'assets/user-images/userCNICF/' +
        user.cnicFrontEDoc;
      this.documentType = 'cnic';
      this.cnicFrontDoc = '';
      this.cnicFrontDocPath = '';
      this.cnicFrontDocExt = '';
    }

    // ── CNIC Back ────────────────────────────────────────────────────
    if (user.cnicBackEDoc && user.cnicBackEDoc.trim() !== '') {
      this.cnicBackPreview =
        environment.productUrl +
        'assets/user-images/userCNICB/' +
        user.cnicBackEDoc;
      this.documentType = 'cnic';
      this.cnicBackDoc = '';
      this.cnicBackDocPath = '';
      this.cnicBackDocExt = '';
    }

    // ── Passport ─────────────────────────────────────────────────────
    if (
      user.passportEDoc &&
      user.passportEDoc.trim() !== '' &&
      !user.passportEDoc.endsWith('/')
    ) {
      this.passportPreview =
        environment.productUrl +
        'assets/user-images/userPassport/' +
        user.passportEDoc;
      this.documentType = 'passport';
      this.passportDoc = '';
      this.passportDocPath = '';
      this.passportDocExt = '';
    }

    // ── Gallery images ─────────────────────────────────────────────────
    if (user.galleryImages) {
      try {
        const serverGallery = JSON.parse(user.galleryImages);
        this.galleryImages = serverGallery
          .filter(
            (img: any) => img.galleryeDoc && img.galleryeDoc.trim() !== '',
          )
          .map((img: any) => ({
            galleryImageID: img.galleryImageID ?? 0,
            galleryEdoc: '',
            galleryEdocPath: '',
            galleryEdocExt: '',
            preview:
              environment.productUrl +
              'assets/user-images/Galleryimages/' +
              img.galleryeDoc,
          }));
        this.originalGalleryImageIDs = this.galleryImages.map(
          (img) => img.galleryImageID,
        );
      } catch (e) {
        this.galleryImages = [];
        this.originalGalleryImageIDs = [];
      }
    } else {
      this.galleryImages = [];
      this.originalGalleryImageIDs = [];
    }

    // ── Parse userProfile subtypes ───────────────────────────────────
    let profileItems: any[] = [];
    try {
      profileItems = JSON.parse(user.userProfile || '[]');
    } catch {
      profileItems = [];
    }

    const getSubTypeID = (typeID: number) =>
      profileItems.find((p: any) => p.typeID === typeID && p.isPreference === 0)
        ?.subTypeID;

    this.selectedGender = getSubTypeID(22) ?? null;
    this.selectedCast = getSubTypeID(1) ?? null;
    this.selectedEthnicity = getSubTypeID(3) ?? null;

    // ── Location object ────────────────────────────────────────────────
    const locationItem = profileItems.find(
      (p: any) => p.cityID !== undefined && p.isPreference === 0,
    );

    // ── Nationality — matched against countryList's "nationality" field ─
    if (locationItem?.nationality) {
      const matchedNationality = this.countryList.find(
        (c: any) => c.nationality === locationItem.nationality,
      );
      this.selectedNationality = matchedNationality
        ? matchedNationality.country_id
        : null;
    } else {
      this.selectedNationality = null;
    }

    // ── Country ─────────────────────────────────────────────────────
    const countryID = user.countryCodeID || locationItem?.countryID || null;
    this.selectedCountry = countryID;

    if (this.selectedCountry) {
      const matchedCountry = this.countryList.find(
        (c: any) => c.country_id == this.selectedCountry,
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
  }

  // ─── Reset to a blank form for a brand-new email ───────────────────────────
  private resetForNewUser(email: string): void {
    this.adminUserID = 0;
    this.profileID = 0;
    this.email = email;

    this.fullName = '';
    this.phoneNumber = '';
    this.dob = '';
    this.cnic = '';
    this.aboutMe = '';
    this.hidePhoto = false;

    this.selectedGender = null;
    this.selectedNationality = null;
    this.selectedCast = null;
    this.selectedEthnicity = null;
    this.selectedCountry = null;
    this.selectedCity = null;
    this.selectedCountryCode = '';

    this.documentType = 'selection';
    this.cnicFrontDoc = '';
    this.cnicFrontDocPath = '';
    this.cnicFrontDocExt = '';
    this.cnicBackDoc = '';
    this.cnicBackDocPath = '';
    this.cnicBackDocExt = '';
    this.passportDoc = '';
    this.passportDocPath = '';
    this.passportDocExt = '';
    this.eDoc = '';
    this.eDocPath = '';
    this.eDocExt = '';

    this.profilePicturePreview = '';
    this.cnicFrontPreview = '';
    this.cnicBackPreview = '';
    this.passportPreview = '';

    this.galleryImages = [];
    this.originalGalleryImageIDs = [];

    this.syncFormFields();
  }

  // ─── Document Type Switcher ───────────────────────────────────────────────
  setDocumentType(type: 'selection' | 'cnic' | 'passport'): void {
    this.documentType = type;
    this.syncFormFields();
  }

  // ─── Country Change (for Country dropdown — city cascade) ────────────────
  onCountryChange(): void {
    const country = this.countryList.find(
      (c) => c.country_id == this.selectedCountry,
    );
    this.selectedCountryCode = country ? country.country_code : '';

    this.selectedCity = null;
    this.countrySelected.emit(this.selectedCountry);
    this.syncFormFields();
  }

  // ─── Country Code Change (for Phone country-code dropdown) ───────────────
  onCountryCodeChange(): void {
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

  onFieldChange(): void {
    this.syncFormFields();
  }

  // ─── Sync ─────────────────────────────────────────────────────────────────
  syncFormFields(): void {
    this.personalFormFields[2].value = this.fullName;
    this.personalFormFields[4].value = this.email;
    this.personalFormFields[5].value = this.phoneNumber;
    this.personalFormFields[7].value = this.dob;
    this.personalFormFields[8].value = this.cnic;
    this.personalFormFields[9].value = Number(this.selectedCountry) || 0;
    this.personalFormFields[10].value = Number(this.selectedCity) || 0;
    this.personalFormFields[11].value = Number(this.selectedNationality) || 0;
    this.personalFormFields[12].value = this.aboutMe;
    this.personalFormFields[13].value = this.eDoc;
    this.personalFormFields[14].value = environment.imageUrl + 'userProfile';
    this.personalFormFields[15].value = this.eDocExt;
    this.personalFormFields[16].value =
      this.documentType === 'selection'
        ? 'CNIC'
        : this.documentType.toUpperCase();
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
      { typeID: 22, subTypeID: this.selectedGender },
      { typeID: 1, subTypeID: this.selectedCast },
      { typeID: 3, subTypeID: this.selectedEthnicity },
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

    this.personalFormFields[28].value = JSON.stringify(subTypeEntries);

    // ── Determine if gallery has any actual changes (add/remove) ──────────
    const currentGalleryIDs = this.galleryImages.map(
      (img) => img.galleryImageID,
    );
    const hasNewImage = currentGalleryIDs.includes(0);
    const idsUnchanged =
      currentGalleryIDs.length === this.originalGalleryImageIDs.length &&
      [...currentGalleryIDs]
        .sort()
        .every((id, i) => id === [...this.originalGalleryImageIDs].sort()[i]);

    if (!hasNewImage && idsUnchanged) {
      this.personalFormFields[29].value = '';
    } else {
      const gallery = this.galleryImages.map((img) => ({
        galleryImageID: img.galleryImageID,
        galleryEdoc: img.galleryImageID === 0 ? img.galleryEdoc : '',
        galleryEdocExt: img.galleryImageID === 0 ? img.galleryEdocExt : '',
        galleryEdocPath:
          img.galleryImageID === 0
            ? environment.imageUrl + 'Galleryimages'
            : '',
      }));
      this.personalFormFields[29].value = JSON.stringify(gallery);
    }
  }

  // ─── Save (no field validation — sends whatever is currently in the form) ──
  save(): void {
    const userID = this.adminUserID;
    if (!userID) {
      this.toastr.error('User not identified. Please verify the email again.');
      return;
    }

    this.syncFormFields();
    this.personalFormFields[0].value = userID;

    // ── Map formFields → pageFields ───────────────────────────────────────
    this.personalPageFields.userID = this.personalFormFields[0].value;
    this.personalPageFields.spType = this.personalFormFields[1].value;
    this.personalPageFields.fullName = this.personalFormFields[2].value;
    this.personalPageFields.lastName = this.personalFormFields[3].value;
    this.personalPageFields.email = this.personalFormFields[4].value || '';
    this.personalPageFields.phoneNumber = this.phoneNumber;
    this.personalPageFields.adress = this.personalFormFields[6].value;
    this.personalPageFields.dob = this.personalFormFields[7].value;
    this.personalPageFields.userCNIC = this.personalFormFields[8].value;
    this.personalPageFields.countryCodeID = Number(
      this.personalFormFields[9].value,
    );
    this.personalPageFields.cityID = Number(this.personalFormFields[10].value);
    this.personalPageFields.nationality = Number(
      this.personalFormFields[11].value,
    );
    this.personalPageFields.aboutMe = this.personalFormFields[12].value;
    this.personalPageFields.eDoc = this.personalFormFields[13].value;
    this.personalPageFields.eDocPath = environment.imageUrl + 'userProfile';
    this.personalPageFields.eDocExt = this.personalFormFields[15].value;
    this.personalPageFields.documentType = this.personalFormFields[16].value;
    this.personalPageFields.cnicFronteDoc = this.personalFormFields[17].value;
    this.personalPageFields.cnicFronteDocPath =
      environment.imageUrl + 'userCNICF';
    this.personalPageFields.cnicFronteDocExt =
      this.personalFormFields[19].value;
    this.personalPageFields.cnicBackeDoc = this.personalFormFields[20].value;
    this.personalPageFields.cnicBackeDocPath =
      environment.imageUrl + 'userCNICB';
    this.personalPageFields.cnicBackeDocExt = this.personalFormFields[22].value;
    this.personalPageFields.passporteDoc = this.personalFormFields[23].value;
    this.personalPageFields.passporteDocPath =
      environment.imageUrl + 'userPassport';
    this.personalPageFields.passporteDocExt = this.personalFormFields[25].value;
    this.personalPageFields.hidePhoto = this.personalFormFields[26].value;
    this.personalPageFields.parentPhoneNo = this.phoneNumber;
    this.personalPageFields.subTypeJson = this.personalFormFields[28].value;
    this.personalPageFields.galleryImages = this.personalFormFields[29].value;
    this.personalPageFields.profileID = this.personalFormFields[30].value;

    console.log('Personal PageFields:', this.personalPageFields);
    console.log('Personal FormFields:', this.personalFormFields);

    this.dataService
      .saveHttp(
        this.personalPageFields,
        this.personalFormFields,
        'core-api/Profile/saveUserPersonalInfo',
      )
      .subscribe({
        next: (response: any) => {
          console.log('saveUserPersonalInfo Response:', response);
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
      this.eDoc = e.target.result.split(',')[1];
      this.eDocPath = environment.imageUrl + 'userProfile';
      this.eDocExt = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeProfilePicture(): void {
    this.profilePicturePreview = '';
    this.profilePictureFile = null;
    this.eDoc = '';
    this.eDocPath = '';
    this.eDocExt = '';
    this.syncFormFields();
  }

  // ─── CNIC Front Handler ───────────────────────────────────────────────────
  onCnicFrontSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cnicFrontPreview = e.target.result;
      this.cnicFrontDoc = e.target.result.split(',')[1];
      this.cnicFrontDocPath = environment.imageUrl + 'userCNICF';
      this.cnicFrontDocExt = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeCnicFront(): void {
    this.cnicFrontPreview = '';
    this.cnicFrontDoc = '';
    this.cnicFrontDocPath = '';
    this.cnicFrontDocExt = '';
    this.syncFormFields();
  }

  // ─── CNIC Back Handler ────────────────────────────────────────────────────
  onCnicBackSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.cnicBackPreview = e.target.result;
      this.cnicBackDoc = e.target.result.split(',')[1];
      this.cnicBackDocPath = environment.imageUrl + 'userCNICB';
      this.cnicBackDocExt = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removeCnicBack(): void {
    this.cnicBackPreview = '';
    this.cnicBackDoc = '';
    this.cnicBackDocPath = '';
    this.cnicBackDocExt = '';
    this.syncFormFields();
  }

  // ─── Passport Handler ─────────────────────────────────────────────────────
  onPassportSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.passportPreview = e.target.result;
      this.passportDoc = e.target.result.split(',')[1];
      this.passportDocPath = environment.imageUrl + 'userPassport';
      this.passportDocExt = file.name.split('.').pop() || '';
      this.syncFormFields();
    };
    reader.readAsDataURL(file);
  }

  removePassport(): void {
    this.passportPreview = '';
    this.passportDoc = '';
    this.passportDocPath = '';
    this.passportDocExt = '';
    this.syncFormFields();
  }

  onGallerySelected(event: Event): void {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.galleryImages.push({
          galleryImageID: 0,
          galleryEdoc: e.target.result.split(',')[1],
          galleryEdocPath: environment.imageUrl + 'Galleryimages',
          galleryEdocExt: file.name.split('.').pop() || '',
          preview: e.target.result,
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

  closeModal(): void {
    this.showEmailModal = false;
    this.router.navigate(['/adminDashboard']); // adjust path to your actual route
  }
}
