import { Injectable } from '@angular/core';
import { SharedGlobalService } from './shared-global.service';
import { SharedNotificationService, AppNotification } from '../services/shared-notification.service';

declare global {
  interface Window {
    OneSignalDeferred: any[];
  }
}

@Injectable({ providedIn: 'root' })
export class SharedOneSignalService {
  private readonly APP_ID = '20f47ea2-90c2-4fcc-b058-98beb7ad60ab'; // safe to expose, not secret
  private initialized = false;

  constructor(
    private global: SharedGlobalService,
    private notificationService: SharedNotificationService,
  ) {
    window.OneSignalDeferred = window.OneSignalDeferred || [];
  }

  // Call once, at app startup (AppComponent.ngOnInit)
  init(): void {
    if (this.initialized) return;
    this.initialized = true;

    window.OneSignalDeferred.push((OneSignal: any) => {
      OneSignal.init({
        appId: this.APP_ID,
        notifyButton: { enable: false }, // we use our own bell UI, not OneSignal's default widget
        allowLocalhostAsSecureOrigin: true, // dev only — remove for production
      });

      // If a push arrives while the tab is open, this fires INSTEAD of the
      // OS-level popup. We use it to also drop the notification straight
      // into SharedNotificationService, so the bell/list update live
      // without waiting for the next poll.
      OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event: any) => {
        const payload = event.notification;

        const notification: AppNotification = {
          id: Date.now(), // temporary local id; real id should come from payload.additionalData if backend provides one
          type: (payload.additionalData?.type as any) || 'system',
          title: payload.title || 'New notification',
          message: payload.body || '',
          createdAt: new Date(),
          isRead: false,
          icon: this.iconForType(payload.additionalData?.type),
          iconBgClass: 'bg-5th txt-7th',
          link: payload.additionalData?.link,
        };

        this.notificationService.pushNotification(notification);

        // Prevent OneSignal's own OS-level popup while the tab is focused,
        // since we're already showing it via the in-app bell/list instead.
        event.preventDefault();
      });

      // Fires when the person clicks an actual OS-level push notification
      // (tab was closed or backgrounded) — use this to deep-link them.
      OneSignal.Notifications.addEventListener('click', (event: any) => {
        const link = event.notification?.additionalData?.link;
        if (link) {
          window.location.hash = link; // hash-based routing, matches your app's URL style
        }
      });
    });
  }

  // Call after login, once you know who the user is — links this browser's
  // OneSignal subscription to your actual userID, so the backend can target
  // pushes at a specific person via the REST API's external_user_id.
  identifyUser(): void {
    const userID = this.global.getUserID();
    if (!userID) return;

    window.OneSignalDeferred.push((OneSignal: any) => {
      OneSignal.login(String(userID));
    });
  }

  // Call on logout, so this browser stops being tied to that user's ID
  clearUser(): void {
    window.OneSignalDeferred.push((OneSignal: any) => {
      OneSignal.logout();
    });
  }

  // Call from a button — never auto-prompt on page load, browsers penalize that heavily
 requestPermission(): void {
  window.OneSignalDeferred.push((OneSignal: any) => {
    OneSignal.Notifications.requestPermission();
  });
}
  isSubscribed(): Promise<boolean> {
    return new Promise((resolve) => {
      window.OneSignalDeferred.push((OneSignal: any) => {
        resolve(OneSignal.User.PushSubscription.optedIn);
      });
    });
  }

  private iconForType(type: string | undefined): string {
    const map: Record<string, string> = {
      profile_submitted: 'bi-person-fill',
      plan_requested: 'bi-credit-card',
      match_found: 'bi-heart-fill',
      message: 'bi-chat-dots-fill',
      system: 'bi-gear-fill',
    };
    return map[type || 'system'] || 'bi-bell-fill';
  }
}