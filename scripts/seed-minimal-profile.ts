import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMinimalProfile() {
  console.log('🌱 Creating minimal test profile...');

  try {
    // Create basic companies
    const techCorp = await prisma.company.upsert({
      where: { name: 'TechCorp Inc.' },
      update: {},
      create: { name: 'TechCorp Inc.', logo: '🏢' }
    });

    const stanford = await prisma.institution.upsert({
      where: { name: 'Stanford University' },
      update: {},
      create: { name: 'Stanford University', logo: '🎓' }
    });

    // Create a test user
    const user = await prisma.user.upsert({
      where: { email: 'sarah.test@example.com' },
      update: {},
      create: {
        email: 'sarah.test@example.com',
        clerkId: `test_${Date.now()}`,
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'INTERVIEWER'
      }
    });

    // Create user profile
    const profile = await prisma.userProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        currentTitle: 'Senior Data Scientist',
        location: 'San Francisco, CA',
        summary: 'Data scientist lead with over 6 years experience in both large enterprises and startups.',
        isPublic: true,
        profileSlug: 'sarahjohnson'
      }
    });

    // Create role fits
    await prisma.userRoleFit.deleteMany({ where: { userId: user.id } });
    await prisma.userRoleFit.createMany({
      data: [
        { userId: user.id, roleTitle: 'Data Science', fitLevel: 'VERY_HIGH', displayOrder: 1 },
        { userId: user.id, roleTitle: 'ML Engineer', fitLevel: 'HIGH', displayOrder: 2 },
        { userId: user.id, roleTitle: 'Data Engineer', fitLevel: 'HIGH', displayOrder: 3 }
      ]
    });

    // Create work experience
    await prisma.workExperience.deleteMany({ where: { userId: user.id } });
    await prisma.workExperience.create({
      data: {
        userId: user.id,
        companyId: techCorp.id,
        title: 'Senior Data Scientist',
        startDate: new Date('2022-01-15'),
        description: 'Led a team of 5 data scientists in developing machine learning models for customer behavior prediction.',
        tags: ['Python', 'TensorFlow', 'AWS'],
        displayOrder: 1
      }
    });

    // Create education
    await prisma.education.deleteMany({ where: { userId: user.id } });
    await prisma.education.create({
      data: {
        userId: user.id,
        institutionId: stanford.id,
        degree: 'Master of Science',
        fieldOfStudy: 'Data Science',
        startYear: 2016,
        endYear: 2018,
        description: 'Specialized in Machine Learning and Statistical Computing.',
        displayOrder: 1
      }
    });

    console.log('✅ Minimal profile created successfully!');
    console.log(`Profile URL: http://localhost:3005/profile/sarahjohnson`);
    console.log(`User ID: ${user.id}`);
    console.log(`Profile ID: ${profile.id}`);

  } catch (error) {
    console.error('❌ Error creating profile:', error);
    throw error;
  }
}

createMinimalProfile()
  .catch(console.error)
  .finally(() => prisma.$disconnect());