# Database Configuration Guide - Budget Manager

## Overview

Budget Manager supports three database configurations:

1. **Docker PostgreSQL** (Local Development) - ⭐ **RECOMMENDED FOR DEVELOPMENT**
2. **Supabase** (Cloud) - Recommended for Production
3. **Local PostgreSQL** (Standalone) - Alternative for local development

## Quick Start

### Option 1: Docker PostgreSQL (Recommended for Development)

This is the fastest way to get started locally.

**Requirements:**
- Docker Desktop installed and running

**Steps:**

1. **Double-click `DB_SWITCH.bat`** and select option **1**
   - This automatically configures your `.env` file

2. **Ensure Docker is running:**
   ```bash
   docker ps
   ```

3. **Start the containers:**
   ```bash
   docker-compose up --build -d
   ```

4. **Wait for PostgreSQL to be ready** (~20 seconds)

5. **Run migrations:**
   ```bash
   docker exec 01_budgetmanager-backend-1 npx prisma migrate deploy
   ```

6. **Start the backend:**
   ```bash
   cd backend
   npm run dev
   ```

**Access:**
- Backend: http://localhost:3000
- Prisma Studio: `npm run prisma:studio` (inside backend folder)

---

## Option 2: Supabase (Cloud Database - Production)

Perfect for production deployments and cloud hosting.

### Step 1: Create Supabase Project

1. Go to **https://supabase.com**
2. Click **"New Project"**
3. Fill in the details:
   - **Project name:** budget-manager
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free tier is fine for testing
4. Click **"Create new project"**
5. **Wait 2-3 minutes** for the project to initialize

### Step 2: Get Your Connection Details

1. In your Supabase dashboard, click **"Settings"** → **"Database"**
2. Find the **Connection Details** section:
   - **Project ID:** From the project URL (example: `abc123xyz`)
   - **Database URL:** Already formatted (we'll use a simpler one)
   - **Postgres Password:** The password you set during creation

### Step 3: Configure Database in Budget Manager

1. **Double-click `DB_SWITCH.bat`** and select option **2**
2. Enter your:
   - Supabase Project ID
   - Database Password
3. The script will create/update your `backend/.env` file

### Step 4: Execute SQL Setup Script

1. Open **SUPABASE_SETUP.sql** in your text editor
2. Go to your Supabase dashboard: **https://supabase.com/dashboard**
3. Click on your project
4. Go to **"SQL Editor"** in the left sidebar
5. Click **"New Query"**
6. **Copy and paste the entire content** of SUPABASE_SETUP.sql
7. Click **"Run"** (green button at bottom)

**Expected Output:**
```
Tables: 3 (categories, provisions, expenses)
Types: 2 (provision_status, payment_method)
Triggers: 3 (for updated_at)
Indexes: 9 (for performance)
```

### Step 5: Sync with Prisma

```bash
cd backend

# Push the Prisma schema to Supabase
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Start the backend
npm run dev
```

### Step 6: (Optional) Verify Connection

```bash
# If you have psql installed locally:
psql -U postgres -h db.YOUR_PROJECT_ID.supabase.co -d postgres

# Should show the tables:
# \dt
```

---

## Option 3: Local PostgreSQL (Standalone)

For users who prefer a local PostgreSQL installation without Docker.

### Step 1: Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember the password you set for the `postgres` user
4. Installation creates the PostgreSQL service (auto-starts)

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create the database
CREATE DATABASE budget_management;

# Exit psql
\q
```

### Step 3: Configure Budget Manager

1. **Double-click `DB_SWITCH.bat`** and select option **3**
2. Enter:
   - **Host:** localhost
   - **Port:** 5432 (default)
   - **User:** postgres (or your user)
   - **Password:** Your PostgreSQL password
   - **Database:** budget_management
3. Script will configure `backend/.env`

### Step 4: Initialize Database

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Start the backend
npm run dev
```

---

## Switching Databases

To switch from one database to another:

1. **Double-click `DB_SWITCH.bat`**
2. Select your new database option (1, 2, or 3)
3. **Important:** Your existing data will NOT be migrated automatically
   - Plan accordingly if you have important data

### Data Migration Strategy

If you need to migrate data between databases:

```bash
# Export data from old database
npx prisma db pull

# Switch database (run DB_SWITCH.bat)

# Push schema to new database
npx prisma db push

# Restore data (manual or custom script)
```

---

## Verification Checklist

### Docker PostgreSQL
- ✅ Docker Desktop is running
- ✅ `docker-compose ps` shows 3 containers (db, backend, frontend)
- ✅ Backend connects without errors
- ✅ `http://localhost:3000/health` returns 200 OK

### Supabase
- ✅ Project created at supabase.com
- ✅ SQL setup script executed
- ✅ Tables visible in Supabase "Table Editor"
- ✅ Connection string in `.env`
- ✅ `npx prisma db push` succeeds
- ✅ Backend connects without errors

### Local PostgreSQL
- ✅ PostgreSQL service is running
- ✅ `psql -U postgres -d budget_management` connects successfully
- ✅ Migrations completed
- ✅ Tables visible in `psql`: `\dt`
- ✅ Backend connects without errors

---

## Environment Variables Explained

```bash
# The DATABASE_URL format:
postgresql://[user]:[password]@[host]:[port]/[database]?schema=public

# Docker example:
postgresql://postgres:postgres@db:5432/budget_management?schema=public

# Supabase example:
postgresql://postgres:your_password@db.abc123xyz.supabase.co:5432/postgres?schema=public

# Local PostgreSQL example:
postgresql://postgres:your_password@localhost:5432/budget_management?schema=public
```

---

## Troubleshooting

### "Connection refused" error

**Docker:**
```bash
# Check if containers are running
docker-compose ps

# Check logs
docker-compose logs db
```

**Supabase:**
- Verify Project ID is correct
- Verify Database Password is correct
- Check that SQL setup script was executed
- Whitelist your IP: Settings → Database → Firewall

**Local PostgreSQL:**
```bash
# Check if PostgreSQL is running
psql -U postgres

# Start PostgreSQL service (Windows)
net start postgresql-x64-15
```

### "Database does not exist" error

**Docker:**
```bash
# Migrations run automatically, but if needed:
docker exec 01_budgetmanager-backend-1 npx prisma migrate deploy
```

**Supabase:**
```bash
# Push schema to create tables
npx prisma db push
```

**Local PostgreSQL:**
```bash
# Run migrations
npx prisma migrate dev --name init
```

### "Cannot find module 'prisma'" error

```bash
# Reinstall dependencies
cd backend
npm install

# Regenerate Prisma client
npx prisma generate
```

---

## Database Backup & Recovery

### Docker PostgreSQL

```bash
# Backup
docker exec 01_budgetmanager-db-1 pg_dump -U postgres budget_management > backup.sql

# Restore
docker exec -i 01_budgetmanager-db-1 psql -U postgres budget_management < backup.sql
```

### Supabase

1. Go to **Settings** → **Backups**
2. Automatic backups are enabled
3. Click **"Download"** to get a backup

### Local PostgreSQL

```bash
# Backup
pg_dump -U postgres -d budget_management -f backup.sql

# Restore
psql -U postgres -d budget_management -f backup.sql
```

---

## Production Recommendations

### Use Supabase for Production

1. **Automatic Backups:** Daily backups included
2. **Security:** SSL/TLS encryption
3. **Scalability:** Auto-scales as needed
4. **Monitoring:** Built-in analytics and logs
5. **Compliance:** GDPR compliant

### Enable Row-Level Security (Optional)

For multi-user support, enable RLS in Supabase:

1. Go to **Authentication** → **Policies**
2. Enable policies on tables
3. Create policies for each table

### Environment Variables in Production

Set these in your hosting platform (Vercel, Railway, Heroku, etc.):

```
NODE_ENV=production
DATABASE_URL=postgresql://postgres:password@db.xyz.supabase.co:5432/postgres?schema=public
PORT=3000
```

---

## Summary

| Feature | Docker | Supabase | Local PostgreSQL |
|---------|--------|----------|------------------|
| Setup Time | 2 minutes | 5 minutes | 10 minutes |
| Cost | Free | Free (tier included) | Free |
| Maintenance | Minimal | None | Manual |
| Production Ready | No | Yes | No |
| Backups | Manual | Automatic | Manual |
| Scaling | Limited | Unlimited | Limited |
| Remote Access | No | Yes | Yes (if configured) |

**Recommendation:**
- **Development:** Docker PostgreSQL
- **Production:** Supabase
- **Testing:** Local PostgreSQL

---

## Need Help?

1. Check the troubleshooting section above
2. Review logs: `docker-compose logs` (Docker)
3. Check Supabase status: https://status.supabase.com
4. Open an issue on GitHub with your error message

Good luck! 🚀
