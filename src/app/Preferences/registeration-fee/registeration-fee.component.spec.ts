import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterationFeeComponent } from './registeration-fee.component';

describe('RegisterationFeeComponent', () => {
  let component: RegisterationFeeComponent;
  let fixture: ComponentFixture<RegisterationFeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterationFeeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterationFeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
