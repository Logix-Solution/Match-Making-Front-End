import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';


interface CalendarDay {
  date: Date;
  label: number;
  inCurrentMonth: boolean;
  isWeekend: boolean;
  isPast: boolean;
  isSelected: boolean;
}

interface Language {
  languageID: number;
  languageName: string;
}

interface TimeSlot {
  timeslotID: number;
  timeSlot: string;
  slotStatus: string; // 'Available' | 'Booked' (or any other non-'Available' value returned by the API)
}

interface FieldErrors {
  language: boolean;
  specialRequests: boolean;
  slot: boolean;
}

@Component({
  selector: 'app-consultation',
  templateUrl: './consultation.component.html',
  styleUrls: ['./consultation.component.scss']
})
export class ConsultationComponent implements OnInit {
  // ─── Calendar state ───────────────────────────────────────────────
  weekdayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  currentMonthDate: Date = new Date();
  calendarWeeks: CalendarDay[][] = [];
  selectedDate: Date = new Date();

  // ─── API-driven lists ───────────────────────────────────────────────
  languages: Language[] = [];
  timeSlots: TimeSlot[] = [];

  // ─── Time slot selection ────────────────────────────────────────────
  selectedSlotId: number | null = null;
  selectedSlotLabel: string = '';
  isLoadingSlots = false;

  // ─── Form fields (kept, still shown in UI) ─────────────────────────
  consultationLanguageId: number | null = null;
  specialRequests = '';

  isSubmitting = false;
  isLoadingLookups = false;

  // ─── Logged-in user's country info (pulled from userProfile JSON) ──
  userCountryCode: string = '';
  userCountryID: number | null = null;

  // ─── Inline field validation state ─────────────────────────────────
  fieldErrors: FieldErrors = {
    language: false,
    specialRequests: false,
    slot: false,
  };

  constructor(
    private toastr: ToastrService,
    private sharedDataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService,
    private  router: Router 
  ) {}

  ngOnInit(): void {
    this.buildCalendar(this.currentMonthDate);
    this.loadLookups();
    this.loadTimeSlots(this.selectedDate);
    this.loadUserCountryInfo();
  }

  // ─── Load logged-in user's countryCode/countryID from their profile ─
  private loadUserCountryInfo(): void {
    const userID = this.sharedGlobalService.getUserID();
    if (!userID) return;

    this.sharedDataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`, {}).subscribe({
      next: (res: any) => {
        const u = Array.isArray(res) ? res[0] : res;
        if (!u) return;

        let profileItems: any[] = [];
        try { profileItems = JSON.parse(u.userProfile || '[]'); } catch { profileItems = []; }

        const locationItem = profileItems.find((p: any) => p.cityID !== undefined && p.isPreference === 0);
        this.userCountryCode = locationItem?.countryCode || '';
        this.userCountryID = locationItem?.countryID ?? null;
      },
      error: (err) => console.error('getUserDetails (country info) error:', err),
    });
  }

  // ─── Load dropdown data ─────────────────────────────────────────────
  private loadLookups(): void {
    this.isLoadingLookups = true;

    this.sharedDataService.getHttp('core-api/Consultation/getLanguage').subscribe({
      next: (res: any) => {
        this.languages = res || [];
        this.isLoadingLookups = false;
      },
      error: () => {
        this.isLoadingLookups = false;
        this.toastr.error('Could not load consultation options, please refresh');
      }
    });
  }

  // ─── Load time slots for the currently selected date ────────────────
  private loadTimeSlots(date: Date): void {
    this.isLoadingSlots = true;
    this.selectedSlotId = null;
    this.selectedSlotLabel = '';

    const dateStr = this.formatDateLocal(date);
    this.sharedDataService.getHttp(`core-api/Consultation/getTimeSlot?date=${dateStr}`).subscribe({
      next: (res: any) => {
        this.timeSlots = res || [];
        this.isLoadingSlots = false;
      },
      error: () => {
        this.timeSlots = [];
        this.isLoadingSlots = false;
        this.toastr.error('Could not load time slots for this date');
      }
    });
  }

  // ─── Calendar generation ──────────────────────────────────────────
  private buildCalendar(anchorDate: Date): void {
    const year = anchorDate.getFullYear();
    const month = anchorDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    // Convert JS Sunday=0..Saturday=6 into Monday-first index (0=Mon..6=Sun)
    const firstWeekdayIndex = (firstOfMonth.getDay() + 6) % 7;

    const gridStart = new Date(firstOfMonth);
    gridStart.setDate(firstOfMonth.getDate() - firstWeekdayIndex);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeks: CalendarDay[][] = [];
    const cursor = new Date(gridStart);

    for (let w = 0; w < 6; w++) {
      const week: CalendarDay[] = [];
      for (let d = 0; d < 7; d++) {
        const dayDate = new Date(cursor);
        dayDate.setHours(0, 0, 0, 0);

        week.push({
          date: dayDate,
          label: dayDate.getDate(),
          inCurrentMonth: dayDate.getMonth() === month,
          isWeekend: d === 5 || d === 6, // Sat / Sun columns
          isPast: dayDate.getTime() < today.getTime(),
          isSelected: this.isSameDate(dayDate, this.selectedDate),
        });

        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(week);
    }

    this.calendarWeeks = weeks;
  }

  private isSameDate(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  // Local YYYY-MM-DD (avoids toISOString() UTC day-shift bug)
  private formatDateLocal(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  get monthLabel(): string {
    return this.currentMonthDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    }).toUpperCase();
  }

  get selectedDateLabel(): string {
    return this.selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).toUpperCase();
  }

  prevMonth(): void {
    const d = new Date(this.currentMonthDate);
    d.setMonth(d.getMonth() - 1);
    this.currentMonthDate = d;
    this.buildCalendar(d);
  }

  nextMonth(): void {
    const d = new Date(this.currentMonthDate);
    d.setMonth(d.getMonth() + 1);
    this.currentMonthDate = d;
    this.buildCalendar(d);
  }

  selectDate(day: CalendarDay): void {
    if (day.isPast) return;
    this.selectedDate = day.date;
    this.buildCalendar(this.currentMonthDate);
    this.loadTimeSlots(this.selectedDate);
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.slotStatus !== 'Available') return; // booked slots aren't selectable
    this.selectedSlotId = slot.timeslotID;
    this.selectedSlotLabel = slot.timeSlot;
    this.fieldErrors.slot = false;
  }

  isTodayLike(day: CalendarDay): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDate(day.date, yesterday);
  }

  // ─── Validate + save directly (no OTP step) ─────────────────────────
  confirmAppointment(): void {
    this.fieldErrors = {
      language: !this.consultationLanguageId,
      specialRequests: !this.specialRequests.trim(),
      slot: !this.selectedSlotId,
    };

    const hasError = Object.values(this.fieldErrors).some(v => v);
    if (hasError) {
      this.toastr.warning('Please fill all fields');
      return;
    }

    const payload = {
      consultationID: 0,
      date: this.formatDateLocal(this.selectedDate),
      // These fields are no longer collected in the UI but the save
      // endpoint still expects them, so they're sent through empty.
      firstName: '',
      surName: '',
      email: '',
      phoneNo: '',
      countryCode: this.userCountryCode,
      countryID: this.userCountryID,
      topicToDiscuss: this.specialRequests,
      languageID: this.consultationLanguageId,
      timeslotID: this.selectedSlotId,
      flag: 0,
      userID: this.sharedGlobalService.getUserID() || 0,
      spType: 'insert',
    };
    console.log('Payload for saving consultation:', payload);
    this.saveConsultation(payload);
  }

  // ─── Save consultation ──────────────────────────────────────────────
  private saveConsultation(payload: any): void {
    this.isSubmitting = true;

    this.sharedDataService.postDirect('Core-api/Consultation/saveUserConsultation', payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastr.success('Appointment confirmed successfully');
        this.router.navigate(['/registerationFee']);
        this.resetForm();
      },
      error: () => {
        this.isSubmitting = false;
        this.toastr.error('Something went wrong, please try again');
      }
    });
  }

  // ─── Reset form back to defaults after a successful booking ─────────
  private resetForm(): void {
    this.specialRequests = '';
    this.fieldErrors = {
      language: false,
      specialRequests: false,
      slot: false,
    };

    this.consultationLanguageId = this.languages.length ? this.languages[0].languageID : null;

    this.selectedDate = new Date();
    this.currentMonthDate = new Date();
    this.buildCalendar(this.currentMonthDate);
    this.loadTimeSlots(this.selectedDate);
  }
}