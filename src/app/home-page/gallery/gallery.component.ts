import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { environment } from 'src/envirnment/environment';

interface EventItem {
  id: number;
  title: string;
  city: string;
  cityID: number;
  country: string;
  countryID: number;
  imageUrl: string;
  eventTypeID: number;
  eventTypeTitle: string;
  eventDescription: string;
}

interface EventType {
  eventTypeID: number;
  eventTypeTitle: string;
}
@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {

  searchQuery: string = '';
  allEvents: EventItem[] = [];
  filteredEvents: EventItem[] = [];
  eventTypeList: EventType[] = [];

  selectedEventTypeID: number = 0;

  isLoading: boolean = false;

  // Lightbox
  isLightboxOpen: boolean = false;
  activeEvent: EventItem | null = null;

  constructor(private dataService: SharedDataService) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadEventTypes();
  }

  // ── Load Gallery ─────────────────────────────────────────────────────────
  loadEvents(): void {
    this.isLoading = true;
    this.dataService.getHttp('user-api/getEventsGallery', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allEvents = data.map((e: any) => ({
          id: e.eventID,
          title: e.eventTitle,
          city: e.cityName,
          cityID: e.cityID,
          country: e.countryName,
          countryID: e.countryID,
          imageUrl: environment.productUrl + 'assets/user-images/Events/' + e.eDoc,
          eventTypeID: e.eventTypeID,
          eventTypeTitle: e.eventTypeTitle,
          eventDescription: e.eventDescription || '',
        }));
        this.filteredEvents = [...this.allEvents];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Gallery load error:', err);
        this.isLoading = false;
      },
    });
  }

  loadEventTypes(): void {
    this.dataService.getHttp('user-api/getEventType', {}).subscribe({
      next: (res: any) => {
        this.eventTypeList = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('Event type load error:', err),
    });
  }

  // ── Filtering (search + event type, combined) ───────────────────────────
  applyFilters(): void {
    const q = this.searchQuery.trim().toLowerCase();

    this.filteredEvents = this.allEvents.filter((ev) => {
      const matchesSearch = !q
        || ev.title.toLowerCase().includes(q)
        || ev.city.toLowerCase().includes(q);

      const matchesType = !this.selectedEventTypeID
        || ev.eventTypeID === this.selectedEventTypeID;

      return matchesSearch && matchesType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onEventTypeFilterChange(typeID: number): void {
    this.selectedEventTypeID = typeID;
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedEventTypeID = 0;
    this.filteredEvents = [...this.allEvents];
  }

  get hasActiveFilters(): boolean {
    return !!this.searchQuery || !!this.selectedEventTypeID;
  }

  // ── Lightbox (view-only detail preview) ─────────────────────────────────
  openLightbox(event: EventItem): void {
    this.activeEvent = event;
    this.isLightboxOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox(): void {
    this.isLightboxOpen = false;
    this.activeEvent = null;
    document.body.style.overflow = '';
  }
}