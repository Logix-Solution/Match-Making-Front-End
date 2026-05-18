import { Component } from '@angular/core';

@Component({
  selector: 'app-find-your-match',
  templateUrl: './find-your-match.component.html',
  styleUrls: ['./find-your-match.component.scss']
})
export class FindYourMatchComponent {


    filters = {
    gender: '',
    country: '',
    qualification: '',
    profession: ''
  };
 
  genderOptions = [
    { value: '', label: 'Any' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ];
 
  countryOptions = [
    { value: '', label: 'Any' },
    { value: 'pakistan', label: 'Pakistan' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'usa', label: 'United States' },
    { value: 'uae', label: 'UAE' },
    { value: 'canada', label: 'Canada' },
    { value: 'australia', label: 'Australia' },
    { value: 'saudi', label: 'Saudi Arabia' },
  ];
 
  qualificationOptions = [
    { value: '', label: 'e.g. Bachelors' },
    { value: 'matric', label: 'Matric' },
    { value: 'fsc', label: 'FSc / A-Levels' },
    { value: 'bachelors', label: 'Bachelors' },
    { value: 'masters', label: 'Masters' },
    { value: 'phd', label: 'PhD' },
    { value: 'mbbs', label: 'MBBS' },
  ];
 
  professionOptions = [
    { value: '', label: 'e.g. Dentist' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'dentist', label: 'Dentist' },
    { value: 'engineer', label: 'Engineer' },
    { value: 'teacher', label: 'Teacher' },
    { value: 'lawyer', label: 'Lawyer' },
    { value: 'business', label: 'Business' },
    { value: 'it', label: 'IT Professional' },
    { value: 'accountant', label: 'Accountant' },
  ];
 
  onSearch(): void {
    console.log('Search filters:', this.filters);
    // Emit or navigate with filters
  }
 
  onReset(): void {
    this.filters = { gender: '', country: '', qualification: '', profession: '' };
  }

}
