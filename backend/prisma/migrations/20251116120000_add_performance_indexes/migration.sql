-- ============================================================
-- PERFORMANCE OPTIMIZATION: Add Database Indexes
-- ============================================================
-- These indexes optimize common query patterns in the Budget Manager
-- Expected improvements: 30-50% faster queries, especially for filtering and sorting

-- Expenses Table Indexes
CREATE INDEX "idx_expenses_category_id" ON "expenses"("category_id");
CREATE INDEX "idx_expenses_provision_id" ON "expenses"("provision_id");
CREATE INDEX "idx_expenses_date" ON "expenses"("date");
CREATE INDEX "idx_expenses_category_date" ON "expenses"("category_id", "date");

-- Provisions Table Indexes
CREATE INDEX "idx_provisions_category_id" ON "provisions"("category_id");
CREATE INDEX "idx_provisions_status" ON "provisions"("status");
CREATE INDEX "idx_provisions_category_status" ON "provisions"("category_id", "status");
CREATE INDEX "idx_provisions_due_date" ON "provisions"("due_date");

-- Categories Table Indexes
CREATE INDEX "idx_categories_period" ON "categories"("period");
