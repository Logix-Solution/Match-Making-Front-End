import { Component } from '@angular/core';


interface ServiceItem {
  id: string;
  title: string;
  imageUrl: string;
}

@Component({
  selector: 'app-premium-services',
  templateUrl: './premium-services.component.html',
  styleUrls: ['./premium-services.component.scss']
})
export class PremiumServicesComponent {

  services: ServiceItem[] = [
    { id: 'match-making', title: 'Matchmaking', imageUrl: 'assets/matchmaking.jpg' },
    { id: 'event-planning', title: 'Event Planning', imageUrl: 'assets/event-planning.jpg' },
    { id: 'destination-wedding', title: 'Destination Wedding', imageUrl: 'assets/destination-wedding.jpg' },
    { id: 'honeymoon', title: 'Honeymoon', imageUrl: 'assets/honeymoon.jpg' }
  ];

  isModalOpen = false;

  openOverlay(): void {
    this.isModalOpen = true;
  }

  closeOverlay(): void {
    this.isModalOpen = false;
  }

}
