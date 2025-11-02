import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../../auth/login/login.component';
import { RegisterComponent } from '../../auth/register/register.component'; 

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
  standalone: true, 
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent {
  navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { path: '/carbon-footprint', label: 'Carbon Footprint', icon: 'eco' },
    { path: '/goals', label: 'My Goals', icon: 'track_changes' },
    { label: 'Logout', icon: 'logout', isAction: true } 
  ];
  constructor(private dialog: MatDialog, private router: Router) {}

  openLoginForm() {
    this.dialog.open(LoginComponent, {
      width: '400px',
      autoFocus: true 
    });
  }

  openSignupForm() {
    this.dialog.open(RegisterComponent, {
      width: '400px',
      autoFocus: true
    });
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}