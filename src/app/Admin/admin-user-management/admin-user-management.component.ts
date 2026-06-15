import { Component, OnInit } from '@angular/core';

interface UserProfile {
  id: number;
  name: string;
  location: string;
  image: string;
  status: 'Active' | 'Blocked';
  memberSince: string;
}

@Component({
  selector: 'app-admin-user-management',
  templateUrl: './admin-user-management.component.html',
  styleUrls: ['./admin-user-management.component.scss']
})
export class AdminUserManagementComponent implements OnInit {

  searchQuery: string = '';
  allUsers: UserProfile[] = [];
  filteredUsers: UserProfile[] = [];

  ngOnInit(): void {
    this.generateMockUserDataset();
    this.filteredUsers = [...this.allUsers];
  }

  // Live filter computation system execution
  onSearchChange(): void {
    const cleanQuery = this.searchQuery.trim().toLowerCase();
    if (!cleanQuery) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    this.filteredUsers = this.allUsers.filter(user => 
      user.name.toLowerCase().includes(cleanQuery) || 
      user.location.toLowerCase().includes(cleanQuery)
    );
  }

  onViewDetails(user: UserProfile): void {
    console.log('Displaying record system logs metadata profile instance for user ID:', user.id);
  }

  onBlockUser(user: UserProfile): void {
    user.status = 'Blocked';
    console.log(`Disabling active operational access privileges for user identity: ${user.name}`);
  }

  private generateMockUserDataset(): void {
    const sampleProfilePic = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=80&h=80';
    
    // Seed exactly 15 records matching the image mockup matrix grid output pattern
    this.allUsers = Array.from({ length: 15 }, (_, idx) => ({
      id: idx + 1,
      name: 'Fatima Noor',
      location: 'Islamabad, PK',
      image: sampleProfilePic,
      status: 'Active' as const,
      memberSince: 'Jan 12, 2026'
    }));
  }
}