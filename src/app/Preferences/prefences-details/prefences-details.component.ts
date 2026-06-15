import { Component } from '@angular/core';

interface PreferenceItem {
  label: string;
  value: string;
}

@Component({
  selector: 'app-prefences-details',
  templateUrl: './prefences-details.component.html',
  styleUrls: ['./prefences-details.component.scss']
})
export class PrefencesDetailsComponent {



    // ── Personal Information ──────────────────────────────────────────────────
  personalInfo: PreferenceItem[] = [
    { label: 'Gender',         value: 'Male' },
    { label: 'Age Range',      value: '19 to 25' },
    { label: 'Phone Number',   value: '+92 3040695071' },
    { label: 'Country/City',   value: 'Pakistan, Rawalpindi' },
    { label: 'Nationality',    value: 'Pakistan' },
    { label: 'Caste',          value: 'Arain' },
    { label: 'Ethnicity',      value: 'Punjabi' },
  ];
 
  // ── Appearance ────────────────────────────────────────────────────────────
  appearanceInfo: PreferenceItem[] = [
    { label: 'Minimum Height',                    value: "5'7\"" },
    { label: 'Maximum Height',                    value: "6'0\"" },
    { label: 'Body Type',                         value: 'Slim, Average' },
    { label: 'Skin Tone',                         value: 'Fair' },
    { label: 'Open to Partner With Disabilities?',value: 'No' },
    { label: '-----',                             value: '---' },
    { label: '-----',                             value: '---' },
  ];
 
  // ── Education & Career ────────────────────────────────────────────────────
  educationInfo: PreferenceItem[] = [
    { label: 'Minimum Education Level', value: "Bachelor's" },
    { label: 'Occupation',              value: 'Engineer' },
    { label: 'Minimum Monthly Income',  value: 'PKR 50,000 – 100,000/month' },
  ];
 
  // ── Lifestyle ─────────────────────────────────────────────────────────────
  lifestyleInfo: PreferenceItem[] = [
    { label: 'Smoking Acceptable?',        value: 'No' },
    { label: 'Drink Alcohol Acceptable?',  value: 'No' },
    { label: 'Partner Want Kids?',         value: 'Yes' },
  ];
 
  // ── Religion ──────────────────────────────────────────────────────────────
  religionInfo: PreferenceItem[] = [
    { label: 'Religion',               value: 'Islam' },
    { label: 'Sect',                   value: 'Sunni' },
    { label: 'Importance of Religion', value: 'Very Important' },
  ];
 
  additionalInfo = 'no';
  
}
