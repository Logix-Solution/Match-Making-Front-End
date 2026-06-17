import { Component } from '@angular/core';

@Component({
  selector: 'app-explore-matching',
  templateUrl: './explore-matching.component.html',
  styleUrls: ['./explore-matching.component.scss']
})
export class ExploreMatchingComponent {
  // Flag to manage dynamic modal display states natively
  isProfileModalOpen: boolean = false;
  selectedProfile: any = null;

  // Mock data payload matching your interface attributes
  recommendedMatches = [
    { name: 'Aisha Khizer', gender: 'Female', age: 25, height: "5'5", status: 'Unmarried', location: 'London', job: 'Software Engineer', matchScore: 85, img: 'assets/images/profile1.png' },
    { name: 'Fatima', gender: 'Female', age: 30, height: "6'1", status: 'Married', location: 'Pakistan', job: 'Product Manager', matchScore: 70, img: 'assets/images/profile1.png' },
    { name: 'Lily Chen', gender: 'Female', age: 28, height: "5'2", status: 'Single', location: 'San Francisco', job: 'UX Designer', matchScore: 90, img: 'assets/images/profile1.png' }
  ];

  openProfileDetails(profile: any): void {
    this.selectedProfile = profile;
    this.isProfileModalOpen = true;
  }

  closeProfileDetails(): void {
    this.isProfileModalOpen = false;
    this.selectedProfile = null;
  }
}