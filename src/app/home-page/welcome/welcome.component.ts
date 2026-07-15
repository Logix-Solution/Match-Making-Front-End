import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileCompletionService } from 'src/shared/services/profile-completion.service';

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

        // If they've already hit 100% (e.g. navigated back here manually), send them onward
        if (this.overallCompletion === 100) {
          this.router.navigate(['/Pricing-Plans']);
        }
      },
      error: (err) => console.error('calculateCompletion error:', err)
    });
  }

  goToProfile(): void {
    this.router.navigate(['/create-profile']);
  }

  goToPreferences(): void {
    this.router.navigate(['/preferences-configuration']);
  }
}