import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedDataService } from './shared-data.service';

export interface AppNotification {
  id: number;
  title: string;
  type?: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  icon: string;
  iconBgClass: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class SharedNotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  unreadCount$: Observable<number> = this.notifications$.pipe(
    map((list) => list.filter((n) => !n.isRead).length)
  );

  // ─── Fires only when a LIVE push arrives — used to trigger the toast popup ──
  private newNotificationSubject = new Subject<AppNotification>();
  newNotification$ = this.newNotificationSubject.asObservable();

  constructor(private dataService: SharedDataService) {}

  getRecent(limit: number = 5): AppNotification[] {
    return this.notificationsSubject.value.slice(0, limit);
  }

  getAll(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  loadForUser(userID: number): void {
    if (!userID) return;

    this.dataService.getHttp(`notification-api/Notification/getNotificationLog?userID=${userID}`, {}).subscribe({
      next: (res: any) => {
        const data = Array.isArray(res) ? res : [];
        const mapped = data.map((n: any) => this.mapApiItem(n));
        this.notificationsSubject.next(mapped);
      },
      error: (err) => console.error('getNotificationLog error:', err),
    });
  }

  private mapApiItem(n: any): AppNotification {
    const titleLower = (n.notificationTitle || '').toLowerCase();
    let icon = 'bi-bell-fill';
    if (titleLower.includes('profile')) icon = 'bi-person-fill';
    else if (titleLower.includes('plan')) icon = 'bi-credit-card';
    else if (titleLower.includes('match')) icon = 'bi-heart-fill';

    return {
      id: n.notificationID,
      title: n.notificationTitle || '',
      message: n.notificationSubTitle || '',
      createdAt: this.parseNotificationDate(n.createdOn),
      isRead: n.flag === 1,
      icon,
      iconBgClass: 'bg-5th txt-7th',
    };
  }

  private parseNotificationDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    const match = dateStr.match(/(\w{3})\s+(\d{1,2})\s+(\d{4})\s+(\d{1,2}):(\d{2})(AM|PM)/i);
    if (!match) return new Date();

    const [, monthStr, day, year, hourStr, minute, meridian] = match;
    const months: { [key: string]: number } = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
    };
    const month = months[monthStr.toLowerCase().slice(0, 3)] ?? 0;

    let hour = parseInt(hourStr, 10);
    if (meridian.toUpperCase() === 'PM' && hour !== 12) hour += 12;
    if (meridian.toUpperCase() === 'AM' && hour === 12) hour = 0;

    return new Date(+year, month, +day, hour, +minute);
  }

  markAsRead(notification: AppNotification, userID: number): void {
    if (notification.isRead) return;

    const updated = this.notificationsSubject.value.map((n) =>
      n.id === notification.id ? { ...n, isRead: true } : n
    );
    this.notificationsSubject.next(updated);

    const payload = {
      userID,
      notificationID: notification.id,
      flagID: 1,
      spType: 'insert',
    };

    this.dataService.postDirect('notification-api/Notification/SaveReadNotification', payload).subscribe({
      error: (err) => {
        console.error('SaveReadNotification error:', err);
        const rolledBack = this.notificationsSubject.value.map((n) =>
          n.id === notification.id ? { ...n, isRead: false } : n
        );
        this.notificationsSubject.next(rolledBack);
      },
    });
  }

  timeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  // Called by SharedOneSignalService when a LIVE push arrives
  pushNotification(notification: AppNotification): void {
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
    this.newNotificationSubject.next(notification); // ← triggers the toast, list update stays separate
  }
}