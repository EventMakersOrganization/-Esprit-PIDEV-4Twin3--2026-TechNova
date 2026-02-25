import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  message: string = '';
  isError: boolean = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.form.invalid || this.loading) return;
    this.loading = true;
    this.message = '';
    this.authService.forgotPassword(this.form.value.email).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isError = false;
        this.loading = false;
      },
      error: () => {
        this.message = 'Something went wrong. Please try again.';
        this.isError = true;
        this.loading = false;
      }
    });
  }
}
