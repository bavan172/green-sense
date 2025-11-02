import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDialog } from '@angular/material/dialog';
import { RegisterComponent } from '../register/register.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule} from '@angular/forms'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  providers: [AuthService],
  styleUrls: ['./login.component.scss']

})
export class LoginComponent {
  loginForm: FormGroup;
  isModalOpen = false;
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router, private dialogRef: MatDialogRef<LoginComponent>, private dialog: MatDialog, private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
          )
        ]
    ]
    });
   }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }
    this.email = this.loginForm.value.email;
    this.password = this.loginForm.value.password;
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: err => alert('Login failed')
    });
    this.dialogRef.close();
  }

  closeModal() {
    this.dialogRef.close();
  }

  openSignupForm() {
    this.dialogRef.close();
    this.dialog.open(RegisterComponent, {
      width: '400px',
      autoFocus: true
    });
  }

  forgotPassword() { 
    
  }

}
