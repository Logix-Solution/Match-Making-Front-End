import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrefencesDetailsComponent } from './prefences-details.component';

describe('PrefencesDetailsComponent', () => {
  let component: PrefencesDetailsComponent;
  let fixture: ComponentFixture<PrefencesDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrefencesDetailsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PrefencesDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
