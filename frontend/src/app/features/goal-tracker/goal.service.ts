import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Milestone {
    _id: string;
    description: string;
    targetDate: string;
    completed: boolean;
  }
  
  interface Goal {
    _id: string;
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

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private baseUrl = 'http://localhost:3000/api/goals';

  constructor(private http: HttpClient) {}

  getGoals(): Observable<Goal[]> {
    return this.http.get<Goal[]>(this.baseUrl);
  }

  createGoal(goal: Goal): Observable<Goal> {
    return this.http.post<Goal>(this.baseUrl, goal);
  }

  updateGoal(goalId: string, goal: Goal): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/${goalId}`, goal);
  }

  deleteGoal(goalId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${goalId}`);
  }

  updateProgress(goalId: string, progress: number, milestones:Milestone[]): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/${goalId}/progress`, { progress, milestones });
  }

  updateMilestoneStatus(goalId: string, milestoneId: string, completed: boolean): Observable<Goal> {
    return this.http.put<Goal>(`${this.baseUrl}/${goalId}/milestones/${milestoneId}`, { completed });
  }
}
