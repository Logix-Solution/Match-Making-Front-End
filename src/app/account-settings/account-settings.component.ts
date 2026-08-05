import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedDataService } from 'src/shared/services/shared-data.service';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {

  // ─── Meta card data ─────────────────────────────────────────────────────
  email: string = '';
  profileName: string = '';
  memberSince: string = '';

  isLoading: boolean = false;

  // ─── Delete Account Confirmation Modal ──────────────────────────────────
  isDeleteModalOpen: boolean = false;
  isDeleting: boolean = false;

  private userID: number = 0;
  private profileID: number = 0;

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  // ─── Load user details for the meta cards ───────────────────────────────
  loadUserDetails(): void {
    this.isLoading = true;
    const currentUserID = this.sharedGlobalService.getUserID();

    this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${currentUserID}`, {}).subscribe({
      next: (res: any) => {
        const u = Array.isArray(res) ? res[0] : res;
        if (u) {
          this.buildAccountInfo(u);
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('getUserDetails error:', err);
        this.isLoading = false;
      },
    });
  }

  private buildAccountInfo(user: any): void {
    this.userID = user.userID;
    this.profileID = user.profileID;

    this.email = user.email || '-';
    this.profileName = user.fullname || user.firstName || '-';

    // "MemberrSince" lives inside each userProfile entry, not as a top-level field
    let profileItems: any[] = [];
    try { profileItems = JSON.parse(user.userProfile || '[]'); } catch { profileItems = []; }
    const memberSinceRaw = profileItems.find((p: any) => p.MemberrSince)?.MemberrSince;
    this.memberSince = memberSinceRaw ? this.formatMemberSince(memberSinceRaw) : 'Profile under review';
  }

  private formatMemberSince(dateStr: string): string {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  // ─── Delete Account — open confirmation modal (no direct API call) ──────
  onDeleteAccountClick(): void {
    console.warn('Account deletion sequences requested.');
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.isDeleting) return; // don't allow closing mid-request
    this.isDeleteModalOpen = false;
  }

  // ─── Confirmed delete — fires the actual API call ────────────────────────
  confirmDeleteAccount(): void {
    const payload = {
      userID: this.userID,
      profileID: this.profileID,
      spType: 'Delete',
    };

    console.log('DeleteUserAccount payload:', payload);

    this.isDeleting = true;

    this.dataService.postDirect('core-api/Profile/DeleteUserAccount', payload).subscribe({
      next: (res: any) => {
        this.isDeleting = false;
        const response = Array.isArray(res) ? res[0] : res;

        if (response?.toString().toLowerCase().includes('success')) {
          this.isDeleteModalOpen = false;
          this.valid.apiInfoResponse('Your account has been deleted.');
          this.router.navigate(['/login']);
        } else {
          this.valid.apiErrorResponse(response || 'Something went wrong. Please try again.');
        }
      },
      error: (err) => {
        this.isDeleting = false;
        console.error('DeleteUserAccount error:', err);
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
      },
    });
  }
}