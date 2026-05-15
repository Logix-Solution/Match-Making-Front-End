import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { LocationStrategy, HashLocationStrategy, DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoaderInterceptor } from '../../src/shared/interceptors/loader.interceptor';
import { AuthInterceptor } from '../../src/shared/interceptors/auth.interceptor';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TopNavComponent } from './top-nav/top-nav.component';
import { HowItsWorksComponent } from './home-page/how-its-works/how-its-works.component';
import { PageLoaderComponent } from './page-loader/page-loader.component';
import { AboutComponent } from './home-page/about/about.component';
import { SucessStoriesComponent } from './home-page/sucess-stories/sucess-stories.component';
import { EventGalleryComponent } from './home-page/event-gallery/event-gallery.component';
import { HomePageComponent } from './home-page/home-page.component';
import { ClientProfileComponent } from './profile/client-profile/client-profile/client-profile.component';

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    HowItsWorksComponent,
    PageLoaderComponent,
    AboutComponent,
    SucessStoriesComponent,
    EventGalleryComponent,
    HomePageComponent,
    ClientProfileComponent,
  
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,  

     ToastrModule.forRoot({ // Configure toastr here
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
  ],
  providers: [
     { provide: LocationStrategy, useClass: HashLocationStrategy },
    DatePipe,


    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
