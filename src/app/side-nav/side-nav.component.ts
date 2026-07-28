import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SharedGlobalService } from '../../shared/services/shared-global.service';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedNotificationService, AppNotification } from 'src/shared/services/shared-notification.service';
import { SharedOneSignalService } from 'src/shared/services/shared-onesignal.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss']
})
export class SideNavComponent implements OnInit, OnDestroy {
  constructor(
    private global: SharedGlobalService,
    private authSharedService: SharedAuthService,
    private router: Router,
    private authService: SharedAuthService,
    private notificationService: SharedNotificationService,
    private oneSignal: SharedOneSignalService,
  ) {}

  private subscription!: Subscription;
  private unreadCountSubscription!: Subscription;
  private notificationsSubscription!: Subscription;

  loginName: string = '';
  roleTitle: string = '';
  menuList: any = [];
  showLogoDropdown: boolean = false;
  unreadMessageCount: number = 0;
  roleId: number | null = null;
  unreadNotificationCount: number = 0;
  isPushSubscribed: boolean = false;

  // ─── Notification dropdown ───────────────────────────────────────────────
  isNotificationOpen: boolean = false;
  notifications: AppNotification[] = [];

  ngOnInit(): void {
    this.roleId = this.global.getRoleId();

    this.subscription = this.authSharedService.menuTrigger$.subscribe(() => {
      this.getMenu();
      this.getRoleTitleFromMenus();
    });

    this.getMenu();
    this.getLoginName();
    this.getRoleTitleFromMenus();

    const userID = this.global.getUserID();
    this.notificationService.loadForUser(userID);

    this.unreadCountSubscription = this.notificationService.unreadCount$.subscribe((count) => {
      this.unreadNotificationCount = count;
    });

    this.notificationsSubscription = this.notificationService.notifications$.subscribe((list) => {
      this.notifications = list;
    });

    // Admin side: identify user for targeted pushes only — never auto-prompt permission
    this.oneSignal.identifyUser();
    this.oneSignal.isSubscribed().then((subscribed) => {
      this.isPushSubscribed = subscribed;
    });
  }

  enablePushNotifications(): void {
    this.oneSignal.requestPermission();
    this.isPushSubscribed = true;
  }

  toggleNotificationDropdown(event: Event): void {
    event.stopPropagation();
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  readNotification(item: AppNotification): void {
    const userID = this.global.getUserID();
    this.notificationService.markAsRead(item, userID);
  }

  getMenu() {
    this.menuList = [];
    this.menuList = this.global.getMenus();
  }

  getLoginName() {
    const user = this.global.getUser();
    if (user && user.loginName) {
      this.loginName = user.loginName;
    } else if (user && user.fullName) {
      this.loginName = user.fullName;
    } else {
      this.loginName = 'User';
    }
  }

  getRoleTitleFromMenus() {
    const menusString = localStorage.getItem('currentMenus');
    if (menusString) {
      try {
        const menus = JSON.parse(menusString);
        if (menus && menus.length > 0) {
          this.roleTitle = menus[0].roleTitle || '';
          return;
        }
      } catch (error) {
        console.error('Error parsing currentMenus:', error);
      }
    }
    this.roleTitle = this.global.getRoleTitle() || '';
  }

  toggleLogoDropdown() {
    this.showLogoDropdown = !this.showLogoDropdown;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    const target = event.target;

    const clickedInsideLogo = target.closest('.position-relative.logo-dropdown-wrap');
    if (!clickedInsideLogo && this.showLogoDropdown) {
      this.showLogoDropdown = false;
    }

    const clickedInsideNotif = target.closest('.notification-dropdown-wrap');
    if (!clickedInsideNotif && this.isNotificationOpen) {
      this.isNotificationOpen = false;
    }
  }

  isMessagesMenu(menuTitle: string): boolean {
    return menuTitle?.toLowerCase().includes('message');
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.unreadCountSubscription) this.unreadCountSubscription.unsubscribe();
    if (this.notificationsSubscription) this.notificationsSubscription.unsubscribe();
  }

  logout(): void {
    this.oneSignal.clearUser();
    this.authService.logout();
    this.router.navigate(['/']);
  }
  timeAgo(date: Date): string {
  return this.notificationService.timeAgo(date);
}
}