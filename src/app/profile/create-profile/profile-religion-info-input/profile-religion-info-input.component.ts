import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-religion-info-input',
  templateUrl: './profile-religion-info-input.component.html',
  styleUrls: ['./profile-religion-info-input.component.scss']
})
export class ProfileReligionInfoInputComponent implements OnInit {

  @Input() religionList: any[] = [];
  @Input() sectList: any[] = [];
  @Input() religionImportanceList: any[] = [];

  @Output() selectionChange = new EventEmitter<any>();

  selectedReligion: any = '';
  selectedSect: any = '';
  selectedReligionImportance: any = '';

  ngOnInit() {}

  onFieldChange() {
    this.selectionChange.emit({
      religion:           this.selectedReligion,
      sect:               this.selectedSect,
      religionImportance: this.selectedReligionImportance,
    });
  }
}