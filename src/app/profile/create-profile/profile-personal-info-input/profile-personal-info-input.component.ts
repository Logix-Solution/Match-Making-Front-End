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

@Component({
  selector: 'app-profile-personal-info-input',
  templateUrl: './profile-personal-info-input.component.html',
  styleUrls: ['./profile-personal-info-input.component.scss'],
})
export class ProfilePersonalInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────────────────────────
  @Input() castList:        any[] = [];
  @Input() nationalityList: any[] = [];
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

//  Snapshot of IDs as loaded from server — used to detect "no changes"
originalGalleryImageIDs: number[] = [];

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
    { value: '',       msg: 'Please enter your CNIC number',      type: 'textbox',    required: true  }, // 8
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

        // ── Profile picture — build URL from filename ─────────────────────
        if (user.eDoc && user.eDoc.trim() !== '') {
          this.profilePicturePreview = environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc;
          console.log('✅ Profile Picture URL:', this.profilePicturePreview);
          this.eDoc     = '';
          this.eDocPath = '';
          this.eDocExt  = '';
        }

        // ── CNIC Front ───────────────────────────────────────────────────
        if (user.cnicFrontEDoc && user.cnicFrontEDoc.trim() !== '') {
          this.cnicFrontPreview = environment.productUrl + 'assets/user-images/userCNICF/' + user.cnicFrontEDoc;
           console.log('✅ CNIC Front URL:', this.cnicFrontPreview);
          this.documentType     = 'cnic';
          this.cnicFrontDoc     = '';
          this.cnicFrontDocPath = '';
          this.cnicFrontDocExt  = '';
        }

        // ── CNIC Back ────────────────────────────────────────────────────
        if (user.cnicBackEDoc && user.cnicBackEDoc.trim() !== '') {
          this.cnicBackPreview = environment.productUrl + 'assets/user-images/userCNICB/' + user.cnicBackEDoc;
           console.log('✅ CNIC Back URL:', this.cnicBackPreview);
          this.documentType    = 'cnic';
          this.cnicBackDoc     = '';
          this.cnicBackDocPath = '';
          this.cnicBackDocExt  = '';
        }

        // ── Passport ─────────────────────────────────────────────────────
        if (user.passportEDoc && user.passportEDoc.trim() !== '' && !user.passportEDoc.endsWith('/')) {
          this.passportPreview = environment.productUrl + 'assets/user-images/userPassport/' + user.passportEDoc;
           console.log('✅ Passport URL:', this.passportPreview);
          this.documentType    = 'passport';
          this.passportDoc     = '';
          this.passportDocPath = '';
          this.passportDocExt  = '';
        }

       // ── Gallery images — build each URL from filename ─────────────────
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

    // remember original IDs to detect if nothing changed at save time
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

        this.selectedGender    = getSubTypeID(22) || '';
        this.selectedCast      = getSubTypeID(1)  || '';
        this.selectedEthnicity = getSubTypeID(3)  || '';

        // ── Location object (holds cityID, countryID, and the "nationality" string) ──
        const locationItem = profileItems.find(
          (p: any) => p.cityID !== undefined && p.isPreference === 0
        );

        // ── Nationality — comes from locationItem.nationality (a string like "Pakistani"),
        // NOT a typeID/subTypeID pair, so match it against nationalityList by title ──
        if (locationItem?.nationality) {
          const matchedNationality = this.nationalityList.find(
            (n: any) => n.subTypeTitle === locationItem.nationality
          );
          this.selectedNationality = matchedNationality ? matchedNationality.subTypeID : '';
        } else {
          this.selectedNationality = '';
        }

        // ── Country — use countryCodeID directly from user object ─────────
        const countryID = user.countryCodeID || locationItem?.countryID || '';
        this.selectedCountry = countryID;

        if (this.selectedCountry) {
          // Find matching country code string for phone display
          const matchedCountry = this.countryList.find(
            (c: any) => c.country_id == this.selectedCountry
          );
          if (matchedCountry) this.selectedCountryCode = matchedCountry.country_code;

          // Emit to parent to load city list, then set city after short delay
          this.countrySelected.emit(Number(this.selectedCountry));
          setTimeout(() => {
            this.selectedCity = locationItem?.cityID || '';
            this.syncFormFields();
          }, 600);  // Wait for parent to load city list
        }

        this.syncFormFields();
      });
  }

  // ─── Document Type Switcher ───────────────────────────────────────────────
  setDocumentType(type: 'selection' | 'cnic' | 'passport'): void {
    this.documentType = type;
    this.syncFormFields();
  }

  // ─── Country Change ───────────────────────────────────────────────────────
  onCountryChange(): void {
    const country = this.countryList.find((c) => c.country_id == this.selectedCountry);
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

  onFieldChange(): void { this.syncFormFields(); }

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
    this.personalFormFields[15].value = this.eDocExt;             // no dot (set in handler)
    this.personalFormFields[16].value = this.documentType === 'selection' ? 'CNIC' : this.documentType.toUpperCase();
    this.personalFormFields[17].value = this.cnicFrontDoc;
    this.personalFormFields[18].value = environment.imageUrl + 'userCNICF';
    this.personalFormFields[19].value = this.cnicFrontDocExt;     // no dot
    this.personalFormFields[20].value = this.cnicBackDoc;
    this.personalFormFields[21].value = environment.imageUrl + 'userCNICB';
    this.personalFormFields[22].value = this.cnicBackDocExt;      // no dot
    this.personalFormFields[23].value = this.passportDoc;
    this.personalFormFields[24].value = environment.imageUrl + 'userPassport';
    this.personalFormFields[25].value = this.passportDocExt;      // no dot
    this.personalFormFields[26].value = this.hidePhoto ? 1 : 0;
    this.personalFormFields[27].value = this.phoneNumber;         // ← raw phone
    this.personalFormFields[30].value = this.profileID;

    // subTypeJson — includes countryCode as part of entries
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
  // nothing added, nothing removed, nothing changed
  this.personalFormFields[29].value = '';
} else {
  const gallery = this.galleryImages.map((img) => ({
    galleryImageID:  img.galleryImageID,
    galleryEdoc:     img.galleryImageID === 0 ? img.galleryEdoc : '',
    galleryEdocExt:  img.galleryImageID === 0 ? img.galleryEdocExt : '',   // no dot
    galleryEdocPath: img.galleryImageID === 0 ? (environment.imageUrl + 'Galleryimages') : '',
  }));
  this.personalFormFields[29].value = JSON.stringify(gallery);
}
  }

  // ─── Save ─────────────────────────────────────────────────────────────────
  save(): void {
      // console.log('profileID at save time:', this.profileID);
    if (!this.selectedCast) {
      this.toastr.warning('Please select your cast'); return;
    }
    if (!this.selectedEthnicity) {
      this.toastr.warning('Please select your ethnicity'); return;
    }
    // if (!this.eDoc) {
    //   this.toastr.warning('Please upload your profile picture'); return;
    // }
    // if (this.galleryImages.length < 3) {
    //   this.toastr.warning('Please upload at least 3 gallery images'); return;
    // }

    const hasCnic     = (this.cnicFrontDoc && this.cnicBackDoc) || (this.cnicFrontPreview && this.cnicBackPreview);
    const hasPassport = this.passportDoc || this.passportPreview;

    if (!hasCnic && !hasPassport) {
      this.toastr.warning('Please upload your CNIC (front & back) or Passport'); return;
    }
    if (this.documentType === 'cnic' && !this.cnicFrontDoc && !this.cnicFrontPreview) {
      this.toastr.warning('Please upload the front side of your CNIC'); return;
    }
    if (this.documentType === 'cnic' && !this.cnicBackDoc && !this.cnicBackPreview) {
      this.toastr.warning('Please upload the back side of your CNIC'); return;
    }
    if (this.documentType === 'passport' && !this.passportDoc && !this.passportPreview) {
      this.toastr.warning('Please upload your passport'); return;
    }

    const userID = this.sharedGlobalService.getUserID();
    if (!userID) {
      this.toastr.error('User session not found. Please login again.'); return;
    }

    this.syncFormFields();
    this.personalFormFields[0].value = userID;

    // ── Map formFields → pageFields ───────────────────────────────────────
    this.personalPageFields.userID            = this.personalFormFields[0].value;
    this.personalPageFields.spType            = this.personalFormFields[1].value;
    this.personalPageFields.fullName          = this.personalFormFields[2].value;
    this.personalPageFields.lastName          = this.personalFormFields[3].value;
    this.personalPageFields.email             = this.personalFormFields[4].value || '';
    this.personalPageFields.phoneNumber       = this.phoneNumber;                // ← raw phone only
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

    console.log('Personal PageFields:', this.personalPageFields);
    console.log('Personal FormFields:', this.personalFormFields);

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
      this.eDocExt  = file.name.split('.').pop() || '';           // ← no dot
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
      this.cnicFrontDocExt  = file.name.split('.').pop() || '';   // ← no dot
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
      this.cnicBackDocExt  = file.name.split('.').pop() || '';    // ← no dot
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
      this.passportDocExt  = file.name.split('.').pop() || '';    // ← no dot
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