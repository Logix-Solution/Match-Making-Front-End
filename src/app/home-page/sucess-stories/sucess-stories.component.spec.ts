import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SucessStoriesComponent } from './sucess-stories.component';

describe('SucessStoriesComponent', () => {
  let component: SucessStoriesComponent;
  let fixture: ComponentFixture<SucessStoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SucessStoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SucessStoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
