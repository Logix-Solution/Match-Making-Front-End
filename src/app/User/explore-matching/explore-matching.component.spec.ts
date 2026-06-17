import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreMatchingComponent } from './explore-matching.component';

describe('ExploreMatchingComponent', () => {
  let component: ExploreMatchingComponent;
  let fixture: ComponentFixture<ExploreMatchingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExploreMatchingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreMatchingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
