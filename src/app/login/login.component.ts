import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { SharedFormFieldValidationService } from '../../shared/services/shared-form-field-validation.service';
import { first } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  hidePassword: boolean = true;
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private authService: SharedAuthService,
    private valid: SharedFormFieldValidationService,
    private router: Router
  ) {}

  // Email/Password Login
  login(): void {
    // Validation
    const validate = [
      {
        value: this.email,
        msg: 'Please enter email address',
        type: 'textBox',
        required: true,
      },
      {
        value: this.password,
        msg: 'Please enter password',
        type: 'textBox',
        required: true,
      },
    ];

    if (this.valid.validateToastr(validate) === true) {
      this.isLoading = true;
      this.error = '';

      this.authService
        .login(this.email, this.password)
       
        .pipe(first())
        
        .subscribe(
          (data) => {
            console.log('Login successful:', data);
            this.isLoading = false;
            this.valid.apiSuccessResponse('Login Successful!');
            
            // Redirect based on role
            const roleId = data.roleId;
            if (roleId === 2) {
              this.router.navigate(['/Explore-Match']);
            } else if (roleId === 1){
              this.router.navigate(['/adminDashboard']);
            }
            else {
              this.router.navigate(['/']);
            }
          },
          (error) => {
            this.isLoading = false;
            console.error('Login error:', error);
            this.valid.apiErrorResponse('Invalid email or password');
          
          }
        );
    }
  }

  // Google Sign In
  signInWithGoogle(): void {
    // Implement Google Sign-In logic here
    // This will use the googleLoginFlow from SharedAuthService
    console.log('Google Sign In clicked');
    this.valid.apiInfoResponse('Google Sign-In coming soon');
  }

  // Toggle password visibility
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

 


  // Close modal (if needed)
  closeModal(): void {
    // Implement close logic if this is a modal
    this.router.navigate(['/']);
  }
}