import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { UserInterface } from '../../shared/interfaces/user-interface';
import { Router } from '@angular/router';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { environment } from 'src/envirnment/environment';
import { ProfileCompletionService } from 'src/shared/services/profile-completion.service';
import {
  SharedNotificationService,
  AppNotification,
} from 'src/shared/services/shared-notification.service';
import { SharedOneSignalService } from 'src/shared/services/shared-onesignal.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit, OnDestroy {
  currentUser: UserInterface | null = null;
  isNavOpen = false;
  isDropdownOpen = false;
  profileImageUrl: string = 'assets/images/profile1.png';

  profileCompletion: number = 0;
  preferencesCompletion: number = 0;

  // ─── Notification dropdown ───────────────────────────────────────────────
  isNotificationOpen: boolean = false;
  notifications: AppNotification[] = [];
  unreadNotificationCount: number = 0;
  private unreadCountSubscription!: Subscription;
  private notificationsSubscription!: Subscription;

  toastNotification: AppNotification | null = null;
  private newNotificationSubscription!: Subscription;
  private toastTimeout: any;

  // ─── Push permission banner (click-triggered, not auto-popup) ─────────────
  showPushPrompt: boolean = false;

  private readonly PUSH_PROMPT_KEY = 'pushPermissionAsked';

  constructor(
    private authService: SharedAuthService,
    private dataService: SharedDataService,
    private router: Router,
    private global: SharedGlobalService,
    private profileCompletionService: ProfileCompletionService,
    private notificationService: SharedNotificationService,
    private oneSignal: SharedOneSignalService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadProfileImage();
        this.loadCompletionStatus();
        this.initNotifications();
        this.maybePromptPushPermission();
      }
    });
    this.userRedirect();
  }

  ngOnDestroy(): void {
    // this.notificationService.stopPolling();
    this.unreadCountSubscription?.unsubscribe();
    this.notificationsSubscription?.unsubscribe();
    this.newNotificationSubscription?.unsubscribe();
    clearTimeout(this.toastTimeout);
  }

  // ─── Notifications: same strategy as admin, no auto push-prompt here ──────
  private initNotifications(): void {
    const userID = this.global.getUserID();
    this.notificationService.loadForUser(userID);
    // keeps bell current without needing a reload

    this.unreadCountSubscription =
      this.notificationService.unreadCount$.subscribe((count) => {
        this.unreadNotificationCount = count;
      });

    this.notificationsSubscription =
      this.notificationService.notifications$.subscribe((list) => {
        this.notifications = list;
      });
    this.newNotificationSubscription =
      this.notificationService.newNotification$.subscribe((notification) => {
        this.toastNotification = notification;
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
          this.toastNotification = null;
        }, 6000); // auto-dismiss after 6s
      });
  }

  dismissToast(): void {
  clearTimeout(this.toastTimeout);
  this.toastNotification = null;
}

  // ─── Decide whether to show the "Enable notifications?" banner ────────────
  // We do NOT call requestPermission() automatically — Chrome silently
  // suppresses auto-triggered prompts (shows a muted icon in the address bar
  // instead of the real popup). Showing a button and letting the person click
  // it is what actually triggers the real browser permission dialog.
  private maybePromptPushPermission(): void {
    const alreadyAsked = localStorage.getItem(this.PUSH_PROMPT_KEY);
    if (alreadyAsked) {
      this.oneSignal.identifyUser();
      return;
    }

    if ('Notification' in window && Notification.permission === 'default') {
      this.showPushPrompt = true;
    } else {
      // Already decided (granted/denied) at browser level — nothing to ask
      localStorage.setItem(this.PUSH_PROMPT_KEY, '1');
    }

    this.oneSignal.identifyUser();
  }

  // Called when the person clicks "Allow" on the in-app banner
  onEnableNotificationsClick(): void {
    this.oneSignal.requestPermission(); // real user-gesture click — triggers actual browser popup
    this.showPushPrompt = false;
    localStorage.setItem(this.PUSH_PROMPT_KEY, '1');
  }

  // Called when the person clicks "Not now" / dismisses the banner
  dismissPushPrompt(): void {
    this.showPushPrompt = false;
    localStorage.setItem(this.PUSH_PROMPT_KEY, '1');
  }

  toggleNotificationDropdown(event: Event): void {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  readNotification(item: AppNotification): void {
    const userID = this.global.getUserID();
    this.notificationService.markAsRead(item, userID);
  }

  timeAgo(date: Date): string {
    return this.notificationService.timeAgo(date);
  }

  @HostListener('document:click', ['$event'])
  clickOutsideNotification(event: any): void {
    const target = event.target;
    const clickedInside = target.closest('.notification-dropdown-wrap');
    if (!clickedInside && this.isNotificationOpen) {
      this.isNotificationOpen = false;
    }
  }

  // ── Load profile image from API ───────────────────────────────────────────
  loadProfileImage(): void {
    const userID = this.global.getUserID();
    if (!userID) return;

    (
      this.dataService.getHttp(
        `core-api/Profile/getUserDetails?UserID=${userID}`,
      ) as any
    ).subscribe((res: any) => {
      const user = Array.isArray(res) ? res[0] : res;
      if (user?.eDoc && user.eDoc.trim() !== '') {
        this.profileImageUrl =
          environment.productUrl +
          'assets/user-images/userProfile/' +
          user.eDoc;
      }
    });
  }

  // ── Load profile & preferences completion percentages ─────────────────────
  loadCompletionStatus(): void {
    this.profileCompletionService.calculateCompletion().subscribe({
      next: (result) => {
        this.profileCompletion = result.profileCompletion;
        this.preferencesCompletion = result.preferencesCompletion;
      },
      error: (err) => console.error('calculateCompletion error:', err),
    });
  }

  goToProfileMenu(): void {
    this.isDropdownOpen = false;
    if (this.profileCompletion === 100) {
      this.router.navigate(['/client-profile']);
    } else {
      this.router.navigate(['/create-profile']);
    }
  }

  goToPreferencesMenu(): void {
    this.isDropdownOpen = false;
    if (this.preferencesCompletion === 100) {
      this.router.navigate(['/preferences-details']);
    } else {
      this.router.navigate(['/preferences-configuration']);
    }
  }

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  userRedirect(): void {
    if (this.global.getRoleId() == 2) {
      this.router.navigate(['/adminDashboard']);
    } else {
      this.router.navigate(['/']);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    if (this.router.url === '/') {
      this.performScroll(sectionId);
    } else {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.performScroll(sectionId), 300);
      });
    }
  }

  private performScroll(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
