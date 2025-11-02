import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:3000/api/auth'; 
  private tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string, userId: string }>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('token', res.token);
        this.tokenSubject.next(res.token);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(data: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post<{ token: string, userId: string }>(`${this.baseUrl}/register`, data).pipe(
      tap(res => {
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('token', res.token);
        this.tokenSubject.next(res.token);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.tokenSubject.next(null);
  }

  getToken(): string | null {
    return this.tokenSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.tokenSubject.value;
  }
}
