import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestSubmitedComponent } from './request-submited.component';

describe('RequestSubmitedComponent', () => {
  let component: RequestSubmitedComponent;
  let fixture: ComponentFixture<RequestSubmitedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RequestSubmitedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestSubmitedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
