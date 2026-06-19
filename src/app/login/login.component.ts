import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { SharedFormFieldValidationService } from '../../shared/services/shared-form-field-validation.service';
import { first } from 'rxjs';
import { SideNavSevice } from 'src/shared/services/sidenavSevice';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { ToastrService } from 'ngx-toastr';

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
    menu: any[] = [];

  constructor(
    private authService: SharedAuthService,
    private valid: SharedFormFieldValidationService,
    private router: Router,
    private SideNavSevice: SideNavSevice,
    private global: SharedGlobalService,
    private toastr: ToastrService
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
            // console.log('Login successful:', data);
            this.isLoading = false;
            this.valid.apiSuccessResponse('Login Successful!');
            
               const roleId = this.global.getRoleId();
            // console.log('🎯 User Role ID:', roleId);

            // Load menu based on role
            this.getMenu(roleId);
            // Redirect based on role
            // const roleId = data.roleId;
            if (roleId === 3) {
              this.router.navigate(['/Explore-Match']);
            } else if (roleId === 2){
              this.router.navigate(['/adminDashboard']);
            }
               else if (roleId === 1){
              this.router.navigate(['/adminDashboard']);
            }

            else {
              this.router.navigate(['/']);
            }
          },
          (error) => {
            this.isLoading = false;
            console.error('Login error:', error);
            this.valid.apiErrorResponse(error,);
              this.valid.apiErrorResponse('incorrect Email and Password');
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

   getMenu(roleID: any): void {
    console.log('📋 Getting menu for role:', roleID);
    this.isLoading = true;

    this.SideNavSevice.getMenu(roleID).subscribe({
      next: (response: any[]) => {
        // console.log('✅ Menu Response:', response);
        this.isLoading = false;
        this.menu = response;
        this.global.saveMenuSession(response);
        this.authService.triggerMenu();
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('❌ Error fetching menu:', error);
        this.toastr.error('Failed to load menu', 'Error');
      }
    });
  }

   handleLoginSuccess(loginResponse: any): void {
    // console.log('🎉 Login Success, processing response...');
    this.isLoading = false;

    // Store user data
    localStorage.setItem('currentUser', JSON.stringify(loginResponse));
    
    this.toastr.success('Login successful!', 'Welcome');

    const roleId = loginResponse.roleID || this.global.getRoleId();
    console.log('🎯 User Role ID:', roleId);

    // Load menu based on role
    this.getMenu(roleId);

    // Role-based redirect
    setTimeout(() => {
  
            if (roleId === 3) {
              this.router.navigate(['/Explore-Match']);
            } else if (roleId === 2){
              this.router.navigate(['/adminDashboard']);
            }
            else if (roleId === 1){
              this.router.navigate(['/adminDashboard']);
            }
            else {
              this.router.navigate(['/']);
            }
    }, 500);
  }

}