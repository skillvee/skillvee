import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTables() {
  console.log('🔧 Creating profile tables directly via Prisma...');

  try {
    // Create tables using raw SQL through Prisma
    console.log('Creating FitLevel enum...');
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "FitLevel" AS ENUM ('VERY_HIGH', 'HIGH', 'MEDIUM', 'LOW');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;

    console.log('Creating companies table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS companies (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT UNIQUE NOT NULL,
        logo TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Creating institutions table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS institutions (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        name TEXT UNIQUE NOT NULL,
        logo TEXT,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Creating user_profiles table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT UNIQUE NOT NULL REFERENCES users(id),
        "currentTitle" TEXT,
        location TEXT,
        summary TEXT,
        "linkedinUrl" TEXT,
        "githubUrl" TEXT,
        "portfolioUrl" TEXT,
        "isPublic" BOOLEAN DEFAULT FALSE NOT NULL,
        "profileSlug" TEXT UNIQUE,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Creating user_role_fits table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS user_role_fits (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        "roleTitle" TEXT NOT NULL,
        "fitLevel" "FitLevel" NOT NULL,
        "displayOrder" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Creating profile_skill_scores table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS profile_skill_scores (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        "skillId" TEXT NOT NULL REFERENCES skills(id),
        score INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        UNIQUE("userId", "skillId")
      );
    `;

    console.log('Creating work_experiences table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS work_experiences (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        "companyId" TEXT NOT NULL REFERENCES companies(id),
        title TEXT NOT NULL,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3),
        description TEXT NOT NULL,
        tags TEXT[] DEFAULT '{}',
        location TEXT,
        "displayOrder" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    console.log('Creating educations table...');
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS educations (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "userId" TEXT NOT NULL REFERENCES users(id),
        "institutionId" TEXT NOT NULL REFERENCES institutions(id),
        degree TEXT NOT NULL,
        "fieldOfStudy" TEXT NOT NULL,
        "startYear" INTEGER NOT NULL,
        "endYear" INTEGER,
        description TEXT,
        "displayOrder" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;

    // Create indexes
    console.log('Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS companies_name_idx ON companies(name);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS institutions_name_idx ON institutions(name);`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS user_profiles_profileSlug_idx ON user_profiles("profileSlug");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS user_role_fits_userId_displayOrder_idx ON user_role_fits("userId", "displayOrder");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS profile_skill_scores_userId_idx ON profile_skill_scores("userId");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS work_experiences_userId_displayOrder_idx ON work_experiences("userId", "displayOrder");`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS educations_userId_displayOrder_idx ON educations("userId", "displayOrder");`;

    console.log('✅ All profile tables created successfully!');

    // Test with a simple query
    const companies = await prisma.company.findMany();
    console.log(`📊 Companies table working - found ${companies.length} companies`);

  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

createTables()
  .catch((e) => {
    console.error('Failed to create tables:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });