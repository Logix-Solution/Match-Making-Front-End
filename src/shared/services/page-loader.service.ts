import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PageLoaderService {

  constructor() { }

  private state = new BehaviorSubject<any>({ show: false, message: '' });
  loaderState = this.state.asObservable();

  show(message: string = "Loading...", timeout: number = 0) {
    this.state.next({ show: true, message });

    if (timeout > 0) {
      setTimeout(() => this.hide(), timeout);
    }
  }

  hide() {
    this.state.next({ show: false, message: "" });
  }
}
