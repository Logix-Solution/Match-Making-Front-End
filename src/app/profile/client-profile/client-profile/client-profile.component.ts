import { Component } from '@angular/core';

interface InfoItem {
  description: string;
  value: string;
}

interface ProfileSection {
  title: string;
  iconClass: string;
  items: InfoItem[];
}

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'],
})
export class ClientProfileComponent {
  // Left Sidebar Static Metrics Block
  profileHeader = {
    name: 'Salif Saif',
    age: '26 years',
    location: 'Islamabad, Pakistan.',
    occupation: 'Engineer',
    status: 'Un Married',
    avatar: '../../../../assets/images/client-profile-main.png'
  };

  aboutText1: string = `British Pakistani Sunni Muslim, age 29 , 5ft4, West York's. Language: English and Urdu. Educated at (BGGS). BA in Criminology and Criminal Justice (Hons) and a Master's in Counter-Terrorism. Completed around two years of an Alimah course at Girls College, Burnley. Currently working in a school. Observes hijab and modest dress. Tries to read 5 daily salah, Alhamdulillah. Celebrates khatam and Milaad. Cheerful, friendly and family-oriented with a balanced understanding of deen and dunya. Enjoys spending time with family and friends. Willing to meet initially in the presence of a mehram. Seeking a practicing Muslim (preferably Pakistani), aged 27+, with good character, ...see more`;

  // Right-Side Segmented Sections Loops Matrix Data
  profileSections: ProfileSection[] = [
    {
      title: 'Education & Career',
      iconClass: 'bi bi-briefcase',
      items: [
        { description: 'Education Level', value: "Bachelor's" },
        { description: 'High School', value: 'Model High School' },
        { description: 'University Name(s)', value: 'Comsats University' },
        { description: 'Occupation', value: 'Engineer' },
        { description: 'Monthly Income', value: 'PKR 50,000 – 100,000/month' }
      ]
    },
    {
      title: 'Personal Information',
      iconClass: 'bi bi-person',
      items: [
        { description: 'Gender', value: 'Male' },
        { description: 'Phone Number', value: '+92 3040695071' },
        { description: 'Nationality', value: 'Pakistan' },
        { description: 'Caste', value: 'Arain' },
        { description: 'Ethnicity', value: 'Punjabi' }
      ]
    },
    {
      title: 'Lifestyle',
      iconClass: 'bi bi-cup-hot',
      items: [
        { description: 'Smoke', value: 'No' },
        { description: 'Drink Alcohol', value: 'No' },
        { description: 'Wants Kids', value: 'Yes' },
        { description: 'Kids from Previous Marriage', value: 'No' },
        { description: 'Social Media', value: 'Abcs@123' }
      ]
    },
    {
      title: 'Appearance',
      iconClass: 'bi bi-eye',
      items: [
        { description: 'Height', value: "5'7\"" },
        { description: 'Body Type', value: 'Average' },
        { description: 'Skin Tone', value: 'Medium' },
        { description: 'Disabilities', value: 'No' },
        { description: '-----', value: '---' }
      ]
    },
    {
      title: 'Religion',
      iconClass: 'bi bi-moon',
      items: [
        { description: 'Religion', value: 'Islam' },
        { description: 'Sect', value: 'Sunni' },
        { description: 'Importance of Religion', value: 'Very Important' }
      ]
    },
    {
      title: 'Family',
      iconClass: 'bi bi-people',
      items: [
        { description: "Father's Occupation", value: 'Farmer' },
        { description: 'Housing Situation', value: 'Own House' },
        { description: 'No. of Siblings', value: '2' },
        { description: 'Willing to Relocate', value: 'Yes' },
        { description: "Mother's Occupation", value: 'Homemaker' },
        { description: 'Family Involvement Preference', value: 'Highly Involved' },
        { description: 'Settle Down Timeline', value: 'Within 1 Year' }
      ]
    }
  ];

  // Utility method to slice lists out easily inside dynamic template layouts
  getSectionByTitle(title: string): ProfileSection | undefined {
    return this.profileSections.find(s => s.title === title);
  }
}