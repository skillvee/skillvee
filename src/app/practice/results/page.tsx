"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { 
  Briefcase, 
  Building, 
  Users, 
  Calendar,
  Play,
  BookOpen,
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
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('coding');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: string[]}>({
    coding: ['Python'] // Default to Python selected
  });

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in?redirect_url=%2Fpractice%2Fresults');
    return null;
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Initialize with at least one item selected if category has items
    if (!selectedItems[categoryId]) {
      const category = interviewCategories.find(cat => cat.id === categoryId);
      if (category?.items && category.items.length > 0) {
        const firstItem = category.items[0];
        if (firstItem) {
          setSelectedItems((prev: {[key: string]: string[]}) => ({
            ...prev,
            [categoryId]: [firstItem] // Select first item by default
          }));
        }
      }
    }
  };

  const handleItemToggle = (categoryId: string, item: string) => {
    setSelectedItems((prev: {[key: string]: string[]}) => {
      const currentItems = prev[categoryId] || [];
      const newItems = currentItems.includes(item)
        ? currentItems.filter(i => i !== item)
        : [...currentItems, item];
      
      // Ensure at least one item is selected
      if (newItems.length === 0) {
        return prev; // Don't allow deselecting all items
      }
      
      return {
        ...prev,
        [categoryId]: newItems
      };
    });
  };

  const calculateDuration = (categoryId: string) => {
    const category = interviewCategories.find(cat => cat.id === categoryId);
    if (!category) return 0;
    
    if (category.items && category.items.length > 0) {
      const selectedItemsCount = selectedItems[categoryId]?.length || 1;
      return selectedItemsCount * 15; // 15 minutes per selected item
    } else {
      return 38; // Average of 26-50
    }
  };


  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Role Insights Section */}
        <div className="bg-muted p-6 rounded-md">
          <h1 className="text-2xl font-bold text-foreground mb-2">Role Insights</h1>
          <p className="text-muted-foreground mb-6">Based on your job description and experience analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {roleInsights.map((insight, index) => (
              <Card key={index} className="border shadow-sm rounded-md">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <insight.icon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{insight.label}</p>
                  <p className="font-semibold text-foreground">{insight.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Start Mock Interviews Section */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Start your mock interviews</h2>
          <p className="text-muted-foreground mb-8">
            To land this role at Meta, you'll need to ace four key interviews. Click any card to begin practicing
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewCategories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const Icon = category.icon;

              return (
                <Card 
                  key={category.id} 
                  className={`relative cursor-pointer border transition-all duration-200 hover:shadow-lg rounded-xl ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-border/80 bg-card'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {/* Priority Badge */}
                  <div 
                    className={`absolute top-0 right-0 text-xs font-semibold px-3 py-1 ${getPriorityColor(category.priority)} rounded-bl-lg rounded-tr-xl`}
                  >
                    {category.priority}
                  </div>

                  <CardContent className="p-6">
                    <div className="mb-4">
                      <Icon className="w-8 h-8 text-primary mb-3" />
                      <h3 className="font-bold text-foreground mb-1 text-lg">{category.title}</h3>
                      <div className="w-8 h-1 bg-primary rounded mb-4"></div>
                    </div>

                    {/* Show details only for selected card */}
                    {isSelected ? (
                      <>
                        {/* Category Items or Duration */}
                        {category.items && category.items.length > 0 ? (
                          <div className="space-y-3 mb-4">
                            {category.items.map((item, index) => {
                              const itemSelected = selectedItems[category.id]?.includes(item) || false;
                              return (
                                <div 
                                  key={index} 
                                  className="flex items-center space-x-2 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemToggle(category.id, item);
                                  }}
                                >
                                  <Checkbox 
                                    checked={itemSelected}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground pointer-events-none"
                                  />
                                  <span className="text-sm text-foreground select-none">
                                    {item}
                                  </span>
                                </div>
                              );
                            })}
                            <p className="text-sm text-muted-foreground mt-3 text-center">
                              Duration: {calculateDuration(category.id)} min
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground mb-6 text-center">{category.duration}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
                          >
                            <BookOpen className="w-4 h-4" />
                            View Interview Guide
                          </Button>
                          
                          <Button
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Play className="w-4 h-4" />
                            Start Interview
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">{category.duration}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}