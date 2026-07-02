import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface ForgetPasswordPayload {
  email: string;
}

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {

  isLoading: boolean = false;
  

  // ─── Page Fields (API payload) ────────────────────────────────────────────
  pageFields: ForgetPasswordPayload = {
    email: ''
  };

  // ─── Form Fields (UI validation) ──────────────────────────────────────────
  formFields: any[] = [
    {
      value:    '',
      msg:      'Please enter a valid email address',
      type:     'email',
      required: true
    } // 0 email
  ];

  constructor(
    private dataService: SharedDataService,
    private toastr:      ToastrService,
    private valid:       SharedFormFieldValidationService,
    private router:      Router
  ) {}

  ngOnInit(): void {}

  // ─── Validation ───────────────────────────────────────────────────────────
  validateForm(): boolean {
    const email = this.formFields[0].value;

    if (!email || email.trim() === '') {
      this.toastr.error(this.formFields[0].msg);
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.toastr.error('Please enter a valid email address');
      return false;
    }

    return true;
  }

  // ─── Submit — Send OTP ────────────────────────────────────────────────────
  submitResetRequest(): void {
    if (!this.validateForm()) return;

    this.isLoading = true;

    const email = this.formFields[0].value.trim();

    console.log('Submitting reset request for email:', email);

    this.dataService.sendOTP(email).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('OTP Response:', response);

        const isSuccess =
          response?.message === 'Mail Sent!'                              ||
          response?.message?.toLowerCase().includes('sent')               ||
          response?.message?.toLowerCase().includes('success')            ||
          response?.success                                                ||
          (Array.isArray(response) && response[0]?.includes('Success'));

        if (isSuccess) {
          this.valid.apiInfoResponse('OTP sent successfully to your email');
          sessionStorage.setItem('resetEmail', email);
          this.router.navigate(['/verify-otp']);
        } else {
          this.valid.apiErrorResponse(response?.message || 'Failed to send OTP. Please try again.');
        }
      },
      error: (err: any) => {
        this.isLoading = false;
        console.error('OTP Error:', err);

        if (err.error?.message) {
          this.valid.apiErrorResponse(err.error.message);
        } else if (err.status === 404) {
          this.valid.apiErrorResponse('Email not found in our system');
        } else if (err.status === 0) {
          this.valid.apiErrorResponse('Unable to connect to server. Please check your internet connection.');
        } else {
          this.valid.apiErrorResponse('An error occurred. Please try again.');
        }
      }
    });
  }

  // ─── Sync email input → formFields ───────────────────────────────────────
  onEmailChange(): void {
    this.pageFields.email = this.formFields[0].value;
  }

  // ─── Back to Login ────────────────────────────────────────────────────────
  closeModal(): void {
    this.router.navigate(['/login']);
  }
}