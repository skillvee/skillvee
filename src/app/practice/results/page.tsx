"use client";

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { 
  Briefcase, 
  Building, 
  Users, 
  Calendar,
  Play,
  BookOpen,
  CheckCircle2,
  Code,
  Brain,
  BarChart3,
  Target
} from "lucide-react";

interface InterviewCategory {
  id: string;
  title: string;
  duration: string;
  priority: 'CRITICAL' | 'RECOMMENDED' | 'OPTIONAL';
  items?: string[];
  icon: React.ComponentType<{ className?: string }>;
}

export default function PracticeResultsPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const roleInsights = [
    { 
      icon: Briefcase, 
      label: "Role", 
      value: "Machine Learning Engineer" 
    },
    { 
      icon: Building, 
      label: "Company", 
      value: "Meta" 
    },
    { 
      icon: Users, 
      label: "Team", 
      value: "Data Science & Analytics" 
    },
    { 
      icon: Calendar, 
      label: "Experience", 
      value: "2-4 years" 
    }
  ];

  const interviewCategories: InterviewCategory[] = [
    {
      id: 'coding',
      title: 'Coding & Programming',
      duration: '26-50 min',
      priority: 'CRITICAL',
      items: ['SQL', 'Python', 'R'],
      icon: Code
    },
    {
      id: 'ml-ai',
      title: 'Machine Learning & AI',
      duration: '26-50 min',
      priority: 'CRITICAL',
      items: ['Model Development', 'Deep Learning', 'MLOps'],
      icon: Brain
    },
    {
      id: 'stats',
      title: 'Statistics & Experimentation',
      duration: '26-50 min',
      priority: 'RECOMMENDED',
      items: [],
      icon: BarChart3
    },
    {
      id: 'product',
      title: 'Product & Business sense',
      duration: '26-50 min',
      priority: 'OPTIONAL',
      items: [],
      icon: Target
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-500 text-white';
      case 'RECOMMENDED':
        return 'bg-yellow-500 text-white';
      case 'OPTIONAL':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleCategoryToggle = (categoryId: string, items?: string[]) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const calculateTotalDuration = () => {
    const selectedCats = interviewCategories.filter(cat => 
      selectedCategories.includes(cat.id)
    );
    
    let totalMinutes = 0;
    selectedCats.forEach(cat => {
      if (cat.items && cat.items.length > 0) {
        // If category has items, calculate based on selected items
        const baseMinutes = 26; // Base duration
        const additionalMinutes = cat.items.length * 6; // Rough estimate per item
        totalMinutes += Math.min(baseMinutes + additionalMinutes, 50);
      } else {
        // Default to mid-range of duration
        totalMinutes += 38; // Average of 26-50
      }
    });
    
    return totalMinutes;
  };

  const selectedCategory = interviewCategories.find(cat => 
    selectedCategories.includes(cat.id)
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Role Insights Section */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Role Insights</h1>
          <p className="text-gray-600 mb-6">Based on your job description and experience analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roleInsights.map((insight, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <insight.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">{insight.label}</p>
                  <p className="font-semibold text-gray-900">{insight.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Start Mock Interviews Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Start your mock interviews</h2>
          <p className="text-gray-600 mb-8">
            To land this role at Meta, you'll need to ace four key interviews. Click any card to begin practicing
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewCategories.map((category) => {
              const isSelected = selectedCategories.includes(category.id);
              const Icon = category.icon;

              return (
                <Card 
                  key={category.id} 
                  className={`relative cursor-pointer border-2 transition-all duration-200 hover:shadow-lg ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleCategoryToggle(category.id, category.items)}
                >
                  {/* Priority Badge */}
                  <Badge 
                    className={`absolute -top-2 -right-2 text-xs font-semibold px-2 py-1 ${getPriorityColor(category.priority)}`}
                  >
                    {category.priority}
                  </Badge>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Icon className="w-8 h-8 text-blue-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-1">{category.title}</h3>
                      <div className="w-8 h-1 bg-blue-600 rounded mb-4"></div>
                    </div>

                    {/* Category Items or Duration */}
                    {category.items && category.items.length > 0 ? (
                      <div className="space-y-3 mb-4">
                        {category.items.map((item, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <Checkbox 
                              checked={isSelected}
                              className="data-[state=checked]:bg-blue-600"
                            />
                            <span className="text-sm text-gray-700">{item}</span>
                          </div>
                        ))}
                        <p className="text-sm text-gray-500 mt-3">
                          Duration: {category.items.length * 15} min
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-6">{category.duration}</p>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
                      >
                        <BookOpen className="w-4 h-4" />
                        View Interview Guide
                      </Button>
                      
                      {isSelected && (
                        <Button
                          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Play className="w-4 h-4" />
                          Start Interview
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Selection Summary */}
        {selectedCategories.length > 0 && (
          <Card className="border border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedCategories.length} Interview{selectedCategories.length > 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-gray-600">
                    Total estimated duration: {calculateTotalDuration()} minutes
                  </p>
                </div>
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                >
                  Start Selected Interviews
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}