import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting profile data seeding...');

  // 1. Create companies
  console.log('Creating companies...');
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { name: 'TechCorp Inc.' },
      update: {},
      create: {
        name: 'TechCorp Inc.',
        logo: '🏢'
      }
    }),
    prisma.company.upsert({
      where: { name: 'Analytics Solutions' },
      update: {},
      create: {
        name: 'Analytics Solutions',
        logo: '📊'
      }
    }),
    prisma.company.upsert({
      where: { name: 'StartupX' },
      update: {},
      create: {
        name: 'StartupX',
        logo: '🚀'
      }
    }),
    prisma.company.upsert({
      where: { name: 'Google' },
      update: {},
      create: {
        name: 'Google',
        logo: '🔍'
      }
    }),
    prisma.company.upsert({
      where: { name: 'Meta' },
      update: {},
      create: {
        name: 'Meta',
        logo: '📘'
      }
    }),
    prisma.company.upsert({
      where: { name: 'Amazon' },
      update: {},
      create: {
        name: 'Amazon',
        logo: '📦'
      }
    })
  ]);
  console.log(`✅ Created ${companies.length} companies`);

  // 2. Create institutions
  console.log('Creating institutions...');
  const institutions = await Promise.all([
    prisma.institution.upsert({
      where: { name: 'Stanford University' },
      update: {},
      create: {
        name: 'Stanford University',
        logo: '🎓'
      }
    }),
    prisma.institution.upsert({
      where: { name: 'UC Berkeley' },
      update: {},
      create: {
        name: 'UC Berkeley',
        logo: '🐻'
      }
    }),
    prisma.institution.upsert({
      where: { name: 'MIT' },
      update: {},
      create: {
        name: 'MIT',
        logo: '🏛️'
      }
    }),
    prisma.institution.upsert({
      where: { name: 'Harvard University' },
      update: {},
      create: {
        name: 'Harvard University',
        logo: '🍁'
      }
    }),
    prisma.institution.upsert({
      where: { name: 'Carnegie Mellon University' },
      update: {},
      create: {
        name: 'Carnegie Mellon University',
        logo: '🏫'
      }
    })
  ]);
  console.log(`✅ Created ${institutions.length} institutions`);

  // 3. Create/verify skill domains
  console.log('Creating skill domains...');
  const skillDomains = [
    { name: 'Coding & Programming', order: 1 },
    { name: 'Machine Learning & AI', order: 2 },
    { name: 'Statistics and Experimentation', order: 3 },
    { name: 'Product & Business Sense', order: 4 },
    { name: 'System Design & Architecture', order: 5 },
    { name: 'DevOps & Infrastructure', order: 6 },
    { name: 'Research & Innovation', order: 7 }
  ];

  for (const domain of skillDomains) {
    await prisma.skillDomain.upsert({
      where: { name: domain.name },
      update: { order: domain.order },
      create: domain
    });
  }
  console.log(`✅ Created/verified ${skillDomains.length} skill domains`);

  // 4. Create/verify skills
  console.log('Creating skills...');
  const skillsToCreate = [
    // Coding & Programming
    { domain: 'Coding & Programming', skills: ['Python', 'SQL', 'R', 'JavaScript'] },
    // Machine Learning & AI
    { domain: 'Machine Learning & AI', skills: ['Machine Learning', 'Deep Learning', 'Feature Engineering', 'Model Optimization', 'Classical ML Algorithms'] },
    // Statistics and Experimentation
    { domain: 'Statistics and Experimentation', skills: ['Statistics', 'Data Visualization', 'Hypothesis Testing', 'A/B Testing', 'Experimental Design'] },
    // Product & Business Sense
    { domain: 'Product & Business Sense', skills: ['Business Strategy', 'Product Analysis', 'User Analysis', 'User Experience'] },
    // System Design & Architecture
    { domain: 'System Design & Architecture', skills: ['Data Architecture', 'Data Pipeline Design', 'Scalability Design', 'Real-time Processing'] },
    // DevOps & Infrastructure
    { domain: 'DevOps & Infrastructure', skills: ['AWS', 'Docker', 'Kubernetes', 'MLOps Tools', 'Cloud Platforms'] },
    // Research & Innovation
    { domain: 'Research & Innovation', skills: ['Research Methodology', 'Literature Review', 'Innovation'] }
  ];

  let totalSkillsCreated = 0;
  for (const domainSkills of skillsToCreate) {
    const domain = await prisma.skillDomain.findUnique({
      where: { name: domainSkills.domain }
    });

    if (!domain) {
      console.error(`Domain not found: ${domainSkills.domain}`);
      continue;
    }

    for (const skillName of domainSkills.skills) {
      await prisma.skill.upsert({
        where: {
          domainId_name: {
            domainId: domain.id,
            name: skillName
          }
        },
        update: {},
        create: {
          name: skillName,
          domainId: domain.id
        }
      });
      totalSkillsCreated++;
    }
  }
  console.log(`✅ Created/verified ${totalSkillsCreated} skills`);

  // 5. Create a sample user profile (if user exists)
  console.log('Creating sample user profile...');

  // First, find or create a test user
  const testEmail = 'sarah.johnson@example.com';
  let user = await prisma.user.findUnique({
    where: { email: testEmail }
  });

  if (!user) {
    console.log('Creating test user...');
    user = await prisma.user.create({
      data: {
        email: testEmail,
        clerkId: `test_${Date.now()}`, // Temporary test ID
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'INTERVIEWER'
      }
    });
  }

  // Create UserProfile
  const userProfile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currentTitle: 'Senior Data Scientist',
      location: 'San Francisco, CA',
      summary: 'Data scientist lead with over 6 years experience in both large enterprises and startups. Specialized in machine learning, statistical analysis, and building scalable data solutions.',
      isPublic: true,
      profileSlug: 'sarahjohnson'
    }
  });
  console.log('✅ Created user profile');

  // Create UserRoleFits
  await prisma.userRoleFit.deleteMany({ where: { userId: user.id } }); // Clear existing
  const roleFits = await Promise.all([
    prisma.userRoleFit.create({
      data: {
        userId: user.id,
        roleTitle: 'Data Science',
        fitLevel: 'VERY_HIGH',
        displayOrder: 1
      }
    }),
    prisma.userRoleFit.create({
      data: {
        userId: user.id,
        roleTitle: 'ML Engineer',
        fitLevel: 'HIGH',
        displayOrder: 2
      }
    }),
    prisma.userRoleFit.create({
      data: {
        userId: user.id,
        roleTitle: 'Data Engineer',
        fitLevel: 'HIGH',
        displayOrder: 3
      }
    })
  ]);
  console.log('✅ Created role fits');

  // Create ProfileSkillScores
  console.log('Creating skill scores...');
  const skillScores = [
    // Coding & Programming
    { skill: 'Python', score: 92 },
    { skill: 'SQL', score: 88 },
    { skill: 'R', score: 85 },
    { skill: 'JavaScript', score: 68 },
    // Machine Learning & AI
    { skill: 'Machine Learning', score: 90 },
    { skill: 'Deep Learning', score: 82 },
    { skill: 'Feature Engineering', score: 89 },
    { skill: 'Model Optimization', score: 87 },
    { skill: 'Classical ML Algorithms', score: 91 },
    // Statistics and Experimentation
    { skill: 'Statistics', score: 87 },
    { skill: 'Data Visualization', score: 90 },
    { skill: 'Hypothesis Testing', score: 86 },
    { skill: 'A/B Testing', score: 84 },
    { skill: 'Experimental Design', score: 83 },
    // Product & Business Sense
    { skill: 'Business Strategy', score: 78 },
    { skill: 'Product Analysis', score: 80 },
    { skill: 'User Analysis', score: 82 },
    { skill: 'User Experience', score: 79 },
    // System Design & Architecture
    { skill: 'Data Architecture', score: 85 },
    { skill: 'Data Pipeline Design', score: 88 },
    { skill: 'Scalability Design', score: 83 },
    { skill: 'Real-time Processing', score: 79 },
    // DevOps & Infrastructure
    { skill: 'AWS', score: 72 },
    { skill: 'Docker', score: 78 },
    { skill: 'Kubernetes', score: 58 },
    { skill: 'MLOps Tools', score: 74 },
    { skill: 'Cloud Platforms', score: 76 },
    // Research & Innovation
    { skill: 'Research Methodology', score: 88 },
    { skill: 'Literature Review', score: 91 },
    { skill: 'Innovation', score: 87 }
  ];

  // Clear existing skill scores
  await prisma.profileSkillScore.deleteMany({ where: { userId: user.id } });

  for (const scoreData of skillScores) {
    const skill = await prisma.skill.findFirst({
      where: { name: scoreData.skill }
    });

    if (skill) {
      await prisma.profileSkillScore.create({
        data: {
          userId: user.id,
          skillId: skill.id,
          score: scoreData.score
        }
      });
    }
  }
  console.log('✅ Created skill scores');

  // Create Work Experience
  console.log('Creating work experience...');
  await prisma.workExperience.deleteMany({ where: { userId: user.id } }); // Clear existing

  const techCorp = companies.find(c => c.name === 'TechCorp Inc.')!;
  const analyticsSolutions = companies.find(c => c.name === 'Analytics Solutions')!;
  const startupX = companies.find(c => c.name === 'StartupX')!;

  await Promise.all([
    prisma.workExperience.create({
      data: {
        userId: user.id,
        companyId: techCorp.id,
        title: 'Senior Data Scientist',
        startDate: new Date('2022-01-15'),
        endDate: null,
        description: 'Led a team of 5 data scientists in developing machine learning models for customer behavior prediction, resulting in 23% increase in retention rates. Built scalable data pipelines processing 10M+ daily events.',
        tags: ['Python', 'TensorFlow', 'AWS', 'Spark', 'SQL'],
        displayOrder: 1
      }
    }),
    prisma.workExperience.create({
      data: {
        userId: user.id,
        companyId: analyticsSolutions.id,
        title: 'Data Scientist',
        startDate: new Date('2020-03-01'),
        endDate: new Date('2021-12-31'),
        description: 'Developed predictive models for financial risk assessment, reducing false positives by 35%. Collaborated with cross-functional teams to implement A/B testing frameworks.',
        tags: ['R', 'scikit-learn', 'PostgreSQL', 'Tableau', 'Statistics'],
        displayOrder: 2
      }
    }),
    prisma.workExperience.create({
      data: {
        userId: user.id,
        companyId: startupX.id,
        title: 'Junior Data Analyst',
        startDate: new Date('2018-06-01'),
        endDate: new Date('2020-02-28'),
        description: 'Analyzed user engagement metrics and created automated reporting dashboards. Worked closely with product teams to optimize user acquisition strategies.',
        tags: ['Python', 'Excel', 'Google Analytics', 'Data Visualization'],
        displayOrder: 3
      }
    })
  ]);
  console.log('✅ Created work experience');

  // Create Education
  console.log('Creating education...');
  await prisma.education.deleteMany({ where: { userId: user.id } }); // Clear existing

  const stanford = institutions.find(i => i.name === 'Stanford University')!;
  const berkeley = institutions.find(i => i.name === 'UC Berkeley')!;

  await Promise.all([
    prisma.education.create({
      data: {
        userId: user.id,
        institutionId: stanford.id,
        degree: 'Master of Science',
        fieldOfStudy: 'Data Science',
        startYear: 2016,
        endYear: 2018,
        description: 'Specialized in Machine Learning and Statistical Computing. Thesis on deep learning applications in natural language processing.',
        displayOrder: 1
      }
    }),
    prisma.education.create({
      data: {
        userId: user.id,
        institutionId: berkeley.id,
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2012,
        endYear: 2016,
        description: 'Minor in Mathematics. Graduated Magna Cum Laude with focus on algorithms and data structures.',
        displayOrder: 2
      }
    })
  ]);
  console.log('✅ Created education');

  console.log('🎉 Profile data seeding completed successfully!');
  console.log(`\nYou can now visit: http://localhost:3000/profile/sarahjohnson`);
}

main()
  .catch((e) => {
    console.error('Error seeding profile data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });