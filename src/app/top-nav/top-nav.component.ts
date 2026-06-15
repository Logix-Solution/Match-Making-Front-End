import { Component, OnInit, HostListener } from '@angular/core';
import { SharedAuthService } from '../../shared/services/shared-auth.service';
import { UserInterface } from '../../shared/interfaces/user-interface';

@Component({
  selector: 'app-top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.scss']
})
export class TopNavComponent implements OnInit {

  currentUser: UserInterface | null = null;
  isNavOpen = false;
  isDropdownOpen = false;

  constructor(private authService: SharedAuthService) {}

  toggleNav(): void {
    this.isNavOpen = !this.isNavOpen;
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click')
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
  }
}