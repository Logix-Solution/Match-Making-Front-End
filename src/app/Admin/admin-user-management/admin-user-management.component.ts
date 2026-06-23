import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface UserProfile {
  id:          number;
  userID:      number;
  name:        string;
  location:    string;
  image:       string;
  status:      'Active' | 'Blocked';
  memberSince: string;
}

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit {

  searchQuery:   string        = '';
  allUsers:      UserProfile[] = [];
  filteredUsers: UserProfile[] = [];

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid:               SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  // ── Load all users from API ──────────────────────────────────────────────
  loadUsers(): void {
    this.dataService.getHttp('core-api/Admin/getRequestManagement', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allUsers = data.map((u: any) => ({
          id:          u.profileID,
          userID:      u.userID,
          name:        u.fullname || u.firstName || 'Unknown',
          location:    u.address || 'N/A',
          image:       u.eDoc   || 'assets/images/default-avatar.png',
          status:      this.mapStatus(u.statusID),
          memberSince: this.formatDate(u.dob),
        }));
        this.filteredUsers = [...this.allUsers];
      },
      error: (err) => console.error('User Management load error:', err)
    });
  }

  // ── Status mapping by statusID ───────────────────────────────────────────
  mapStatus(statusID: number): 'Active' | 'Blocked' {
    return statusID === 2 ? 'Active' : 'Blocked';
  }

  // ── Format dob as readable date ──────────────────────────────────────────
  formatDate(dob: string): string {
    if (!dob) return 'N/A';
    return new Date(dob).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  // ── Search filter ────────────────────────────────────────────────────────
  onSearchChange(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredUsers = !q
      ? [...this.allUsers]
      : this.allUsers.filter(u =>
          u.name.toLowerCase().includes(q) ||
          u.location.toLowerCase().includes(q)
        );
  }

  onViewDetails(user: UserProfile): void {
    console.log('View Details:', user);
  }

  // ── Block / Active toggle ────────────────────────────────────────────────
  onBlockUser(user: UserProfile): void {
    const isCurrentlyActive  = user.status === 'Active';
    const spType             = isCurrentlyActive ? 'Deactive' : 'Active';
    const adminID            = this.sharedGlobalService.getUserID();

    const payload = {
      adminID: adminID,
      userID:  user.userID,
      spType:  spType
    };
   console.log(payload, 'active deactive');
    this.dataService.postDirect('core-api/Admin/SaveUserDeactive', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          user.status = isCurrentlyActive ? 'Blocked' : 'Active';
          this.valid.apiInfoResponse(
            isCurrentlyActive
              ? `${user.name} has been blocked`
              : `${user.name} has been activated`
          );
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('Block/Active error:', err);
      }
    });
  }
}