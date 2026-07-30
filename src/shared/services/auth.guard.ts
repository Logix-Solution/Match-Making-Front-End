import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { SharedGlobalService } from '../services/shared-global.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private global: SharedGlobalService,
    private router: Router,
  ) {}

  canActivate(): boolean {
    if (this.global.isLoggedIn()) {
      return true;
    }
    this.router.navigate(['/login']);
    return false;
  }
}