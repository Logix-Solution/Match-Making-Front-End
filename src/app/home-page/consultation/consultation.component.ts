import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
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

interface Country {
  country_id: number;
  country_name: string;
  country_code: string;
  nationality: string;
  currencyTypeID: number;
}

interface Language {
  languageID: number;
  languageName: string;
}

interface TimeSlot {
  timeslotID: number;
  timeSlot: string;
}

interface FieldErrors {
  firstName: boolean;
  surname: boolean;
  email: boolean;
  phone: boolean;
  country: boolean;
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
  countries: Country[] = [];
  languages: Language[] = [];
  timeSlots: TimeSlot[] = [];

  // ─── Time slot selection ────────────────────────────────────────────
  selectedSlotId: number | null = null;
  selectedSlotLabel: string = '';

  // ─── Form fields ──────────────────────────────────────────────────
  firstName = '';
  surname = '';
  email = '';
  phone = '';
  selectedCountryCode = '+92';               // phone dial code
  selectedCountryId: number | null = null;   // Country select -> countryID
  consultationLanguageId: number | null = null;
  specialRequests = '';

  isSubmitting = false;
  isLoadingLookups = false;

  // ─── Inline field validation state ─────────────────────────────────
  fieldErrors: FieldErrors = {
    firstName: false,
    surname: false,
    email: false,
    phone: false,
    country: false,
    language: false,
    specialRequests: false,
    slot: false,
  };

  // ─── OTP Verification Modal ────────────────────────────────────────
  showOtpModal = false;
  otpDigits: string[] = ['', '', '', ''];
  readonly OTP_LENGTH = 4;
  isSendingOtp = false;
  isVerifyingOtp = false;
  otpErrorMessage = '';
  private pendingPayload: any = null;

  constructor(
    private toastr: ToastrService,
    private sharedDataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService
  ) {}

  ngOnInit(): void {
    this.buildCalendar(this.currentMonthDate);
    this.loadLookups();
  }

  // ─── Load dropdown data ─────────────────────────────────────────────
  private loadLookups(): void {
    this.isLoadingLookups = true;

    forkJoin({
      countries: this.sharedDataService.getHttp('cmis-api/getCountry'),
      languages: this.sharedDataService.getHttp('user-api/getLanguage'),
      timeSlots: this.sharedDataService.getHttp('user-api/getTimeSlot'),
    }).subscribe({
      next: (res: any) => {
        this.countries = res.countries || [];
        this.languages = res.languages || [];
        this.timeSlots = res.timeSlots || [];

        // sensible defaults so the form isn't empty on first paint
        // if (this.countries.length) {
        //   this.selectedCountryCode = this.countries[0].country_code;
        //   this.selectedCountryId = this.countries[0].country_id;
        // }
        // if (this.languages.length) {
        //   this.consultationLanguageId = this.languages[0].languageID;
        // }
        // if (this.timeSlots.length) {
        //   this.selectedSlotId = this.timeSlots[0].timeslotID;
        //   this.selectedSlotLabel = this.timeSlots[0].timeSlot;
        // }

        this.isLoadingLookups = false;
      },
      error: () => {
        this.isLoadingLookups = false;
        this.toastr.error('Could not load consultation options, please refresh');
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
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlotId = slot.timeslotID;
    this.selectedSlotLabel = slot.timeSlot;
  }

  isTodayLike(day: CalendarDay): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return this.isSameDate(day.date, yesterday);
  }

  // ─── Step 1: Validate + stage payload + send OTP ───────────────────
  confirmAppointment(): void {
    console.log('confirmAppointment clicked', {
      firstName: this.firstName,
      surname: this.surname,
      email: this.email,
      phone: this.phone,
      selectedCountryId: this.selectedCountryId,
      consultationLanguageId: this.consultationLanguageId,
      specialRequests: this.specialRequests,
      selectedSlotId: this.selectedSlotId,
    });
    this.fieldErrors = {
      firstName: !this.firstName.trim(),
      surname: !this.surname.trim(),
      email: !this.email.trim(),
      phone: !this.phone.trim(),
      country: !this.selectedCountryId,
      language: !this.consultationLanguageId,
      specialRequests: !this.specialRequests.trim(),
      slot: !this.selectedSlotId,
    };

    const hasError = Object.values(this.fieldErrors).some(v => v);
    if (hasError) {
      this.toastr.warning('Please fill all fields');
      return;
    }

    this.pendingPayload = {
      consultationID: 0,
      date: this.formatDateLocal(this.selectedDate),
      firstName: this.firstName,
      surName: this.surname,
      email: this.email,
      phoneNo: this.phone,
      countryCode: this.selectedCountryCode,
      topicToDiscuss: this.specialRequests,
      countryID: this.selectedCountryId,
      languageID: this.consultationLanguageId,
      timeslotID: this.selectedSlotId,
      flag: 0,
      userID: this.sharedGlobalService.getUserID() || 0,
      spType: 'insert',
    };
console.log(this.pendingPayload,'sending object');
    // Open the modal right away — don't gate it on the network call.
    this.openOtpModal();
    this.requestOtp();
  }

  // ─── Step 2: Send OTP (runs while modal is already open) ───────────
  private requestOtp(): void {
    this.isSendingOtp = true;
    this.sharedDataService.sendOTP(this.email).subscribe({
      next: (res: any) => {
        console.log('sendOTP response:', res);
        this.isSendingOtp = false;
      },
      error: (err: any) => {
        console.error('sendOTP error:', err);
        this.isSendingOtp = false;
        this.toastr.error('Could not send verification code, please try again');
      }
    });
  }

  private openOtpModal(): void {
    this.otpDigits = ['', '', '', ''];
    this.otpErrorMessage = '';
    this.showOtpModal = true;
    setTimeout(() => {
      const first = document.getElementById('otp-box-0') as HTMLInputElement;
      if (first) first.focus();
    });
  }

  trackByIndex(index: number): number {
    return index;
  }

  closeOtpModal(): void {
    this.showOtpModal = false;
    this.pendingPayload = null;
  }

  // ─── OTP box handling ────────────────────────────────────────────────
  onOtpInput(event: any, index: number): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/\D/g, '').slice(-1); // keep only the last digit typed
    input.value = cleaned;
    this.otpDigits[index] = cleaned;
    this.otpErrorMessage = '';

    if (cleaned && index < this.OTP_LENGTH - 1) {
      const next = document.getElementById(`otp-box-${index + 1}`) as HTMLInputElement;
      if (next) next.focus();
    }

    if (index === this.OTP_LENGTH - 1 && cleaned && this.otpDigits.every(d => d)) {
      this.verifyOtpAndSave();
    }
  }

  onOtpKeyDown(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.getElementById(`otp-box-${index - 1}`) as HTMLInputElement;
      if (prev) prev.focus();
    }
  }

  resendOtp(): void {
    if (this.isSendingOtp) return;
    this.otpDigits = ['', '', '', ''];
    this.otpErrorMessage = '';
    this.isSendingOtp = true;
    this.sharedDataService.sendOTP(this.email).subscribe({
      next: () => {
        this.isSendingOtp = false;
        this.toastr.success('Verification code resent');
        const first = document.getElementById('otp-box-0') as HTMLInputElement;
        if (first) first.focus();
      },
      error: () => {
        this.isSendingOtp = false;
        this.toastr.error('Failed to resend code, please try again');
      }
    });
  }

  // ─── Step 3: Verify OTP, then save ──────────────────────────────────
  verifyOtpAndSave(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== this.OTP_LENGTH) {
      this.otpErrorMessage = `Please enter the ${this.OTP_LENGTH}-digit code`;
      return;
    }

    this.isVerifyingOtp = true;
    this.otpErrorMessage = '';

    this.sharedDataService.verifyOTP(otp).subscribe({
      next: (response: any) => {
        this.isVerifyingOtp = false;
        if (response && response.length > 0) {
          this.saveConsultation();
        } else {
          this.otpErrorMessage = 'Invalid code, please try again';
          this.otpDigits = ['', '', '', ''];
        }
      },
      error: (err: any) => {
        this.isVerifyingOtp = false;
        this.otpErrorMessage = (err?.status === 400 || err?.status === 404)
          ? 'Invalid or expired code'
          : 'Failed to verify code, please try again';
        this.otpDigits = ['', '', '', ''];
      }
    });
  }

  // ─── Step 4: Save consultation ──────────────────────────────────────
  private saveConsultation(): void {
    if (!this.pendingPayload) return;
    this.isSubmitting = true;

    this.sharedDataService.postDirect('user-api/saveUserConsultation', this.pendingPayload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showOtpModal = false;
        this.pendingPayload = null;
        this.toastr.success('Appointment confirmed successfully');
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
    this.firstName = '';
    this.surname = '';
    this.email = '';
    this.phone = '';
    this.specialRequests = '';
    this.fieldErrors = {
      firstName: false,
      surname: false,
      email: false,
      phone: false,
      country: false,
      language: false,
      specialRequests: false,
      slot: false,
    };

    this.selectedCountryCode = this.countries.length ? this.countries[0].country_code : '+92';
    this.selectedCountryId = this.countries.length ? this.countries[0].country_id : null;
    this.consultationLanguageId = this.languages.length ? this.languages[0].languageID : null;
    this.selectedSlotId = this.timeSlots.length ? this.timeSlots[0].timeslotID : null;
    this.selectedSlotLabel = this.timeSlots.length ? this.timeSlots[0].timeSlot : '';

    this.selectedDate = new Date();
    this.currentMonthDate = new Date();
    this.buildCalendar(this.currentMonthDate);
  }
}