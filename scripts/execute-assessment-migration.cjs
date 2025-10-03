const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function executeAssessmentMigration() {
  try {
    console.log('Starting database migration for AssessmentSkillScore table...');

    // Step 1: Get all existing assessment skill scores with their data
    const existingScores = await prisma.$queryRaw`
      SELECT id, "skillName", "categoryName", "assessmentId", "skillScore", "categoryOrder", "skillOrder", "createdAt"
      FROM "AssessmentSkillScore"
    `;

    console.log(`Found ${existingScores.length} existing records to migrate`);

    // Step 2: Get all skills for mapping
    const skills = await prisma.skill.findMany({
      select: {
        id: true,
        name: true
      }
    });

    // Create mapping from skill name to skill ID
    const skillNameToId = new Map();
    skills.forEach(skill => {
      skillNameToId.set(skill.name, skill.id);
      skillNameToId.set(skill.name.toLowerCase(), skill.id);
      skillNameToId.set(skill.name.replace(/&/g, 'and'), skill.id);
    });

    // Step 3: Add skillId column to existing table
    console.log('Step 1: Adding skillId column...');
    await prisma.$executeRaw`ALTER TABLE "AssessmentSkillScore" ADD COLUMN IF NOT EXISTS "skillId" TEXT`;

    // Step 4: Populate skillId values
    console.log('Step 2: Populating skillId values...');
    let updatedCount = 0;
    for (const score of existingScores) {
      const skillId = skillNameToId.get(score.skillName) ||
                     skillNameToId.get(score.skillName.toLowerCase()) ||
                     skillNameToId.get(score.skillName.replace(/&/g, 'and'));

      if (skillId) {
        await prisma.$executeRaw`
          UPDATE "AssessmentSkillScore"
          SET "skillId" = ${skillId}
          WHERE id = ${score.id}
        `;
        updatedCount++;
      } else {
        console.warn(`Could not find skillId for skill: ${score.skillName}`);
      }
    }

    console.log(`Updated ${updatedCount} records with skillId`);

    // Step 5: Remove unnecessary columns
    console.log('Step 3: Removing unnecessary columns...');
    await prisma.$executeRaw`ALTER TABLE "AssessmentSkillScore" DROP COLUMN IF EXISTS "isFocusArea"`;
    await prisma.$executeRaw`ALTER TABLE "AssessmentSkillScore" DROP COLUMN IF EXISTS "categoryIcon"`;
    await prisma.$executeRaw`ALTER TABLE "AssessmentSkillScore" DROP COLUMN IF EXISTS "categoryName"`;
    await prisma.$executeRaw`ALTER TABLE "AssessmentSkillScore" DROP COLUMN IF EXISTS "skillName"`;

    // Step 6: Add foreign key constraint
    console.log('Step 4: Adding foreign key constraint...');
    await prisma.$executeRaw`
      ALTER TABLE "AssessmentSkillScore"
      ADD CONSTRAINT "AssessmentSkillScore_skillId_fkey"
      FOREIGN KEY ("skillId") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE
    `;

    // Step 7: Add unique constraint
    console.log('Step 5: Adding unique constraint...');
    await prisma.$executeRaw`
      ALTER TABLE "AssessmentSkillScore"
      ADD CONSTRAINT "AssessmentSkillScore_assessmentId_skillId_key"
      UNIQUE ("assessmentId", "skillId")
    `;

    // Step 8: Add indexes
    console.log('Step 6: Adding indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "AssessmentSkillScore_skillId_idx" ON "AssessmentSkillScore"("skillId")`;

    console.log('Migration completed successfully!');

    // Verify the migration
    const finalCount = await prisma.assessmentSkillScore.count();
    console.log(`Final record count: ${finalCount}`);

    // Test a query to make sure relations work
    const testRecord = await prisma.assessmentSkillScore.findFirst({
      include: {
        skill: {
          include: {
            domain: true
          }
        }
      }
    });

    if (testRecord) {
      console.log(`Test query successful - skill: ${testRecord.skill.name} (domain: ${testRecord.skill.domain.name})`);
    }

  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

async function main() {
  try {
    await executeAssessmentMigration();
    console.log('\n✅ Database migration completed successfully');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { executeAssessmentMigration };