# 🚀 Complete Deployment & Submission Guide

This guide provides step-by-step instructions to:
1. Push your project to **GitHub**.
2. Set up a **Free MySQL Cloud Database**.
3. Deploy the application to **Render**.
4. Add your **Live Deployment Link** and badges to your GitHub repository.

---

## 📌 Part 1: Push Your Project to GitHub

### Step 1: Open Terminal in the Project Root
Make sure your terminal is inside the `employee-management-app` directory:
```bash
cd employee-management-app
```

### Step 2: Initialize Git & Commit
Run the following commands:
```bash
# Initialize git repository
git init

# Stage all project files (.gitignore will automatically skip node_modules and .env)
git add .

# Create initial commit
git commit -m "feat: complete Employee Management system with Angular, Express & MySQL"
```

### Step 3: Create a New GitHub Repository
1. Go to [https://github.com/new](https://github.com/new).
2. Name your repository (e.g. `employee-management-app` or `staffpulse-hrms`).
3. Set visibility to **Public** (required for assignment submission & free deployment).
4. **Do NOT** check "Initialize with README" (since we already have one).
5. Click **Create repository**.

### Step 4: Link and Push to GitHub
Copy the commands shown on GitHub:
```bash
# Rename branch to main
git branch -M main

# Add your GitHub repository as remote (replace with your actual GitHub URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/employee-management-app.git

# Push code to GitHub
git push -u origin main
```

---

## 📌 Part 2: Set Up a Free Cloud MySQL Database (2 Minutes)

Render's free tier does not include persistent MySQL instances, but you can get a free, high-performance MySQL cloud database in 2 minutes using **Aiven** or **Clever Cloud**.

### Option A: Aiven (Recommended - Free Tier)
1. Go to [https://aiven.io/](https://aiven.io/) and click **Sign Up Free**.
2. Click **Create Service** -> Choose **MySQL**.
3. Select the **Free Tier** plan.
4. Choose any cloud provider and region closest to you.
5. Click **Create Service**.
6. On your service overview page, copy your **Service URI** or connection parameters:
   - `Host`
   - `Port`
   - `User` (avnadmin)
   - `Password`
   - `Database` (defaultdb)

### Option B: Clever Cloud (Alternative Free MySQL)
1. Sign up at [https://www.clever-cloud.com/](https://www.clever-cloud.com/).
2. Create an **Add-on** -> Select **MySQL** (Free "Personal" plan).
3. Copy the database credentials provided.

---

## 📌 Part 3: Deploy on Render

Render will build both the Angular frontend and Node.js backend and serve them from a single high-speed URL.

### Step 1: Create a Render Account
1. Visit [https://render.com/](https://render.com/) and sign in with your GitHub account.

### Step 2: Create a New Web Service
1. In your Render Dashboard, click **New +** -> **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Connect your `employee-management-app` repository.

### Step 3: Configure Build & Start Settings
Fill in the following fields:

- **Name**: `staffpulse-employee-management` (or any unique name)
- **Language / Runtime**: `Node`
- **Region**: Closest to your database region (e.g. Frankfurt, Ohio, Singapore)
- **Branch**: `main`
- **Root Directory**: *(Leave blank)*
- **Build Command**:
  ```bash
  npm install --prefix backend && npm install --prefix frontend && npm run build:frontend
  ```
- **Start Command**:
  ```bash
  node backend/src/server.js
  ```
- **Instance Type**: `Free`

### Step 4: Add Environment Variables
Scroll down to the **Environment Variables** section and add:

| Key | Value (Example) |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `10000` *(Render sets this automatically)* |
| `JWT_SECRET` | `your_secure_random_jwt_secret_key_here` |
| `DB_HOST` | `your-db-host.aivencloud.com` *(from Cloud DB)* |
| `DB_PORT` | `12345` *(from Cloud DB)* |
| `DB_USER` | `avnadmin` *(from Cloud DB)* |
| `DB_PASSWORD` | `your_db_password` *(from Cloud DB)* |
| `DB_NAME` | `defaultdb` *(from Cloud DB)* |
| `DB_SSL` | `true` |

*(Or simply supply `DATABASE_URL` with your full MySQL URI).*

### Step 5: Click "Create Web Service"
- Render will start building the Angular app, install packages, and launch Express.
- Once complete, Render displays a green **"Live"** badge and your app URL:
  `https://staffpulse-employee-management.onrender.com`

---

## 📌 Part 4: Add Deployment Link & Badges in GitHub

To submit your assignment and showcase your live app:

### Step 1: Update GitHub Repository "About"
1. Go to your GitHub repository homepage.
2. On the right side, click the **⚙️ (Gear icon)** next to "About".
3. Under **Website**, paste your Render URL:
   `https://staffpulse-employee-management.onrender.com`
4. Click **Save changes**.

### Step 2: Update README.md
In your `README.md`, replace `https://your-app-name.onrender.com` with your actual live Render link:

```markdown
# 🏢 StaffPulse - Employee Management System

[![Live Demo](https://img.shields.io/badge/Live_Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://your-app-name.onrender.com)
[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

🔗 **Live Application URL**: [https://your-app-name.onrender.com](https://your-app-name.onrender.com)
```

### Step 3: Commit and Push the Link Update
```bash
git add README.md
git commit -m "docs: add live Render deployment link"
git push
```

