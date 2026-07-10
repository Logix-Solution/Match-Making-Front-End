import { Component, OnInit, HostListener } from '@angular/core';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { SharedDataService } from '../../shared/services/shared-data.service';
import { UserInterface } from '../../shared/interfaces/user-interface';
import { Router } from '@angular/router';
import { SharedGlobalService } from 'src/shared/services/shared-global.service';
import { environment } from 'src/envirnment/environment';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss'],
})
export class TopNavComponent implements OnInit {

  currentUser:     UserInterface | null = null;
  isNavOpen        = false;
  isDropdownOpen   = false;
  profileImageUrl: string = 'assets/images/profile1.png';  // default fallback

  constructor(
    private authService:  SharedAuthService,
    private dataService:  SharedDataService,
    private router:       Router,
    private global:       SharedGlobalService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadProfileImage();
      }
    });
    this.userRedirect();
  }

  // ── Load profile image from API ───────────────────────────────────────────
  loadProfileImage(): void {
    const userID = this.global.getUserID();
    if (!userID) return;

    (this.dataService.getHttp(`core-api/Profile/getUserDetails?UserID=${userID}`) as any)
      .subscribe((res: any) => {
        const user = Array.isArray(res) ? res[0] : res;
        if (user?.eDoc && user.eDoc.trim() !== '') {
          this.profileImageUrl = environment.productUrl + 'assets/user-images/userProfile/' + user.eDoc;
          console.log('✅ Profile Picture URL:', this.profileImageUrl);
        }
      });
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

  // ── Scroll to a section on the home page ───────────────────────────────────
  // If we're already on the home page, scroll directly. Otherwise navigate
  // home first, then scroll once that view has rendered. The home page's
  // scrollable container (.scroll-verticle) sits below the top nav, so
  // scrollIntoView keeps the nav visible without touching its CSS.
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