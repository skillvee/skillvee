import React from 'react';
import { MapPin, Briefcase, GraduationCap } from 'lucide-react';

interface ProfileHeaderProps {
  candidateData: {
    name: string;
    title: string;
    location: string;
    yearsExperience: number;
    yearsEducation: number;
    university?: string;
    profileImage?: string;
    summary: string;
    rolesFit?: { title: string; level: string; color: string }[];
  };
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ candidateData }) => {
  return (
    <div className="px-12 py-8">
      {/* Profile Section */}
      <div className="text-center mb-8">
        {/* Profile Image */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center mx-auto mb-4">
          <span className="text-white text-3xl font-bold">
            {candidateData.name.split(' ').map(n => n[0]).join('')}
          </span>
        </div>

        {/* Name */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{candidateData.name}</h1>

        {/* Info Pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 text-sm">
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
            <MapPin className="w-4 h-4" />
            <span>{candidateData.location}</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
            <Briefcase className="w-4 h-4" />
            <span>{candidateData.yearsExperience} years experience</span>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full">
            <GraduationCap className="w-4 h-4" />
            <span>{candidateData.university || `${candidateData.yearsEducation} years education`}</span>
          </div>
        </div>

        {/* Summary */}
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
          {candidateData.summary}
        </p>

        {/* Role Fits Section */}
        {candidateData.rolesFit && (
          <div className="bg-gray-100 rounded-lg p-6">
            <h3 className="text-base font-bold text-gray-900 mb-4">Top Role Fits</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {candidateData.rolesFit.map((role, index) => (
                <div key={index} className="flex items-center gap-3 bg-white border border-gray-300 px-5 py-3 rounded-lg">
                  <span className="text-xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="font-medium text-gray-900">{role.title}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                    role.level === 'Very High'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {role.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;