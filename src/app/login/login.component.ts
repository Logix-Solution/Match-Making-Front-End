import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { SharedFormFieldValidationService } from '../../shared/services/shared-form-field-validation.service';
import { first } from 'rxjs';
import { SideNavSevice } from 'src/shared/services/sidenavSevice';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/envirnment/environment';
import { ProfileCompletionService } from 'src/shared/services/profile-completion.service';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email:           string  = '';
  password:        string  = '';
  hidePassword:    boolean = true;
  isLoading:       boolean = false;
  isGoogleLoading: boolean = false;
  error:           string  = '';
  menu:            any[]   = [];

  constructor(
    private authService:  SharedAuthService,
    private dataService:  SharedDataService,
    private valid:        SharedFormFieldValidationService,
    private router:       Router,
    private SideNavSevice: SideNavSevice,
    private global:       SharedGlobalService,
    private toastr:       ToastrService,
    private profileCompletionService: ProfileCompletionService,
  ) {}

  ngOnInit(): void {
    this.loadGoogleScript();
  }

  // ─── Load Google Identity Services Script ────────────────────────────────
  loadGoogleScript(): void {
    if (typeof google !== 'undefined') {
      this.initGoogleSignIn();
      return;
    }
    const script  = document.createElement('script');
    script.src    = 'https://accounts.google.com/gsi/client';
    script.async  = true;
    script.defer  = true;
    script.onload = () => this.initGoogleSignIn();
    document.head.appendChild(script);
  }

  initGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id:             environment.googleClientId,
      callback:              (response: any) => this.handleGoogleResponse(response),
      auto_select:           false,
      cancel_on_tap_outside: true,
    });
  }

  // ─── Trigger Google One-Tap Popup ────────────────────────────────────────
  signInWithGoogle(): void {
    if (typeof google === 'undefined') {
      this.toastr.error('Google Sign-In is not available. Please try again.');
      return;
    }
    google.accounts.id.prompt();
  }

  // ─── Navigate based on profile/preferences completion, plan, and status (roleID 3 only) ────
  private navigateAfterLoginForRole3(): void {
    this.profileCompletionService.calculateCompletion().subscribe({
      next: (result) => {
        if (result.overallCompletion < 100) {
          this.router.navigate(['/welcome']);
          return;
        }

        // overallCompletion === 100 → check if the user has a registration plan
        this.checkPlanAndNavigate();
      },
      error: (err) => {
        console.error('calculateCompletion error:', err);
        // Fallback: if completion check fails, still let the user in
        this.router.navigate(['/welcome']);
      }
    });
  }

  private checkPlanAndNavigate(): void {
    const userID = this.global.getUserID();

    this.dataService.getHttp(`core-api/Profile/userRegistrationPlan?userID=${userID}`).subscribe({
      next: (res: any) => {
        const planData = Array.isArray(res) ? res[0] : res;
        const hasPlan  = Array.isArray(res) ? res.length > 0 : !!planData;

        console.log('userRegistrationPlan response:', res);

        if (!hasPlan) {
          this.router.navigate(['/registerationFee']);
          return;
        }

        // User has a plan → check request status
        this.checkStatusAndNavigate(userID);
      },
      error: (err) => {
        console.error('userRegistrationPlan error:', err);
        // Fallback: if plan check fails, still let the user in
        this.router.navigate(['/welcome']);
      }
    });
  }

  private checkStatusAndNavigate(userID: any): void {
    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`).subscribe({
      next: (res: any) => {
        const userDetails = Array.isArray(res) ? res[0] : res;
        const statusTitle = userDetails?.statusTitle;

        console.log('getUserDetails response:', res);
        console.log('statusTitle:', statusTitle);

        if (statusTitle === 'Pending') {
          this.router.navigate(['/reguestSubmited']);
        } else if (statusTitle === 'Approved') {
          this.router.navigate(['/Pricing-Plans']);
        } else {
          // Fallback for any other status
          this.router.navigate(['/welcome']);
        }
      },
      error: (err) => {
        console.error('getUserDetails error:', err);
        this.router.navigate(['/welcome']);
      }
    });
  }

  // ─── Handle Google Credential Response ───────────────────────────────────
  handleGoogleResponse(response: any): void {
    try {
      const credential = response.credential;
      const payload    = JSON.parse(atob(credential.split('.')[1]));
      const email      = payload.email || '';

      if (!email) {
        this.toastr.error('Could not retrieve email from Google. Please try again.');
        return;
      }

      this.isGoogleLoading = true;

      const googlePayload = {
        loginname: email,
        roleID:    3
      };

      console.log('Google Auth Payload:', googlePayload);

      (this.dataService.postDirect('auth-api/googleAuth', googlePayload) as any)
        .subscribe({
          next: (res: any) => {
            this.isGoogleLoading = false;
            console.log('Google Auth Response:', res);

            const loginResponse = Array.isArray(res) ? res[0] : res;

            if (!loginResponse) {
              this.valid.apiErrorResponse('Google Sign-In failed. Please try again.');
              return;
            }

            // Save session same as normal login
            this.global.saveUserSession(loginResponse);
            this.authService.setCurrentUser(loginResponse); 
            this.valid.apiSuccessResponse('Login Successful!');

            const roleId = loginResponse.roleId || this.global.getRoleId();
            this.getMenu(roleId);

            if (roleId === 3) {
              this.navigateAfterLoginForRole3();
            } else if (roleId === 1 || roleId === 2) {
              this.router.navigate(['/adminDashboard']);
            } else {
              this.router.navigate(['/']);
            }
          },
          error: (err: any) => {
            this.isGoogleLoading = false;
            console.error('Google Auth Error:', err);
            if (err.status === 404) {
              this.valid.apiErrorResponse('No account found for this Google email. Please sign up first.');
            } else {
              this.valid.apiErrorResponse('Google Sign-In failed. Please try again.');
            }
          }
        });

    } catch (e) {
      this.isGoogleLoading = false;
      console.error('Google credential decode error:', e);
      this.toastr.error('Failed to process Google Sign-In. Please try again.');
    }
  }

  // ─── Email/Password Login ─────────────────────────────────────────────────
    login(): void {
    const validate = [
      { value: this.email,    msg: 'Please enter email address', type: 'textBox', required: true },
      { value: this.password, msg: 'Please enter password',      type: 'textBox', required: true },
    ];

    if (this.valid.validateToastr(validate) === true) {
      this.isLoading = true;
      this.error     = '';

      this.authService
        .login(this.email, this.password)
        .pipe(first())
        .subscribe(
          (data) => {
            this.isLoading = false;
            this.valid.apiSuccessResponse('Login Successful!');

            this.global.saveUserSession(data);

            const roleId = this.global.getRoleId();
            this.getMenu(roleId);

            if (roleId === 3) {
              this.navigateAfterLoginForRole3();
            } else if (roleId === 2 || roleId === 1) {
              this.router.navigate(['/adminDashboard']);
            } else {
              this.router.navigate(['/']);
            }
          },
          (error) => {
            this.isLoading = false;
            console.error('Login error:', error);

            const backendMessage =
              error?.error?.message ||
              error?.error?.Message ||
              (typeof error?.error === 'string' ? error.error : null) ||
              error?.message ||
              'Incorrect Email or Password';

            this.error = backendMessage;
            this.valid.apiErrorResponse(backendMessage);
          }
        );
    }
  }

  // ─── Toggle Password Visibility ───────────────────────────────────────────
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // ─── Close Modal ──────────────────────────────────────────────────────────
  closeModal(): void {
    this.router.navigate(['/']);
  }

  // ─── Load Menu ────────────────────────────────────────────────────────────
  getMenu(roleID: any): void {
    this.SideNavSevice.getMenu(roleID).subscribe({
      next: (response: any[]) => {
        this.menu = response;
        this.global.saveMenuSession(response);
        this.authService.triggerMenu();
      },
      error: (error: any) => {
        console.error('Error fetching menu:', error);
        this.toastr.error('Failed to load menu', 'Error');
      }
    });
  }

  handleLoginSuccess(loginResponse: any): void {
    this.isLoading = false;
    localStorage.setItem('currentUser', JSON.stringify(loginResponse));
    this.toastr.success('Login successful!', 'Welcome');

    const roleId = loginResponse.roleID || this.global.getRoleId();
    this.getMenu(roleId);

    setTimeout(() => {
      if (roleId === 3) {
        this.navigateAfterLoginForRole3();
      } else if (roleId === 2 || roleId === 1) {
        this.router.navigate(['/adminDashboard']);
      } else {
        this.router.navigate(['/']);
      }
    }, 500);
  }
}