export interface Employee {
  id?: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  salary: number;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeResponse {
  success: boolean;
  message?: string;
  data?: Employee;
  errors?: string[];
}

export interface EmployeeListResponse {
  success: boolean;
  message?: string;
  count?: number;
  data: Employee[];
}
