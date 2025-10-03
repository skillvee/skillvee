import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateLogos() {
  console.log('🔧 Updating company and institution logos to use image URLs...');

  try {
    // Update company logos with real image URLs
    const companyUpdates = [
      {
        name: 'TechCorp Inc.',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=40&h=40&fit=crop&crop=center&auto=format&q=60'
      },
      {
        name: 'Google',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg'
      },
      {
        name: 'Meta',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/40px-Meta_Platforms_Inc._logo.svg.png'
      },
      {
        name: 'Amazon',
        logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-plain-wordmark.svg'
      },
      {
        name: 'Analytics Solutions',
        logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=40&h=40&fit=crop&crop=center&auto=format&q=60'
      },
      {
        name: 'StartupX',
        logo: 'https://images.unsplash.com/photo-1634224147653-54c2d98aa1c5?w=40&h=40&fit=crop&crop=center&auto=format&q=60'
      }
    ];

    // Update institution logos with real image URLs
    const institutionUpdates = [
      {
        name: 'Stanford University',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Stanford_University.svg/40px-Seal_of_Stanford_University.svg.png'
      },
      {
        name: 'UC Berkeley',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/University_of_California%2C_Berkeley_logo.svg/40px-University_of_California%2C_Berkeley_logo.svg.png'
      },
      {
        name: 'MIT',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/MIT_Seal.svg/40px-MIT_Seal.svg.png'
      },
      {
        name: 'Harvard University',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/40px-Harvard_University_coat_of_arms.svg.png'
      },
      {
        name: 'Carnegie Mellon University',
        logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Carnegie_Mellon_University_seal.svg/40px-Carnegie_Mellon_University_seal.svg.png'
      }
    ];

    console.log('Updating company logos...');
    for (const company of companyUpdates) {
      await prisma.company.updateMany({
        where: { name: company.name },
        data: { logo: company.logo }
      });
      console.log(`✅ Updated ${company.name}`);
    }

    console.log('\\nUpdating institution logos...');
    for (const institution of institutionUpdates) {
      await prisma.institution.updateMany({
        where: { name: institution.name },
        data: { logo: institution.logo }
      });
      console.log(`✅ Updated ${institution.name}`);
    }

    console.log('\\n🎉 All logos updated successfully!');

    // Verify the updates
    console.log('\\nVerifying updates...');
    const companies = await prisma.company.findMany({ select: { name: true, logo: true } });
    const institutions = await prisma.institution.findMany({ select: { name: true, logo: true } });

    console.log('\\nUpdated Company Logos:');
    companies.forEach(c => console.log(`- ${c.name}: ${c.logo?.substring(0, 50)}...`));

    console.log('\\nUpdated Institution Logos:');
    institutions.forEach(i => console.log(`- ${i.name}: ${i.logo?.substring(0, 50)}...`));

  } catch (error) {
    console.error('❌ Error updating logos:', error);
    throw error;
  }
}

updateLogos()
  .catch(console.error)
  .finally(() => prisma.$disconnect());