import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';

interface UserRequest {
  id: number;
  userID: number;
  name: string;
  age: number;
  location: string;
  image: string;
  status: 'pending' | 'accepted' | 'rejected';
  statusID: number;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-admin-request-management',
  templateUrl: './admin-request-management.component.html',
  styleUrls: ['./admin-request-management.component.scss']
})
export class AdminRequestManagementComponent implements OnInit {

  activeTab: 'pending' | 'accepted' | 'rejected' = 'pending';
  allRequests: UserRequest[] = [];
  filteredRequests: UserRequest[] = [];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
  this.dataService.getHttp('core-api/Admin/getRequestManagement', {}).subscribe({
    next: (res: any) => {
      console.log('API raw data:', res);
      const data = Array.isArray(res) ? res : [];
      this.allRequests = data.map((u: any) => ({
        id:       u.profileID,
        userID:   u.userID,
        name:     u.fullname || u.firstName || 'Unknown',
        age:      this.calculateAge(u.dob),
        location: u.address || 'N/A',          // ← no phoneNumber fallback
        image:    u.eDoc || 'assets/images/default-avatar.png',
        status:   this.mapStatus(u.statusID),  // ← statusID not statusTitle
        statusID: u.statusID,
        email:    u.email,
        phone:    u.phoneNumber
      }));
      this.filterRequestsByActiveTab();
    },
    error: (err) => console.error('Request Management load error:', err)
  });
}

 mapStatus(statusID: number): 'pending' | 'accepted' | 'rejected' {
  switch (statusID) {
    case 2:  return 'accepted';   // Approved
    case 3:  return 'rejected';   // Reject
    default: return 'pending';    // 1 = Pending
  }
}


  calculateAge(dob: string): number {
    if (!dob) return 0;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
  }

  setTab(tabName: 'pending' | 'accepted' | 'rejected'): void {
    this.activeTab = tabName;
    this.filterRequestsByActiveTab();
  }

  filterRequestsByActiveTab(): void {
    this.filteredRequests = this.allRequests.filter(item => item.status === this.activeTab);
  }

  onViewDetails(item: UserRequest): void {
    console.log('View Details:', item);
  }

onAccept(item: UserRequest): void {
  const adminID = this.sharedGlobalService.getUserID();
  const payload = { userID: item.userID, statusID: 2, adminID: adminID, spType: 'update' };

  this.dataService.postDirect('user-api/User/saveUserRequest', payload).subscribe({
    next: (res: any) => {
      const response = Array.isArray(res) ? res[0] : res;
      if (response?.includes('Success')) {
        this.valid.apiInfoResponse('Request Accepted Successfully');   // ← success toast
        item.status   = 'accepted';
        item.statusID = 2;
        this.filterRequestsByActiveTab();
      } else {
        this.valid.apiErrorResponse(response);                         // ← error toast
      }
    },
    error: (err) => {
      this.valid.apiErrorResponse('Something went wrong. Please try again.');
      console.error('Accept error:', err);
    }
  });
}

onReject(item: UserRequest): void {
  const adminID = this.sharedGlobalService.getUserID();
  const payload = { userID: item.userID, statusID: 3, adminID: adminID, spType: 'update' };

  this.dataService.postDirect('user-api/User/saveUserRequest', payload).subscribe({
    next: (res: any) => {
      const response = Array.isArray(res) ? res[0] : res;
      if (response?.includes('Success')) {
        this.valid.apiInfoResponse('Request Rejected Successfully');   // ← success toast
        item.status   = 'rejected';
        item.statusID = 3;
        this.filterRequestsByActiveTab();
      } else {
        this.valid.apiErrorResponse(response);                         // ← error toast
      }
    },
    error: (err) => {
      this.valid.apiErrorResponse('Something went wrong. Please try again.');
      console.error('Reject error:', err);
    }
  });
}



}