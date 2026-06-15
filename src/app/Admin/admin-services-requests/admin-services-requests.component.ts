import { Component, OnInit } from '@angular/core';

interface ServiceRequest {
  id: number;
  name: string;
  location: string;
  image: string;
  category: 'Matchmaking' | 'Events' | 'Destination Wedding' | 'Honeymoon';
  serviceType: string;
  details: string;
}

@Component({
  selector: 'app-admin-services-requests',
  templateUrl: './admin-services-requests.component.html',
  styleUrls: ['./admin-services-requests.component.scss']
})
export class AdminServicesRequestsComponent implements OnInit {

  // Tracking the currently selected criteria filter
  activeFilter: string = 'All';
  
  allRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];

  ngOnInit(): void {
    this.generateMockServiceRequests();
    this.applyFilter('All');
  }

  // Update selection variable and perform client-side filtering mutation
  applyFilter(filterCriteria: string): void {
    this.activeFilter = filterCriteria;
    
    if (this.activeFilter === 'All') {
      this.filteredRequests = [...this.allRequests];
    } else {
      this.filteredRequests = this.allRequests.filter(
        req => req.category === this.activeFilter
      );
    }
  }

  onContactUser(request: ServiceRequest): void {
    console.log(`Contacting user profile under request assignment ID: ${request.id}`);
  }

  private generateMockServiceRequests(): void {
    const sampleProfilePic = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=80&h=80';
    const sampleDetailsText = 'Looking for Male, 25-30, Lahore. Sunn Muslim.';

    // Generates structural mock database records mirroring your view distribution layout
    this.allRequests = Array.from({ length: 9 }, (_, idx) => ({
      id: idx + 1,
      name: 'Fatima Noor',
      location: 'Islamabad, PK',
      image: sampleProfilePic,
      category: 'Matchmaking' as const,
      serviceType: 'Matchmakin', // Retained the specific text spelling from the mockup
      details: sampleDetailsText
    }));
  }
}