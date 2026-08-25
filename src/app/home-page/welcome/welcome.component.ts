import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileCompletionService } from 'src/shared/services/profile-completion.service';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  companyName: string = "Nadia's Matchmaking Services";

  profileCompletion: number = 0;
  preferencesCompletion: number = 0;
  overallCompletion: number = 0;

  // SVG ring circumference — radius 44
  readonly circumference = 2 * Math.PI * 44;
  get dashOffset(): number {
    return this.circumference - (this.overallCompletion / 100) * this.circumference;
  }

  constructor(
    private profileCompletionService: ProfileCompletionService,
    private sharedDataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadCompletionStatus();
  }

  loadCompletionStatus(): void {
    this.profileCompletionService.calculateCompletion().subscribe({
      next: (result) => {
        this.profileCompletion     = result.profileCompletion;
        this.preferencesCompletion = result.preferencesCompletion;
        this.overallCompletion     = result.overallCompletion;

        // If they've already hit 100% (e.g. navigated back here manually), check status and send them onward
        if (this.overallCompletion === 100) {
          this.checkStatusAndNavigate();
        }
      },
      error: (err) => console.error('calculateCompletion error:', err)
    });
  }

   private checkStatusAndNavigate(): void {
    const userID = this.sharedGlobalService.getUserID();

    this.sharedDataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`).subscribe({
      next: (res: any) => {
        const userDetails = Array.isArray(res) ? res[0] : res;
        const statusTitle = userDetails?.statusTitle;

        console.log('getUserDetails response:', res);
        console.log('statusTitle:', statusTitle, '| typeof:', typeof statusTitle);

        if (statusTitle === 'Pending') {
          console.log('Condition matched: Pending → navigating to /reguestSubmited');
          this.router.navigate(['/reguestSubmited']);
        } else {
          console.log('Condition NOT matched → navigating to /Pricing-Plans');
          this.router.navigate(['/Pricing-Plans']);
        }
      },
      error: (err) => {
        console.error('getUserDetails error:', err);
        this.router.navigate(['/Pricing-Plans']);
      }
    });
  }

  goToProfile(): void {
    this.router.navigate(['/create-profile']);
  }

  goToPreferences(): void {
    this.router.navigate(['/preferences-configuration']);
  }
}