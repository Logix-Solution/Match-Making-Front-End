import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindYourMatchComponent } from './find-your-match.component';

describe('FindYourMatchComponent', () => {
  let component: FindYourMatchComponent;
  let fixture: ComponentFixture<FindYourMatchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FindYourMatchComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FindYourMatchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
