import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, retry, Subject, takeUntil, throwError } from 'rxjs';
import { environment } from '../../envirnment/environment';
import { SharedFormFieldValidationService } from './shared-form-field-validation.service';
import { MyFormField } from '../interfaces/myFormFields';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor(private http: HttpClient,private valid: SharedFormFieldValidationService) {}
  
    private baseURL = environment.apiUrl;

    destory$: Subject<boolean> = new Subject<boolean>();
    // getHTTP
    // data.service.ts
    getHttp(url: string, paramsObj?: { [key: string]: any }) {
      let httpParams = new HttpParams();
  
      if (paramsObj) {
        Object.keys(paramsObj).forEach(key => {
          if (paramsObj[key] !== null && paramsObj[key] !== undefined && paramsObj[key] !== '') {
            httpParams = httpParams.set(key, paramsObj[key]);
          }
        });
      }
  
      return this.http.get(this.baseURL + url, { params: httpParams });
    }

    public saveHttp(pageInterface: any,formFields: MyFormField[],url: string): Observable<any> {
       console.log('validateToastr result:', this.valid.validateToastr(formFields));

    if (this.valid.validateToastr(formFields) == true) {
      // set page interface
      pageInterface = this.setInterface(pageInterface, formFields);

      // save
      if (formFields[0].value == '0') {
        if (formFields[1].value == '') {
          pageInterface.spType = 'insert';
        } else if (formFields[1].value != '') {
          pageInterface.spType = formFields[1].value;
        }
      } else {
        if (formFields[1].value == '') {
          pageInterface.spType = 'update';
        } else if (formFields[1].value == 'Complete') {
          pageInterface.spType = 'Complete';
        } else if (formFields[1].value != '') {
          pageInterface.spType = formFields[1].value;
        } else {
          pageInterface.spType = 'insert';
        }
      }
      console.log(pageInterface);
      return this.createRequest(url, pageInterface).pipe(
        takeUntil(this.destory$)
      );
    } else {
      // Return an empty observable when validation fails
      return new Observable(observer => {
        observer.complete();
      });
    }
  }


   /** Core POST request method */
  private createRequest(url: string, data: any): Observable<any> {
    return this.http
      .post(this.baseURL + url, data)
      .pipe(
        retry(0),
        catchError(error => this.handleError(error))
      );
  }



  public deleteHttp(
    pageInterface: any,
    formFields: MyFormField[],
    url: string
  ): any {
    if (this.valid.validateToastr(formFields) == true) {
      // set page interface
      pageInterface = this.setInterface(pageInterface, formFields);

      console.log(pageInterface);
      return this.createRequest(url, pageInterface).pipe(
        takeUntil(this.destory$)
      );
    }
  }



  setInterface(pageInterface: any, formFields: MyFormField[]): any {
    const headers: Array<any> = Object.keys(pageInterface).map((key) => {
      return { header: key };
    });
    // console.log(headers);
    for (let i = 0; i < headers.length; i++) {
      if (formFields[i].type == 'datePicker') {
        formFields[i].value = this.valid.dateFormat(formFields[i].value);
      }
      pageInterface[headers[i]['header']] = formFields[i].value;
    }
    return pageInterface;
  }


  // http Error Handling
  handleError(error: HttpErrorResponse) {
    // alert('catch error');

    let errorMessage = 'Unknown Error!';

    if (error.error instanceof ErrorEvent) {
      // client side error
      errorMessage = 'Error: ${error.error.message}';
    } else {
      // server side error
      errorMessage = 'Error Code: ${error.status}\nMessage: ${error.message}';
    }

    this.valid.apiErrorResponse(errorMessage);
    console.log(errorMessage);
    // window.alert(errorMessage);
    return throwError(errorMessage);
  }

  sendOTP(email: string): Observable<any> {
    return this.http.post(`${this.baseURL}auth-api/saveOTP`, {
      email,
    });
  }

  // verifyOTP(otp: string): Observable<any> {
  //   const params = new HttpParams().set('otp', otp);
  //   return this.http.get(`${this.baseURL}auth-api/getOTP`, {
  //     params,
  //   });
  // }

    verifyOTP(otp: string): Observable<any> {
        const params = new HttpParams().set('otp', otp);
        return this.http.get(`${this.baseURL}auth-api/getOTP`, { params });
    }
resetPassword(payload: { email: string; password: string; sptype: string }): Observable<any> {
  return this.http.post(`${this.baseURL}user-api/forgetPassword`, payload).pipe(
    retry(0),
    catchError(error => this.handleError(error))
  );
}

postDirect(url: string, data: any): Observable<any> {
  return this.http.post(this.baseURL + url, data).pipe(
    catchError(error => this.handleError(error))
  );
}

}
