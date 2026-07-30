import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { SharedGlobalService } from '../services/shared-global.service';
import { SharedAuthService } from '../services/shared-auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  private isHandlingExpiry = false;

  constructor(
    private router: Router,
    private global: SharedGlobalService,
    private authService: SharedAuthService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const currentUserString = localStorage.getItem('currentUser');
    const currentUser = currentUserString ? JSON.parse(currentUserString) : null;

    if (currentUser?.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`,
          'Content-Type': 'application/json'
        }
      });
    }

    return next.handle(request).pipe(
      tap(
        () => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse && err.status === 401) {
            this.handleSessionExpired();
          }
        }
      )
    );
  }

  private handleSessionExpired(): void {
    if (this.isHandlingExpiry) return;
    this.isHandlingExpiry = true;

    this.global.clearSession();
    this.authService.logout();

    this.router.navigate(['/login']).then(() => {
      this.isHandlingExpiry = false;
    });
  }
}