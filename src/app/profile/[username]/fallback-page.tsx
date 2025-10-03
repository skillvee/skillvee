// Fallback static profile page - used when database tables are not yet created
"use client";

import React from 'react';
import ProfileHeader from '~/components/profile/ProfileHeader';
import SkillsSection from '~/components/profile/SkillsSection';
import ExperienceSection from '~/components/profile/ExperienceSection';
import EducationSection from '~/components/profile/EducationSection';

const FallbackProfilePage = ({ username }: { username: string }) => {
  // Mock data for demonstration
  const candidateData = {
    name: username === 'sarahjohnson' ? "Sarah Johnson" : username.charAt(0).toUpperCase() + username.slice(1),
    title: "Data Scientist",
    location: "San Francisco, CA",
    yearsExperience: 6,
    yearsEducation: 6,
    university: "M.S. Stanford University",
    profileImage: "/api/placeholder/120/120",
    summary: "Data scientist lead with over 6 years experience in both large enterprises and startups. Specialized in machine learning, statistical analysis, and building scalable data solutions.",
    rolesFit: [
      { title: "Data Science", level: "Very High", color: "green" },
      { title: "ML Engineer", level: "High", color: "blue" },
      { title: "Data Engineer", level: "High", color: "blue" }
    ],
    skills: [
      // Coding & Programming (4 skills)
      { name: "Python", score: 92, category: "Coding & Programming" },
      { name: "SQL", score: 88, category: "Coding & Programming" },
      { name: "R", score: 85, category: "Coding & Programming" },
      { name: "JavaScript", score: 68, category: "Coding & Programming" },

      // Machine Learning & AI (5 skills)
      { name: "Machine Learning", score: 90, category: "Machine Learning & AI" },
      { name: "Deep Learning", score: 82, category: "Machine Learning & AI" },
      { name: "Feature Engineering", score: 89, category: "Machine Learning & AI" },
      { name: "Model Optimization", score: 87, category: "Machine Learning & AI" },
      { name: "Classical ML Algorithms", score: 91, category: "Machine Learning & AI" },

      // Statistics and Experimentation (5 skills)
      { name: "Statistics", score: 87, category: "Statistics and Experimentation" },
      { name: "Data Visualization", score: 90, category: "Statistics and Experimentation" },
      { name: "Hypothesis Testing", score: 86, category: "Statistics and Experimentation" },
      { name: "A/B Testing", score: 84, category: "Statistics and Experimentation" },
      { name: "Experimental Design", score: 83, category: "Statistics and Experimentation" },

      // Product & Business Sense (4 skills)
      { name: "Business Strategy", score: 78, category: "Product & Business Sense" },
      { name: "Product Analysis", score: 80, category: "Product & Business Sense" },
      { name: "User Analysis", score: 82, category: "Product & Business Sense" },
      { name: "User Experience", score: 79, category: "Product & Business Sense" },

      // System Design & Architecture (4 skills)
      { name: "Data Architecture", score: 85, category: "System Design & Architecture" },
      { name: "Data Pipeline Design", score: 88, category: "System Design & Architecture" },
      { name: "Scalability Design", score: 83, category: "System Design & Architecture" },
      { name: "Real-time Processing", score: 79, category: "System Design & Architecture" },

      // DevOps & Infrastructure (5 skills)
      { name: "AWS", score: 72, category: "DevOps & Infrastructure" },
      { name: "Docker", score: 78, category: "DevOps & Infrastructure" },
      { name: "Kubernetes", score: 58, category: "DevOps & Infrastructure" },
      { name: "MLOps Tools", score: 74, category: "DevOps & Infrastructure" },
      { name: "Cloud Platforms", score: 76, category: "DevOps & Infrastructure" },

      // Research & Innovation (3 skills)
      { name: "Research Methodology", score: 88, category: "Research & Innovation" },
      { name: "Literature Review", score: 91, category: "Research & Innovation" },
      { name: "Innovation", score: 87, category: "Research & Innovation" }
    ],
    experience: [
      {
        title: "Senior Data Scientist",
        company: "TechCorp Inc.",
        duration: "2022 - Present",
        description: "Led a team of 5 data scientists in developing machine learning models for customer behavior prediction, resulting in 23% increase in retention rates. Built scalable data pipelines processing 10M+ daily events.",
        skills: ["Python", "TensorFlow", "AWS", "Spark", "SQL"],
        logo: "/api/placeholder/40/40"
      },
      {
        title: "Data Scientist",
        company: "Analytics Solutions",
        duration: "2020 - 2022",
        description: "Developed predictive models for financial risk assessment, reducing false positives by 35%. Collaborated with cross-functional teams to implement A/B testing frameworks.",
        skills: ["R", "scikit-learn", "PostgreSQL", "Tableau", "Statistics"],
        logo: "/api/placeholder/40/40"
      },
      {
        title: "Junior Data Analyst",
        company: "StartupX",
        duration: "2018 - 2020",
        description: "Analyzed user engagement metrics and created automated reporting dashboards. Worked closely with product teams to optimize user acquisition strategies.",
        skills: ["Python", "Excel", "Google Analytics", "Data Visualization"],
        logo: "/api/placeholder/40/40"
      }
    ],
    education: [
      {
        degree: "Master of Science in Data Science",
        institution: "Stanford University",
        year: "2018",
        description: "Specialized in Machine Learning and Statistical Computing. Thesis on deep learning applications in natural language processing.",
        logo: "/api/placeholder/40/40"
      },
      {
        degree: "Bachelor of Science in Computer Science",
        institution: "UC Berkeley",
        year: "2016",
        description: "Minor in Mathematics. Graduated Magna Cum Laude with focus on algorithms and data structures.",
        logo: "/api/placeholder/40/40"
      }
    ]
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
        <div className="mt-4 text-center text-sm text-gray-500">
          Note: This is a demo profile. Database tables are being set up.
        </div>
      </div>
    </div>
  );
};

export default FallbackProfilePage;