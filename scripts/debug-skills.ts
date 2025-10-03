import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSkills() {
  const user = await prisma.user.findFirst({
    where: { email: 'sarah.test@example.com' }
  });

  if (!user) {
    console.log('User not found');
    return;
  }

  const skillScores = await prisma.profileSkillScore.findMany({
    where: { userId: user.id },
    include: {
      skill: {
        include: { domain: true }
      }
    },
    orderBy: [{ skill: { domain: { name: 'asc' } } }, { score: 'desc' }]
  });

  console.log('🎯 Skills by Domain:');
  console.log('='.repeat(60));

  let currentDomain = '';
  skillScores.forEach(ss => {
    if (ss.skill.domain.name !== currentDomain) {
      currentDomain = ss.skill.domain.name;
      console.log(`\n📊 ${currentDomain}`);
      console.log('-'.repeat(40));
    }
    console.log(`  • ${ss.skill.name.padEnd(30)} | Score: ${ss.score}`);
  });

  // Check specifically Product & Business Sense
  const productSkills = skillScores.filter(ss => ss.skill.domain.name === 'Product & Business Sense');
  console.log(`\n🔍 Product & Business Sense Skills (${productSkills.length} total):`);
  productSkills.forEach(ss => {
    console.log(`  - ${ss.skill.name}: ${ss.score} (ID: ${ss.skillId})`);
  });

  await prisma.$disconnect();
}

debugSkills().catch(console.error);