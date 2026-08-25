import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './pages/navbar/navbar.component';
import { ToastComponent } from './shared/components/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, ToastComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <!-- Top Navigation -->
      <app-navbar></app-navbar>

      <!-- Main Router Content -->
      <main class="flex-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Global Toast Container -->
      <app-toast></app-toast>

      <!-- Footer -->
      <footer class="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 StaffPulse Employee Management System. All rights reserved.</p>
          <p class="text-slate-400">Angular 19 • Express • MySQL • Tailwind CSS</p>
        </div>
      </footer>
    </div>
  `
})
export class AppComponent {
  title = 'employee-management-frontend';
}
