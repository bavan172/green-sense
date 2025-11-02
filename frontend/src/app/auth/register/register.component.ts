import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';
import { LoginComponent } from '../login/login.component';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone:true,
  imports: [ReactiveFormsModule,CommonModule]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private auth: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<RegisterComponent>,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group(
      {
        fullName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'
            )
          ]
        ],
        confirmPassword: ['', Validators.required]
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }
    const { fullName, email, password } = this.registerForm.value;
    this.auth.register({ name: fullName, email, password }).subscribe({
      next: () => {
        this.dialogRef.close();
        this.router.navigate(['/dashboard']);
      },
      error: () => alert('Registration failed')
    });
  }

  openLoginForm() {
    this.dialogRef.close();
    this.dialog.open(LoginComponent, {
      width: '400px',
      autoFocus: true
    });
  }
}
