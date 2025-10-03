const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateAssessmentSkillScores() {
  try {
    console.log('Starting migration of AssessmentSkillScore table...');

    // First, get all existing assessment skill scores
    const existingScores = await prisma.assessmentSkillScore.findMany({
      select: {
        id: true,
        skillName: true,
        categoryName: true
      }
    });

    console.log(`Found ${existingScores.length} existing skill scores to migrate`);

    // Get all skills with their domains for mapping
    const skills = await prisma.skill.findMany({
      include: {
        domain: true
      }
    });

    // Create mapping from skill name to skill ID
    const skillNameToId = new Map();
    skills.forEach(skill => {
      skillNameToId.set(skill.name, skill.id);
      // Also try variations for common name differences
      skillNameToId.set(skill.name.toLowerCase(), skill.id);
      skillNameToId.set(skill.name.replace(/&/g, 'and'), skill.id);
    });

    console.log('Available skills:');
    skills.forEach(skill => {
      console.log(`  - ${skill.name} (Domain: ${skill.domain.name}) -> ${skill.id}`);
    });

    // Prepare updates
    const updates = [];
    const unmappedSkills = [];

    for (const score of existingScores) {
      const skillId = skillNameToId.get(score.skillName) ||
                     skillNameToId.get(score.skillName.toLowerCase()) ||
                     skillNameToId.get(score.skillName.replace(/&/g, 'and'));

      if (skillId) {
        updates.push({
          id: score.id,
          skillId: skillId
        });
      } else {
        unmappedSkills.push(score.skillName);
      }
    }

    console.log(`\nMapped ${updates.length} skills successfully`);
    if (unmappedSkills.length > 0) {
      console.log(`WARNING: Could not map ${unmappedSkills.length} skills:`);
      unmappedSkills.forEach(skill => console.log(`  - ${skill}`));
    }

    console.log('\nThis migration will:');
    console.log('1. Add skillId field to AssessmentSkillScore table');
    console.log('2. Remove isFocusArea and categoryIcon fields');
    console.log('3. Remove categoryName and skillName fields (replaced by skillId relation)');
    console.log('4. Add proper foreign key constraint to skills table');
    console.log('\nContinue? (y/N)');

    // For automation, we'll proceed directly
    console.log('Proceeding with migration...');

    return {
      updates,
      unmappedSkills,
      totalScores: existingScores.length
    };

  } catch (error) {
    console.error('Migration preparation failed:', error);
    throw error;
  }
}

async function main() {
  try {
    const result = await migrateAssessmentSkillScores();
    console.log('\nMigration preparation completed successfully');
    console.log(`Ready to migrate ${result.updates.length} records`);
    if (result.unmappedSkills.length > 0) {
      console.log(`${result.unmappedSkills.length} skills could not be mapped and will need manual review`);
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateAssessmentSkillScores };