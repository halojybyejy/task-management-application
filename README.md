# Task Management App

A task management application built with TypeScript, Supabase, and React.

## Features

- Task management with Kanban board
- Project-level collaboration
- Supabase authentication
- Fixed category system
- Responsive design
- Real-time updates

## Tech Stack

### Frontend
- TypeScript
- React
- Chakra UI

### Backend
- NestJS
- TypeScript
- PostgreSQL (via Supabase)

## Prerequisites

- Node.js (v14 or higher)
- npm
- PostgreSQL (if running locally)
- Supabase account

## Installation Guide

Follow the steps below to set up the project from scratch.

---

### Prerequisites

- Node.js (v18+ recommended)
- npm / yarn / pnpm
- Supabase project with credentials (URL & API Key)
- Git

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/halojybyejy/task-management-app.git
cd task-management-app
```

---

### Step 2: Install Dependencies

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd ../frontend
npm install
```

---

### Step 3: Configure Environment Variables

Make sure to copy the `.env.example` file and fill in your Supabase credentials.

#### Backend

```bash
cd ../backend
cp .env.example .env
```

Configure your Supabase project credentials in the `.env` file. You must obtain these values from your Supabase project dashboard:

```env
BACKEND_PORT=4000
DATABASE_URL=postgresql://postgres:your-password@your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
SUPABASE_ANON_KEY=your-anon-key-here
DB_SSL=true
```

**Important**: Replace the placeholder values with your actual Supabase project credentials. These can be found in your Supabase project settings under the API section.

---

### Step 4: Database Schema Setup

The application includes a pre-built database schema file for easy migration. Due to IPv4/IPv6 connectivity limitations on Supabase's free tier, we provide a SQL dump file for manual schema setup.

```bash
cd backend
```

Import the database schema using the provided SQL file `task_management_app_schema.sql`:

1. **Access Supabase Dashboard**: Log into your Supabase project dashboard
2. **Navigate to SQL Editor**: 
   - Click on "SQL Editor" in the left sidebar
3. **Create New Query**:
   - Click the "New Query" button to create a new SQL query
4. **Copy and Paste Schema**:
   - Open the file `backend/task_management_app_schema.sql` from your project directory
   - Copy all the SQL content from the file
   - Paste it into the SQL Editor query window
5. **Execute the Schema**:
   - Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for the execution to complete successfully

This process will create all necessary database tables, relationships, constraints, and data types required for the task management application to function properly.

---

### Step 5: Start the Application

#### Backend

```bash
npm run start:dev
```

#### Frontend

```bash
cd ../frontend
npm run dev
```

---

### **Access Points**

Once both services are running:
- **Frontend Application**: http://localhost:3000
- **Backend API**: http://localhost:4000

---

### **Quick Commands Reference**

| Service | Start Command | Port | Description |
|---------|---------------|------|-------------|
| Backend | `npm run start:dev` | 4000 | NestJS API server with hot reload |
| Frontend | `npm start` | 3000 | React development server with hot reload |

---

### **Development Features**

Both services include hot reload:
- **Backend**: Automatically restarts when you modify TypeScript files
- **Frontend**: Automatically refreshes browser when you modify React components

---

### Credits

This project is built and maintained by [@halojybyejy](https://github.com/halojybyejy).