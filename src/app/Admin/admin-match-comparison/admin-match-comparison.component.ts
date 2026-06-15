import { Component , OnInit } from '@angular/core';

interface ProfileItem {
  id: number;
  name: string;
  gender: 'Female' | 'Male';
  occupation: string;
  age: number;
  location: string;
  image: string;
  matchPercentage: number;
  selected: boolean;
}

@Component({
  selector: 'app-admin-match-comparison',
  templateUrl: './admin-match-comparison.component.html',
  styleUrls: ['./admin-match-comparison.component.scss']
})
export class AdminMatchComparisonComponent implements OnInit {

  currentStep: 'selection' | 'compare' = 'selection';
  searchQuery: string = '';
  
  profiles: ProfileItem[] = [];
  selectedProfiles: ProfileItem[] = [];

  ngOnInit(): void {
    this.generateMockProfiles();
  }

  // Processes item selection updates, enforcing limits between 2 and 3 items max.
  toggleProfileSelection(profile: ProfileItem): void {
    if (profile.selected) {
      // Allow unselecting at any time
      profile.selected = false;
    } else {
      // Prevent selection if the list already contains 3 items
      if (this.getSelectedCount() >= 3) {
        alert('You can select a maximum of 3 profiles to compare at once.');
        return;
      }
      profile.selected = true;
    }
    this.updateSelectedProfilesList();
  }

  getSelectedCount(): number {
    return this.profiles.filter(p => p.selected).length;
  }

  updateSelectedProfilesList(): void {
    this.selectedProfiles = this.profiles.filter(p => p.selected);
  }

  // Navigation controller executions
  navigateToComparePage(): void {
    const totalSelectedCount = this.getSelectedCount();
    if (totalSelectedCount < 2) {
      alert('Please select a minimum of 2 profiles to initiate a side-by-side match evaluation.');
      return;
    }
    this.currentStep = 'compare';
  }

  backToSelection(): void {
    this.currentStep = 'selection';
  }

  private generateMockProfiles(): void {
    const basePic = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=80&h=80';
    
    // Seed standard structure array containing records matching the graphic matrix setup sheet
    this.profiles = [
      { id: 1, name: 'Fatima Noor', gender: 'Female', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: true },
      { id: 2, name: 'Amad Ali', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: true },
      { id: 3, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false },
      { id: 4, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false },
      { id: 5, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false },
      { id: 6, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false },
      { id: 7, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false },
      { id: 8, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false },
      { id: 9, name: 'Fatima Noor', gender: 'Male', occupation: 'Doctor', age: 23, location: 'Islamabad, PK', image: basePic, matchPercentage: 90, selected: false }
    ];

    this.updateSelectedProfilesList();
  }
}