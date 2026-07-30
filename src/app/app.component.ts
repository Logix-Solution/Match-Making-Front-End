import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SeoBlockService } from './seo-block.service';
import { SharedOneSignalService } from '../shared/services/shared-onesignal.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  
  title = 'Matchmaking';
 showNav     = true;
  showSideNav = false;

  // ── Routes that show top nav but NO side nav ──────────────────────────────
  private readonly topNavOnlyRoutes: string[] = [
    '/',
    '/client-profile',
    '/create-profile',
    '/signIn',
    '/login',
    '/Forget-Password',
    '/OTP',
    '/preferences-details',
     '/preferences-configuration',
      '/Explore-Match',
       '/Pricing-Plans',
        '/Account-Setting',
       
  ];

  // ── Routes that hide top nav and show side nav ────────────────────────────
  private readonly sideNavRoutes: string[] = [
    '/adminDashboard',
    '/adminRequestManagement',
     '/adminUserManagement',
     '/adminServicesRequests',
    '/adminEventsGallery',
    '/adminbestMatch',
    '/adminMatchComparison',
    '/testimonials',
    '/pricingConfig',
    '/lockProfile',
    '/appointments',
    '/accounts',
   
 
  ];

  constructor(private router: Router,
       private seoBlock: SeoBlockService,
       private oneSignal: SharedOneSignalService
  ) {}

  ngOnInit(): void {
    // Scroll to top on every navigation
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd && typeof window !== 'undefined') {
        window.scrollTo(0, 0);
      }
      this.seoBlock.blockSearchEngines();
          this.oneSignal.init();
    });

    // Update nav state on every route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateNavVisibility());

    // Run once immediately for the initial load
    this.updateNavVisibility();
  }

  private updateNavVisibility(): void {
    const url = this.router.url;

    const isSideNavRoute   = this.sideNavRoutes.includes(url);
    const isTopNavOnlyRoute = this.topNavOnlyRoutes.includes(url);

    // Side nav routes: hide top nav, show side nav
    // Top-nav-only routes: show top nav, hide side nav
    // Anything else defaults to top nav visible, no side nav
    this.showNav     = !isSideNavRoute;
    this.showSideNav =  isSideNavRoute;
  }
}