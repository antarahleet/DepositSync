const { PrismaClient } = require('@prisma/client');

async function setupDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Connecting to Turso database...');
    
    // Test the connection
    await prisma.$connect();
    console.log('✅ Connected to Turso database');
    
    // Create the table manually
    console.log('Creating checks table...');
    await prisma.$executeRaw`
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
      )
    `;
    
    console.log('✅ Checks table created successfully');
    
    // Create index
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "Check_created_at_idx" ON "Check"("created_at")
    `;
    
    console.log('✅ Index created successfully');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase(); 