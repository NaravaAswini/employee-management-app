import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { LoginRegisterComponent } from './pages/auth/login-register.component';
import { EmployeeListComponent } from './pages/employee-list/employee-list.component';
import { EmployeeFormComponent } from './pages/employee-form/employee-form.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'employees',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginRegisterComponent,
    canActivate: [guestGuard]
  },
  {
    path: 'employees',
    component: EmployeeListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'employees/add',
    component: EmployeeFormComponent,
    canActivate: [authGuard]
  },
  {
    path: 'employees/edit/:id',
    component: EmployeeFormComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'employees'
  }
];
