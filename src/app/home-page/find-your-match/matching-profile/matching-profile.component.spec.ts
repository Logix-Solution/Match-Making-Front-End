import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatchingProfileComponent } from './matching-profile.component';

describe('MatchingProfileComponent', () => {
  let component: MatchingProfileComponent;
  let fixture: ComponentFixture<MatchingProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MatchingProfileComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MatchingProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
