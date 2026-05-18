import { Component } from '@angular/core';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'],
})
export class ClientProfileComponent {
  personalInfoList: any = [
    {
      description: 'Gender',
      value: 'Male',
    },
    {
      description: 'Phone Number',
      value: '+923040695071',
    },
    {
      description: 'Nationality',
      value: 'Pakistani',
    },
    {
      description: 'Cast',
      value: 'Arain',
    },
    {
      description: 'Ethnicity',
      value: 'Punjabi',
    },
  ];

  educationInfoList: any = [
    {
      description: 'Education Level',
      value: 'Bacholars',
    },
    {
      description: 'High School',
      value: 'Model High School',
    },
    {
      description: 'University Name',
      value: 'Comsats University',
    },
    {
      description: 'Occupation',
      value: 'Engineer',
    },
    {
      description: 'Monthly Income',
      value: 'PKR 50,000 - 100,000 / month',
    },
  ];
}
