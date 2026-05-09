import { Component } from '@angular/core';
import {
  HlmAlertDialog,
  HlmAlertDialogContent,
  HlmAlertDialogHeader,
  HlmAlertDialogFooter,
} from '@frost-logix/ui/alert-dialog';
import { HlmButtonImports } from '@frost-logix/ui/button';

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
    <hlm-alert-dialog>
      <button hlmAlertDialogTrigger hlmBtn>Test Dialog</button>
      <hlm-alert-dialog-content *hlmAlertDialogPortal>
        <hlm-alert-dialog-header>
          <h2 hlmAlertDialogTitle>Test</h2>
        </hlm-alert-dialog-header>
        <hlm-alert-dialog-footer>
          <button hlmAlertDialogCancel hlmBtn variant="outline">Cancel</button>
          <button hlmAlertDialogAction hlmBtn variant="destructive">Confirm</button>
        </hlm-alert-dialog-footer>
      </hlm-alert-dialog-content>
    </hlm-alert-dialog>
  `,
  imports: [
    HlmButtonImports,
    HlmAlertDialog,
    HlmAlertDialogContent,
    HlmAlertDialogHeader,
    HlmAlertDialogFooter,
  ],
})
export class HomeComponent {}
