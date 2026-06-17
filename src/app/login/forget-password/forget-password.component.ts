import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedAuthService } from 'src/shared/services/shared-auth.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  email: string = '';
  isLoading: boolean = false;

 constructor(
    private authService: SharedAuthService,
    private valid: SharedFormFieldValidationService,
    private router: Router
  ) {}

  ngOnInit(): void { }

  /**
   * Submits the password verification logic 
   */
  submitResetRequest(): void {
    if (!this.email) {
      console.warn('Please provide a valid account email address.');
      return;
    }

    this.isLoading = true;
    console.log('Sending password reset link to:', this.email);

    // Mock network request pipeline handling
    setTimeout(() => {
      this.isLoading = false;
      // Trigger success alert window or navigate back step here
    }, 1800);
  }

 closeModal(): void {
    // Implement close logic if this is a modal
    this.router.navigate(['/login']);
  }
}