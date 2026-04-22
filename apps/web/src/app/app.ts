import { Component, computed, effect, signal, inject, afterNextRender } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UsersService } from './users.service';
import { AuthService } from './login/auth.service';
import { CreateUserDto, UserDto } from '@frost-logix/shared-types';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  readonly title = 'Frost Logix Web';

  readonly authService = inject(AuthService);
  private readonly usersService = inject(UsersService);
  private readonly router = inject(Router);

  readonly users = signal<UserDto[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasUsers = computed(() => this.users().length > 0);

  newUser: CreateUserDto = {
    email: '',
    first_name: '',
    last_name: '',
  };

  constructor() {
    effect(() => {
      const error = this.error();
      if (error) {
        console.error('App error:', error);
      }
    });

    afterNextRender(() => {
      this.loadUsers();
    });
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.usersService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load users');
        this.loading.set(false);
      },
    });
  }

  createUser(form: NgForm): void {
    if (form.invalid) {
      this.error.set('All fields are required');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.usersService.createUser(this.newUser).subscribe({
      next: (created) => {
        this.users.update((current) => [created, ...current]);
        this.newUser = { email: '', first_name: '', last_name: '' };
        this.loading.set(false);
        form.resetForm();
      },
      error: () => {
        this.error.set('Failed to create user');
        this.loading.set(false);
      },
    });
  }

  deleteUser(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.usersService.deleteUser(id).subscribe({
      next: () => {
        this.users.update((current) => current.filter((user) => user.id !== id));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to delete user');
        this.loading.set(false);
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
