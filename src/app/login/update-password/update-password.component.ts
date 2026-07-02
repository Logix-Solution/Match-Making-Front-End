import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../shared/services/shared-data.service';

@Component({
  selector: 'app-update-password',
  templateUrl: './update-password.component.html',
  styleUrls: ['./update-password.component.scss']
})
export class UpdatePasswordComponent implements OnInit {

  newPassword:     string  = '';
  confirmPassword: string  = '';
  isLoading:       boolean = false;
  userEmail:       string  = '';
  isOtpVerified:   boolean = false;

  showNewPassword:     boolean = false;
  showConfirmPassword: boolean = false;

  passwordStrength:      string = '';
  passwordStrengthClass: string = '';

  constructor(
    private dataService: SharedDataService,
    private toastr:      ToastrService,
    private router:      Router
  ) {}

  ngOnInit(): void {
    this.userEmail     = sessionStorage.getItem('resetEmail')   || '';
    this.isOtpVerified = sessionStorage.getItem('otpVerified') === 'true';

    if (!this.userEmail || !this.isOtpVerified) {
      this.toastr.error('Please complete OTP verification first');
      this.router.navigate(['/forget-password']);
    }
  }

  // ── Visibility Toggles ───────────────────────────────────────────────────
  toggleNewPasswordVisibility():     void { this.showNewPassword     = !this.showNewPassword; }
  toggleConfirmPasswordVisibility(): void { this.showConfirmPassword = !this.showConfirmPassword; }

  // ── Password Strength ────────────────────────────────────────────────────
  checkPasswordStrength(): void {
    const p = this.newPassword;
    if (!p) { this.passwordStrength = ''; this.passwordStrengthClass = ''; return; }

    let score = 0;
    if (p.length >= 8)          score++;
    if (p.length >= 12)         score++;
    if (/[a-z]/.test(p))        score++;
    if (/[A-Z]/.test(p))        score++;
    if (/[0-9]/.test(p))        score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;

    if (score <= 2) { this.passwordStrength = 'Weak';   this.passwordStrengthClass = 'weak'; }
    else if (score <= 4) { this.passwordStrength = 'Medium'; this.passwordStrengthClass = 'medium'; }
    else { this.passwordStrength = 'Strong'; this.passwordStrengthClass = 'strong'; }
  }

  // ── Validation Helpers ───────────────────────────────────────────────────
  hasMinLength():   boolean { return this.newPassword.length >= 8; }
  hasUpperCase():   boolean { return /[A-Z]/.test(this.newPassword); }
  hasLowerCase():   boolean { return /[a-z]/.test(this.newPassword); }
  hasNumber():      boolean { return /[0-9]/.test(this.newPassword); }
  hasSpecialChar(): boolean { return /[^A-Za-z0-9]/.test(this.newPassword); }

  // ── Validate Before Submit ───────────────────────────────────────────────
  private validatePasswords(): boolean {
    if (!this.newPassword || !this.confirmPassword) {
      this.toastr.error('Please fill in all password fields'); return false;
    }
    if (!this.hasMinLength()) {
      this.toastr.error('Password must be at least 8 characters'); return false;
    }
    if (!this.hasUpperCase()) {
      this.toastr.error('Password must contain at least one uppercase letter'); return false;
    }
    if (!this.hasLowerCase()) {
      this.toastr.error('Password must contain at least one lowercase letter'); return false;
    }
    if (!this.hasNumber()) {
      this.toastr.error('Password must contain at least one number'); return false;
    }
    if (!this.hasSpecialChar()) {
      this.toastr.error('Password must contain at least one special character'); return false;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.toastr.error('Passwords do not match'); return false;
    }
    return true;
  }

  // ── Reset Password API Call ──────────────────────────────────────────────
  resetPassword(): void {
    if (!this.validatePasswords()) return;

    this.isLoading = true;

    const payload = {
      email:    this.userEmail,
      password: this.newPassword,
      sptype:   'insert'
    };

    this.dataService.resetPassword(payload).subscribe({
      next: (response: any) => {
        console.log('Reset Password Response:', response);
        if (response !== null && response !== undefined) {
          this.toastr.success('Password reset successfully!');
          sessionStorage.removeItem('resetEmail');
          sessionStorage.removeItem('otpVerified');
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.toastr.error(response?.message || 'Failed to reset password. Please try again.');
        }
      },
      error: (error: any) => {
        console.error('Reset Password Error:', error);
        if (error.status === 400)        this.toastr.error('Invalid request. Please try again.');
        else if (error.status === 404)   this.toastr.error('User not found.');
        else if (error.error?.message)   this.toastr.error(error.error.message);
        else                             this.toastr.error('Failed to reset password. Please try again.');
      },
      complete: () => { this.isLoading = false; }
    });
  }

  // ── Back ─────────────────────────────────────────────────────────────────
  goBack(): void {
    sessionStorage.removeItem('resetEmail');
    sessionStorage.removeItem('otpVerified');
    this.router.navigate(['/Forget-Password']);
  }
}