-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to categories table
ALTER TABLE "categories" ADD COLUMN "user_id" TEXT NOT NULL DEFAULT gen_random_uuid();

-- Add foreign key constraint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Update unique constraint to include user_id
ALTER TABLE "categories" DROP CONSTRAINT IF EXISTS "categories_name_period_key";
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_name_period_key"
UNIQUE("user_id", "name", "period");

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS "categories_user_id_idx" ON "categories"("user_id");
