import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientProfileComponent } from './profile/client-profile/client-profile/client-profile.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateProfileComponent } from './profile/create-profile/create-profile.component';
import { LoginComponent } from './login/login.component';
import { PrefencesDetailsComponent } from './Preferences/prefences-details/prefences-details.component';
import { PreferencesConfigurationComponent } from './Preferences/preferences-configuration/preferences-configuration.component';
import { AdminDashboardComponent } from './Admin/admin-dashboard/admin-dashboard.component';
import { AdminRequestManagementComponent } from './Admin/admin-request-management/admin-request-management.component';
import { AdminUserManagementComponent } from './Admin/admin-user-management/admin-user-management.component';
import { AdminServicesRequestsComponent } from './Admin/admin-services-requests/admin-services-requests.component';
import { AdminEventGalleryComponent } from './Admin/admin-event-gallery/admin-event-gallery.component';
import { AdminMatchComparisonComponent } from './Admin/admin-match-comparison/admin-match-comparison.component';
import { AdminBestMatchComponent } from './Admin/admin-best-match/admin-best-match.component';
import { PricingPlansComponent } from './pricing-plans/pricing-plans.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { ExploreMatchingComponent } from './User/explore-matching/explore-matching.component';
import { SignInComponent } from './login/sign-in/sign-in.component';
import { ForgetPasswordComponent } from './login/forget-password/forget-password.component';
import { AboutComponent } from './home-page/about/about.component';
import { HowItsWorksComponent } from './home-page/how-its-works/how-its-works.component';
import { PremiumServicesComponent } from './home-page/premium-services/premium-services.component';
import { SucessStoriesComponent } from './home-page/sucess-stories/sucess-stories.component';
import { TestimonialsComponent } from './Admin/testimonials/testimonials.component';
import { VerifyOTPComponent } from './login/verify-otp/verify-otp.component';
import { UpdatePasswordComponent } from './login/update-password/update-password.component';
import { PricingPlanConfigurationComponent } from './Admin/pricing-plan-configuration/pricing-plan-configuration.component';
import { UserPricingPlanComponent } from './pricing-plans/user-pricing-plan/user-pricing-plan.component';
import { UserUpgradePricePlanComponent } from './pricing-plans/user-upgrade-price-plan/user-upgrade-price-plan.component';
import { UserActivePlanComponent } from './pricing-plans/user-active-plan/user-active-plan.component';
import { WelcomeComponent } from './home-page/welcome/welcome.component';
import { RegisterationFeeComponent } from './Preferences/registeration-fee/registeration-fee.component';
import { LockProfilesComponent } from './Admin/lock-profiles/lock-profiles.component';
import { TermsConditionComponent } from './home-page/terms-condition/terms-condition.component';
import { PrivacyPolicyComponent } from './home-page/privacy-policy/privacy-policy.component';
import { CookiePolicyComponent } from './home-page/cookie-policy/cookie-policy.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'client-profile',
    component: ClientProfileComponent,
  },
  {
    path: 'create-profile',
    component: CreateProfileComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
    {
    path: 'signIn',
    component: SignInComponent,
  },
    {
    path: 'Forget-Password',
    component: ForgetPasswordComponent,
  },

    {
    path: 'verify-otp' ,
    component: VerifyOTPComponent,
  },

    {
    path: 'update-password' ,
    component: UpdatePasswordComponent,
  },

    {
    path: 'about',
    component: AboutComponent,
  },
   {
    path: 'how-Works',
    component: HowItsWorksComponent,
  },

  {
    path: 'features',
    component:  PremiumServicesComponent ,
  },
   {
    path: 'Sucess-Story',
    component:  SucessStoriesComponent ,
  },

    {
    path: 'welcome',
    component: WelcomeComponent, 
  },
    {
    path: 'Terms-and-Conditions',
    component: TermsConditionComponent, 
  },
    {
    path: 'privacy-policy',
    component: PrivacyPolicyComponent, 
  },
    {
    path: 'Cookie-Policy',
    component:  CookiePolicyComponent, 
  },
////////////////preferences ///////////////////////
  
 {
    path: 'preferences-details',
    component: PrefencesDetailsComponent,
  },
   
   {
    path: 'preferences-configuration',
    component: PreferencesConfigurationComponent,
  },

  {
    path: 'registerationFee',
    component: RegisterationFeeComponent,
  },
  

///////////////Admin///////////////

 {
    path: 'adminDashboard',
    component: AdminDashboardComponent,
  },

   {
    path: 'adminRequestManagement',
    component: AdminRequestManagementComponent,
  },
  
   {
    path: 'adminUserManagement',
    component: AdminUserManagementComponent,
  },
    {
    path: 'adminServicesRequests',
    component: AdminServicesRequestsComponent,
  },

     {
    path: 'adminEventsGallery',
    component: AdminEventGalleryComponent,
  },
      {
    path: 'adminMatchComparison',
    component: AdminMatchComparisonComponent,
  },
{
     path: 'adminbestMatch',
    component: AdminBestMatchComponent,
  },

  {
     path: 'testimonials',
    component: TestimonialsComponent,
  },

   {
     path: 'pricingConfig',
    component: PricingPlanConfigurationComponent,
  },
    {
     path: 'lockProfile',
    component: LockProfilesComponent,
  },
  
  /////////////////////Account setting/////////////
 {
     path: 'Account-Setting',
    component: AccountSettingsComponent,
  },
  {
     path: 'Pricing-Plans',
    component: PricingPlansComponent,
  },
   {
     path: 'user-Pricing-Plans',
    component: UserPricingPlanComponent,
  },

     {
     path: 'user-active-plan',
    component: UserActivePlanComponent,
  },

   {
     path: 'Upgrade-Pricing-Plans',
    component: UserUpgradePricePlanComponent,
  },

   /////////////////////User/////////////
 {
     path: 'Explore-Match',
    component: ExploreMatchingComponent,
  },
  ];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
