-- DropIndex
DROP INDEX "categories_name_period_key";

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "user_id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "provisions" ADD COLUMN     "used_amount" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "categories_period_idx" ON "categories"("period");

-- CreateIndex
CREATE INDEX "expenses_category_id_idx" ON "expenses"("category_id");

-- CreateIndex
CREATE INDEX "expenses_provision_id_idx" ON "expenses"("provision_id");

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");

-- CreateIndex
CREATE INDEX "expenses_category_id_date_idx" ON "expenses"("category_id", "date");

-- CreateIndex
CREATE INDEX "provisions_category_id_idx" ON "provisions"("category_id");

-- CreateIndex
CREATE INDEX "provisions_status_idx" ON "provisions"("status");

-- CreateIndex
CREATE INDEX "provisions_category_id_status_idx" ON "provisions"("category_id", "status");

-- CreateIndex
CREATE INDEX "provisions_due_date_idx" ON "provisions"("due_date");
