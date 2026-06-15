import { Component , OnInit } from '@angular/core';

@Component({
  selector: 'app-create-profile',
  templateUrl: './create-profile.component.html',
  styleUrls: ['./create-profile.component.scss'],
})
export class CreateProfileComponent implements OnInit {



  stepper: number = 1;

  constructor() {}

  ngOnInit() {
    this.stepper = 1;

    
  }



  
}
