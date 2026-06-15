import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-family-info-input',
  templateUrl: './profile-family-info-input.component.html',
  styleUrls: ['./profile-family-info-input.component.scss']
})
export class ProfileFamilyInfoInputComponent implements OnInit {

  @Input() maritalStatusList: any[] = [];
  @Input() housingSituationList: any[] = [];
  @Input() fatherOccupationList: any[] = [];
  @Input() motherOccupationList: any[] = [];
  @Input() noOfSiblingsList: any[] = [];
  @Input() familyInvolvementList: any[] = [];
  @Input() countryList: any[] = [];   // NEW

  @Output() selectionChange = new EventEmitter<any>();

  selectedMaritalStatus: any = '';
  selectedHousingSituation: any = '';
  selectedFatherOccupation: any = '';
  selectedMotherOccupation: any = '';
  selectedNoOfSiblings: any = '';
  selectedFamilyInvolvement: any = '';
  selectedParentCountryCode: string = '';  // NEW
  parentPhoneNumber: string = '';          // NEW

  ngOnInit() {}

  onFieldChange() {
    this.selectionChange.emit({
      maritalStatus:       this.selectedMaritalStatus,
      housingSituation:    this.selectedHousingSituation,
      fatherOccupation:    this.selectedFatherOccupation,
      motherOccupation:    this.selectedMotherOccupation,
      noOfSiblings:        this.selectedNoOfSiblings,
      familyInvolvement:   this.selectedFamilyInvolvement,
      parentCountryCode:   this.selectedParentCountryCode,  // NEW
      parentPhoneNumber:   this.parentPhoneNumber,          // NEW
    });
  }
}