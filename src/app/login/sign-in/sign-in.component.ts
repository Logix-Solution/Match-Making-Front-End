import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

// ─── Interface ────────────────────────────────────────────────────────────────
interface SaveUserLoginInterface {
  fullName:    string; // 0
  spType:      string; // 1
  email:       string; // 2
  phoneNumber: string; // 3
  password:    string; // 4
}

// Declare Google global so TypeScript doesn't complain
declare const google: any;

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  // ─── Form Field Models ────────────────────────────────────────────────────
  fullName: string  = '';
  email:    string  = '';
  phone:    string  = '';
  password: string  = '';

  // ─── UI State ─────────────────────────────────────────────────────────────
  hidePassword: boolean = true;
  isLoading:    boolean = false;
  isGoogleLoading: boolean = false;

  // ─── Touched state (per field, set true on blur OR on save attempt) ──────
  touched = {
    fullName: false,
    email:    false,
    phone:    false,
    password: false,
  };

  private readonly emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: SaveUserLoginInterface = {
    fullName:    '',
    spType:      'insert',
    email:       '',
    phoneNumber: '',
    password:    '',
  };

  // ─── Form Fields (for saveHttp validation) ────────────────────────────────
  formFields: any[] = [
    { value: '',       msg: ' Enter Your Full Name',    type: 'textbox', required: true  }, // 0
    { value: 'insert', msg: '',                         type: 'hidden',  required: false }, // 1
    { value: '',       msg: ' Enter Your Email',        type: 'textbox', required: true  }, // 2
    { value: '',       msg: ' Enter Your Phone Number', type: 'textbox', required: true  }, // 3
    { value: '',       msg: ' Enter Your Password',     type: 'textbox', required: true  }, // 4
  ];

  constructor(
    private router:      Router,
    private dataService: SharedDataService,
    private toastr:      ToastrService,
    private valid:       SharedFormFieldValidationService,
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
    const script   = document.createElement('script');
    script.src     = 'https://accounts.google.com/gsi/client';
    script.async   = true;
    script.defer   = true;
    script.onload  = () => this.initGoogleSignIn();
    document.head.appendChild(script);
  }

  initGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id:        environment.googleClientId,
      callback:         (response: any) => this.handleGoogleResponse(response),
      auto_select:      false,
      cancel_on_tap_outside: true,
    });
  }

  // ─── Trigger Google One-Tap / Popup ──────────────────────────────────────
  signUpWithGoogle(): void {
    if (typeof google === 'undefined') {
      this.toastr.error('Google Sign-In is not available. Please try again.');
      return;
    }
    google.accounts.id.prompt();
  }

  // ─── Handle Google Credential Response ───────────────────────────────────
  handleGoogleResponse(response: any): void {
    try {
      const credential  = response.credential;
      const payload     = JSON.parse(atob(credential.split('.')[1]));

      const userName = payload.name  || '';
      const email    = payload.email || '';

      this.isGoogleLoading = true;

      const googlePayload = {
        userID:    0,
        userRoleID: 0,
        userName:  userName,
        contact:   '',
        email:     email,
        roleID:    3,
        spType:    'insert'
      };

      console.log('Google Sign-Up Payload:', googlePayload);

      (this.dataService.postDirect('auth-api/GoogleSaveUser', googlePayload) as any)
        .subscribe({
          next: (res: any) => {
            this.isGoogleLoading = false;
            const apiResponse = Array.isArray(res) ? res[0] : res;
            console.log('Google Save Response:', apiResponse);

            if (apiResponse?.includes('Success') || apiResponse?.includes('success')) {
              this.valid.apiInfoResponse('Account created successfully with Google!');
              this.router.navigate(['/login']);
            } else {
              this.valid.apiErrorResponse(apiResponse || 'Google sign-up failed. Please try again.');
            }
          },
          error: (err: any) => {
            this.isGoogleLoading = false;
            console.error('Google Save Error:', err);
            this.valid.apiErrorResponse('Google sign-up failed. Please try again.');
          }
        });

    } catch (e) {
      this.isGoogleLoading = false;
      console.error('Google credential decode error:', e);
      this.toastr.error('Failed to process Google Sign-In. Please try again.');
    }
  }

  // ─── Toggle Password Visibility ───────────────────────────────────────────
  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  // ─── Close Modal ──────────────────────────────────────────────────────────
  closeModal(): void {
    this.router.navigate(['/login']);
  }

  // ─── Mark a single field as touched (called on blur) ─────────────────────
  markTouched(field: keyof typeof this.touched): void {
    this.touched[field] = true;
  }

  // ─── Mark all fields touched (called on save attempt) ─────────────────────
  private markAllTouched(): void {
    this.touched.fullName = true;
    this.touched.email    = true;
    this.touched.phone    = true;
    this.touched.password = true;
  }

  // ─── Per-field error checks (used by template) ────────────────────────────
  get fullNameError(): string {
    if (!this.touched.fullName) return '';
    if (!this.fullName?.trim()) return 'Full name is required';
    return '';
  }

  get emailError(): string {
    if (!this.touched.email) return '';
    if (!this.email?.trim()) return 'Email is required';
    if (!this.emailPattern.test(this.email.trim())) return 'Enter a valid email address';
    return '';
  }

  get phoneError(): string {
    if (!this.touched.phone) return '';
    if (!this.phone?.trim()) return 'Phone number is required';
    return '';
  }

  get passwordError(): string {
    if (!this.touched.password) return '';
    if (!this.password?.trim()) return 'Password is required';
    return '';
  }

  get isFormValid(): boolean {
    return !this.fullNameError && !this.emailError && !this.phoneError && !this.passwordError
      && !!this.fullName?.trim() && !!this.email?.trim()
      && !!this.phone?.trim() && !!this.password?.trim();
  }

  // ─── Create Profile (Save) ────────────────────────────────────────────────
  createProfile(): void {
    this.markAllTouched();

    if (!this.isFormValid) {
      return; // red messages are now visible; stop here
    }

    this.formFields[0].value = this.fullName;
    this.formFields[1].value = 'insert';
    this.formFields[2].value = this.email;
    this.formFields[3].value = this.phone;
    this.formFields[4].value = this.password;

    this.pageFields.fullName    = this.formFields[0].value;
    this.pageFields.spType      = this.formFields[1].value;
    this.pageFields.email       = this.formFields[2].value;
    this.pageFields.phoneNumber = this.formFields[3].value;
    this.pageFields.password    = this.formFields[4].value;

    if (!this.valid.validateToastr(this.formFields)) return;

    this.isLoading = true;

    console.log('PageFields:', this.pageFields);
    console.log('FormFields:', this.formFields);

    this.dataService
      .saveHttp(this.pageFields, this.formFields, 'auth-api/saveUserLogin')
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.valid.apiInfoResponse('User Created Successfully');
            this.router.navigate(['/login']);
          } else {
            this.valid.apiErrorResponse(apiResponse);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.log('Registration Error:', err);
        },
      });
  }
}