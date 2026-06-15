import { Component } from '@angular/core';

@Component({
  selector: 'app-preferences-configuration',
  templateUrl: './preferences-configuration.component.html',
  styleUrls: ['./preferences-configuration.component.scss']
})
export class PreferencesConfigurationComponent {

    stepper: number = 1;

  constructor() {}

  ngOnInit() {
    this.stepper = 1;
  }


}
