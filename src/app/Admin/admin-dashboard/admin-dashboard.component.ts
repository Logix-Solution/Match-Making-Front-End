import { Component,OnInit} from '@angular/core';
interface UserProfile {
  name: string;
  age: number;
  status: string;
  avatarUrl: string;
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
  kidsFromPrevious: string;
  education: string;
  university: string;
  occupation: string;
  income: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  isModalOpen = false;
  selectedCountryFilter = 'All';

  // Mock array simulating records displayed in mockup view
  allProfiles: UserProfile[] = [
    {
      name: 'Tayyab Ali',
      age: 26,
      status: 'UN MARRIED',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
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
      kidsFromPrevious: 'No',
      education: "Bachelor's",
      university: 'Comsats University',
      occupation: 'Engineer',
      income: 'PKR 50,000/ - 100,000/month'
    },
    {
      name: 'Tayyab Ali',
      age: 26,
      status: 'UN MARRIED',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120',
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
      kidsFromPrevious: 'No',
      education: "Bachelor's",
      university: 'Comsats University',
      occupation: 'Engineer',
      income: 'PKR 50,000/ - 100,000/month'
    }
  ];

  filteredProfiles: UserProfile[] = [];

  ngOnInit(): void {
    this.filteredProfiles = [...this.allProfiles];
  }

  openModalWithFilter(country: string): void {
    this.selectedCountryFilter = country;
    if (country === 'All') {
      this.filteredProfiles = [...this.allProfiles];
    } else {
      // Filter the data down by target selection rule
      this.filteredProfiles = this.allProfiles.filter(
        p => p.nationality.toLowerCase() === 'pakistani'
      );
    }
    this.isModalOpen = true;
    document.body.classList.add('modal-open');
  }

  closeModal(): void {
    this.isModalOpen = false;
    document.body.classList.remove('modal-open');
  }
}