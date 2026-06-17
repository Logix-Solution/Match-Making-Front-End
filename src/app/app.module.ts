import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import {
  LocationStrategy,
  HashLocationStrategy,
  DatePipe,
} from '@angular/common';
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
import { CreateProfileComponent } from './profile/create-profile/create-profile.component';
import { LoginComponent } from './login/login.component';
import { FooterComponent } from './home-page/footer/footer.component';
import { PremiumServicesComponent } from './home-page/premium-services/premium-services.component';
import { FindYourMatchComponent } from './home-page/find-your-match/find-your-match.component';
import { MatchingProfileComponent } from './home-page/find-your-match/matching-profile/matching-profile.component';
import { HeroSectionComponent } from './home-page/hero-section/hero-section.component';

import { ProfilePersonalInfoInputComponent } from './profile/create-profile/profile-personal-info-input/profile-personal-info-input.component';
import { ProfileCareerInfoInputComponent } from './profile/create-profile/profile-career-info-input/profile-career-info-input.component';
import { ProfileReligionInfoInputComponent } from './profile/create-profile/profile-religion-info-input/profile-religion-info-input.component';
import { ProfileFamilyInfoInputComponent } from './profile/create-profile/profile-family-info-input/profile-family-info-input.component';
import { ProfileAppearanceInfoInputComponent } from './profile/create-profile/profile-appearance-info-input/profile-appearance-info-input.component';
import { ProfileLifestyleInfoInputComponent } from './profile/create-profile/profile-lifestyle-info-input/profile-lifestyle-info-input.component';

import { PrefencesDetailsComponent } from './Preferences/prefences-details/prefences-details.component';
import { PreferencesConfigurationComponent } from './Preferences/preferences-configuration/preferences-configuration.component';
import { PreferencesPersonalComponent } from './Preferences/preferences-configuration/preferences-personal/preferences-personal.component';
import { PreferencesCareerComponent } from './Preferences/preferences-configuration/preferences-career/preferences-career.component';
import { PreferencesReligionComponent } from './Preferences/preferences-configuration/preferences-religion/preferences-religion.component';
import { PreferencesFamilyComponent } from './Preferences/preferences-configuration/preferences-family/preferences-family.component';
import { PreferencesAppearanceComponent } from './Preferences/preferences-configuration/preferences-appearance/preferences-appearance.component';
import { PreferencesLifestyleComponent } from './Preferences/preferences-configuration/preferences-lifestyle/preferences-lifestyle.component';
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard.component';
import { AdminRequestManagementComponent } from './Admin/admin-request-management/admin-request-management.component';
import { AdminUserManagementComponent } from './Admin/admin-user-management/admin-user-management.component';
import { AdminServicesRequestsComponent } from './Admin/admin-services-requests/admin-services-requests.component';
import { AdminEventGalleryComponent } from './Admin/admin-event-gallery/admin-event-gallery.component';
import { AdminMatchComparisonComponent } from './Admin/admin-match-comparison/admin-match-comparison.component';
import { AdminBestMatchComponent } from './Admin/admin-best-match/admin-best-match.component';
import { PricingPlansComponent } from './pricing-plans/pricing-plans.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { AdminDashbordComponent } from './Admin/admin-dashbord/admin-dashbord.component';
import { ExploreMatchingComponent } from './User/explore-matching/explore-matching.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { ForgetPasswordComponent } from './login/forget-password/forget-password.component';
import { SideNavComponent } from './side-nav/side-nav.component';


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
    CreateProfileComponent,
    LoginComponent,
    FooterComponent,
    PremiumServicesComponent,
    FindYourMatchComponent,
    MatchingProfileComponent,
    HeroSectionComponent,

    ProfilePersonalInfoInputComponent,
    ProfileCareerInfoInputComponent,
    ProfileReligionInfoInputComponent,
    ProfileFamilyInfoInputComponent,
    ProfileAppearanceInfoInputComponent,
    ProfileLifestyleInfoInputComponent,

    PrefencesDetailsComponent,
    PreferencesConfigurationComponent,
    PreferencesPersonalComponent,
    PreferencesCareerComponent,
    PreferencesReligionComponent,
    PreferencesFamilyComponent,
    PreferencesAppearanceComponent,
    PreferencesLifestyleComponent,
    AdminDashboardComponent,
    AdminRequestManagementComponent,
    AdminUserManagementComponent,
    AdminServicesRequestsComponent,
    AdminEventGalleryComponent,
    AdminMatchComparisonComponent,
    AdminBestMatchComponent,
    PricingPlansComponent,
    AccountSettingsComponent,
    AdminDashbordComponent,
    ExploreMatchingComponent,
    SignInComponent,
    ForgetPasswordComponent,
    SideNavComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    NgSelectModule,
    ToastrModule.forRoot({
      // Configure toastr here
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
  ],
  exports: [ProfilePersonalInfoInputComponent],
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
  bootstrap: [AppComponent],
})
export class AppModule {}
