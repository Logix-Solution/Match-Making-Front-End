import { Component, Input, Output, EventEmitter, OnInit  } from '@angular/core';

@Component({
  selector: 'app-profile-career-info-input',
  templateUrl: './profile-career-info-input.component.html',
  styleUrls: ['./profile-career-info-input.component.scss']
})
export class ProfileCareerInfoInputComponent implements OnInit {

 
  @Input() educationList: any[] = [];
  @Input() occupationList: any[] = [];
  @Input() monthlyIncomeList: any[] = [];

  // Output to parent
  @Output() selectionChange = new EventEmitter<any>();


    selectedEducation: any = '';
  selectedOccupation: any = '';
  selectedMonthlyIncome: any = '';

  ngOnInit() {}

   onFieldChange() {
    this.selectionChange.emit({
      education:   this.selectedEducation,
      occupation:  this.selectedOccupation,
      monthlyIncome: this.selectedMonthlyIncome
    });
  }

}
