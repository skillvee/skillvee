import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSkillsDisplay() {
  console.log('🧪 Testing Skills Display Data...');

  const user = await prisma.user.findFirst({
    where: { email: 'sarah.test@example.com' }
  });

  if (!user) {
    console.log('❌ User not found');
    return;
  }

  const skillScores = await prisma.profileSkillScore.findMany({
    where: { userId: user.id },
    include: {
      skill: {
        include: { domain: true }
      }
    }
  });

  // Simulate the transformation that happens in the profile page
  const skills = skillScores.map(skill => ({
    name: skill.skill.name,
    score: skill.score,
    category: skill.skill.domain.name
  }));

  console.log('\n📊 Transformed Skills Data:');
  console.log('='.repeat(50));
  skills.forEach(skill => {
    console.log(`${skill.name.padEnd(30)} | ${skill.category.padEnd(25)} | Score: ${skill.score}`);
  });

  // Group by category like the component does
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, any[]>);

  console.log('\n🎯 Grouped by Category:');
  console.log('='.repeat(50));
  Object.entries(skillsByCategory).forEach(([category, categorySkills]) => {
    console.log(`\n📂 ${category}:`);
    categorySkills.forEach(skill => {
      const stars = Math.round((skill.score / 100) * 5);
      const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
      console.log(`  • ${skill.name.padEnd(25)} | ${skill.score}/100 | ${starDisplay}`);
    });
  });

  await prisma.$disconnect();
}

testSkillsDisplay().catch(console.error);