import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';

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
    private sharedGlobalService: SharedGlobalService
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
          location: u.address || u.phoneNumber || 'N/A',
          image:    u.eDoc || 'assets/images/default-avatar.png',
          status:   this.mapStatus(u.statusTitle),
          statusID: u.statusID,
          email:    u.email,
          phone:    u.phoneNumber
        }));
        this.filterRequestsByActiveTab();
      },
      error: (err) => console.error('Request Management load error:', err)
    });
  }

  mapStatus(statusTitle: string): 'pending' | 'accepted' | 'rejected' {
    if (!statusTitle) return 'pending';
    const s = statusTitle.toLowerCase().trim();
    if (s === 'accepted' || s === 'approved') return 'accepted';
    if (s === 'rejected')                     return 'rejected';
    return 'pending';
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
    item.status = 'accepted';
    this.filterRequestsByActiveTab();
  }

  onReject(item: UserRequest): void {
    item.status = 'rejected';
    this.filterRequestsByActiveTab();
  }
}