import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientProfileComponent } from './profile/client-profile/client-profile/client-profile.component';
import { HomePageComponent } from './home-page/home-page.component';
import { CreateProfileComponent } from './profile/create-profile/create-profile.component';
import { LoginComponent } from './login/login.component';
import { PrefencesDetailsComponent } from './Preferences/prefences-details/prefences-details.component';
import { PreferencesConfigurationComponent } from './Preferences/preferences-configuration/preferences-configuration.component';

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

////////////////preferences ///////////////////////
  
 {
    path: 'preferences-details',
    component: PrefencesDetailsComponent,
  },
   
   {
    path: 'preferences-configuration',
    component: PreferencesConfigurationComponent,
  },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
