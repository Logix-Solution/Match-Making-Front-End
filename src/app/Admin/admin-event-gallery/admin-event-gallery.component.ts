import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
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
  selector: 'app-admin-event-gallery',
  templateUrl: './admin-event-gallery.component.html',
  styleUrls: ['./admin-event-gallery.component.scss'],
})
export class AdminEventGalleryComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  searchQuery: string = '';
  isModalOpen: boolean = false;
  isEditMode: boolean = false;
  allEvents: EventItem[] = [];
  filteredEvents: EventItem[] = [];
  eventTypeList: EventType[] = [];

  // ── Country / City ────────────────────────────────────────────────────────
  countryList: any[] = [];
  cityList: any[] = [];

  selectedFile: File | null = null;
  selectedFileB64: string = '';
  selectedFileExt: string = '';

  newEvent = {
    eventID: 0,
    title: '',
    eventDescription: '',
    eventTypeID: 0,
    country: '',
    countryID: 0,
    city: '',
    cityID: 0,
  };

  constructor(
    private dataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private valid: SharedFormFieldValidationService,
  ) {}

  ngOnInit(): void {
    this.loadEvents();
    this.loadEventTypes();
    this.getCountries(); // ← load countries on init
  }

  // ── Load Gallery ─────────────────────────────────────────────────────────
  loadEvents(): void {
    this.dataService.getHttp('core-api/Admin/getEventsGallery', {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        this.allEvents = data.map((e: any) => ({
          id: e.eventID,
          title: e.eventTitle,
          city: e.cityName,
          cityID: e.cityID,
          country: e.countryName,
          countryID: e.countryID,
          imageUrl: e.eDoc || 'assets/images/default-event.png',
          eventTypeID: e.eventTypeID,
          eventTypeTitle: e.eventTypeTitle,
          eventDescription: e.eventDescription || '',
        }));
        this.filteredEvents = [...this.allEvents];
      },
      error: (err) => console.error('Gallery load error:', err),
    });
  }

  // ── Load Event Types ──────────────────────────────────────────────────────
  loadEventTypes(): void {
    this.dataService.getHttp('core-api/Admin/getEventType', {}).subscribe({
      next: (res: any) => {
        this.eventTypeList = Array.isArray(res) ? res : [];
      },
      error: (err) => console.error('Event type load error:', err),
    });
  }

  // ── Countries ─────────────────────────────────────────────────────────────
  getCountries(): void {
    this.dataService.getHttp('cmis-api/company/getCountry', {}).subscribe({
      next: (res: any) => {
        this.countryList = res;
      },
      error: (err) => console.error('Error loading countries:', err),
    });
  }

  // ── Cities (called on country change) ────────────────────────────────────
  getCities(countryID: number): void {
    this.dataService
      .getHttp('cmis-api/company/getCity', { countryID })
      .subscribe({
        next: (res: any) => {
          this.cityList = res;
        },
        error: (err) => console.error('Error loading cities:', err),
      });
  }

  // ── On Country Dropdown Change ────────────────────────────────────────────
  onCountryChange(): void {
    this.newEvent.cityID = 0; // reset city
    this.cityList = [];
    if (this.newEvent.countryID) {
      this.getCities(this.newEvent.countryID);
    }
  }

  // ── Search ────────────────────────────────────────────────────────────────
  onSearchChange(): void {
    const q = this.searchQuery.trim().toLowerCase();
    this.filteredEvents = !q
      ? [...this.allEvents]
      : this.allEvents.filter(
          (ev) =>
            ev.title.toLowerCase().includes(q) ||
            ev.city.toLowerCase().includes(q),
        );
  }

  // ── Modal ─────────────────────────────────────────────────────────────────
  openUploadModal(): void {
    this.isEditMode = false;
    this.isModalOpen = true;
    this.resetForm();
  }

  closeUploadModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    this.selectedFileExt = file.name.split('.').pop() || 'jpg';
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.selectedFileB64 = result.split(',')[1];
    };
    reader.readAsDataURL(file);
  }

  // ── Save (Insert / Update) ────────────────────────────────────────────────
  onPublishEvent(): void {
    if (!this.newEvent.title) {
      this.valid.apiErrorResponse('Please enter event title.');
      return;
    }
    if (!this.newEvent.eventTypeID) {
      this.valid.apiErrorResponse('Please select event type.');
      return;
    }
    if (!this.newEvent.countryID) {
      this.valid.apiErrorResponse('Please select event country.');
      return;
    }
    if (!this.newEvent.cityID) {
      this.valid.apiErrorResponse('Please select event city.');
      return;
    }
    if (!this.selectedFileB64 && !this.isEditMode) {
      this.valid.apiErrorResponse('Please upload an event photo.');
      return;
    }

    const userID = this.sharedGlobalService.getUserID();
    const payload = {
      eventID: this.newEvent.eventID,
      eventTitle: this.newEvent.title,
      // eventDescription: this.newEvent.eventDescription,
      eventDescription: 'Good Event',
      eventTypeID: this.newEvent.eventTypeID,
      eDoc: this.selectedFileB64,
      eDocPath: environment.imageUrl + 'Events',
      eDocExt: this.selectedFileExt,
      cityID: this.newEvent.cityID,
      userID: userID,
      spType: this.isEditMode ? 'update' : 'insert',
    };

    console.log(payload, 'Add event');

    this.dataService.postDirect('core-api/Admin/SaveEvent', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse(
            this.isEditMode
              ? 'Event updated successfully.'
              : 'Event published successfully.',
          );
          this.closeUploadModal();
          this.loadEvents();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('SaveEvent error:', err);
      },
    });
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  onEditEvent(eventItem: EventItem): void {
    this.isEditMode = true;
    this.isModalOpen = true;
    this.newEvent = {
      eventID: eventItem.id,
      title: eventItem.title,
      eventDescription: eventItem.eventDescription,
      eventTypeID: eventItem.eventTypeID,
      country: eventItem.country,
      countryID: eventItem.countryID,
      city: eventItem.city,
      cityID: eventItem.cityID,
    };
    // Load cities for the pre-selected country
    if (eventItem.countryID) {
      this.getCities(eventItem.countryID);
    }
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  onDeleteEvent(eventItem: EventItem): void {
    const userID = this.sharedGlobalService.getUserID();
    const payload = {
      eventID: eventItem.id,
      eventTitle: eventItem.title,
      eventDescription: eventItem.eventDescription,
      eventTypeID: eventItem.eventTypeID,
      eDoc: '',
      eDocPath: '',
      eDocExt: '',
      cityID: eventItem.cityID,
      userID: userID,
      spType: 'delete',
    };

    this.dataService.postDirect('core-api/Admin/SaveEvent', payload).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Event deleted successfully.');
          this.allEvents = this.allEvents.filter(
            (ev) => ev.id !== eventItem.id,
          );
          this.onSearchChange();
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('DeleteEvent error:', err);
      },
    });
  }

  private resetForm(): void {
    this.newEvent = {
      eventID: 0,
      title: '',
      eventDescription: '',
      eventTypeID: 0,
      country: '',
      countryID: 0,
      city: '',
      cityID: 0,
    };
    this.selectedFile = null;
    this.selectedFileB64 = '';
    this.selectedFileExt = '';
    this.cityList = [];
  }
}
