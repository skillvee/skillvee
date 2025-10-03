import React from 'react';
import { Building2 } from 'lucide-react';

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills: string[];
  logo: string;
}

interface ExperienceSectionProps {
  experiences: Experience[];
}

// Fallback logo if none provided
const getCompanyLogo = (logo: string | null) => {
  return logo || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=40&h=40&fit=crop&crop=center&auto=format&q=60';
};

const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  return (
    <div className="px-12 py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-8">Work Experience</h2>

      <div className="relative">
        {/* Timeline line - hidden on mobile */}
        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Experience Items */}
        <div className="space-y-8">
          {experiences.map((exp, index) => {
            const logoUrl = getCompanyLogo(exp.logo);

            return (
              <div key={index} className="relative flex gap-6">
                {/* Logo/Timeline Dot */}
                <div className="flex-shrink-0 z-10">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200 overflow-hidden">
                    <img
                      src={logoUrl}
                      alt={`${exp.company} logo`}
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{exp.title}</h3>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{exp.company}</span>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 mt-1 sm:mt-0">{exp.duration}</span>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {exp.description}
                  </p>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2">
                    {exp.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ExperienceSection;