import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { ToastService } from '../../core/services/toast.service';
import { CustomValidators } from '../../core/validators/custom.validators';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Breadcrumb / Back Link -->
      <div class="mb-6">
        <a
          routerLink="/employees"
          class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <span class="material-symbols-outlined text-base">arrow_back</span>
          Back to Directory
        </a>
      </div>

      <!-- Card Form Container -->
      <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/40 p-6 sm:p-10">
        
        <!-- Header -->
        <div class="flex items-center gap-4 pb-6 mb-8 border-b border-slate-100">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg"
            [ngClass]="isEditMode ? 'bg-amber-500 shadow-amber-200' : 'bg-indigo-600 shadow-indigo-200'"
          >
            <span class="material-symbols-outlined text-3xl">
              {{ isEditMode ? 'manage_accounts' : 'person_add' }}
            </span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
              {{ isEditMode ? 'Edit Employee Profile' : 'Add New Employee' }}
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
              {{ isEditMode ? 'Update existing employee details and compensation.' : 'Fill in the information below to onboard a new employee.' }}
            </p>
          </div>
        </div>

        <!-- Error Alert Banner -->
        @if (serverError) {
          <div class="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <span class="material-symbols-outlined text-rose-600 text-xl flex-shrink-0 mt-0.5">error</span>
            <div class="flex-1">{{ serverError }}</div>
          </div>
        }

        <!-- Loading employee data skeleton (if in edit mode) -->
        @if (isLoadingData) {
          <div class="py-12 flex flex-col items-center justify-center gap-3 text-indigo-600">
            <span class="inline-block w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span class="text-sm font-semibold text-slate-600">Loading employee details...</span>
          </div>
        } @else {
          <!-- Employee Reactive Form -->
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()" class="space-y-6">
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <!-- Full Name -->
              <div class="sm:col-span-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span class="material-symbols-outlined text-lg">badge</span>
                  </div>
                  <input
                    type="text"
                    formControlName="name"
                    placeholder="e.g. Eleanor Vance"
                    class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    [ngClass]="{'border-rose-400 bg-rose-50/20': isFieldInvalid('name')}"
                  />
                </div>
                @if (isFieldInvalid('name')) {
                  <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    Full name is required (min 2 characters).
                  </p>
                }
              </div>

              <!-- Email -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Work Email <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span class="material-symbols-outlined text-lg">mail</span>
                  </div>
                  <input
                    type="email"
                    formControlName="email"
                    placeholder="eleanor.vance@company.com"
                    class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    [ngClass]="{'border-rose-400 bg-rose-50/20': isFieldInvalid('email')}"
                  />
                </div>
                @if (isFieldInvalid('email')) {
                  <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    {{ getEmailError() }}
                  </p>
                }
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span class="material-symbols-outlined text-lg">call</span>
                  </div>
                  <input
                    type="text"
                    formControlName="phone"
                    placeholder="+1 (555) 000-0000"
                    class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    [ngClass]="{'border-rose-400 bg-rose-50/20': isFieldInvalid('phone')}"
                  />
                </div>
                @if (isFieldInvalid('phone')) {
                  <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    Valid phone number is required (min 5 digits).
                  </p>
                }
              </div>

              <!-- Department -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Department <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span class="material-symbols-outlined text-lg">domain</span>
                  </div>
                  <select
                    formControlName="department"
                    class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer"
                    [ngClass]="{'border-rose-400 bg-rose-50/20': isFieldInvalid('department')}"
                  >
                    <option value="" disabled>Select Department</option>
                    @for (dept of departments; track dept) {
                      <option [value]="dept">{{ dept }}</option>
                    }
                  </select>
                </div>
                @if (isFieldInvalid('department')) {
                  <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    Department selection is required.
                  </p>
                }
              </div>

              <!-- Salary -->
              <div>
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Annual Salary ($ USD) <span class="text-rose-500">*</span>
                </label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span class="material-symbols-outlined text-lg">attach_money</span>
                  </div>
                  <input
                    type="number"
                    step="500"
                    min="0"
                    formControlName="salary"
                    placeholder="85000"
                    class="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    [ngClass]="{'border-rose-400 bg-rose-50/20': isFieldInvalid('salary')}"
                  />
                </div>
                @if (isFieldInvalid('salary')) {
                  <p class="text-rose-600 text-xs mt-1.5 flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">warning</span>
                    Salary must be a positive number.
                  </p>
                }
              </div>

            </div>

            <!-- Form Actions -->
            <div class="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <a
                routerLink="/employees"
                class="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </a>
              <button
                type="submit"
                [disabled]="employeeForm.invalid || isSubmitting"
                class="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                @if (isSubmitting) {
                  <span class="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>{{ isEditMode ? 'Updating...' : 'Saving...' }}</span>
                } @else {
                  <span class="material-symbols-outlined text-lg">{{ isEditMode ? 'save' : 'check' }}</span>
                  <span>{{ isEditMode ? 'Update Employee' : 'Create Employee' }}</span>
                }
              </button>
            </div>

          </form>
        }

      </div>
    </div>
  `
})
export class EmployeeFormComponent implements OnInit {
  employeeForm!: FormGroup;
  isEditMode = false;
  employeeId: number | null = null;
  isLoadingData = false;
  isSubmitting = false;
  serverError = '';

  departments = [
    'Engineering',
    'Product',
    'Marketing',
    'Finance',
    'Human Resources',
    'Operations',
    'Sales',
    'Customer Support'
  ];

  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.employeeId = parseInt(idParam, 10);
      this.loadEmployeeData(this.employeeId);
    }
  }

  private initForm() {
    this.employeeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, CustomValidators.strictEmail]],
      phone: ['', [Validators.required, Validators.minLength(5)]],
      department: ['', [Validators.required]],
      salary: ['', [Validators.required, Validators.min(0)]]
    });
  }

  private loadEmployeeData(id: number) {
    this.isLoadingData = true;
    this.serverError = '';

    this.employeeService.getEmployeeById(id).subscribe({
      next: (res) => {
        this.isLoadingData = false;
        if (res.data) {
          this.employeeForm.patchValue({
            name: res.data.name,
            email: res.data.email,
            phone: res.data.phone,
            department: res.data.department,
            salary: res.data.salary
          });
        }
      },
      error: (err) => {
        this.isLoadingData = false;
        this.serverError = err.error?.message || `Failed to fetch employee with ID ${id}.`;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.employeeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getEmailError(): string {
    const control = this.employeeForm.get('email');
    if (!control || !control.errors) return '';
    if (control.errors['required']) return 'Email is required.';
    if (control.errors['noSpaces']) return control.errors['noSpaces'];
    if (control.errors['maxLength320']) return control.errors['maxLength320'];
    if (control.errors['singleAtSymbol']) return control.errors['singleAtSymbol'];
    if (control.errors['emptyLocal']) return control.errors['emptyLocal'];
    if (control.errors['invalidDomain']) return control.errors['invalidDomain'];
    return 'Invalid email format.';
  }

  onSubmit() {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.serverError = '';
    const formValue = this.employeeForm.value;

    if (this.isEditMode && this.employeeId) {
      this.employeeService.updateEmployee(this.employeeId, formValue).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.toastService.success(`Employee "${formValue.name}" updated successfully.`);
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.serverError = err.error?.message || 'Failed to update employee.';
        }
      });
    } else {
      this.employeeService.createEmployee(formValue).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.toastService.success(`Employee "${formValue.name}" added to directory.`);
          this.router.navigate(['/employees']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.serverError = err.error?.message || 'Failed to add employee.';
        }
      });
    }
  }
}
