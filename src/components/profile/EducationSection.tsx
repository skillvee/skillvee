import React from 'react';
import { GraduationCap } from 'lucide-react';

interface Education {
  degree: string;
  institution: string;
  year: string;
  description: string;
  logo: string;
}

interface EducationSectionProps {
  education: Education[];
}

// Fallback logo if none provided
const getInstitutionLogo = (logo: string | null) => {
  return logo || 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Generic_university_logo.svg/40px-Generic_university_logo.svg.png';
};

const EducationSection: React.FC<EducationSectionProps> = ({ education }) => {
  return (
    <div className="px-12 py-8 pb-12">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Education</h2>

      <div className="relative">
        {/* Timeline line - hidden on mobile */}
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Education Items */}
        <div className="space-y-8">
          {education.map((edu, index) => {
            const logoUrl = getInstitutionLogo(edu.logo);

            return (
              <div key={index} className="relative flex gap-6">
                {/* Logo/Timeline Dot */}
                <div className="flex-shrink-0 z-10">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={`${edu.institution} logo`}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <GraduationCap className="w-4 h-4" />
                        <span>{edu.institution}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 mt-1 sm:mt-0">{edu.year}</span>
                  </div>

                  {edu.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {edu.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EducationSection;