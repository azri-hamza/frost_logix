import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="w-full max-w-md p-8 space-y-6">
        <div class="text-center">
          <h1 class="text-2xl font-bold tracking-tight">
            Sign in to your account
          </h1>
          <p class="text-sm text-muted-foreground mt-2">
            Enter your email and password to sign in
          </p>
        </div>

        @if (error()) {
          <div class="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
            {{ error() }}
          </div>
        }

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Email
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="m@example.com"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              [class.border-red-500]="loginForm.get('email')?.invalid && loginForm.get('email')?.dirty"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.dirty) {
              <p class="text-sm text-red-500">Please enter a valid email</p>
            }
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="Enter your password"
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              [class.border-red-500]="loginForm.get('password')?.invalid && loginForm.get('password')?.dirty"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.dirty) {
              <p class="text-sm text-red-500">Password is required</p>
            }
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || loading()"
            class="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            @if (loading()) {
              <span>Signing in...</span>
            } @else {
              <span>Sign in</span>
            }
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(1)]],
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.loginForm.value;

    this.authService.login(email!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.error?.message || 'Invalid email or password');
      },
    });
  }
}