import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';

interface ServiceItem {
  id: string;
  title: string;
  imageUrl: string;
  eventTypeID: number;
}

interface EventDetail {
  eventID: number;
  eventTitle: string;
  eDoc: string;
  cityID: number;
  cityName: string;
  countryID: number;
  countryName: string;
  interestStatusID: number;
}

@Component({
  selector: 'app-premium-services',
  templateUrl: './premium-services.component.html',
  styleUrls: ['./premium-services.component.scss']
})
export class PremiumServicesComponent implements OnInit {

  // ── Service cards ─────────────────────────────────────────────────────────
  services: ServiceItem[] = [
    { id: 'match-making',        title: 'Matchmaking',         imageUrl: 'assets/images/matchmaking.svg',        eventTypeID: 1 },
    { id: 'event-planning',      title: 'Events',              imageUrl: 'assets/images/eventPlaning.svg',       eventTypeID: 2 },
    { id: 'destination-wedding', title: 'Destination Wedding', imageUrl: 'assets/images/destinationwedding.svg', eventTypeID: 3 },
    { id: 'honeymoon',           title: 'Honeymoon',           imageUrl: 'assets/images/honeymoon.svg',          eventTypeID: 4 }
  ];

  // ── Modal state ───────────────────────────────────────────────────────────
  isModalOpen        = false;
  selectedService:     ServiceItem | null = null;
  modalEvents:         EventDetail[] = [];
  eventDescription     = '';
  isLoading            = false;

  // ── Interest state ────────────────────────────────────────────────────────
  interestStatusID     = 1;   // 1 = send interest, 0 = withdraw
  isSendingInterest    = false;

  // ── Slider ────────────────────────────────────────────────────────────────
  readonly visibleCount = 3;
  currentSlide = 0;

  constructor(private dataService: SharedDataService,
    private  valid: SharedFormFieldValidationService,
    private sharedGlobalService: SharedGlobalService,
  ) {}

  ngOnInit(): void {}

  // ── Open modal & load data ────────────────────────────────────────────────
  openOverlay(service: ServiceItem): void {
    this.selectedService  = service;
    this.isModalOpen      = true;
    this.currentSlide     = 0;
    this.modalEvents      = [];
    this.eventDescription = '';
    this.interestStatusID = 1;
    this.isLoading        = true;

    (this.dataService.getHttp('user-api/getDashboardEvent', { eventTypeID: service.eventTypeID }) as any)
      .subscribe({
        next: (res: any) => {
          const data = Array.isArray(res) ? res : [];
          if (data.length) {
            // Parse eDoc JSON string
            try {
              this.modalEvents = JSON.parse(data[0].eDoc);
            } catch (e) {
              this.modalEvents = [];
            }
            // Description from API
            this.eventDescription = data[0].eventDescription || '';

            // Check interestStatusID from first event if available
            if (this.modalEvents.length && this.modalEvents[0].interestStatusID !== undefined) {
              this.interestStatusID = this.modalEvents[0].interestStatusID;
            }
          }
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
  }

  closeOverlay(): void {
    this.isModalOpen      = false;
    this.selectedService  = null;
    this.modalEvents      = [];
    this.eventDescription = '';
  }

  // ── Send Interest ─────────────────────────────────────────────────────────
  sendInterest(): void {
    if (!this.selectedService) return;

    const loggedInUser = JSON.parse(localStorage.getItem('userData') || '{}');
    const senderID     = this.sharedGlobalService.getUserID() || 0;

    const payload = {
      senderID:         senderID,
      receiverID:       this.selectedService.eventTypeID,
      interestStatusID: this.interestStatusID,
      spType:           'insert'
    };
    console.log(payload,'sendInterest');

    this.isSendingInterest = true;

    (this.dataService.postDirect('core-api/Admin/saveUserInterest', payload) as any)
      .subscribe({
       next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse('Interest Send successfully.');
      
        } else {
          this.valid.apiErrorResponse(response);
        }
      },
      error: (err: any) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('SaveEvent error:', err);
      },
    });
  }
  //       next: () => {
  //         // Toggle: 1 → 0 → 1
  //         this.interestStatusID  = this.interestStatusID === 1 ? 0 : 1;
  //         this.isSendingInterest = false;
  //       },
  //       error: () => { this.isSendingInterest = false; }
  //     });
  // }

  // ── Slider ────────────────────────────────────────────────────────────────
  get sliderDots(): number[] {
    const count = Math.max(0, this.modalEvents.length - this.visibleCount + 1);
    return Array.from({ length: count }, (_, i) => i);
  }

  prevSlide(): void {
    if (this.currentSlide > 0) this.currentSlide--;
  }

  nextSlide(): void {
    const max = this.modalEvents.length - this.visibleCount;
    if (this.currentSlide < max) this.currentSlide++;
  }
}