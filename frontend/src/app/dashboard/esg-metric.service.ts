import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Metric {
  name: string;
  unit: string;
  value: number;
  goal: number;
}

export interface SustainabilityData {
  userId: string;
  lastUpdated: Date;
  metrics: Metric[];
}

@Injectable({ providedIn: 'root' })
export class EsgMetricsService {
  private apiUrl = 'http://localhost:3000/api/metrics'; 

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<SustainabilityData> {
    const userId = localStorage.getItem('userId');
  
    const params = { userId: userId ?? '' };
  
    return this.http.get<SustainabilityData>(this.apiUrl, { params });
  }

  saveMetrics(data: SustainabilityData): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
