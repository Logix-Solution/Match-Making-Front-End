import { Component , OnInit } from '@angular/core';
interface UserRequest {
  id: number;
  name: string;
  age: number;
  location: string;
  image: string;
  status: 'pending' | 'accepted' | 'rejected';
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

  ngOnInit(): void {
    this.generateMockDataset();
    this.filterRequestsByActiveTab();
  }

  setTab(tabName: 'pending' | 'accepted' | 'rejected'): void {
    this.activeTab = tabName;
    this.filterRequestsByActiveTab();
  }

  filterRequestsByActiveTab(): void {
    this.filteredRequests = this.allRequests.filter(item => {
      // Logic rule: when viewing Accepted tab, display items set to 'accepted' OR 'pending' nested items if desired
      if (this.activeTab === 'accepted') {
        return item.status === 'accepted' || item.name === 'Omar Farooq' || item.name === 'Sofia Khan';
      }
      return item.status === this.activeTab;
    });
  }

  onViewDetails(item: UserRequest): void {
    console.log('Inspecting data profile instance for ID:', item.id);
  }

  onAccept(item: UserRequest): void {
    item.status = 'accepted';
    this.filterRequestsByActiveTab();
  }

  onReject(item: UserRequest): void {
    item.status = 'rejected';
    this.filterRequestsByActiveTab();
  }

  private generateMockDataset(): void {
    const defaultPic = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=80&h=80';
    
    // Seed records mimicking the real distribution layouts in Container (2) and Container (3)
    const userSeedData = [
      { name: 'Arjun Malik', age: 30, location: 'Lahore, PK', count: 5, initialStatus: 'accepted' as const },
      { name: 'Omar Farooq', age: 35, location: 'Islamabad, PK', count: 5, initialStatus: 'rejected' as const },
      { name: 'Sofia Khan', age: 25, location: 'Karachi, PK', count: 5, initialStatus: 'pending' as const }
    ];

    let overallIdCounter = 1;
    userSeedData.forEach(userGroup => {
      for (let i = 0; i < userGroup.count; i++) {
        this.allRequests.push({
          id: overallIdCounter++,
          name: userGroup.name,
          age: userGroup.age,
          location: userGroup.location,
          image: defaultPic,
          status: userGroup.initialStatus
        });
      }
    });
  }
}