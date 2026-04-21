import { Routes } from '@angular/router';
import { App } from './app';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { EditUserComponent } from './users/edit/edit-user.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'users', component: EditUserComponent, canActivate: [authGuard] },
];