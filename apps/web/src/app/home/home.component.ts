import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <div class="min-h-screen flex items-center justify-center bg-background">
      <div class="text-center">
        <h1 class="text-4xl font-bold tracking-tight">Welcome to the Home Page</h1>
        <p class="text-lg text-muted-foreground mt-4">
          This is the home page of our Angular application.
        </p>
      </div>
    </div>
  `,
})
export class HomeComponent {}
