import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { environment } from 'src/envirnment/environment';

interface ServiceRequest {
  id: number;           // userID (not unique per row anymore — see note below)
  name: string;
  location: string;
  image: string;
  phone: string;
  category: string;     // single eventTypeTitle — drives the card + filter
  serviceType: string;
}

@Component({
  selector: 'app-admin-services-requests',
  templateUrl: './admin-services-requests.component.html',
  styleUrls: ['./admin-services-requests.component.scss'],
})
export class AdminServicesRequestsComponent implements OnInit {
  activeFilter: string = 'All';
  allRequests: ServiceRequest[] = [];
  filteredRequests: ServiceRequest[] = [];

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  // ── Load from API ─────────────────────────────────────────────────────────
  loadServices(): void {
    this.dataService.getHttp('core-api/Admin/getServices', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        const mapped: ServiceRequest[] = [];

        data.forEach((s: any) => {
          let events: any[] = [];
          try {
            events = JSON.parse(s.userEvents || '[]');
          } catch {
            events = [];
          }

          const image =
            environment.productUrl +
              'assets/user-images/userProfile/' +
              s.eDoc || 'assets/images/profile1.png';
          const location =
            [s.cityName, s.countryName].filter(Boolean).join(', ') || 'N/A';

          if (events.length === 0) {
            // No events at all — still show one card, category falls back to "Other"
            mapped.push({
              id: s.userID,
              name: s.firstName || 'Unknown',
              location,
              image,
              phone: s.phoneNumber || '',
              category: 'Other',
              serviceType: 'Other',
            });
            return;
          }

          // One card PER event type — a user with 2 events becomes 2 cards
          events.forEach((e: any) => {
            mapped.push({
              id: s.userID,
              name: s.firstName || 'Unknown',
              location,
              image,
              phone: s.phoneNumber || '',
              category: e.eventTypeTitle || 'Other',
              serviceType: e.eventTypeTitle || 'Other',
            });
          });
        });

        // API can send duplicate raw rows for the same user (as in your sample,
        // userID 18 appeared twice) — dedupe on userID + category combo so we
        // don't show the same person/event card twice.
        const seen = new Set<string>();
        this.allRequests = mapped.filter((r) => {
          const key = `${r.id}-${r.category}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        this.applyFilter(this.activeFilter);
      },
      error: (err) => console.error('Services load error:', err),
    });
  }

  // ── Filter ────────────────────────────────────────────────────────────────
 private filterToCategoryMap: Record<string, string> = {
    Events: 'Event Planing',
  };

  applyFilter(filterCriteria: string): void {
    this.activeFilter = filterCriteria;
    const targetCategory = this.filterToCategoryMap[filterCriteria] ?? filterCriteria;

    this.filteredRequests =
      this.activeFilter === 'All'
        ? [...this.allRequests]
        : this.allRequests.filter((req) => req.category === targetCategory);
  }

  // ── WhatsApp Contact ──────────────────────────────────────────────────────
  onContactUser(request: ServiceRequest): void {
    if (!request.phone) {
      console.warn('No phone number available for this user.');
      return;
    }

    let cleaned = request.phone.replace(/[^\d+]/g, '');

    if (cleaned.startsWith('0')) {
      cleaned = '+92' + cleaned.slice(1);
    }

    if (!cleaned.startsWith('+')) {
      cleaned = '+92' + cleaned;
    }

    const waNumber = cleaned.replace('+', '');

    window.open(`https://wa.me/${waNumber}`, '_blank');
  }
}