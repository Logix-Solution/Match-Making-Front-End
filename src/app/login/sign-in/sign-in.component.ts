import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  // Form Field Models
  fullName: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';

  // UI State Properties
  hidePassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialization logic if required
  }

  /**
   * Toggles password field visibility between masked text and plain text
   */
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Handles traditional Email/Password profile registration workflow
   */
  createProfile(): void {
    // Basic structural validation check
    if (!this.fullName || !this.email || !this.phone || !this.password) {
      console.warn('Please fill out all required registration fields.');
      return;
    }

    this.isLoading = true;
    console.log('Registering user profile...', {
      fullName: this.fullName,
      email: this.email,
      phone: this.phone
    });

    // Simulated API Callback Request
    setTimeout(() => {
      this.isLoading = false;
      // Navigate to onboarding dashboard or trigger success modal handling here
    }, 2000);
  }

  /**
   * Triggers Google OpenID Connect Authentication
   */
  signUpWithGoogle(): void {
    console.log('Initiating Google authentication sign up pipeline...');
    // Connect your Angular Fire / Auth Service payload here
  }

  /**
   * Closes active component overlay modal
   */
  closeModal(): void {
    console.log('Dismissing profile modal.');
    // Insert event emitter or service modal dismiss triggers here
    this.router.navigate(['/login']);
  }


}