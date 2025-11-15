-- ============================================================
-- BUDGET MANAGER - SUPABASE SQL SETUP SCRIPT
-- ============================================================
-- This script creates all necessary tables and configurations
-- for Budget Manager in Supabase PostgreSQL database
--
-- Instructions:
-- 1. Go to https://supabase.com and create a new project
-- 2. Go to SQL Editor in your Supabase dashboard
-- 3. Create a new query and copy-paste this entire script
-- 4. Click "Run" to execute
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE provision_status AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE payment_method AS ENUM ('CASH', 'TRANSFER', 'CARD', 'OTHER');

-- ============================================================
-- TABLES
-- ============================================================

-- Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  period TEXT NOT NULL, -- Format: "2025-10" (YYYY-MM)
  monthly_budget DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint on name + period per user
  UNIQUE(name, period)
);

-- Provisions Table (Gastos Anticipados)
CREATE TABLE IF NOT EXISTS public.provisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL, -- Always negative
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status provision_status DEFAULT 'OPEN',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  provision_id UUID REFERENCES public.provisions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL, -- Always negative
  payment_method payment_method DEFAULT 'CASH',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES (for better performance)
-- ============================================================

CREATE INDEX idx_categories_period ON public.categories(period);
CREATE INDEX idx_categories_name ON public.categories(name);
CREATE INDEX idx_provisions_category_id ON public.provisions(category_id);
CREATE INDEX idx_provisions_status ON public.provisions(status);
CREATE INDEX idx_provisions_due_date ON public.provisions(due_date);
CREATE INDEX idx_expenses_category_id ON public.expenses(category_id);
CREATE INDEX idx_expenses_provision_id ON public.expenses(provision_id);
CREATE INDEX idx_expenses_date ON public.expenses(date);
CREATE INDEX idx_expenses_payment_method ON public.expenses(payment_method);

-- ============================================================
-- ROW LEVEL SECURITY (Optional - for multi-user support)
-- ============================================================
-- Uncomment the following if you want to enable RLS for multi-user setup

-- ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.provisions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TRIGGERS (for automatic updated_at)
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for categories
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for provisions
DROP TRIGGER IF EXISTS update_provisions_updated_at ON public.provisions;
CREATE TRIGGER update_provisions_updated_at
  BEFORE UPDATE ON public.provisions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for expenses
DROP TRIGGER IF EXISTS update_expenses_updated_at ON public.expenses;
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================================
-- Uncomment the following to insert sample data for testing

/*
INSERT INTO public.categories (name, period, monthly_budget, notes) VALUES
  ('Groceries', '2025-01', 500.00, 'Food and groceries for the month'),
  ('Transport', '2025-01', 200.00, 'Gas and public transport'),
  ('Utilities', '2025-01', 150.00, 'Water, electricity, internet');

INSERT INTO public.provisions (item, category_id, amount, due_date, status, notes) VALUES
  ('Monthly electricity bill',
   (SELECT id FROM public.categories WHERE name = 'Utilities' AND period = '2025-01'),
   -150.00,
   '2025-01-05',
   'OPEN',
   'Expected electricity expense');

INSERT INTO public.expenses (date, description, category_id, amount, payment_method) VALUES
  ('2025-01-03', 'Supermarket',
   (SELECT id FROM public.categories WHERE name = 'Groceries' AND period = '2025-01'),
   -50.00,
   'CARD'),
  ('2025-01-04', 'Gas station',
   (SELECT id FROM public.categories WHERE name = 'Transport' AND period = '2025-01'),
   -40.00,
   'CARD');
*/

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================
-- Run these to verify everything was created successfully

-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check enums
SELECT enumlabel FROM pg_enum;

-- Check indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================
-- NOTES
-- ============================================================
/*
1. All amounts (budget, expenses, provisions) are in DECIMAL(10, 2) format
   - monthly_budget: Always positive (budget allocation)
   - amount (provisions & expenses): Always negative (money going out)

2. The period field in categories uses "YYYY-MM" format (e.g., "2025-01")
   This allows grouping by month/year

3. Enums are used for:
   - ProvisionStatus: OPEN (not yet spent) or CLOSED (fully allocated)
   - PaymentMethod: CASH, TRANSFER, CARD, OTHER

4. All timestamps use "TIMESTAMP WITH TIME ZONE" for better timezone handling

5. Cascading deletes:
   - Deleting a category deletes all related provisions and expenses
   - Deleting a provision sets provision_id to NULL in expenses (not deleted)

6. Updated_at triggers automatically update the timestamp on any row modification

7. For production, consider enabling Row Level Security (RLS) for:
   - Multi-user support
   - Data isolation between users
   - Security at the database level

8. All tables are in the 'public' schema for Supabase compatibility
*/
