"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Code, Brain, BarChart, Target, Database, Cloud, Search } from 'lucide-react';

interface Skill {
  name: string;
  score: number;
  category: string;
}

interface SkillsSectionProps {
  skills: Skill[];
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category]!.push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  // Define categories with metadata
  const categories = [
    { name: "Coding & Programming", icon: Code, color: "blue" },
    { name: "Machine Learning & AI", icon: Brain, color: "purple" },
    { name: "Statistics and Experimentation", icon: BarChart, color: "green" },
    { name: "Product & Business Sense", icon: Target, color: "orange" },
    { name: "System Design & Architecture", icon: Database, color: "red" },
    { name: "DevOps & Infrastructure", icon: Cloud, color: "indigo" },
    { name: "Research & Innovation", icon: Search, color: "pink" }
  ].filter(cat => skillsByCategory[cat.name]);

  const handlePrevious = () => {
    setCurrentCategoryIndex((prev) => (prev - 1 + categories.length) % categories.length);
  };

  const handleNext = () => {
    setCurrentCategoryIndex((prev) => (prev + 1) % categories.length);
  };

  // Get visible categories (3 at a time on desktop, 1 on mobile)
  const getVisibleCategories = () => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentCategoryIndex + i) % categories.length;
      result.push(categories[index]);
    }
    return result;
  };

  const visibleCategories = getVisibleCategories();

  // Helper function to get stars display
  const getStarsDisplay = (score: number) => {
    const stars = Math.round((score / 100) * 5);
    return '★'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  // Helper function to get color classes for borders and backgrounds
  const getCategoryColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-l-4 border-l-blue-500',
      purple: 'border-l-4 border-l-purple-500',
      green: 'border-l-4 border-l-green-500',
      orange: 'border-l-4 border-l-orange-500',
      red: 'border-l-4 border-l-red-500',
      indigo: 'border-l-4 border-l-indigo-500',
      pink: 'border-l-4 border-l-pink-500'
    };
    return colorMap[color as keyof typeof colorMap] || 'border-l-4 border-l-gray-500';
  };

  const getSkillStyles = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 border border-blue-200',
      purple: 'bg-purple-100 border border-purple-200',
      green: 'bg-green-100 border border-green-200',
      orange: 'bg-orange-100 border border-orange-200',
      red: 'bg-red-100 border border-red-200',
      indigo: 'bg-indigo-100 border border-indigo-200',
      pink: 'bg-pink-100 border border-pink-200'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 border border-gray-200';
  };

  const getIconColor = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600',
      pink: 'text-pink-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const getStarColor = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      green: 'text-green-600',
      orange: 'text-orange-600 font-bold',
      red: 'text-red-600',
      indigo: 'text-indigo-600',
      pink: 'text-pink-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  return (
    <div className="px-12 py-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Skills</h2>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 z-10 p-1.5 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
          aria-label="Previous category"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 z-10 p-1.5 bg-white rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
          aria-label="Next category"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleCategories.map((category) => {
            if (!category) return null;
            const categorySkills = skillsByCategory[category.name] || [];
            const Icon = category.icon;

            return (
              <div
                key={category.name}
                className={`border ${getCategoryColorClasses(category.color)} border-gray-200 rounded-lg bg-white`}
              >
                {/* Category Header */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${getIconColor(category.color)}`} />
                    <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                  </div>
                </div>

                {/* Skills List */}
                <div className="p-4 space-y-2">
                  {categorySkills.map((skill) => (
                    <div
                      key={skill.name}
                      className={`${getSkillStyles(category.color)} rounded-full px-3 py-2`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-800">{skill.name}</span>
                        <span className={`text-xs ${getStarColor(category.color)}`}>
                          {getStarsDisplay(skill.score)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SkillsSection;