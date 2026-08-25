import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EmployeeService } from '../../core/services/employee.service';
import { ToastService } from '../../core/services/toast.service';
import { Employee } from '../../models/employee.model';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ConfirmModalComponent],
  template: `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- Top Action Bar & Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your organization's workforce, compensation, and department allocations.
          </p>
        </div>

        <a
          routerLink="/employees/add"
          class="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all cursor-pointer"
        >
          <span class="material-symbols-outlined text-xl">add</span>
          <span>Add Employee</span>
        </a>
      </div>

      <!-- Quick Summary Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <!-- Stat 1: Total Employees -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-2xl">groups</span>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</p>
            <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ employees.length }}</p>
          </div>
        </div>

        <!-- Stat 2: Total Payroll -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-2xl">payments</span>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Payroll</p>
            <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ totalPayroll | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
        </div>

        <!-- Stat 3: Avg Salary -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg. Compensation</p>
            <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ averageSalary | currency:'USD':'symbol':'1.0-0' }}</p>
          </div>
        </div>

        <!-- Stat 4: Departments -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-2xl">domain</span>
          </div>
          <div>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Departments</p>
            <p class="text-2xl font-bold text-slate-900 mt-0.5">{{ departmentCount }}</p>
          </div>
        </div>
      </div>

      <!-- Search & Filters -->
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <span class="material-symbols-outlined text-xl">search</span>
          </div>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onFilterChange()"
            placeholder="Search by name, email, department, or phone..."
            class="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <!-- Department Filter -->
        <div class="sm:w-56">
          <select
            [(ngModel)]="selectedDepartment"
            (ngModelChange)="onFilterChange()"
            class="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
          >
            <option value="All">All Departments</option>
            @for (dept of departments; track dept) {
              <option [value]="dept">{{ dept }}</option>
            }
          </select>
        </div>
      </div>

      <!-- ERROR STATE -->
      @if (errorMessage) {
        <div class="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center mb-6">
          <span class="material-symbols-outlined text-rose-600 text-3xl mb-2">error</span>
          <h3 class="text-base font-semibold text-rose-900">Failed to load employees</h3>
          <p class="text-xs text-rose-700 mt-1 mb-4">{{ errorMessage }}</p>
          <button
            (click)="loadEmployees()"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl"
          >
            Try Again
          </button>
        </div>
      }

      <!-- LOADING STATE SKELETON -->
      @if (isLoading) {
        <div class="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs p-6 space-y-4">
          <div class="flex items-center justify-center py-12 gap-3 text-indigo-600">
            <span class="inline-block w-6 h-6 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            <span class="text-sm font-semibold text-slate-700">Loading workforce records...</span>
          </div>
        </div>
      }

      <!-- DATA TABLE (Desktop) & CARDS (Mobile) -->
      @if (!isLoading && !errorMessage) {
        @if (filteredEmployees.length === 0) {
          <!-- Empty State -->
          <div class="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div class="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span class="material-symbols-outlined text-3xl">person_search</span>
            </div>
            <h3 class="text-lg font-bold text-slate-900">No employees found</h3>
            <p class="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mt-1 mb-6">
              {{ searchQuery || selectedDepartment !== 'All' ? 'No records match your filter criteria. Try resetting your search.' : 'Your employee directory is currently empty. Add your first team member.' }}
            </p>
            @if (searchQuery || selectedDepartment !== 'All') {
              <button
                type="button"
                (click)="resetFilters()"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Clear Filters
              </button>
            } @else {
              <a
                routerLink="/employees/add"
                class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              >
                <span class="material-symbols-outlined text-lg">add</span>
                Add First Employee
              </a>
            }
          </div>
        } @else {
          <!-- Responsive Table -->
          <div class="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th class="py-3.5 px-4 sm:px-6">Employee</th>
                    <th class="py-3.5 px-4">Department</th>
                    <th class="py-3.5 px-4">Contact Phone</th>
                    <th class="py-3.5 px-4">Annual Salary</th>
                    <th class="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-sm">
                  @for (emp of filteredEmployees; track emp.id) {
                    <tr class="hover:bg-slate-50/60 transition-colors">
                      <!-- Employee Name & Email -->
                      <td class="py-3.5 px-4 sm:px-6">
                        <div class="flex items-center gap-3">
                          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-sm flex items-center justify-center shadow-xs flex-shrink-0">
                            {{ emp.name.charAt(0) }}
                          </div>
                          <div>
                            <div class="font-semibold text-slate-900">{{ emp.name }}</div>
                            <div class="text-xs text-slate-500">{{ emp.email }}</div>
                          </div>
                        </div>
                      </td>

                      <!-- Department Badge -->
                      <td class="py-3.5 px-4">
                        <span
                          class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold"
                          [ngClass]="getDepartmentClass(emp.department)"
                        >
                          {{ emp.department }}
                        </span>
                      </td>

                      <!-- Phone -->
                      <td class="py-3.5 px-4 text-slate-600 text-xs sm:text-sm">
                        {{ emp.phone }}
                      </td>

                      <!-- Salary -->
                      <td class="py-3.5 px-4 font-semibold text-slate-900">
                        {{ emp.salary | currency:'USD':'symbol':'1.0-0' }}
                      </td>

                      <!-- Action Buttons -->
                      <td class="py-3.5 px-4 sm:px-6 text-right">
                        <div class="inline-flex items-center gap-1.5">
                          <a
                            [routerLink]="['/employees/edit', emp.id]"
                            class="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Employee"
                          >
                            <span class="material-symbols-outlined text-lg">edit</span>
                          </a>
                          <button
                            type="button"
                            (click)="promptDelete(emp)"
                            class="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Employee"
                          >
                            <span class="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <!-- Table Footer Count -->
            <div class="py-3 px-6 bg-slate-50 border-t border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
              <span>Showing {{ filteredEmployees.length }} of {{ employees.length }} total employees</span>
              <span class="font-medium text-slate-700">Employee Management</span>
            </div>
          </div>
        }
      }

    </div>

    <!-- Confirm Delete Modal -->
    <app-confirm-modal
      [isOpen]="showDeleteModal"
      [title]="'Delete Employee'"
      [message]="'Are you sure you want to remove ' + (employeeToDelete?.name || 'this employee') + ' from the database? This action is permanent.'"
      [confirmText]="'Delete'"
      [isLoading]="isDeleting"
      (confirmed)="confirmDelete()"
      (cancelled)="cancelDelete()"
    ></app-confirm-modal>
  `
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  filteredEmployees: Employee[] = [];
  isLoading = false;
  errorMessage = '';

  searchQuery = '';
  selectedDepartment = 'All';

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

  // Delete modal state
  showDeleteModal = false;
  employeeToDelete: Employee | null = null;
  isDeleting = false;

  constructor(
    private employeeService: EmployeeService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees() {
    this.isLoading = true;
    this.errorMessage = '';

    this.employeeService.getEmployees().subscribe({
      next: (res) => {
        this.isLoading = false;
        this.employees = res.data || [];
        this.applyFilters();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Could not load employees from server.';
      }
    });
  }

  onFilterChange() {
    this.applyFilters();
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedDepartment = 'All';
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.employees];

    if (this.selectedDepartment && this.selectedDepartment !== 'All') {
      result = result.filter(e => e.department.toLowerCase() === this.selectedDepartment.toLowerCase());
    }

    if (this.searchQuery && this.searchQuery.trim()) {
      const q = this.searchQuery.trim().toLowerCase();
      result = result.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q)
      );
    }

    this.filteredEmployees = result;
  }

  // Summary stats calculations
  get totalPayroll(): number {
    return this.employees.reduce((acc, curr) => acc + (Number(curr.salary) || 0), 0);
  }

  get averageSalary(): number {
    return this.employees.length ? this.totalPayroll / this.employees.length : 0;
  }

  get departmentCount(): number {
    const depts = new Set(this.employees.map(e => e.department));
    return depts.size;
  }

  getDepartmentClass(dept: string): string {
    switch (dept?.toLowerCase()) {
      case 'engineering':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'product':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'marketing':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'finance':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'human resources':
        return 'bg-rose-50 text-rose-700 border border-rose-200';
      case 'sales':
        return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200';
    }
  }

  promptDelete(emp: Employee) {
    this.employeeToDelete = emp;
    this.showDeleteModal = true;
  }

  cancelDelete() {
    this.showDeleteModal = false;
    this.employeeToDelete = null;
  }

  confirmDelete() {
    if (!this.employeeToDelete || !this.employeeToDelete.id) return;

    this.isDeleting = true;
    const empId = this.employeeToDelete.id;
    const empName = this.employeeToDelete.name;

    this.employeeService.deleteEmployee(empId).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.employees = this.employees.filter(e => e.id !== empId);
        this.applyFilters();
        this.toastService.success(`Employee "${empName}" deleted successfully.`);
        this.employeeToDelete = null;
      },
      error: (err) => {
        this.isDeleting = false;
        this.toastService.error(err.error?.message || 'Failed to delete employee.');
      }
    });
  }
}
