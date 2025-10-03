import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedProfileSkills() {
  console.log('🎯 Adding sample profile skill scores...');

  try {
    // First, get the Sarah Johnson user
    const user = await prisma.user.findFirst({
      where: { email: 'sarah.test@example.com' }
    });

    if (!user) {
      console.error('❌ Sarah Johnson user not found. Run seed-minimal-profile.ts first.');
      return;
    }

    console.log(`Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);

    // Get some existing skills to map to
    const skills = await prisma.skill.findMany({
      include: { domain: true },
      take: 20
    });

    if (skills.length === 0) {
      console.error('❌ No skills found in database. Need to seed skills first.');
      return;
    }

    console.log(`Found ${skills.length} skills to assign scores to`);

    // Clear existing skill scores for this user
    await prisma.profileSkillScore.deleteMany({
      where: { userId: user.id }
    });

    // Create skill scores based on exact skill IDs from the database
    const skillScoreMappings = [
      // Coding & Programming skills (high scores)
      { skillId: 'cmfgw66vx000axvdsu68100n2', score: 92 }, // Python
      { skillId: 'cmfgw661c0002xvdsjmbjk6lb', score: 88 }, // SQL
      { skillId: 'cmfgw67q1000ixvdssuf5ha4g', score: 85 }, // R
      { skillId: 'cmg1gey2n000pwyazqqh5fstz', score: 83 }, // JavaScript

      // Machine Learning & AI (very high scores - her specialty)
      { skillId: 'cmg1geyz0000rwyazrjld2yb6', score: 95 }, // Machine Learning
      { skillId: 'cmfgw69ti000zxvdsfjd86hu6', score: 89 }, // Deep Learning
      { skillId: 'cmfgw68yv000rxvdszow9m3if', score: 92 }, // Classical ML algorithms
      { skillId: 'cmfgw6ank0017xvds9z9uam1v', score: 90 }, // Feature Engineering
      { skillId: 'cmfgw6bhu001fxvdsjk1wrfly', score: 87 }, // Model Optimization

      // Statistics and Experimentation (high scores)
      { skillId: 'cmg1gf26r0011wyaz9eeev0g2', score: 90 }, // Statistics
      { skillId: 'cmfgw6dkt001wxvdslc1tbg5x', score: 88 }, // Hypothesis Testing
      { skillId: 'cmfgw6cqq001oxvds4ipl17lb', score: 85 }, // Descriptive Statistics & Probability
      { skillId: 'cmfgw6eey0024xvdsywnwumvy', score: 87 }, // Experimental Design
      { skillId: 'cmg1gf2rp0013wyazzquyle5o', score: 89 }, // Data Visualization

      // Product & Business Sense (moderate to high scores)
      { skillId: 'cmfgw6hb9002txvds6pig99x3', score: 86 }, // A/B Testing
      { skillId: 'cmg1gf60d001dwyazt44ya49y', score: 82 }, // Product Analysis
      { skillId: 'cmfgw6ggt002lxvdsp8vqq0nr', score: 84 }, // Metric Definition
      { skillId: 'cmfgw6i550031xvdsxzgeulis', score: 81 }, // User Analysis
      { skillId: 'cmfgw6izj0039xvds0frkgcf7', score: 78 }, // Business Strategy

      // System Design & Architecture (moderate scores)
      { skillId: 'cmfgwcs1z000yxvilcdkyevyn', score: 81 }, // Data Pipeline Design
      { skillId: 'cmg1gf81j001jwyaztlfv1pu7', score: 79 }, // Data Architecture
      { skillId: 'cmfgwco1v000ixvil18528kte', score: 83 }, // ML System Design
      { skillId: 'cmfgwcq1u000qxvilintwyrxt', score: 76 }, // Real-time Processing

      // DevOps & Infrastructure (lower scores - not her main focus)
      { skillId: 'cmg1gfaph001rwyaz6e78wl4i', score: 75 }, // AWS
      { skillId: 'cmg1gfbak001twyazd9vhmwvs', score: 72 }, // Docker
      { skillId: 'cmg1gfbvo001vwyazoykbsa1p', score: 68 }, // Kubernetes
      { skillId: 'cmfgwcuki0017xvillq9sfrii', score: 70 }, // CI/CD Pipelines
      { skillId: 'cmfgwd2n20023xvilaszzxo4m', score: 74 }, // MLOps Tools

      // Research & Innovation (high scores)
      { skillId: 'cmfgwd968002sxvilzuso95ar', score: 91 }, // Research Methodology
      { skillId: 'cmfgwd55e002cxvilp21e0wrx', score: 89 }, // Literature Review
      { skillId: 'cmfgwdb8u0030xvilebczd1ne', score: 86 }, // Publication & Communication
      { skillId: 'cmfgwd75x002kxvileq6fk4b4', score: 84 }, // Novel Method Development
    ];

    const profileSkillsToCreate = [];

    for (const mapping of skillScoreMappings) {
      // Find the skill to get its name for logging
      const skill = skills.find(s => s.id === mapping.skillId);

      if (skill) {
        profileSkillsToCreate.push({
          userId: user.id,
          skillId: mapping.skillId,
          score: mapping.score
        });
        console.log(`✓ Adding "${skill.name}" (${mapping.score}) from domain "${skill.domain.name}"`);
      } else {
        console.log(`⚠ Skill ID ${mapping.skillId} not found in database`);
      }
    }

    if (profileSkillsToCreate.length > 0) {
      await prisma.profileSkillScore.createMany({
        data: profileSkillsToCreate
      });

      console.log(`\n✅ Created ${profileSkillsToCreate.length} profile skill scores!`);
    } else {
      console.log('\n❌ No skill scores were created. Check skill mapping.');
    }

    // Verify the results
    const createdScores = await prisma.profileSkillScore.findMany({
      where: { userId: user.id },
      include: {
        skill: {
          include: { domain: true }
        }
      },
      orderBy: { score: 'desc' }
    });

    console.log(`\n📊 Profile Skills Summary for ${user.firstName} ${user.lastName}:`);
    console.log('─'.repeat(70));
    createdScores.forEach(score => {
      console.log(`${score.skill.name.padEnd(25)} | ${score.skill.domain.name.padEnd(20)} | ${score.score}/100`);
    });

    console.log(`\n🎯 Profile URL: http://localhost:3005/profile/sarahjohnson`);

  } catch (error) {
    console.error('❌ Error seeding profile skills:', error);
    throw error;
  }
}

seedProfileSkills()
  .catch(console.error)
  .finally(() => prisma.$disconnect());