import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { PageLoaderService } from '../services/page-loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {
  constructor(private loader: PageLoaderService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Show loader automatically
    this.loader.show('Loading...');

    return next.handle(req).pipe(
      // When response or error comes → hide loader
      finalize(() => {
        this.loader.hide();
      })
    );
  }
}
