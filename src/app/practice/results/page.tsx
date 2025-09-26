"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { api } from "~/trpc/react";
import { 
  Briefcase, 
  Building, 
  Users, 
  Calendar,
  Play
} from "lucide-react";
import { generateInterviewCategories, type InterviewCategory, type ArchetypeWithSkills } from "~/server/api/utils/interview-categories";

function PracticeResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{[key: string]: string[]}>({});
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const sessionCreationRef = useRef(false);

  // Get params from URL
  const sessionId = searchParams.get('sessionId');
  const isCreating = searchParams.get('creating') === 'true';
  const creationType = searchParams.get('type'); // 'job' or 'role'
  const description = searchParams.get('description');
  const role = searchParams.get('role');

  // tRPC mutations for creating sessions
  const analyzeJobDescription = api.practice.analyzeJobDescription.useMutation();
  const selectRole = api.practice.selectRole.useMutation();
  const createInterviewCase = api.practice.createInterviewCase.useMutation();

  // Load session data (either existing or newly created)
  const activeSessionId = createdSessionId || sessionId;
  const { data: session, isLoading: sessionLoading, error: sessionError } = api.practice.getSession.useQuery(
    { sessionId: activeSessionId! },
    { enabled: !!activeSessionId }
  );

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=%2Fpractice%2Fresults');
    }
  }, [isLoaded, user, router]);

  // Handle session creation when in creating mode (with debouncing)
  useEffect(() => {
    const createSession = async () => {
      if (!isCreating || !user || sessionCreationRef.current || isCreatingSession || createdSessionId) return;

      // Prevent multiple simultaneous calls
      sessionCreationRef.current = true;
      setIsCreatingSession(true);

      try {
        let result;
        if (creationType === 'job' && description) {
          result = await analyzeJobDescription.mutateAsync({
            description: decodeURIComponent(description),
          });
        } else if (creationType === 'role' && role) {
          result = await selectRole.mutateAsync({
            role: decodeURIComponent(role),
          });
        }

        if (result?.sessionId) {
          setCreatedSessionId(result.sessionId);
          // Update URL to remove creating params and add sessionId
          router.replace(`/practice/results?sessionId=${result.sessionId}`);
        }
      } catch (error) {
        console.error('Failed to create session:', error);
        // Redirect back to practice page on error
        router.push('/practice');
      } finally {
        setIsCreatingSession(false);
      }
    };

    // Only run once when the component mounts in creating mode
    if (isCreating && user && !sessionCreationRef.current && !createdSessionId) {
      createSession();
    }
  }, [isCreating, creationType, description, role, user, createdSessionId]);

  // Reset ref when not in creating mode
  useEffect(() => {
    if (!isCreating) {
      sessionCreationRef.current = false;
    }
  }, [isCreating]);

  // Redirect to practice page if no session ID and not creating
  useEffect(() => {
    if (!sessionId && !isCreating) {
      router.push('/practice');
    }
  }, [sessionId, isCreating, router]);

  // Generate dynamic interview categories from archetype data
  const interviewCategories: InterviewCategory[] = generateInterviewCategories(
    session?.archetype as ArchetypeWithSkills | null
  );

  // Auto-select first category when categories are loaded
  useEffect(() => {
    if (session?.archetype && interviewCategories.length > 0) {
      const firstCategory = interviewCategories[0];
      if (firstCategory) {
        setSelectedCategory(firstCategory.id);
        
        // Initialize selectedItems for first category if it has items
        if (firstCategory.items && firstCategory.items.length > 0) {
          const firstItem = firstCategory.items[0];
          if (firstItem) {
            setSelectedItems(prev => ({
              ...prev,
              [firstCategory.id]: [firstItem] // Select first item by default
            }));
          }
        }
      }
    }
  }, [session?.archetype]);

  // Show creating state when session is being created (but only if no session created yet)
  if (isCreating && !createdSessionId) {
    const isJob = creationType === 'job';
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-2">
            Creating Your Interview Session
          </h1>
          <div className="space-y-2 text-gray-600">
            {isJob ? (
              <>
                <p>• AI is analyzing your job description...</p>
                <p>• Matching to interview archetypes...</p>
                <p>• Customizing questions for your role...</p>
              </>
            ) : (
              <>
                <p>• Setting up {decodeURIComponent(role || '')} interview...</p>
                <p>• Preparing relevant questions...</p>
                <p>• Customizing session content...</p>
              </>
            )}
          </div>
          <p className="text-sm text-blue-600 mt-4">
            This usually takes 3-5 seconds...
          </p>
        </div>
      </div>
    );
  }

  // Show loading state while checking auth or loading session
  if (!isLoaded || sessionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading practice session...</p>
        </div>
      </div>
    );
  }

  // Show error state if session failed to load
  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-6">
            {sessionError?.message || "This practice session has expired or doesn't exist."}
          </p>
          <Button onClick={() => router.push('/practice')} className="bg-blue-600 hover:bg-blue-700">
            Start New Practice Session
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Create role insights from session data
  console.log('[DEBUG] Session data:', session);
  console.log('[DEBUG] Session jobTitle:', session?.jobTitle);
  console.log('[DEBUG] Session company:', session?.company);
  console.log('[DEBUG] Session team:', session?.team);
  console.log('[DEBUG] Session experience:', session?.experience);

  const roleInsights = [
    {
      icon: Briefcase,
      label: "Role",
      value: session?.jobTitle || "Unknown"
    },
    {
      icon: Building,
      label: "Company",
      value: session?.company || "Unknown"
    },
    {
      icon: Users,
      label: "Team",
      value: session?.team || "Unknown"
    },
    {
      icon: Calendar,
      label: "Experience",
      value: session?.experience || "Unknown"
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

  const handleStartInterview = async (categoryId: string) => {
    if (!activeSessionId) return;

    const category = interviewCategories.find(cat => cat.id === categoryId);
    if (!category) return;

    // Get selected skills for this category
    const skills = selectedItems[categoryId] || category.items || [];

    if (skills.length === 0) {
      console.error('No skills selected');
      return;
    }

    try {
      // Create interview case with selected skills
      const result = await createInterviewCase.mutateAsync({
        sessionId: activeSessionId,
        domainId: categoryId,
        selectedSkills: skills
      });

      // Navigate to interview page with the case ID
      if (result.caseId) {
        router.push(`/interview/case/${result.caseId}`);
      }
    } catch (error) {
      console.error('Failed to create interview case:', error);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Role Insights Section */}
        <div className="bg-blue-50 p-8 rounded-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Role Insights</h1>
          <p className="text-gray-600 mb-8">Based on your job description and experience analysis</p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {roleInsights.map((insight, index) => (
              <div key={index} className="bg-white rounded-lg p-6 text-center shadow-sm">
                <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <insight.icon className="w-7 h-7 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500 mb-2 font-medium">{insight.label}</p>
                <p className="font-semibold text-gray-900 text-lg">{insight.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Start Mock Interviews Section */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Start your mock interviews</h2>
          <p className="text-gray-600 mb-8">
            {session.company 
              ? `To land this role at ${session.company}, you'll need to ace these key interviews. Click any card to begin practicing`
              : `To land this ${session.jobTitle || 'role'}, you'll need to ace these key interviews. Click any card to begin practicing`
            }
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {interviewCategories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const Icon = category.icon;

              return (
                <div
                  key={category.id} 
                  className={`relative cursor-pointer bg-white border border-gray-200 transition-all duration-200 hover:shadow-lg rounded-lg ${
                    isSelected ? 'border-blue-500 shadow-lg' : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  {/* Priority Badge */}
                  <div 
                    className={`absolute top-0 right-0 text-xs font-semibold px-3 py-1 ${getPriorityColor(category.priority)} rounded-bl-lg rounded-tr-lg`}
                  >
                    {category.priority}
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <Icon className="w-8 h-8 text-blue-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-1 text-lg">{category.title}</h3>
                      <div className="w-8 h-1 bg-blue-600 rounded mb-4"></div>
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
                                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:text-white pointer-events-none"
                                  />
                                  <span className="text-sm text-gray-900 select-none">
                                    {item}
                                  </span>
                                </div>
                              );
                            })}
                            <p className="text-sm text-gray-500 mt-3 text-center">
                              Duration: {calculateDuration(category.id)} min
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mb-6 text-center">{category.duration}</p>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <Button
                            onClick={() => handleStartInterview(category.id)}
                            disabled={createInterviewCase.isPending}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
                          >
                            <Play className="w-4 h-4" />
                            {createInterviewCase.isPending ? 'Creating Case...' : 'Start Interview'}
                          </Button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">{category.duration}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function PracticeResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <PracticeResultsContent />
    </Suspense>
  );
}