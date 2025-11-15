# Supabase Quick Start Guide

## What is Supabase?

Supabase is an open-source Firebase alternative that provides:
- PostgreSQL database (same as our app uses)
- Real-time subscriptions
- Authentication (built-in)
- Automatic backups
- Free tier with 500MB storage

Perfect for deploying Budget Manager to production!

---

## 5-Minute Setup

### Step 1: Create Supabase Account & Project (2 min)

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with:
   - Email: your email
   - Password: strong password
4. Create a new project:
   - Project name: `budget-manager`
   - Database password: `YourStrongPassword123!` (save this!)
   - Region: Select closest to you
   - Pricing: Free tier
5. Click **"Create new project"**
6. **Wait 2-3 minutes** while Supabase initializes

### Step 2: Get Your Credentials (1 min)

1. In Supabase dashboard, go to **Settings** (gear icon)
2. Click **Database** tab
3. Find your **Project ID** (in the project URL)
   - URL format: `https://YOUR_PROJECT_ID.supabase.co`
   - Example: `abc123xyz`
4. Your **Database Password** is the one you set above

### Step 3: Configure Budget Manager (1 min)

1. Double-click **`DB_SWITCH.bat`**
2. Press **2** (Supabase option)
3. Enter your Project ID
4. Enter your Database Password
5. Keep the `backend/.env` file when asked

### Step 4: Execute SQL Setup (1 min)

1. Open **SUPABASE_SETUP.sql** (in the root folder)
2. Go to your Supabase dashboard
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. **Paste** the entire SUPABASE_SETUP.sql content
6. Click **Run** (green button)

You should see:
```
3 tables created
2 enums created
3 triggers created
9 indexes created
```

### Step 5: Connect Your App (instant)

```bash
cd backend

# Sync Prisma with Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate

# Start backend
npm run dev
```

Done! Your app is now connected to Supabase. 🎉

---

## What Gets Created?

### Tables
- **categories** - Budget categories (Groceries, Transport, etc.)
- **provisions** - Anticipated expenses (monthly bills, etc.)
- **expenses** - Actual spending records

### Columns (Categories)
```
id              - UUID (unique identifier)
name            - Text (e.g., "Groceries")
period          - Text (e.g., "2025-01")
monthly_budget  - Decimal (e.g., 500.00)
notes           - Text (optional)
created_at      - Timestamp
updated_at      - Timestamp (auto-updates)
```

### Columns (Provisions)
```
id              - UUID
item            - Text (e.g., "Electricity bill")
category_id     - UUID (links to category)
amount          - Decimal (always negative)
due_date        - Timestamp
status          - OPEN or CLOSED
notes           - Text (optional)
created_at      - Timestamp
updated_at      - Timestamp
```

### Columns (Expenses)
```
id              - UUID
date            - Timestamp
description     - Text
category_id     - UUID (links to category)
provision_id    - UUID (optional, links to provision)
amount          - Decimal (always negative)
payment_method  - CASH, TRANSFER, CARD, or OTHER
created_at      - Timestamp
updated_at      - Timestamp
```

---

## Verify Everything Works

### Check in Supabase Dashboard

1. Go to **Table Editor** (left sidebar)
2. You should see three tables:
   - categories
   - provisions
   - expenses

### Check Your App

```bash
# In backend folder
npm run dev
```

Visit: `http://localhost:3000/health`

Should return:
```json
{
  "status": "ok",
  "database": "connected"
}
```

---

## View Your Data

### In Supabase Dashboard

1. Click **Table Editor**
2. Select a table
3. View all rows in real-time
4. Add/edit/delete data directly

### In Your App

1. Open frontend: `http://localhost:3001`
2. Navigate to Categories, Expenses, or Provisions
3. All CRUD operations work with Supabase!

---

## Backup & Recovery

### Automatic Backups

Supabase creates automatic daily backups. To download:

1. Go to **Settings** → **Backups**
2. Click **Download** on any backup

### Manual Backup

```bash
# Backup to file
pg_dump -h db.YOUR_PROJECT_ID.supabase.co -U postgres -d postgres > backup.sql

# Restore from file
psql -h db.YOUR_PROJECT_ID.supabase.co -U postgres -d postgres < backup.sql
```

---

## Environment Variable Reference

Your `backend/.env` will look like:

```
DATABASE_URL=postgresql://postgres:YourPassword@db.abc123xyz.supabase.co:5432/postgres?schema=public
PORT=3000
NODE_ENV=production
```

---

## Common Questions

### Q: Is Supabase secure?
**A:** Yes! Uses SSL/TLS encryption, password hashing, and PostgreSQL security.

### Q: Can I access the database from my computer?
**A:** Yes, using any PostgreSQL client (psql, DBeaver, TablePlus, etc.)

### Q: What if I hit free tier limits?
**A:** Upgrade anytime. Free tier includes:
- 500MB storage
- Unlimited bandwidth
- 2 concurrent connections
- Perfect for testing!

### Q: Can I export my data?
**A:** Yes! Download backups anytime from Settings → Backups

### Q: Can I use this for production?
**A:** Absolutely! Supabase is production-ready with 99.9% uptime.

### Q: How do I add more database features?
**A:** Supabase SQL Editor allows raw SQL queries. Advanced users can:
- Add stored procedures
- Create views
- Add extensions
- Write custom functions

---

## Deploying Frontend to Production

Once Supabase is set up, deploy your frontend:

### Option A: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# From frontend folder
cd frontend
vercel
```

### Option B: Netlify

1. Push code to GitHub
2. Connect GitHub to Netlify
3. Netlify auto-deploys on every push

### Option C: Your Own Server

```bash
# Build frontend
npm run build

# Deploy the .next folder to your server
```

---

## Troubleshooting

### "Invalid credentials" error
- ✅ Copy/paste Project ID and Password again
- ✅ Check for extra spaces
- ✅ Reset password in Supabase Settings → Database

### "SQL script failed"
- ✅ Make sure you copied the ENTIRE SUPABASE_SETUP.sql
- ✅ Check no characters were left out
- ✅ Try running in smaller chunks

### "Connection timeout"
- ✅ Check internet connection
- ✅ Whitelist your IP: Settings → Database → Firewall
- ✅ Wait 5 minutes after creating project

### Tables not showing
- ✅ Refresh the dashboard (F5)
- ✅ Check SQL Editor for errors
- ✅ Verify script executed completely

---

## Next Steps

1. ✅ Set up Supabase (done!)
2. ✅ Configure Budget Manager (done!)
3. 📊 Start using the app
4. 🚀 Deploy to production
5. 📈 Monitor with Supabase Analytics

---

## Support

- **Supabase Docs:** https://supabase.com/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Status Page:** https://status.supabase.com
- **Community Discord:** https://discord.supabase.com

Happy budgeting! 💰
