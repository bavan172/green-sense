import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon'; 
import { CommonModule } from '@angular/common';
import { RegisterComponent } from '../auth/register/register.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [MatIconModule,CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent {
  features = [
    { icon: 'dashboard', title: 'Environmental Metrics Dashboard', description: 'Visualize your carbon footprint and resource consumption.' },
    { icon: 'calculate', title: 'Carbon Footprint Calculator', description: 'Assess your emissions based on daily activities.' },
    { icon: 'flag', title: 'Personal Goal Setting', description: 'Set and track your sustainability objectives.' },
  ];
  
  testimonials = [
    { quote: 'Green Pulse has transformed the way I approach sustainability. The dashboard keeps me informed and motivated.', author: 'Alex J.' },
    { quote: 'Green Pulse helped me track my Co2 emissions.', author: 'Maria S.' },
  ];
  constructor(private dialog: MatDialog) {}

    openSignupForm() {
      this.dialog.open(RegisterComponent, {
        width: '400px',
        autoFocus: true
      });
    }
    scrollToSection(element: HTMLElement): void {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  
}
