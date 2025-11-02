import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalTrackerComponent } from './goal-tracker.component';

describe('GoalTrackerComponent', () => {
  let component: GoalTrackerComponent;
  let fixture: ComponentFixture<GoalTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalTrackerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
