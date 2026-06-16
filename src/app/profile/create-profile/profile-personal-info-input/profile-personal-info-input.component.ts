import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-personal-info-input',
  templateUrl: './profile-personal-info-input.component.html',
  styleUrls: ['./profile-personal-info-input.component.scss']
})
export class ProfilePersonalInfoInputComponent implements OnInit {

  // Inputs from parent
  @Input() castList: any[] = [];
  @Input() nationalityList: any[] = [];
  @Input() ethnicityList: any[] = [];
  @Input() genderList: any[] = [];

    @Input() countryList: any[] = [];
  @Input() cityList: any[] = [];

 
  @Output() selectionChange = new EventEmitter<any>();

  @Output() countrySelected = new EventEmitter<number>();

  // Selected values
  selectedGender: any = '';
  selectedNationality: any = '';
  selectedCast: any = '';
  selectedEthnicity: any = '';

  selectedCountry: any = '';
  selectedCity: any = '';
  selectedCountryCode: string = '';


  documentType: 'selection' | 'cnic' | 'passport' = 'selection';

  ngOnInit() {}

  setDocumentType(type: 'selection' | 'cnic' | 'passport'): void {
    this.documentType = type;
  }


  onCountryChange() {
    const country = this.countryList.find(c => c.country_id == this.selectedCountry);
    this.selectedCountryCode = country ? country.country_code : '';
    this.selectedCity = '';
    this.countrySelected.emit(this.selectedCountry); // triggers getCities() in parent
    this.onFieldChange();
  }

  onFieldChange() {
    this.selectionChange.emit({
      gender:      this.selectedGender,
      nationality: this.selectedNationality,
      cast:        this.selectedCast,
      ethnicity:   this.selectedEthnicity,
       country:       this.selectedCountry,
      city:          this.selectedCity,
      countryCode:   this.selectedCountryCode,
    });
  }
}