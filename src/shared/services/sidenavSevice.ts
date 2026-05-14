import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../envirnment/environment';
// import { url } from 'inspector';

@Injectable({
  providedIn: 'root',
})
export class SideNavSevice {
  private apiUrlauth = environment.apiUrlauth;

  constructor(private http: HttpClient) {}



  getMenu(roleID: any): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrlauth}user-api/Role/getMenu?roleID=${roleID}`
    );
  }
}
