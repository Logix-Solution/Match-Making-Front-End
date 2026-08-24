import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedFormFieldValidationService } from 'src/shared/services/shared-form-field-validation.service';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { environment } from 'src/envirnment/environment';

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
}

@Component({
  selector: 'app-premium-services',
  templateUrl: './premium-services.component.html',
  styleUrls: ['./premium-services.component.scss'],
})
export class PremiumServicesComponent implements OnInit {
  // ── Service cards ─────────────────────────────────────────────────────────
  services: ServiceItem[] = [
    {
      id: 'match-making',
      title: 'Matchmaking',
      imageUrl: 'assets/images/matchmaking.svg',
      eventTypeID: 1,
    },
    {
      id: 'event-planning',
      title: 'Events',
      imageUrl: 'assets/images/eventPlaning.svg',
      eventTypeID: 2,
    },
    {
      id: 'destination-wedding',
      title: 'Destination Wedding',
      imageUrl: 'assets/images/destinationwedding.svg',
      eventTypeID: 3,
    },
    {
      id: 'honeymoon',
      title: 'Honeymoon',
      imageUrl: 'assets/images/honeymoon.svg',
      eventTypeID: 4,
    },
  ];

  // ── Modal state ───────────────────────────────────────────────────────────
  isModalOpen = false;
  selectedService: ServiceItem | null = null;
  modalEvents: EventDetail[] = [];
  eventDescription = '';
  isLoading = false;

  // ── Interest state ────────────────────────────────────────────────────────
  // interestStatusID always reflects the CURRENT status as returned by GET.
  // 0 = no interest sent yet (button shows "Send Interest")
  // 1 = interest already sent (button shows "Withdraw Interest")
  interestStatusID = 0;

  // serviceID from GET: 0 (or falsy) means no record exists yet -> insert.
  // Non-zero means a record already exists -> update.
  serviceID = 0;

  isSendingInterest = false;

  // ── Slider ────────────────────────────────────────────────────────────────
  readonly visibleCount = 3;
  currentSlide = 0;

  constructor(
    private dataService: SharedDataService,
    private valid: SharedFormFieldValidationService,
    private sharedGlobalService: SharedGlobalService,
  ) {}

  ngOnInit(): void {}

  // ── Open modal & load data ────────────────────────────────────────────────
  openOverlay(service: ServiceItem): void {
    this.selectedService = service;
    this.isModalOpen = true;
    this.currentSlide = 0;
    this.modalEvents = [];
    this.eventDescription = '';
    this.interestStatusID = 0;
    this.serviceID = 0;
    this.isLoading = true;
    const currentUserID = this.sharedGlobalService.getUserID() || 0;
    console.log('userID being sent:', currentUserID); // 👈 check this

    (
      this.dataService.getHttp('user-api/getDashboardEvent', {
        eventTypeID: service.eventTypeID,
        userID: currentUserID,
      }) as any
    ).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        console.log('RAW RESPONSE:', data[0]);
        if (data.length) {
          // Parse eDoc JSON string
          try {
            const parsedEvents: EventDetail[] = JSON.parse(data[0].eDoc);
            // Build full image URL for each event's eDoc filename
            this.modalEvents = parsedEvents.map((event) => ({
              ...event,
              eDoc:
                event.eDoc && event.eDoc.trim() !== ''
                  ? environment.productUrl +
                    'assets/user-images/Events/' +
                    event.eDoc
                  : 'assets/images/default-event.png',
            }));
          } catch (e) {
            this.modalEvents = [];
          }
          // Description from API
          this.eventDescription = data[0].eventDescription || '';

          // interestStatusID and serviceID now come from the top-level response
          this.interestStatusID =
            data[0].interestStatusID !== undefined
              ? data[0].interestStatusID
              : 0;

          this.serviceID =
            data[0].serviceID !== undefined ? data[0].serviceID : 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  closeOverlay(): void {
    this.isModalOpen = false;
    this.selectedService = null;
    this.modalEvents = [];
    this.eventDescription = '';
  }

  // ── Send / Withdraw Interest (insert first time, update thereafter) ──────
  sendInterest(): void {
    if (!this.selectedService) return;

    const roleID = this.sharedGlobalService.getRoleId();

    // Only role 3 (regular user) is allowed to send/withdraw interest
    if (roleID !== 3) {
      this.valid.apiErrorResponse('Please login with user account.');
      return;
    }

    const senderID = this.sharedGlobalService.getUserID() || 0;

    // No record yet -> first-time insert. Otherwise -> update (toggle).
    const isInsert = !this.serviceID;

    const newStatusID = isInsert ? 1 : this.interestStatusID === 1 ? 0 : 1;

    const payload = {
      userID: senderID,
      eventTypeID: this.selectedService.eventTypeID,
      eventID: 0,
      serviceID: isInsert ? 0 : this.serviceID,
      statusID: newStatusID,
      spType: isInsert ? 'insert' : 'update',
    };
    console.log(payload, 'sendInterest');

    this.isSendingInterest = true;

    (
      this.dataService.postDirect('core-api/Admin/SaveService', payload) as any
    ).subscribe({
      next: (res: any) => {
        const response = Array.isArray(res) ? res[0] : res;
        if (response?.includes('Success')) {
          this.valid.apiInfoResponse(
            newStatusID === 1
              ? 'Interest sent successfully.'
              : 'Interest withdrawn successfully.',
            // this.openOverlay(this.selectedService!) // Refresh modal data to reflect new interest status
          );
          this.openOverlay(this.selectedService!); // Refresh modal data to reflect new interest status
          // reflect the new state locally so the button/color update immediately
          this.interestStatusID = newStatusID;
        } else {
          this.valid.apiErrorResponse(response);
        }
        this.isSendingInterest = false;
      },
      error: (err: any) => {
        this.valid.apiErrorResponse('Something went wrong. Please try again.');
        console.error('SaveEvent error:', err);
        this.isSendingInterest = false;
      },
    });
  }

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
