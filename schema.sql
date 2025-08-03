-- Create the checks table
CREATE TABLE IF NOT EXISTS "Check" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "check_number" TEXT,
  "date" DATETIME,
  "amount" REAL,
  "memo" TEXT,
  "payor" TEXT,
  "payee" TEXT,
  "image_url" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'needs_review',
  "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index on created_at for better performance
CREATE INDEX IF NOT EXISTS "Check_created_at_idx" ON "Check"("created_at"); 