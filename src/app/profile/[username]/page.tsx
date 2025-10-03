import { notFound } from 'next/navigation';
import ProfileHeader from '~/components/profile/ProfileHeader';
import SkillsSection from '~/components/profile/SkillsSection';
import ExperienceSection from '~/components/profile/ExperienceSection';
import EducationSection from '~/components/profile/EducationSection';
import FallbackProfilePage from './fallback-page';
import { api } from '~/trpc/server';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  try {
    // Fetch profile data from database
    const profileData = await api.profile.getByUsername({ username });

    if (!profileData) {
      notFound();
    }

    // Transform data to match component expectations
    const candidateData = {
      name: `${profileData.profile.user.firstName || ''} ${profileData.profile.user.lastName || ''}`.trim() || 'Anonymous',
      title: profileData.profile.currentTitle || 'Professional',
      location: profileData.profile.location || 'Location not specified',
      yearsExperience: profileData.yearsExperience,
      yearsEducation: profileData.educations.length > 0
        ? new Date().getFullYear() - (profileData.educations[profileData.educations.length - 1]?.startYear || new Date().getFullYear())
        : 0,
      university: profileData.educationSummary || undefined,
      profileImage: profileData.profile.user.profileImage || "/api/placeholder/120/120",
      summary: profileData.profile.summary || '',
      rolesFit: profileData.roleFits.map(fit => ({
        title: fit.roleTitle,
        level: fit.fitLevel.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
        color: fit.fitLevel === 'VERY_HIGH' ? 'green' : 'blue'
      })),
      skills: profileData.skillScores.map(skill => ({
        name: skill.skillName,
        score: skill.score,
        category: skill.category
      })),
      experience: profileData.workExperiences.map(exp => {
        const startYear = new Date(exp.startDate).getFullYear();
        const endYear = exp.endDate ? new Date(exp.endDate).getFullYear() : 'Present';
        return {
          title: exp.title,
          company: exp.company.name,
          duration: `${startYear} - ${endYear}`,
          description: exp.description,
          skills: exp.tags,
          logo: exp.company.logo || "/api/placeholder/40/40"
        };
      }),
      education: profileData.educations.map(edu => ({
        degree: `${edu.degree} in ${edu.fieldOfStudy}`,
        institution: edu.institution.name,
        year: edu.endYear?.toString() || 'Ongoing',
        description: edu.description || '',
        logo: edu.institution.logo || "/api/placeholder/40/40"
      }))
    };

    return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <ProfileHeader candidateData={candidateData} />
          <SkillsSection skills={candidateData.skills} />
          <ExperienceSection experiences={candidateData.experience} />
          <EducationSection education={candidateData.education} />
        </div>
      </div>
    </div>
    );
  } catch (error: any) {
    console.error('Error fetching profile:', error);

    // If the error is due to missing tables, show fallback
    if (error?.message?.includes('does not exist') || error?.code === 'P2021') {
      return <FallbackProfilePage username={username} />;
    }

    notFound();
  }
}