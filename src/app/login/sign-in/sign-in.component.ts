import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { environment } from 'src/envirnment/environment';

interface SaveUserLoginInterface {
  fullName:    string;
  spType:      string;
  email:       string;
  phoneNumber: string;
  password:    string;
}

declare const google: any;

type TouchedField = 'fullName' | 'email' | 'phone' | 'password';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  // ─── Form Field Models ────────────────────────────────────────────────
  fullName: string  = '';
  email:    string  = '';
  phone:    string  = '';
  password: string  = '';

  // ─── UI State ───────────────────────────────────────────────────────
  hidePassword: boolean = true;
  isLoading:    boolean = false;
  isGoogleLoading: boolean = false;

  touched = {
    fullName: false,
    email:    false,
    phone:    false,
    password: false,
  };

  markTouched(field: TouchedField): void {
    this.touched[field] = true;
  }

  private readonly emailPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  pageFields: SaveUserLoginInterface = {
    fullName:    '',
    spType:      'insert',
    email:       '',
    phoneNumber: '',
    password:    '',
  };

  formFields: any[] = [
    { value: '',       msg: ' Enter Your Full Name',    type: 'textbox', required: true  },
    { value: 'insert', msg: '',                         type: 'hidden',  required: false },
    { value: '',       msg: ' Enter Your Email',        type: 'textbox', required: true  },
    { value: '',       msg: ' Enter Your Phone Number', type: 'textbox', required: true  },
    { value: '',       msg: ' Enter Your Password',     type: 'textbox', required: true  },
  ];

  // ─── OTP Verification Modal ─────────────────────────────────────────
  showOtpModal = false;
  otpDigits: string[] = ['', '', '', ''];
  readonly OTP_LENGTH = 4;
  isSendingOtp = false;
  isVerifyingOtp = false;
  otpErrorMessage = '';

  constructor(
    private router:      Router,
    private dataService: SharedDataService,
    private toastr:      ToastrService,
    private valid:       SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadGoogleScript();
  }

  // ─── Google Sign-In (unchanged) ──────────────────────────────────────
  loadGoogleScript(): void {
    if (typeof google !== 'undefined') {
      this.initGoogleSignIn();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initGoogleSignIn();
    document.head.appendChild(script);
  }

  initGoogleSignIn(): void {
    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: any) => this.handleGoogleResponse(response),
      auto_select: false,
      cancel_on_tap_outside: true,
    });
  }

  signUpWithGoogle(): void {
    if (typeof google === 'undefined') {
      this.toastr.error('Google Sign-In is not available. Please try again.');
      return;
    }
    google.accounts.id.prompt();
  }

  handleGoogleResponse(response: any): void {
    try {
      const credential = response.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      const userName = payload.name || '';
      const email = payload.email || '';

      this.isGoogleLoading = true;

      const googlePayload = {
        userID: 0,
        userRoleID: 0,
        userName: userName,
        contact: '',
        email: email,
        roleID: 3,
        spType: 'insert'
      };

      (this.dataService.postDirect('auth-api/GoogleSaveUser', googlePayload) as any)
        .subscribe({
          next: (res: any) => {
            this.isGoogleLoading = false;
            const apiResponse = Array.isArray(res) ? res[0] : res;
            if (apiResponse?.includes('Success') || apiResponse?.includes('success')) {
              this.valid.apiInfoResponse('Account created successfully with Google!');
              this.router.navigate(['/login']);
            } else {
              this.valid.apiErrorResponse(apiResponse || 'Google sign-up failed. Please try again.');
            }
          },
          error: (err: any) => {
            this.isGoogleLoading = false;
            this.valid.apiErrorResponse('Google sign-up failed. Please try again.');
          }
        });

    } catch (e) {
      this.isGoogleLoading = false;
      this.toastr.error('Failed to process Google Sign-In. Please try again.');
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  closeModal(): void {
    this.router.navigate(['/login']);
  }

  private markAllTouched(): void {
    this.touched.fullName = true;
    this.touched.email    = true;
    this.touched.phone    = true;
    this.touched.password = true;
  }

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

  // ─── Step 1: Validate → open OTP modal → send OTP ────────────────────
  createProfile(): void {
    this.markAllTouched();

    if (!this.isFormValid) {
      return;
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

    // Open the modal immediately, don't wait on the network call
    this.openOtpModal();
    this.requestOtp();
  }

  // ─── Step 2: Send OTP (runs while modal is already open) ─────────────
  private requestOtp(): void {
    this.isSendingOtp = true;
    this.dataService.sendOTP(this.email).subscribe({
      next: (res: any) => {
        this.isSendingOtp = false;
      },
      error: (err: any) => {
        this.isSendingOtp = false;
        this.toastr.error('Could not send verification code, please try again');
      }
    });
  }

  private openOtpModal(): void {
    this.otpDigits = ['', '', '', ''];
    this.otpErrorMessage = '';
    this.showOtpModal = true;
    setTimeout(() => {
      const first = document.getElementById('signup-otp-box-0') as HTMLInputElement;
      if (first) first.focus();
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
  }

  // ─── OTP box handling ─────────────────────────────────────────────────
  onOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(-1);
    input.value = cleaned;
    this.otpDigits[index] = cleaned;
    this.otpErrorMessage = '';

    if (cleaned && index < this.OTP_LENGTH - 1) {
      const next = document.getElementById(`signup-otp-box-${index + 1}`) as HTMLInputElement;
      if (next) next.focus();
    }

    if (index === this.OTP_LENGTH - 1 && cleaned && this.otpDigits.every(d => d)) {
      this.verifyOtpAndSave();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`signup-otp-box-${index - 1}`) as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  resendOtp(): void {
    if (this.isSendingOtp) return;
    this.otpDigits = ['', '', '', ''];
    this.otpErrorMessage = '';
    this.isSendingOtp = true;
    this.dataService.sendOTP(this.email).subscribe({
      next: () => {
        this.isSendingOtp = false;
        this.toastr.success('Verification code resent');
        const first = document.getElementById('signup-otp-box-0') as HTMLInputElement;
        if (first) first.focus();
      },
      error: () => {
        this.isSendingOtp = false;
        this.toastr.error('Failed to resend code, please try again');
      }
    });
  }

  // ─── Step 3: Verify OTP, then save ─────────────────────────────────────
  verifyOtpAndSave(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== this.OTP_LENGTH) {
      this.otpErrorMessage = `Please enter the ${this.OTP_LENGTH}-digit code`;
      return;
    }

    this.isVerifyingOtp = true;
    this.otpErrorMessage = '';

    this.dataService.verifyOTP(otp).subscribe({
      next: (response: any) => {
        this.isVerifyingOtp = false;
        if (response && response.length > 0) {
          this.saveProfile();
        } else {
          this.otpErrorMessage = 'Invalid code, please try again';
          this.otpDigits = ['', '', '', ''];
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        this.otpErrorMessage = (err?.status === 400 || err?.status === 404)
          ? 'Invalid or expired code'
          : 'Failed to verify code, please try again';
        this.otpDigits = ['', '', '', ''];
      }
    });
  }

  // ─── Step 4: Actual save (was old createProfile body) ─────────────────
  private saveProfile(): void {
    this.isLoading = true;

    this.dataService
      .saveHttp(this.pageFields, this.formFields, 'auth-api/saveUserLogin')
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          const apiResponse = Array.isArray(response) ? response[0] : response;
          if (apiResponse?.includes('Success')) {
            this.showOtpModal = false;
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