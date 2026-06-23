import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
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
  constructor(private dataService: SharedDataService) {}
  isModalOpen = false;
  totalUser = 0;
  pendingApproval = 0;
  activeMatches = 0;
  interestedClients = 0;
  selectedCountryFilter = 'All';


    countryProfiles: { country_name: string; totalProfiles: number; profilePercentage: string }[] = [];
  donutColors = ['#dc3545', '#fd7e14', '#0dcaf0', '#198754', '#6f42c1', '#20c997'];
  donutSegments: { color: string; dasharray: string; dashoffset: string; country: string }[] = [];

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
    this.getDashboardCounts();
       this.getCountryWiseProfiles();
  }

  getDashboardCounts(): void {
    this.dataService.getHttp('core-api/Admin/getDashboardCounts', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res[0] : res;
        this.totalUser        = data.totalUser        ?? 0;
        this.pendingApproval  = data.pendingApproval  ?? 0;
        this.activeMatches    = data.activeMatches    ?? 0;
        this.interestedClients= data.interestedClients?? 0;
      },
      error: (err) => console.error('Dashboard counts error:', err)
    });
  }


   getCountryWiseProfiles(): void {
    this.dataService.getHttp('core-api/Admin/getCountryWiseProfile', {}).subscribe({
      next: (res: any) => {
        this.countryProfiles = Array.isArray(res) ? res : [];
        this.buildDonut();
      },
      error: (err) => console.error('Country wise profile error:', err)
    });
  }

  buildDonut(): void {
    const circumference = 100;
    let offset = 25; // start from top
    this.donutSegments = this.countryProfiles.map((item, i) => {
      const pct = parseFloat(item.profilePercentage);
      const dash = `${pct.toFixed(2)} ${(circumference - pct).toFixed(2)}`;
      const seg = {
        color:       this.donutColors[i % this.donutColors.length],
        dasharray:   dash,
        dashoffset:  String(circumference - offset + circumference),
        country:     item.country_name
      };
      offset += pct;
      return seg;
    });
  }

  openModalWithFilter(country: string): void {
    this.selectedCountryFilter = country;
    if (country === 'All') {
      this.filteredProfiles = [...this.allProfiles];
   } else {
      this.filteredProfiles = this.allProfiles.filter(
        p => p.nationality.toLowerCase() === country.toLowerCase()
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