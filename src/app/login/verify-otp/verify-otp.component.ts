import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../shared/services/shared-data.service';

@Component({
  selector: 'app-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss']
})
export class VerifyOTPComponent implements OnInit {

  otp:          string  = '';
  userEmail:    string  = '';
  isLoading:    boolean = false;
  errorMessage: string  = '';

  // OTP box count — 4 digits matching the design
  private readonly OTP_LENGTH = 4;

  constructor(
    private dataService: SharedDataService,
    private toastr:      ToastrService,
    private router:      Router
  ) {}

  ngOnInit(): void {
    this.userEmail = sessionStorage.getItem('resetEmail') || '';
    if (!this.userEmail) {
      this.toastr.error('Session expired. Please request OTP again.');
      this.router.navigate(['/forget-password']);
    }
  }

  // ── Auto-advance to next box ─────────────────────────────────────────────
  moveToNext(event: any, nextInputId: string): void {
    const input = event.target as HTMLInputElement;
    // Allow digits only
    input.value = input.value.replace(/\D/g, '');
    this.updateOTP();

    if (input.value.length === 1) {
      if (nextInputId) {
        const next = document.getElementById(nextInputId) as HTMLInputElement;
        if (next) next.focus();
      } else {
        // Last box filled — auto-submit
        if (this.otp.length === this.OTP_LENGTH) {
          this.verifyOtp();
        }
      }
    }
  }

  // ── Backspace moves to previous box ─────────────────────────────────────
  onKeyDown(event: KeyboardEvent, currentInputId: string): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && input.value.length === 0) {
      const prevId = this.getPreviousInputId(currentInputId);
      if (prevId) {
        const prev = document.getElementById(prevId) as HTMLInputElement;
        if (prev) prev.focus();
      }
    }
  }

  private getPreviousInputId(currentInputId: string): string | null {
    const num = parseInt(currentInputId.replace('input', ''), 10);
    return num > 1 ? `input${num - 1}` : null;
  }

  private updateOTP(): void {
    this.otp = '';
    for (let i = 1; i <= this.OTP_LENGTH; i++) {
      const input = document.getElementById(`input${i}`) as HTMLInputElement;
      if (input?.value) this.otp += input.value;
    }
    this.errorMessage = '';
  }

  private clearOtp(): void {
    this.otp = '';
    for (let i = 1; i <= this.OTP_LENGTH; i++) {
      const input = document.getElementById(`input${i}`) as HTMLInputElement;
      if (input) input.value = '';
    }
    const first = document.getElementById('input1') as HTMLInputElement;
    if (first) first.focus();
  }

  // ── Verify OTP ───────────────────────────────────────────────────────────
  verifyOtp(): void {
    if (this.otp.length !== this.OTP_LENGTH) {
      this.errorMessage = `Please enter a ${this.OTP_LENGTH}-digit OTP`;
      return;
    }

    this.isLoading    = true;
    this.errorMessage = '';

    this.dataService.verifyOTP(this.otp).subscribe({
      next: (response: any) => {
        console.log('OTP Verification Response:', response);
        if (response && response.length > 0) {
          this.toastr.success('OTP verified successfully!');
          sessionStorage.setItem('otpVerified', 'true');
          this.router.navigate(['/update-password']);
        } else {
          this.toastr.error(response?.message || 'Invalid OTP. Please try again.');
          this.clearOtp();
        }
      },
      error: (error: any) => {
        console.error('OTP Verification Error:', error);
        if (error.status === 400 || error.status === 404) {
          this.toastr.error('Invalid or expired OTP');
        } else {
          this.toastr.error(error.error?.message || 'Failed to verify OTP. Please try again.');
        }
        this.clearOtp();
      },
      complete: () => { this.isLoading = false; }
    });
  }

  // ── Resend OTP ───────────────────────────────────────────────────────────
resendOtp(): void {
  if (!this.userEmail) {
    this.toastr.error('Email not found. Please start again.');
    this.router.navigate(['/forget-password']);
    return;
  }

  this.isLoading = true;
  this.clearOtp();
  console.log('Resending OTP to email:', this.userEmail);

  this.dataService.sendOTP(this.userEmail).subscribe({
    next: (response: any) => {
      console.log('Resend OTP Response:', response);
      // Accept any truthy response — API may return a string, array, or object
      if (response !== null && response !== undefined) {
        this.toastr.success('OTP resent to your email');
      } else {
        this.toastr.error('Failed to resend OTP. Please try again.');
      }
    },
    error: (err: any) => {
      console.error('Resend OTP Error:', err);
      this.toastr.error('Failed to resend OTP. Please try again.');
    },
    complete: () => { this.isLoading = false; }
  });
}

  // ── Back ─────────────────────────────────────────────────────────────────
  goBack(): void {
    this.router.navigate(['/Forget-Password']);
  }
}