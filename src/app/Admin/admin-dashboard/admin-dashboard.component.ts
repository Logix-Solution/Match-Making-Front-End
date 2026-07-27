import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { environment } from 'src/envirnment/environment';
import { Subscription } from 'rxjs';
import { SharedNotificationService, AppNotification } from '../../../shared/services/shared-notification.service';
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

interface SignupGrowthPoint {
  monthName: string;
  year: string;
  totalUsers: string;
}

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  constructor(private dataService: SharedDataService,
     private notificationService: SharedNotificationService,
  ) {}
  isModalOpen = false;
  totalUser = 0;
  pendingApproval = 0;
  activeMatches = 0;
  interestedClients = 0;
  selectedCountryFilter = 'All';

   recentActivity: AppNotification[] = [];
  allActivity: AppNotification[] = [];
  isActivityModalOpen = false;
  private activitySub!: Subscription;


    countryProfiles: { country_name: string; totalProfiles: number; profilePercentage: string;  country_id: number; }[] = [];
  donutColors = ['#dc3545', '#fd7e14', '#0dcaf0', '#198754', '#6f42c1', '#20c997'];
  donutSegments: { color: string; dasharray: string; dashoffset: string; country: string; countryId: number }[] = [];

  // Mock array simulating records displayed in mockup view
//  filteredProfiles: UserProfile[] = [];

  filteredProfiles: UserProfile[] = [];

  // ─── User Signups Growth ────────────────────────────────────────────────
  signupGrowth: SignupGrowthPoint[] = [];
  signupChartPath = '';
  signupChartAreaPath = '';
  signupChartMonths: string[] = [];

 ngOnInit(): void {
   
    this.getDashboardCounts();
       this.getCountryWiseProfiles();
    this.getUserSignupGrowth();
     this.loadActivity(); 
  }

   private loadActivity(): void {
    this.activitySub = this.notificationService.notifications$.subscribe((list) => {
      this.recentActivity = list.slice(0, 2);
      this.allActivity = list;
    });
  }

  timeAgo(date: Date): string {
    return this.notificationService.timeAgo(date);
  }

  openActivityModal(): void {
    this.isActivityModalOpen = true;
    document.body.classList.add('modal-open');
  }

  closeActivityModal(): void {
    this.isActivityModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  readActivity(item: AppNotification): void {
    this.notificationService.markAsRead(item.id);
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
  let offset = 25;
  this.donutSegments = this.countryProfiles.map((item, i) => {
    const pct = parseFloat(item.profilePercentage);
    const dash = `${pct.toFixed(2)} ${(circumference - pct).toFixed(2)}`;
    const seg = {
      color:       this.donutColors[i % this.donutColors.length],
      dasharray:   dash,
      dashoffset:  String(circumference - offset + circumference),
      country:     item.country_name,
      countryId:   item.country_id,          // ← added
    };
    offset += pct;
    return seg;
  });
}

  // ─── User Signups Growth ────────────────────────────────────────────────
  getUserSignupGrowth(): void {
    this.dataService.getHttp('core-api/Admin/getUserSignUpGrowth', {}).subscribe({
      next: (res: any) => {
        const data: SignupGrowthPoint[] = Array.isArray(res) ? res : [];
        // API returns most-recent-first; chart reads left→right chronologically
        this.signupGrowth = [...data].reverse();
        this.signupChartMonths = this.signupGrowth.map((m) => m.monthName);
        this.buildSignupChart();
      },
      error: (err) => console.error('User signup growth error:', err),
    });
  }

  private buildSignupChart(): void {
    if (!this.signupGrowth.length) {
      this.signupChartPath = '';
      this.signupChartAreaPath = '';
      return;
    }

    const width = 600;
    const height = 200;
    const topPadding = 20;
    const bottomPadding = 20;

    const values = this.signupGrowth.map((m) => +m.totalUsers || 0);
    const maxVal = Math.max(...values, 1); // avoid divide-by-zero if all are 0

    const stepX = this.signupGrowth.length > 1 ? width / (this.signupGrowth.length - 1) : width;

    const points = values.map((val, i) => {
      const x = i * stepX;
      const y = height - bottomPadding - (val / maxVal) * (height - topPadding - bottomPadding);
      return { x, y };
    });

    // Smooth line through points (simple quadratic-ish join, matching original style)
    let line = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      line += ` Q ${midX} ${prev.y} ${curr.x} ${curr.y}`;
    }

    this.signupChartPath = line;
    this.signupChartAreaPath = `${line} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;
  }

 openModalWithFilter(country: string, countryID: number = 0): void {
  this.selectedCountryFilter = country;
  this.isModalOpen = true;
  document.body.classList.add('modal-open');
  this.filteredProfiles = []; // clear previous results

  if (!countryID) return; // nothing to fetch if no ID

  this.dataService.getHttp(`core-api/Admin/getUserDetailsByCountry`, { countryID }).subscribe({
    next: (res: any) => {
      const data = Array.isArray(res) ? res : [];
      this.filteredProfiles = data.map((u: any) => {
        let profile: any[] = [];
        try { profile = JSON.parse(u.userProfile || '[]'); } catch { profile = []; }

        const get = (typeID: number) =>
          profile.find((p: any) => p.typeID === typeID && p.isPreference === 0)?.subTypeTitle || 'N/A';

        const getInstitute = (typeID: number) =>
          profile.find((p: any) => p.typeID === typeID && p.isPreference === 0)?.instituteName || 'N/A';

        const location = profile.find((p: any) => p.cityID !== undefined && p.isPreference === 0);

        const dob = u.dob ? new Date(u.dob) : null;
        const age = dob ? new Date().getFullYear() - dob.getFullYear() : 0;

        return {
          name:             `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          age,
          status:           get(10),
          //  environment.productUrl + 'assets/user-images/Galleryimages/' + img.galleryeDoc
          avatarUrl:       environment.productUrl + 'assets/user-images/userProfile/' + (u.eDoc || ''),
          city:             location?.cityName    || 'N/A',
          phone:            u.phoneNo             || 'N/A',
          nationality:      location?.countryName || 'N/A',
          caste:            get(1),
          religion:         get(7),
          sect:             get(8),
          height:           get(26),
          disabilities:     get(30),
          smoke:            get(17),
          drink:            get(18),
          wantKids:         get(19),
          kidsFromPrevious: 'N/A',
          education:        get(4),
          university:       getInstitute(4),
          occupation:       get(5),
          income:           get(6),
        } as UserProfile;
      });
    },
    error: (err) => console.error('getUserDetailsByCountry error:', err)
  });
}

  closeModal(): void {
    this.isModalOpen = false;
    document.body.classList.remove('modal-open');
  }
    ngOnDestroy(): void {
    this.activitySub?.unsubscribe();
  }

}