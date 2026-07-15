import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../shared//services/shared-global.service';

@Component({
  selector: 'app-pricing-plans',
  templateUrl: './pricing-plans.component.html',
  styleUrls: ['./pricing-plans.component.scss']
})
export class PricingPlansComponent implements OnInit {

  isLoading: boolean = true;
  hasActivePlan: boolean = false;
  profileID: number | null = null;

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
  ) {}

  ngOnInit(): void {
    this.checkActivePlan();
  }

  checkActivePlan(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
      next: (res: any) => {
        const user = Array.isArray(res) ? res[0] : res;
        this.profileID = user?.profileID ?? null;

        if (this.profileID) {
          this.getUserActivePlanStatus(this.profileID);
        } else {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('getUserDetails error:', err);
        this.isLoading = false;
      }
    });
  }

  getUserActivePlanStatus(profileID: number): void {
    this.dataService.getHttp(`core-api/Profile/getUserActivePlans?profileID=${profileID}`, {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res[0] : res;
        this.hasActivePlan = data?.planStatus === 1;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('getUserActivePlans error:', err);
        this.isLoading = false;
      }
    });
  }
}