import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          
          <!-- Logo & Brand -->
          <div class="flex items-center gap-8">
            <a routerLink="/employees" class="flex items-center gap-2.5 group">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <span class="material-symbols-outlined text-2xl">badge</span>
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-lg bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 bg-clip-text text-transparent leading-none">
                  StaffPulse
                </span>
                <span class="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5">
                  HR Management
                </span>
              </div>
            </a>

            <!-- Desktop Nav Links -->
            @if (authService.isAuthenticated()) {
              <nav class="hidden md:flex items-center gap-1">
                <a
                  routerLink="/employees"
                  routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">group</span>
                  Directory
                </a>
                <a
                  routerLink="/employees/add"
                  routerLinkActive="bg-indigo-50 text-indigo-700 font-semibold"
                  class="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium transition-colors"
                >
                  <span class="material-symbols-outlined text-lg">person_add</span>
                  Add Employee
                </a>
              </nav>
            }
          </div>

          <!-- Right side actions & User Info -->
          @if (authService.isAuthenticated()) {
            <div class="flex items-center gap-3">
              <!-- User Profile Chip -->
              <div class="hidden sm:flex items-center gap-2.5 pl-3 pr-4 py-1.5 bg-slate-50 border border-slate-200/80 rounded-full">
                <div class="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center uppercase shadow-inner">
                  {{ (authService.currentUser()?.name || 'U').charAt(0) }}
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-xs font-semibold text-slate-800 leading-tight">
                    {{ authService.currentUser()?.name || 'User' }}
                  </span>
                  <span class="text-[10px] text-slate-500 leading-tight truncate max-w-[140px]">
                    {{ authService.currentUser()?.email }}
                  </span>
                </div>
              </div>

              <!-- Logout Button -->
              <button
                type="button"
                (click)="logout()"
                class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-700 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                title="Sign Out"
              >
                <span class="material-symbols-outlined text-lg">logout</span>
                <span class="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          } @else {
            <div class="flex items-center gap-2">
              <a
                routerLink="/login"
                class="px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                Sign In
              </a>
            </div>
          }

        </div>
      </div>
    </header>
  `
})
export class NavbarComponent {
  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  logout() {
    this.authService.logout();
  }
}
