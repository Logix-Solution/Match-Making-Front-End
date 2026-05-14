import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HowItsWorksComponent } from './how-its-works.component';

describe('HowItsWorksComponent', () => {
  let component: HowItsWorksComponent;
  let fixture: ComponentFixture<HowItsWorksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HowItsWorksComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HowItsWorksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
