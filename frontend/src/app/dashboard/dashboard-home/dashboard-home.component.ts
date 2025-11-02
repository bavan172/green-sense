import { Component, OnInit, AfterViewInit } from '@angular/core';
import Chart from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EsgMetricsService } from '../esg-metric.service';
import { ChatService } from '../chat.service';
import { GoalService } from '../../features/goal-tracker/goal.service';

export interface ESGMetric {
  name: string;
  value: number;
  goal: number;
  unit: string;
}

export interface SustainabilityData {
  userId: string;
  lastUpdated: Date;
  metrics: ESGMetric[];
}
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
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss'],
  standalone: true,
  imports: [FormsModule,CommonModule]
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  esgMetrics: ESGMetric[] = [{name:'CO₂ Emissions',value:0,goal:0,unit:'tons'},{name:'DEI Score',value:0,goal:0,unit:'%'},{name:'Waste Managed',value:0,goal:0,unit:'%'}];
  selectItems = [ 'CO₂ Emissions (tons)','DEI Score','Waste Managed'];
  selectedMetricIndex: number = 0;
  newValue: number = 0;
  newGoal: number = 0;
  chart: any;
  showChat: boolean = false;
  chatMessages: {sender: string, message: string}[] = [];
  newMessage: string = '';
  gaiaIntro:string = '';
  goals: Goal[] = [];
  userId: string = localStorage.getItem('userId') ?? '';

  constructor(private esgService: EsgMetricsService, private chatService : ChatService, private goalService: GoalService) {}

  ngOnInit(): void {
    this.setFormDefaults();
    this.loadGoals();
    this.esgService.getMetrics().subscribe({
      next: (data) => {
        this.esgMetrics = data.metrics.map(metric => ({
          name: metric.name, 
          value: metric.value, 
          goal: metric.goal, 
          unit: metric.unit
        }));
        this.setFormDefaults();
        this.updateChart();
      },
      error: (err) => {
        console.error('Failed to fetch ESG metrics', err);
      }
    });
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  toggleChat(): void {
    this.showChat = !this.showChat;
      if (this.showChat) {
      this.gaiaIntro = `Hi! I see you have ${this.goals.length} goals. How can I assist you today?`;
    };
  }


  sendMessage(): void {
    if (this.newMessage.trim()) {
      this.chatMessages.push({ sender: 'You', message: this.newMessage });
      this.chatService.sendMessage(this.newMessage, this.userId).subscribe({
        next: (response) => {
          this.chatMessages.push({ sender: 'Bot', message: response.reply });
        },
        error: (err) => {
          console.error('Failed to send message:', err);
        }
      });
      this.newMessage = '';
    }
  }

  setFormDefaults(): void {
    const metric = this.esgMetrics[this.selectedMetricIndex];
    if (metric) {
      this.newValue = metric.value;
      this.newGoal = metric.goal;
    }
  }

  exportToCSV(): void {
    const headers = ['Metric', 'Current Value', 'Goal', 'Unit'];
    const rows = this.esgMetrics.map(metric => [
      metric.name,
      metric.value,
      metric.goal,
      metric.unit
    ]);
  
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(rowArray => {
      csvContent += rowArray.join(',') + '\n';
    });
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'esg_metrics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  onMetricChange(): void {
    this.setFormDefaults();
  }

  updateMetric(): void {
    if (
      this.selectedMetricIndex >= 0 &&
      this.selectedMetricIndex < this.esgMetrics.length
    ) {
      this.esgMetrics[this.selectedMetricIndex].value = this.newValue;
      this.esgMetrics[this.selectedMetricIndex].goal = this.newGoal;
  
      const data: SustainabilityData = {
        userId: localStorage.getItem('userId') ?? '',
        lastUpdated: new Date(),
        metrics: this.esgMetrics.map(metric => ({
          name: metric.name,
          unit: metric.unit,
          value: metric.value,
          goal: metric.goal
        }))
      };
  
      this.esgService.saveMetrics(data).subscribe({
        next: () => {
          console.log('Metrics updated successfully');
        },
        error: (err) => {
          console.error('Failed to update metrics:', err);
        }
      });
    } else {
      console.error('Invalid selectedMetricIndex:', this.selectedMetricIndex);
    }
  }

  renderChart(): void {
    this.chart = new Chart("esgChart", {
      type: 'bar',
      data: {
        labels: this.esgMetrics.map(m => m.name),
        datasets: [{
          label: 'Current Value',
          data: this.esgMetrics.map(m => m.value),
          backgroundColor: '#4caf50'
        }, {
          label: 'Target Goal',
          data: this.esgMetrics.map(m => m.goal),
          backgroundColor: '#c8e6c9'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  updateChart(): void {
    this.chart.data.datasets[0].data = this.esgMetrics.map(m => m.value);
    this.chart.data.datasets[1].data = this.esgMetrics.map(m => m.goal);
    this.chart.update();
  }

  loadGoals(): void {
    this.goalService.getGoals().subscribe(goals => {
      this.goals = goals;
    });
  }
}
