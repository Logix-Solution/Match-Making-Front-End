import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, retry, throwError } from 'rxjs';
import { SharedFormFieldValidationService } from '../services/shared-form-field-validation.service';
import { environment } from '../../envirnment/environment';
import { UserInterface } from '../interfaces/user-interface';
 import { Subject } from 'rxjs';
 import { tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SharedAuthService {

  private currentUserSubject: BehaviorSubject<UserInterface | null>;
  public currentUser$: Observable<UserInterface | null>;

  constructor(
    private http: HttpClient,
    private valid: SharedFormFieldValidationService
  ) {

    const storedUser = localStorage.getItem('currentUser');
    const user = storedUser ? JSON.parse(storedUser) : null;

    this.currentUserSubject = new BehaviorSubject<UserInterface | null>(user);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): UserInterface | null {
    return this.currentUserSubject.value;
  }

 login(email: string, password: string): Observable<UserInterface> {

  return this.http
    .post<UserInterface>(environment.apiUrl + 'auth-api/mobile-auth', { 
      email: email, 
      password: password, 
   
    })
    .pipe(
      map((user: UserInterface) => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUserSubject.next(user);
        return user;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
}

  // login(email: string, password: string): Observable<UserInterface> {
  //  console.log('Attempting login with:', { email, password });
  //   return this.http
  //     .post<UserInterface>(environment.apiUrl + 'auth-api/mobile-auth', {
  //       Loginname: email,
  //       hashpassword: password,
  //       spType: 'READ',
  //     })
  //     .pipe(
  //       map((user: UserInterface) => {
  //         localStorage.setItem('currentUser', JSON.stringify(user));
  //         this.currentUserSubject.next(user);
  //         return user;
  //       })
  //     );
  // }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('moduleId');
    this.currentUserSubject.next(null); // important!
  }

  getCompanyHttp(url: string, params: any): Observable<any> {
    return this.http
      .get(environment.apiUrl + url + params)
      .pipe(retry(3), catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown Error!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }

       private menuTriggerSource = new Subject<void>();
        menuTrigger$ = this.menuTriggerSource.asObservable();
        
        triggerMenu() {
            this.menuTriggerSource.next();
        }

        googleLoginFlow(googleData: any): Observable<any> {
  const email = googleData.email;
  const roleID = 1;

  console.log('=== Google Login Flow Started ===');
  console.log('Google Data:', googleData);
  console.log('Full API URL:', `${environment.apiUrlauth }auth-api/googleAuth`);
  console.log('Request Payload:', {
    loginname: email,
    roleID: roleID
  });

  return this.http.post(`${environment.apiUrlauth}auth-api/googleAuth`, {
    loginname: email,
    roleID: roleID
  }, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).pipe(
    tap((response) => {
      console.log('✅ Google Auth SUCCESS Response:', response);
    }),
    catchError((error) => {
      console.error('❌ Google Auth ERROR:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.error?.message || error.message,
        error: error.error,
        headers: error.headers,
        requestPayload: {
          loginname: email,
          roleID: roleID
        }
      });
      return throwError(() => error);
    })
  );
}

// Save new Google user
saveGoogleUser(googleData: any): Observable<any> {
  console.log('=== Save Google User Function Called ===');
  console.log('Google Data:', googleData);
  
  const payload = {
    userID: 0,
    userRoleID: 0,
    userName: googleData.name || 'Google User',
    contact: googleData.phone || '', 
    email: googleData.email,
    roleID: 1,
    spType: 'insert'
  };
  
  console.log('Save User Payload:', JSON.stringify(payload, null, 2));
  console.log('Full API URL:', `${environment.apiUrlauth}auth-api/googleSaveUser`);
  
  return this.http.post(`${environment.apiUrlauth}auth-api/googleSaveUser`, payload, {
    headers: {
      'Content-Type': 'application/json'
    }
  }).pipe(
    tap((response) => {
      console.log('✅ Save User SUCCESS Response:', response);
    }),
    catchError((error) => {
      console.error('❌ Save User ERROR:', {
        status: error.status,
        statusText: error.statusText,
        url: error.url,
        message: error.error?.message || error.message,
        error: error.error,
        headers: error.headers,
        requestPayload: payload
      });
      return throwError(() => error);
    })
  );
}

  completeGoogleSignIn(googleData: any): Observable<any> {
    console.log('🔄 === Complete Google Sign-In Process ===');
    console.log('📋 Starting with Google Data:', googleData);
    
    // Step 1: Save user (or ignore if already exists)
    return this.saveGoogleUser(googleData).pipe(
      // Step 2: After saving, attempt to login
      switchMap((saveResponse) => {
        console.log('✅ User save completed, now attempting login...');
        console.log('📋 Save Response:', saveResponse);
        
        // Delay slightly to ensure DB commit
        return new Observable(observer => {
          setTimeout(() => {
            this.googleLoginFlow(googleData).subscribe({
              next: (loginResponse) => {
                observer.next(loginResponse);
                observer.complete();
              },
              error: (loginError) => {
                observer.error(loginError);
              }
            });
          }, 500); // 500ms delay
        });
      }),
      catchError((saveError) => {
        console.log('⚠️ Save returned error, checking if user already exists...');
        
        // If user already exists (409 Conflict), try to login anyway
        if (saveError.status === 409 || 
            (saveError.error?.message?.toLowerCase() || '').includes('already exists') ||
            (saveError.error?.message?.toLowerCase() || '').includes('duplicate')) {
          
          console.log('🔄 User already exists, attempting login...');
          return this.googleLoginFlow(googleData);
        }
        
        // For other errors, rethrow
        return throwError(() => saveError);
      })
    );
  }
}
