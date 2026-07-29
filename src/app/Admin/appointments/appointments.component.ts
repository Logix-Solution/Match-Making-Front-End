import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';

interface Appointment {
  consultationID: number;
  firstName: string;
  surName: string;
  email: string;
  date: string;           // "MM/DD/YYYY 00:00:00" from API
  phoneNo: string;
  topicsTodiscuss: string;
  flag: number;           // 0 = pending, 1 = completed
  countryID: number;
  countryName: string;
  countryCode: string;
  languageID: number;
  languageName: string;
  timeslotID: number;
  timeSlot: string;       // "09:00 AM"
}

type TabKey = 'appointments' | 'completed' | 'expired';

@Component({
  selector: 'app-appointments',
  templateUrl: './appointments.component.html',
  styleUrls: ['./appointments.component.scss']
})
export class AppointmentsComponent implements OnInit {
  allAppointments: Appointment[] = [];
  isLoading = false;

  activeTab: TabKey = 'appointments';

  // ─── Detail modal ────────────────────────────────────────────────
  showDetailModal = false;
  selectedAppointment: Appointment | null = null;

  // ─── Mark-done in-flight tracking (per card) ────────────────────
  updatingIds: Set<number> = new Set();

  constructor(
    private toastr: ToastrService,
    private sharedDataService: SharedDataService,
    private sharedGlobalService: SharedGlobalService
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  private loadAppointments(): void {
    this.isLoading = true;
    this.sharedDataService.getHttp('core-api/Consultation/getAppointments').subscribe({
      next: (res: any) => {
        this.allAppointments = res || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Could not load appointments, please refresh');
      }
    });
  }

  // ─── Parse "MM/DD/YYYY 00:00:00" + "09:00 AM" into a real Date ───
  private parseAppointmentDateTime(item: Appointment): Date {
    const datePart = (item.date || '').split(' ')[0]; // "07/28/2026"
    const [month, day, year] = datePart.split('/').map(n => parseInt(n, 10));

    let hours = 0;
    let minutes = 0;
    const slot = (item.timeSlot || '').trim();
    const match = slot.match(/(\d{1,2}):(\d{2})\s?(AM|PM)/i);
    if (match) {
      hours = parseInt(match[1], 10);
      minutes = parseInt(match[2], 10);
      const meridiem = match[3].toUpperCase();
      if (meridiem === 'PM' && hours !== 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;
    }

    return new Date(year, (month || 1) - 1, day || 1, hours, minutes);
  }

  private isExpired(item: Appointment): boolean {
    if (item.flag === 1) return false; // completed items are never "expired"
    return this.parseAppointmentDateTime(item).getTime() < new Date().getTime();
  }

  get appointmentsList(): Appointment[] {
    return this.allAppointments.filter(a => a.flag !== 1 && !this.isExpired(a));
  }

  get completedList(): Appointment[] {
    return this.allAppointments.filter(a => a.flag === 1);
  }

  get expiredList(): Appointment[] {
    return this.allAppointments.filter(a => a.flag !== 1 && this.isExpired(a));
  }

  get visibleList(): Appointment[] {
    if (this.activeTab === 'completed') return this.completedList;
    if (this.activeTab === 'expired') return this.expiredList;
    return this.appointmentsList;
  }

  setTab(tab: TabKey): void {
    this.activeTab = tab;
  }

  // ─── Display helpers ─────────────────────────────────────────────
  displayDate(item: Appointment): string {
    const d = this.parseAppointmentDateTime(item);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  fullName(item: Appointment): string {
    return `${item.firstName} ${item.surName}`.trim();
  }

  // ─── Detail modal ────────────────────────────────────────────────
  openDetail(item: Appointment): void {
    this.selectedAppointment = item;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedAppointment = null;
  }

  // ─── Mark as done ────────────────────────────────────────────────
  markDone(item: Appointment): void {
    if (this.updatingIds.has(item.consultationID)) return;

    this.updatingIds.add(item.consultationID);

    const payload = {
      consultationID: item.consultationID,
      flag: 1,
      userID: this.sharedGlobalService.getUserID(),
      spType: 'insert',
    };

    this.sharedDataService.postDirect('core-api/Consultation/saveConsultationStatus', payload).subscribe({
      next: () => {
        this.updatingIds.delete(item.consultationID);
        item.flag = 1; // move it into Completed tab immediately
        this.toastr.success('Marked as completed');
      },
      error: () => {
        this.updatingIds.delete(item.consultationID);
        this.toastr.error('Could not update status, please try again');
      }
    });
  }

  isUpdating(item: Appointment): boolean {
    return this.updatingIds.has(item.consultationID);
  }
}