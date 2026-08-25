import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomValidators } from '../../core/validators/custom.validators';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100">
      <div class="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/70 p-6 sm:p-8 transition-all">
        
        <!-- Header / Logo -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3">
            <span class="material-symbols-outlined text-3xl">badge</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-900 tracking-tight">StaffPulse</h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            {{ isLoginMode ? 'Welcome back! Sign in to manage your workforce' : 'Create an account to get started' }}
          </p>
        </div>

        <!-- Mode Toggle Tabs -->
        <div class="grid grid-cols-2 p-1 mb-6 bg-slate-100 rounded-2xl">
          <button
            type="button"
            (click)="setMode(true)"
            [class]="isLoginMode ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700 font-medium'"
            class="py-2.5 text-sm rounded-xl transition-all cursor-pointer text-center"
          >
            Sign In
          </button>
          <button
            type="button"
            (click)="setMode(false)"
            [class]="!isLoginMode ? 'bg-white text-slate-900 shadow-sm font-semibold' : 'text-slate-500 hover:text-slate-700 font-medium'"
            class="py-2.5 text-sm rounded-xl transition-all cursor-pointer text-center"
          >
            Register
          </button>
        </div>

        <!-- Alert Error Banner -->
        @if (errorMessage) {
          <div class="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
            <span class="material-symbols-outlined text-rose-600 text-lg flex-shrink-0 mt-0.5">error</span>
            <div class="flex-1 leading-5">{{ errorMessage }}</div>
          </div>
        }

        <!-- SIGN IN FORM -->
        @if (isLoginMode) {
          <form [formGroup]="loginForm" (ngSubmit)="onLogin()" class="space-y-4">
            <!-- Email -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span class="material-symbols-outlined text-lg">mail</span>
                </div>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="name@company.com"
                  class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [ngClass]="{'border-rose-400 bg-rose-50/30': isControlInvalid(loginForm, 'email')}"
                />
              </div>
              @if (isControlInvalid(loginForm, 'email')) {
                <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  {{ getEmailErrorMessage(loginForm) }}
                </p>
              }
            </div>

            <!-- Password -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span class="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                  class="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [ngClass]="{'border-rose-400 bg-rose-50/30': isControlInvalid(loginForm, 'password')}"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (isControlInvalid(loginForm, 'password')) {
                <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  Password is required.
                </p>
              }
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || isLoading"
              class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              @if (isLoading) {
                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Signing in...</span>
              } @else {
                <span>Sign In</span>
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
              }
            </button>
          </form>
        }

        <!-- REGISTER FORM -->
        @if (!isLoginMode) {
          <form [formGroup]="registerForm" (ngSubmit)="onRegister()" class="space-y-4">
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span class="material-symbols-outlined text-lg">person</span>
                </div>
                <input
                  type="text"
                  formControlName="name"
                  placeholder="Alex Johnson"
                  class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [ngClass]="{'border-rose-400 bg-rose-50/30': isControlInvalid(registerForm, 'name')}"
                />
              </div>
              @if (isControlInvalid(registerForm, 'name')) {
                <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  Full name must be at least 2 characters.
                </p>
              }
            </div>

            <!-- Email with strict validation rules -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span class="material-symbols-outlined text-lg">mail</span>
                </div>
                <input
                  type="email"
                  formControlName="email"
                  placeholder="alex.johnson@company.com"
                  class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [ngClass]="{'border-rose-400 bg-rose-50/30': isControlInvalid(registerForm, 'email')}"
                />
              </div>
              @if (isControlInvalid(registerForm, 'email')) {
                <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">warning</span>
                  {{ getEmailErrorMessage(registerForm) }}
                </p>
              }
            </div>

            <!-- Password with real-time criteria checklist -->
            <div>
              <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Create Password
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <span class="material-symbols-outlined text-lg">lock</span>
                </div>
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="Min 8 chars, 1 uppercase, 1 number, 1 symbol"
                  class="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  [ngClass]="{'border-rose-400 bg-rose-50/30': isControlInvalid(registerForm, 'password')}"
                />
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <span class="material-symbols-outlined text-lg">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>

              <!-- Real-time Password Rules Checklist -->
              <div class="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                <p class="font-semibold text-slate-700 mb-1">Password Requirements:</p>
                <div class="flex items-center gap-2" [class]="hasMinLength() ? 'text-emerald-700 font-medium' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-base">{{ hasMinLength() ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  <span>Minimum 8 characters</span>
                </div>
                <div class="flex items-center gap-2" [class]="hasUppercase() ? 'text-emerald-700 font-medium' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-base">{{ hasUppercase() ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  <span>At least one uppercase letter (A-Z)</span>
                </div>
                <div class="flex items-center gap-2" [class]="hasLowercase() ? 'text-emerald-700 font-medium' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-base">{{ hasLowercase() ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  <span>At least one lowercase letter (a-z)</span>
                </div>
                <div class="flex items-center gap-2" [class]="hasNumber() ? 'text-emerald-700 font-medium' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-base">{{ hasNumber() ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  <span>At least one numeric digit (0-9)</span>
                </div>
                <div class="flex items-center gap-2" [class]="hasSpecialChar() ? 'text-emerald-700 font-medium' : 'text-slate-500'">
                  <span class="material-symbols-outlined text-base">{{ hasSpecialChar() ? 'check_circle' : 'radio_button_unchecked' }}</span>
                  <span>At least one special symbol (&#64;, $, !, %, &, *)</span>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="registerForm.invalid || isLoading"
              class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              @if (isLoading) {
                <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Creating account...</span>
              } @else {
                <span>Register & Continue</span>
                <span class="material-symbols-outlined text-lg">arrow_forward</span>
              }
            </button>
          </form>
        }

        <!-- Switch Footer text -->
        <div class="mt-6 pt-5 border-t border-slate-100 text-center">
          <p class="text-xs sm:text-sm text-slate-500">
            {{ isLoginMode ? "Don't have an account yet?" : "Already registered?" }}
            <button
              type="button"
              (click)="setMode(!isLoginMode)"
              class="ml-1 text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-2 cursor-pointer"
            >
              {{ isLoginMode ? 'Register here' : 'Sign in here' }}
            </button>
          </p>
        </div>

      </div>
    </div>
  `
})
export class LoginRegisterComponent implements OnInit {
  isLoginMode = true;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForms();

    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.isLoginMode = false;
      }
    });
  }

  private initForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, CustomValidators.strictEmail]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, CustomValidators.strictEmail]],
      password: ['', [Validators.required, CustomValidators.strictPassword]]
    });
  }

  setMode(isLogin: boolean) {
    this.isLoginMode = isLogin;
    this.errorMessage = '';
    this.showPassword = false;
  }

  isControlInvalid(form: FormGroup, controlName: string): boolean {
    const control = form.get(controlName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getEmailErrorMessage(form: FormGroup): string {
    const control = form.get('email');
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Email is required.';
    if (control.errors['noSpaces']) return control.errors['noSpaces'];
    if (control.errors['maxLength320']) return control.errors['maxLength320'];
    if (control.errors['singleAtSymbol']) return control.errors['singleAtSymbol'];
    if (control.errors['emptyLocal']) return control.errors['emptyLocal'];
    if (control.errors['invalidDomain']) return control.errors['invalidDomain'];
    return 'Please enter a valid email address.';
  }

  // Real-time password criteria helpers for register form
  hasMinLength(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return pass.length >= 8;
  }

  hasUppercase(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[A-Z]/.test(pass);
  }

  hasLowercase(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[a-z]/.test(pass);
  }

  hasNumber(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[0-9]/.test(pass);
  }

  hasSpecialChar(): boolean {
    const pass = this.registerForm.get('password')?.value || '';
    return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pass);
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success(`Welcome back, ${res.user?.name || 'User'}!`);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/employees';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Login failed. Please verify your credentials.';
      }
    });
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.toastService.success('Registration successful! Welcome to StaffPulse.');
        this.router.navigate(['/employees']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Registration failed. Please check your inputs.';
      }
    });
  }
}
