import { Component, OnInit } from '@angular/core';

interface ProfileItem {
  id: number;
  name: string;
  gender: 'Female' | 'Male';
  occupation: string;
  age: number;
  location: string;
  image: string;
  matchPercentage: number;
}

interface MatchDetailItem {
  id: number;
  name: string;
  age: number;
  image: string;
  city: string;
  phone: string;
  nationality: string;
  caste: string;
  religion: string;
  sect: string;
  height: string;
  disabilities: string;
  smoke: string;
  drink: string;
  wantKids: string;
  kidsFromPrev: string;
  education: string;
  university: string;
  occupation: string;
  income: string;
}

@Component({
  selector: 'app-admin-best-match',
  templateUrl: './admin-best-match.component.html',
  styleUrls: ['./admin-best-match.component.scss']
})
export class AdminBestMatchComponent implements OnInit {

  currentView: 'grid' | 'detail' = 'grid';
  searchQuery: string = '';
  
  allProfiles: ProfileItem[] = [];
  filteredProfiles: ProfileItem[] = [];
  selectedProfile: ProfileItem | null = null;
  
  bestMatchesList: MatchDetailItem[] = [];

  ngOnInit(): void {
    this.generateMockProfiles();
    this.filteredProfiles = [...this.allProfiles];
  }

  onSearchFilter(): void {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      this.filteredProfiles = [...this.allProfiles];
      return;
    }
    this.filteredProfiles = this.allProfiles.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.location.toLowerCase().includes(query) ||
      p.occupation.toLowerCase().includes(query)
    );
  }

  // Switches view step seamlessly to profile details view representation mode
  viewProfileDetails(profile: ProfileItem): void {
    this.selectedProfile = profile;
    this.generateDetailMatchesMatrix();
    this.currentView = 'detail';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Returns state step view validation rules back to target gallery selection grid
  backToGridView(): void {
    this.currentView = 'grid';
    this.selectedProfile = null;
  }

  // Click handler trigger layer for execution of outer row redirection controls
  onRedirectToFullProfile(match: MatchDetailItem): void {
    console.log(`Redirecting context route pattern to profile target account assignment ID: ${match.id}`);
  }

  private generateMockProfiles(): void {
    const placeholderImage = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150';
    
    this.allProfiles = [
      { id: 1, name: 'Fatima Noor', gender: 'Female', occupation: 'Engineer', age: 26, location: 'Islamabad, PK', image: placeholderImage, matchPercentage: 96 },
      { id: 2, name: 'Aisha Khan', gender: 'Female', occupation: 'Doctor', age: 24, location: 'Karachi, PK', image: placeholderImage, matchPercentage: 90 },
      { id: 3, name: 'Zainab Bibi', gender: 'Female', occupation: 'Manager', age: 27, location: 'Lahore, PK', image: placeholderImage, matchPercentage: 93 },
      { id: 4, name: 'Amna Begum', gender: 'Female', occupation: 'Analyst', age: 25, location: 'Rawalpindi, PK', image: placeholderImage, matchPercentage: 89 }
    ];
  }

  private generateDetailMatchesMatrix(): void {
    const avatarThumb = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120';
    
    // Seed standard structure array containing records matching the graphic matrix setup sheet
    this.bestMatchesList = Array.from({ length: 4 }, (_, index) => ({
      id: 101 + index,
      name: 'Tayyab Ali',
      age: 26,
      image: avatarThumb,
      city: 'Islamabad',
      phone: '+92 3040695071',
      nationality: 'Pakistani',
      caste: 'Arain',
      religion: 'Islam',
      sect: 'Sunni',
      height: "5'11",
      disabilities: 'No',
      smoke: 'No',
      drink: 'No',
      wantKids: 'Yes',
      kidsFromPrev: 'No',
      education: "Bachelor's",
      university: 'Comsats University',
      occupation: 'Engineer',
      income: 'PKR 50,000/ - 100,000/month'
    }));
  }
}