import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  message: string = '';
  isError: boolean = false;
  loading = false;
  token: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.message = 'Invalid or missing reset link. Please request a new one.';
      this.isError = true;
    }
  }

  passwordMatchValidator(g: FormGroup) {
    const p = g.get('password')?.value;
    const cp = g.get('confirmPassword')?.value;
    return p === cp ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.form.invalid || this.loading || !this.token) return;
    this.loading = true;
    this.message = '';
    this.authService.resetPassword(this.token, this.form.value.password).subscribe({
      next: (res) => {
        this.message = res.message;
        this.isError = false;
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err) => {
        this.message = err.error?.message || 'Invalid or expired link. Please request a new reset link.';
        this.isError = true;
        this.loading = false;
      }
    });
  }
}
