import { Component,OnInit, OnDestroy, HostListener } from '@angular/core';

import { SharedGlobalService } from '../../shared/services/shared-global.service';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

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
    private authService :SharedAuthService,
  ) {}

  private subscription!: Subscription;
  private unreadCountSubscription!: Subscription;
  loginName: string = '';
   roleTitle: string = '';
  menuList: any = [];
  showLogoDropdown: boolean = false;
  unreadMessageCount: number = 0;
  roleId: number | null = null;


  ngOnInit(): void {
     this.roleId = this.global.getRoleId();

    this.subscription = this.authSharedService.menuTrigger$.subscribe(() => {
      this.getMenu();
      this.getRoleTitleFromMenus();
    });

    this.getMenu();
    this.getLoginName();
     this.getRoleTitleFromMenus();
    

  }

  

  getMenu() {
    this.menuList = [];
    this.menuList = this.global.getMenus();

    console.log(this.menuList, 'menuList');
  }

  getLoginName() {
    // Get the current user from localStorage
    const user = this.global.getUser();

    if (user && user.loginName) {
      this.loginName = user.loginName;
    } else if (user && user.fullName) {
      // Fallback to fullName if loginName is not available
      this.loginName = user.fullName;
    } else {
      // Final fallback
      this.loginName = 'User';
    }

    console.log('Login Name:', this.loginName);
  }

  getRoleTitleFromMenus() {
    // Get menus from localStorage
    const menusString = localStorage.getItem('currentMenus');
    
    if (menusString) {
      try {
        const menus = JSON.parse(menusString);
        
        if (menus && menus.length > 0) {
          // Extract roleTitle from the first menu item
          this.roleTitle = menus[0].roleTitle || '';
          console.log('Role Title from menus:', this.roleTitle);
          return;
        }
      } catch (error) {
        console.error('Error parsing currentMenus:', error);
      }
    }
    
    // Fallback to global service
    this.roleTitle = this.global.getRoleTitle() || '';
    console.log('Role Title from service:', this.roleTitle);
  }
  // logout() {
  //   localStorage.removeItem('currentUser');
  //   localStorage.removeItem('currentMenus');
  //   localStorage.removeItem('authToken');
  //   sessionStorage.removeItem('userData');

  //   this.router.navigate(['/']);
  // }
  // Toggle logo dropdown
  toggleLogoDropdown() {
    this.showLogoDropdown = !this.showLogoDropdown;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  clickOutside(event: any) {
    const target = event.target;
    const clickedInside = target.closest('.position-relative');

    if (!clickedInside && this.showLogoDropdown) {
      this.showLogoDropdown = false;
    }
  }

  isMessagesMenu(menuTitle: string): boolean {
    return menuTitle?.toLowerCase().includes('message');
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
    if (this.unreadCountSubscription) this.unreadCountSubscription.unsubscribe();
  }

    logout(): void {
    this.authService.logout();

     this.router.navigate(['/']);
  }
}

