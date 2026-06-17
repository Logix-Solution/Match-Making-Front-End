import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-personal-info-input',
  templateUrl: './profile-personal-info-input.component.html',
  styleUrls: ['./profile-personal-info-input.component.scss']
})
export class ProfilePersonalInfoInputComponent implements OnInit {

  // ─── Inputs from Parent ───────────────────────────────
  @Input() castList: any[] = [];
  @Input() nationalityList: any[] = [];
  @Input() ethnicityList: any[] = [];
  @Input() genderList: any[] = [];
  @Input() countryList: any[] = [];
  @Input() cityList: any[] = [];

  // ─── Outputs to Parent ────────────────────────────────
  @Output() selectionChange = new EventEmitter<any>();
  @Output() countrySelected = new EventEmitter<number>();

  // ─── Text Fields ──────────────────────────────────────
  firstName: string = '';
  email: string = '';
  phoneNumber: string = '';
  dob: string = '';
  cnic: string = '';
  aboutMe: string = '';
  hidePhoto: boolean = false;

  // ─── Dropdown Selections ──────────────────────────────
  selectedGender: any = '';
  selectedNationality: any = '';
  selectedCast: any = '';
  selectedEthnicity: any = '';
  selectedCountry: any = '';
  selectedCity: any = '';
  selectedCountryCode: string = '';

  // ─── Document Fields ──────────────────────────────────
  documentType: 'selection' | 'cnic' | 'passport' = 'selection';

  // CNIC docs
  cnicFrontDoc: string = '';
  cnicFrontDocPath: string = '';
  cnicFrontDocExt: string = '';
  cnicBackDoc: string = '';
  cnicBackDocPath: string = '';
  cnicBackDocExt: string = '';

  // Passport docs
  passportDoc: string = '';
  passportDocPath: string = '';
  passportDocExt: string = '';

  // Profile Picture doc (eDoc)
  eDoc: string = '';
  eDocPath: string = '';
  eDocExt: string = '';

  // ─── Profile Pictures ─────────────────────────────────
  profilePictures: string[] = [];

  ngOnInit() {}

  // ─── Document Type Switcher ───────────────────────────
  setDocumentType(type: 'selection' | 'cnic' | 'passport'): void {
    this.documentType = type;
    this.onFieldChange();
  }

  // ─── Country Change → emit to parent for city load ────
  onCountryChange() {
    const country = this.countryList.find(c => c.country_id == this.selectedCountry);
    this.selectedCountryCode = country ? country.country_code : '';
    this.selectedCity = '';
    this.countrySelected.emit(this.selectedCountry);
    this.onFieldChange();
  }

  // ─── CNIC Formatter ───────────────────────────────────
  formatCNIC() {
    let value = this.cnic.replace(/\D/g, '');
    if (value.length > 5)  value = value.slice(0, 5)  + '-' + value.slice(5);
    if (value.length > 13) value = value.slice(0, 13) + '-' + value.slice(13);
    this.cnic = value.slice(0, 15);
    this.onFieldChange();
  }

  // ─── Phone Formatter ──────────────────────────────────
  formatPhone() {
    let value = this.phoneNumber.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4) + '-' + value.slice(4);
    this.phoneNumber = value.slice(0, 12);
    this.onFieldChange();
  }

  // ─── Emit all fields to parent ────────────────────────
 onFieldChange() {
  this.selectionChange.emit({
    // Text
    firstName:    this.firstName,
    email:        this.email,
    phoneNumber:  this.phoneNumber,
    dob:          this.dob,
    cnic:         this.cnic,
    aboutMe:      this.aboutMe,
    hidePhoto:    this.hidePhoto,
    // Dropdowns
    gender:       this.selectedGender,
    nationality:  this.selectedNationality,
    cast:         this.selectedCast,
    ethnicity:    this.selectedEthnicity,
    country:      this.selectedCountry,
    city:         this.selectedCity,
    countryCode:  this.selectedCountryCode,
    // Profile Picture (eDoc)
    eDoc:         this.eDoc,
    eDocPath:     this.eDocPath,
    eDocExt:      this.eDocExt,
    // Document type — always send the current state
    documentType:       this.documentType === 'selection' ? 'CNIC' : this.documentType.toUpperCase(),
    cnicFrontDoc:       this.cnicFrontDoc,
    cnicFrontDocPath:   this.cnicFrontDocPath,
    cnicFrontDocExt:    this.cnicFrontDocExt,
    cnicBackDoc:        this.cnicBackDoc,
    cnicBackDocPath:    this.cnicBackDocPath,
    cnicBackDocExt:     this.cnicBackDocExt,
    passportDoc:        this.passportDoc,
    passportDocPath:    this.passportDocPath,
    passportDocExt:     this.passportDocExt,
    // Gallery
     galleryImages: this.galleryImages.map(img => ({
      galleryEdoc:     img.galleryEdoc,
      galleryEdocPath: img.galleryEdocPath,
      galleryEdocExt:  img.galleryEdocExt,
    })),
  });
}

  // ─── Profile Picture ──────────────────────────────────
profilePicturePreview: string = '';
profilePictureFile: File | null = null;

// ─── CNIC Docs ────────────────────────────────────────
cnicFrontPreview: string = '';
cnicBackPreview: string = '';

// ─── Passport Doc ─────────────────────────────────────
passportPreview: string = '';

// ─── Profile Picture Handler ──────────────────────────
onProfilePictureSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  this.profilePictureFile = file;
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.profilePicturePreview = e.target.result;
    this.eDoc     = e.target.result.split(',')[1];
    this.eDocPath = file.name;
    this.eDocExt  = '.' + (file.name.split('.').pop() || '');
    this.onFieldChange();
  };
  reader.readAsDataURL(file);
}

// ─── CNIC Front Handler ───────────────────────────────
onCnicFrontSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.cnicFrontPreview   = e.target.result;
    this.cnicFrontDoc       = e.target.result.split(',')[1];
    this.cnicFrontDocPath   = file.name;
    this.cnicFrontDocExt    = file.name.split('.').pop() || '';
    this.onFieldChange();
  };
  reader.readAsDataURL(file);
}

// ─── CNIC Back Handler ────────────────────────────────
onCnicBackSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.cnicBackPreview    = e.target.result;
    this.cnicBackDoc        = e.target.result.split(',')[1];
    this.cnicBackDocPath    = file.name;
    this.cnicBackDocExt     = file.name.split('.').pop() || '';
    this.onFieldChange();
  };
  reader.readAsDataURL(file);
}

// ─── Passport Handler ─────────────────────────────────
onPassportSelected(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e: any) => {
    this.passportPreview    = e.target.result;
    this.passportDoc        = e.target.result.split(',')[1];
    this.passportDocPath    = file.name;
    this.passportDocExt     = file.name.split('.').pop() || '';
    this.onFieldChange();
  };
  reader.readAsDataURL(file);
}

// ─── Remove Handlers ──────────────────────────────────
removeProfilePicture() {
  this.profilePicturePreview = '';
  this.profilePictureFile = null;
  this.eDoc = '';
  this.eDocPath = '';
  this.eDocExt = '';
  this.onFieldChange();
}

removeCnicFront() {
  this.cnicFrontPreview = '';
  this.cnicFrontDoc = '';
  this.cnicFrontDocPath = '';
  this.cnicFrontDocExt = '';
  this.onFieldChange();
}

removeCnicBack() {
  this.cnicBackPreview = '';
  this.cnicBackDoc = '';
  this.cnicBackDocPath = '';
  this.cnicBackDocExt = '';
  this.onFieldChange();
}

removePassport() {
  this.passportPreview = '';
  this.passportDoc = '';
  this.passportDocPath = '';
  this.passportDocExt = '';
  this.onFieldChange();
}

// ─── Gallery Images ───────────────────────────────────
galleryImages: { galleryEdoc: string; galleryEdocPath: string; galleryEdocExt: string; preview: string }[] = [];

onGallerySelected(event: Event) {
  const files = (event.target as HTMLInputElement).files;
  if (!files) return;
  Array.from(files).forEach(file => {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.galleryImages.push({
        galleryEdoc:     e.target.result.split(',')[1],
        galleryEdocPath: file.name,
        galleryEdocExt:  '.' + (file.name.split('.').pop() || ''),
        preview:         e.target.result
      });
      this.onFieldChange();
    };
    reader.readAsDataURL(file);
  });
}

removeGalleryImage(index: number) {
  this.galleryImages.splice(index, 1);
  this.onFieldChange();
}
}