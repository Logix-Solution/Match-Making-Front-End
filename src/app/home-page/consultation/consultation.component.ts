import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

interface CalendarDay {
  date: Date;
  label: number;
  inCurrentMonth: boolean;
  isWeekend: boolean;
  isPast: boolean;
  isSelected: boolean;
}

interface CountryCode {
  code: string;
  label: string;
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

  // ─── Time slots ───────────────────────────────────────────────────
  timeSlots: string[] = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM',
    '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  ];
  selectedSlot: string = '09:30 AM';

  // ─── Form fields ──────────────────────────────────────────────────
  firstName = '';
  surname = '';
  email = '';
  phone = '';
  selectedCountryCode = '+92';
  country = '';
  consultationLanguage = 'English';
  specialRequests = '';

  countryCodes: CountryCode[] = [
    { code: '+92', label: 'PK +92' },
    { code: '+1', label: 'US +1' },
    { code: '+44', label: 'UK +44' },
    { code: '+971', label: 'UAE +971' },
    { code: '+966', label: 'KSA +966' },
  ];

  countryList: string[] = [
    'Pakistan', 'United States', 'United Kingdom',
    'United Arab Emirates', 'Saudi Arabia', 'Canada', 'Germany',
  ];

  languageList: string[] = ['English', 'Urdu', 'Arabic'];

  isSubmitting = false;

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.buildCalendar(this.currentMonthDate);
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

  selectSlot(slot: string): void {
    this.selectedSlot = slot;
  }

  // ─── Submit ───────────────────────────────────────────────────────
  confirmAppointment(): void {
    if (!this.firstName.trim()) {
      this.toastr.warning('Please enter your first name');
      return;
    }
    if (!this.surname.trim()) {
      this.toastr.warning('Please enter your surname');
      return;
    }
    if (!this.email.trim()) {
      this.toastr.warning('Please enter your email address');
      return;
    }
    if (!this.phone.trim()) {
      this.toastr.warning('Please enter your phone number');
      return;
    }
    if (!this.country) {
      this.toastr.warning('Please select your country');
      return;
    }
    if (!this.consultationLanguage) {
      this.toastr.warning('Please select a consultation language');
      return;
    }
    if (!this.specialRequests.trim()) {
      this.toastr.warning('Please share what you\'d like to discuss');
      return;
    }
    if (!this.selectedSlot) {
      this.toastr.warning('Please select a time slot');
      return;
    }

    const payload = {
      date: this.selectedDate.toISOString().split('T')[0],
      timeSlot: this.selectedSlot,
      firstName: this.firstName,
      surname: this.surname,
      email: this.email,
      phoneCountryCode: this.selectedCountryCode,
      phone: this.phone,
      country: this.country,
      consultationLanguage: this.consultationLanguage,
      specialRequests: this.specialRequests,
    };

    console.log('Consultation booking payload:', payload);

    // TODO: wire to real endpoint once provided, e.g.:
    // this.isSubmitting = true;
    // this.dataService.postDirect('core-api/Consultation/bookAppointment', payload).subscribe({
    //   next: (res: any) => {
    //     this.isSubmitting = false;
    //     this.toastr.success('Appointment confirmed successfully');
    //   },
    //   error: (err: any) => {
    //     this.isSubmitting = false;
    //     this.toastr.error('Something went wrong, please try again');
    //   },
    // });

    this.toastr.success('Appointment confirmed successfully');
  }
  isTodayLike(day: CalendarDay): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return this.isSameDate(day.date, yesterday);
}
}