# StaffPulse - Modern Employee Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://your-app-name.onrender.com)
[![Angular 19](https://img.shields.io/badge/Angular_19-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js_Express-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A modern, fullstack **Employee Management System** built with **Angular (Standalone Architecture)**, **Node.js Express**, **MySQL Database**, **JWT Authentication**, and **Tailwind CSS**.

🔗 **Live Deployment URL**: (https://employee-management-app-ua67.onrender.com)
---

## ✨ Features

### 🔐 1. Authentication & Security (Front Page)
- **Unified Front Page**: Smooth tab switching between **Sign In** and **Registration**.
- **Strict Email Validation Rules**:
  - Exactly one `@` symbol separating the local name and domain.
  - Zero whitespace characters permitted anywhere in the address.
  - Max length $\le 320$ characters.
  - Comprehensive regex RFC format check.
- **Strict Password Validation Rules**:
  - Minimum 8 characters.
  - At least one uppercase letter (`A-Z`).
  - At least one lowercase letter (`a-z`).
  - At least one numeric digit (`0-9`).
  - At least one special symbol (`@`, `$`, `!`, `%`, `&`, `*`, etc.).
  - **Live Password Criteria Checklist**: Visual checkmarks appear dynamically as each rule is satisfied.
- **Secure Password Hashing**: Passwords stored using `bcryptjs` with salt rounds.
- **Session Protection**: JWT Tokens stored securely with Angular `AuthGuard` route guards and `AuthInterceptor`.

### 👥 2. Employee Directory & CRUD Management
- **Interactive Directory**:
  - Real-time search across Name, Email, Department, and Phone.
  - Department filtering dropdown (Engineering, Product, Marketing, Finance, HR, Operations, Sales).
  - Quick statistics summary cards: Total Staff, Total Payroll ($), Average Salary ($), Active Departments.
  - Colored department badge indicators and currency formatting.
- **Add Employee**:
  - Reactive form with instant field-level validation for Name, Email, Phone, Department, and Salary.
- **Edit Employee**:
  - Pre-populated form allowing seamless updates to employee information.
- **Delete Employee**:
  - Modal confirmation dialog to avoid accidental deletions with loading state and toast feedback.
- **Loading & Error States**:
  - Skeleton loaders and retry banners for resilient user experience.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | Angular 19 (Standalone Components, Signals, Reactive Forms) |
| **Styling & Icons** | Tailwind CSS + Google Material Symbols |
| **Backend API** | Node.js + Express.js |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` |
| **Database** | MySQL (with `mysql2/promise` pool & auto-table initialization) |
| **Deployment** | Render Web Service + Cloud MySQL (Aiven / Clever Cloud) |

---

## 📡 REST API Documentation

### Base URL: `/api`

#### Authentication Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Sign in & receive JWT token | No |
| `GET` | `/api/auth/me` | Get current logged-in user profile | Yes (JWT) |

#### Employee Management Routes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/employees` | Get all employees (supports `?search=` and `?department=`) | Yes (JWT) |
| `GET` | `/api/employees/:id` | Get single employee details | Yes (JWT) |
| `POST` | `/api/employees` | Create a new employee record | Yes (JWT) |
| `PUT` | `/api/employees/:id` | Update existing employee record | Yes (JWT) |
| `DELETE` | `/api/employees/:id` | Delete employee record | Yes (JWT) |
| `GET` | `/api/health` | Service health status & DB state | No |

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or v20+)
- [MySQL](https://www.mysql.com/) (Optional: if MySQL is not running locally, the backend automatically runs in mock fallback mode for zero-configuration testing!)

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/employee-management-app.git
cd employee-management-app
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 3. Configure Backend Environment
Create a `.env` file in the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=employee_db
JWT_SECRET=super_secret_jwt_key_employee_management_2026
```

### 4. Run the Application
**Terminal 1: Start Backend**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2: Start Frontend**
```bash
cd frontend
npm start
# Angular dev server runs on http://localhost:4200
```

Open [http://localhost:4200](http://localhost:4200) in your browser!

---

## 📦 Production Deployment Guide

For full instructions on:
1. Pushing to GitHub
2. Creating a Free MySQL database on Aiven / Clever Cloud
3. Deploying to Render with unified single-URL hosting

👉 Please see **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** for a complete walkthrough!

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
