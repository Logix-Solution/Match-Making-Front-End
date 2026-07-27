import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// import { SharedDataService } from './shared-data.service'; // uncomment once a real endpoint exists

export type NotificationType = 'profile_submitted' | 'plan_requested' | 'match_found' | 'message' | 'system';

export interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  icon: string;
  iconBgClass: string;
  link?: string;
}

@Injectable({ providedIn: 'root' })
export class SharedNotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>(this.getMockNotifications());
  notifications$ = this.notificationsSubject.asObservable();

  unreadCount$: Observable<number> = this.notifications$.pipe(
    map((list) => list.filter((n) => !n.isRead).length)
  );

  constructor(/* private dataService: SharedDataService */) {
    // Live delivery now comes through SharedOneSignalService's
    // 'foregroundWillDisplay' listener calling pushNotification() directly —
    // see shared-onesignal.service.ts. No polling/websocket needed here
    // for the "app is open" case anymore.
    //
    // Still call loadFromApi() once on startup so the list is populated
    // with real history (not just whatever arrived via push since page load):
    // this.loadFromApi();
  }

  private getMockNotifications(): AppNotification[] {
    return [
      {
        id: 1,
        type: 'profile_submitted',
        title: 'Salif submitted a new profile',
        message: 'Salif completed registration and submitted a profile for review.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        isRead: false,
        icon: 'bi-person-fill',
        iconBgClass: 'bg-5th txt-7th',
      },
      {
        id: 2,
        type: 'plan_requested',
        title: 'Salif requested a plan',
        message: 'Salif requested to upgrade to the Monthly plan.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        isRead: false,
        icon: 'bi-credit-card',
        iconBgClass: 'bg-5th txt-7th',
      },
      {
        id: 3,
        type: 'match_found',
        title: 'New match found',
        message: 'A new potential match has been found based on preferences.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        isRead: true,
        icon: 'bi-heart-fill',
        iconBgClass: 'bg-5th txt-7th',
      },
    ];
  }

  getRecent(limit: number = 2): AppNotification[] {
    return this.notificationsSubject.value.slice(0, limit);
  }

  getAll(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  markAsRead(id: number): void {
    const updated = this.notificationsSubject.value.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.notificationsSubject.next(updated);

    // TODO: persist to backend once available:
    // this.dataService.postDirect('core-api/Admin/markNotificationRead', { notificationID: id }).subscribe();
  }

  markAllAsRead(): void {
    const updated = this.notificationsSubject.value.map((n) => ({ ...n, isRead: true }));
    this.notificationsSubject.next(updated);
  }

  // Called by SharedOneSignalService when a live push arrives, or manually for testing
  pushNotification(notification: AppNotification): void {
    this.notificationsSubject.next([notification, ...this.notificationsSubject.value]);
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

  // ── Real API integration point — implement once endpoint exists ───────
  // private loadFromApi(): void {
  //   this.dataService.getHttp('core-api/Admin/getNotifications', {}).subscribe({
  //     next: (res: any) => {
  //       const data = Array.isArray(res) ? res : [];
  //       this.notificationsSubject.next(data.map((n: any) => this.mapApiItem(n)));
  //     },
  //     error: (err) => console.error('getNotifications error:', err),
  //   });
  // }
  //
  // private mapApiItem(n: any): AppNotification {
  //   return {
  //     id: n.notificationID,
  //     type: n.type,
  //     title: n.title,
  //     message: n.message,
  //     createdAt: new Date(n.createdAt),
  //     isRead: n.isRead === 1,
  //     icon: this.iconForType(n.type),
  //     iconBgClass: 'bg-5th txt-7th',
  //   };
  // }
}