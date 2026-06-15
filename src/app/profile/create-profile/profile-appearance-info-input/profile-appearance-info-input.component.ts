import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile-appearance-info-input',
  templateUrl: './profile-appearance-info-input.component.html',
  styleUrls: ['./profile-appearance-info-input.component.scss']
})
export class ProfileAppearanceInfoInputComponent implements OnInit {

  @Input() heightList: any[] = [];
  @Input() bodyTypeList: any[] = [];
  @Input() skinToneList: any[] = [];
  @Input() disabilityList: any[] = [];

  @Output() selectionChange = new EventEmitter<any>();

  selectedHeight: any = '';
  selectedBodyType: any = '';
  selectedSkinTone: any = '';
  selectedDisability: any = '';

  ngOnInit() {}

  onFieldChange() {
    this.selectionChange.emit({
      height:     this.selectedHeight,
      bodyType:   this.selectedBodyType,
      skinTone:   this.selectedSkinTone,
      disability: this.selectedDisability,
    });
  }
}