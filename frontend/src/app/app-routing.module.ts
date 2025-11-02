import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardHomeComponent } from './dashboard/dashboard-home/dashboard-home.component';
import { CarbonFootprintComponent } from './features/carbon-footprint/carbon-footprint.component';
import { GoalTrackerComponent } from './features/goal-tracker/goal-tracker.component';
import { LeaderboardComponent } from './features/leaderboard/leaderboard.component';
import { AuthGuard } from './auth.guard';
import { LandingComponent } from './landing/landing.component';
import { BillUploaderComponent } from './features/bills/bill-uploader/bill-uploader.component';

export const routes: Routes = [
  {path: '', component: LandingComponent},
  { path: 'dashboard', component: DashboardHomeComponent, canActivate: [AuthGuard] },
  { path: 'carbon-footprint', component: CarbonFootprintComponent,canActivate: [AuthGuard] },
  { path: 'goals', component: GoalTrackerComponent, canActivate: [AuthGuard] },
  { path: 'leaderboard', component: LeaderboardComponent, canActivate: [AuthGuard] },
  { path:'bills', component: BillUploaderComponent, canActivate: [AuthGuard]},
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
