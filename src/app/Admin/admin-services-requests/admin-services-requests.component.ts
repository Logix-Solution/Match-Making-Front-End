import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { environment } from 'src/envirnment/environment';

interface ServiceRequest {
  id:          number;
  name:        string;
  location:    string;
  image:       string;
  phone:       string;                    
  category:    string;
  serviceType: string;
}

@Component({
  selector: 'app-admin-services-requests',
  templateUrl: './admin-services-requests.component.html',
  styleUrls: ['./admin-services-requests.component.scss']
})
export class AdminServicesRequestsComponent implements OnInit {

  activeFilter:     string           = 'All';
  allRequests:      ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];

  constructor(
    private dataService:         SharedDataService,
    private sharedGlobalService: SharedGlobalService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  // ── Load from API ─────────────────────────────────────────────────────────
  loadServices(): void {
    this.dataService.getHttp('core-api/Admin/getServices', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allRequests = data.map((s: any) => ({
          id:          s.serviceID,
          name:        s.firstName || 'Unknown',
          location:    [s.cityName, s.countryName].filter(Boolean).join(', ') || 'N/A',
          //  const hasImage = s.eDoc && s.eDoc.trim() !== '';
          //    const image = hasImage 
          //             ? environment.productUrl + 'assets/user-images/userProfile/' + s.eDoc 
          //             : 'assets/images/default-avatar.png';
          
          image:     environment.productUrl + 'assets/user-images/userProfile/' + s.eDoc || 'assets/images/profile1.png',
          phone:       s.phoneNumber || '',
          category:    s.eventTypeTitle || 'Other',
          serviceType: s.eventTypeTitle || 'Other',
        }));
        this.applyFilter(this.activeFilter);
      },
      error: (err) => console.error('Services load error:', err)
    });
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  applyFilter(filterCriteria: string): void {
    this.activeFilter = filterCriteria;
    this.filteredRequests = this.activeFilter === 'All'
      ? [...this.allRequests]
      : this.allRequests.filter(req => req.category === this.activeFilter);
  }

  // ── WhatsApp Contact ──────────────────────────────────────────────────────
onContactUser(request: ServiceRequest): void {
  if (!request.phone) {
    console.warn('No phone number available for this user.');
    return;
  }

  // Remove all non-digit characters except leading +
  let cleaned = request.phone.replace(/[^\d+]/g, '');

  // If number starts with 0, replace with Pakistan code +92
  if (cleaned.startsWith('0')) {
    cleaned = '+92' + cleaned.slice(1);
  }

  // If no + prefix at all, add +92 as default
  if (!cleaned.startsWith('+')) {
    cleaned = '+92' + cleaned;
  }

  // Remove the + for wa.me URL (wa.me expects digits only)
  const waNumber = cleaned.replace('+', '');

  // Opens WhatsApp direct message chat with that number
  window.open(`https://wa.me/${waNumber}`, '_blank');
}
}