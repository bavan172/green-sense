import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { GoalService } from './goal.service';
import { FormsModule } from '@angular/forms';

interface Milestone {
  _id: string;
  description: string;
  targetDate: string;
  completed: boolean;
}

interface CreateGoal {
  title: string;
  description: string;
  category: string;
  deadline: string;
  impactPoints: number;
  progress: number;
  status: 'completed' | 'in progress' | 'upcoming';
  milestones: Milestone[];
  showMilestones?: boolean;
}
export interface Goal extends CreateGoal{
  _id: string; 
}
@Component({
  selector: 'app-goal-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './goal-tracker.component.html',
  styleUrl: './goal-tracker.component.scss'
})
export class GoalTrackerComponent implements OnInit {
  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  completedGoals: Goal[] = [];
  inProgressGoals: Goal[] = [];
  upcomingGoals: Goal[] = [];

  searchTerm: string = '';
  selectedStatus: string = 'All';
  selectedCategory: string = 'all';
  statusOptions: string[] = ['All', 'Completed', 'In Progress', 'Upcoming'];
  impactCategories: string[] = ['Energy', 'Waste', 'Water', 'Transport', 'Food'];

  isLoading: boolean = true;
  showGoalModal: boolean = false;
  showProgressModal: boolean = false;
  editMode: boolean = false;
  submitted: boolean = false;

  goalForm: FormGroup;
  progressValue: number = 0;
  progressNotes: string = '';
  selectedGoal: Goal = {} as Goal;

  showAchievement: boolean = false;
  achievementTitle: string = '';
  achievementMessage: string = '';

  constructor(private fb: FormBuilder, private goalService: GoalService) {
    this.goalForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: [null, Validators.required],
      deadline: ['', Validators.required],
      impactPoints: [1, [Validators.min(1), Validators.max(100)]],
      milestones: this.fb.array([])
    });
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.isLoading = false;
      this.loadGoals();
    }, 1000);
  }

  get f() {
    return this.goalForm.controls;
  }

  get milestones(): FormArray {
    return this.goalForm.get('milestones') as FormArray;
  }

  loadGoals(): void {
    this.goalService.getGoals().subscribe(goals => {
      this.goals = goals;
      this.applyFilters();
    });
  }

  applyFilters(): void {
    this.filteredGoals = this.goals.filter(goal => {
      const matchesSearch = goal.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesStatus = this.selectedStatus === 'All' || goal.status.toLowerCase() === this.selectedStatus.toLowerCase();
      const matchesCategory = this.selectedCategory === 'all' || goal.category === this.selectedCategory;
      return matchesSearch && matchesStatus && matchesCategory;
    });

    this.completedGoals = this.goals.filter(goal => goal.status === 'completed');
    this.inProgressGoals = this.goals.filter(goal => goal.status === 'in progress');
    this.upcomingGoals = this.goals.filter(goal => goal.status === 'upcoming');
  }

  calculateTotalImpact(): number {
    return this.goals.reduce((total, goal) => total + goal.impactPoints, 0);
  }

  openGoalModal(): void {
    this.showGoalModal = true;
    this.editMode = false;
    this.submitted = false;
    this.goalForm.reset();
    this.milestones.clear();
  }

  closeModal(event?: MouseEvent): void {
    if (event && (event.target as HTMLElement).classList.contains('modal')) {
      this.showGoalModal = false;
    } else if (!event) {
      this.showGoalModal = false;
    }
  }

  saveGoal(): void {
    this.submitted = true;
    if (this.goalForm.invalid) return;
  
    const formValue = this.goalForm.value;
  
    const newGoal: any = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      deadline: formValue.deadline,
      impactPoints: formValue.impactPoints || 0,
      progress: this.editMode ? this.selectedGoal?.progress || 0 : 0,
      status: this.editMode ? this.selectedGoal?.status || 'upcoming' : 'upcoming',
      milestones: this.milestones.controls.map(control => ({
        description: control.get('description')?.value,
        targetDate: control.get('targetDate')?.value,
      }))
    };
  
    if (this.editMode && this.selectedGoal?._id) {
      this.goalService.updateGoal(this.selectedGoal._id, newGoal).subscribe(() => {
        this.loadGoals();
        this.showGoalModal = false;
      });
    } else {
      this.goalService.createGoal(newGoal).subscribe(() => {
        this.loadGoals();
        this.showGoalModal = false;
      });
    }
  }

  editGoal(goal: Goal): void {
    this.editMode = true;
    this.selectedGoal = goal;
    this.showGoalModal = true;
    this.goalForm.patchValue({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      deadline: goal.deadline,
      impactPoints: goal.impactPoints,
      progress: goal.progress,
    });

    this.milestones.clear();
    goal.milestones.forEach(milestone => {
      this.milestones.push(this.fb.group({
        description: [milestone.description],
        targetDate: [milestone.targetDate],
        completed: [milestone.completed]
      }));
    });
  }

  deleteGoal(goalId: string): void {
    this.goalService.deleteGoal(goalId).subscribe(() => {
      this.loadGoals();
    });
  }  

  onStatusChange(status: string): void {
    this.selectedStatus = status;
    this.applyFilters();
  }

  getGoalStatusClass(goal: Goal): string {
    switch (goal.status) {
      case 'completed':
        return 'goal-completed';
      case 'in progress':
        return 'goal-in-progress';
      case 'upcoming':
        return 'goal-upcoming';
      default:
        return '';
    }
  }

  getCategoryClass(category: string): string {
    switch (category) {
      case 'Energy':
        return 'category-energy';
      case 'Waste':
        return 'category-waste';
      case 'Water':
        return 'category-water';
      case 'Transport':
        return 'category-transport';
      case 'Food':
        return 'category-food';
      default:
        return '';
    }
  }

  isDeadlineNear(deadline: string): boolean {
    console.log(deadline);
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const timeDiff = deadlineDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    console.log(daysDiff,"check day difference")
    console.log(daysDiff <= 7 && daysDiff >= 0,"check condition")
    return daysDiff <= 7 && daysDiff >= 0;
  }

  getEmptyStateMessage(): string {
    return 'No goals found. Start by adding a new goal!';
  }

  addMilestone(): void {
    this.milestones.push(this.fb.group({
      description: [''],
      targetDate: [''],
      completed: [false]
    }));
  }

  removeMilestone(index: number): void {
    this.milestones.removeAt(index);
  }

  toggleMilestones(goal: Goal): void {
    goal.showMilestones = !goal.showMilestones;
  }

toggleMilestone(goal: Goal, milestoneId: string, completed: boolean): void {
  const milestone = goal.milestones.find((m: Milestone) => m._id === milestoneId);
  if (milestone) {
    milestone.completed = !completed;

    const updatedProgress = this.calculateProgress(goal);

    this.goalService.updateProgress(goal._id, updatedProgress, goal.milestones).subscribe(updatedGoal => {
      goal.progress = updatedGoal.progress;
      goal.status = updatedGoal.status;

      if (updatedGoal.status === 'completed') {
        this.showAchievement = true;
        this.achievementTitle = 'Congratulations!';
        this.achievementMessage = `You have completed the goal: ${updatedGoal.title}`;
      }
    });
  }
}

  calculateProgress(goal: any): number {
  console.log(goal,"goal in progress");
  if (goal.milestones && goal.milestones.length > 0) {
    const completedMilestones = goal.milestones.filter((milestone: Milestone) => milestone.completed).length;
    return (completedMilestones / goal.milestones.length) * 100;
  }
  return goal.progress || 0; 
}
  updateProgress(goal: Goal): void {
    const updatedProgress = this.calculateProgress(goal);
    this.goalService.updateProgress(goal._id, updatedProgress, goal.milestones).subscribe(updatedGoal => {
    console.log('Updated Goal:', updatedGoal); // Debugging
    goal.progress = updatedGoal.progress;
    goal.status = updatedGoal.status;

    if (updatedGoal.status === 'completed') {
      this.showAchievement = true;
      this.achievementTitle = 'Congratulations!';
      this.achievementMessage = `You have completed the goal: ${updatedGoal.title}`;
    }

    this.loadGoals(); 
  });
  }
  
  closeProgressModal(event?: MouseEvent): void {
    if (event && (event.target as HTMLElement).classList.contains('modal')) {
      this.showProgressModal = false;
    } else if (!event) {
      this.showProgressModal = false;
    }
  }

saveProgress(): void {
  if (this.selectedGoal) {
    const updatedProgress = this.calculateProgress(this.selectedGoal);
    this.goalService.updateProgress(this.selectedGoal._id, updatedProgress, this.selectedGoal.milestones).subscribe(updatedGoal => {
      this.selectedGoal.progress = updatedGoal.progress;
      this.selectedGoal.status = updatedGoal.status;
      this.showProgressModal = false;
      if (updatedGoal.status === 'completed') {
        this.showAchievement = true;
        this.achievementTitle = 'Congratulations!';
        this.achievementMessage = `You have completed the goal: ${updatedGoal.title}`;
      }

      this.loadGoals();
    });
  }
 }
  
}
 
