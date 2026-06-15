import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-lifestyle-info-input',
  templateUrl: './profile-lifestyle-info-input.component.html',
  styleUrls: ['./profile-lifestyle-info-input.component.scss']
})
export class ProfileLifestyleInfoInputComponent implements OnInit {

  @Input() smokeList: any[] = [];
  @Input() alcoholList: any[] = [];
  @Input() wantKidsList: any[] = [];
  @Input() maritalStatusList: any[] = [];

  @Output() selectionChange = new EventEmitter<any>();

  selectedSmoke: any = '';
  selectedAlcohol: any = '';
  selectedWantKids: any = '';
  selectedMaritalStatus: any = '';

  facebookLink: string = '';
  instagramLink: string = '';
  tiktokLink: string = '';
  snapchatLink: string = '';

  ngOnInit() {}

  onFieldChange() {
    this.selectionChange.emit({
      smoke:              this.selectedSmoke,
      alcohol:            this.selectedAlcohol,
      wantKids:           this.selectedWantKids,
      maritalStatus:      this.selectedMaritalStatus,
      facebookLink:       this.facebookLink,
      instagramLink:      this.instagramLink,
      tiktokLink:         this.tiktokLink,
      snapchatLink:       this.snapchatLink,
    });
  }
}