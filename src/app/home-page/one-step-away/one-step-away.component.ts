import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SharedAuthService } from '../../../shared/services/shared-auth.service';
import { SharedGlobalService } from '../../../shared/services/shared-global.service';
import { UserInterface } from '../../../shared/interfaces/user-interface';

@Component({
  selector: 'app-one-step-away',
  templateUrl: './one-step-away.component.html',
  styleUrls: ['./one-step-away.component.scss']
})
export class OneStepAwayComponent implements OnInit, OnDestroy {

  showAuthButtons: boolean = true;
  private userSub!: Subscription;

  constructor(
    private authService: SharedAuthService,
    private global: SharedGlobalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user: UserInterface | null) => {
      const roleId = user ? this.global.getRoleId() : null;
      this.showAuthButtons = !(roleId === 2 || roleId === 3);
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  onLogin(): void {
    this.router.navigate(['/login']);
  }

  onCreateAccount(): void {
    this.router.navigate(['/sign-in']);
  }
}