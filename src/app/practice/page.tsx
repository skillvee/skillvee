"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export default function PracticePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in?redirect_url=%2Fpractice');
    }
  }, [isLoaded, user, router]);

  if (isLoaded && !user) {
    return null;
  }

  // Show loading state while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const roles = [
    "Data Analyst",
    "Machine Learning Engineer", 
    "ML Research Scientist",
    "Data Engineer",
    "Analytics Engineer",
    "Quantitative Analyst",
    "AI / Deep Learning Specialist"
  ];

  const hasMinimumWords = jobDescription.trim().split(/\s+/).filter(word => word.length > 0).length >= 5;
  const hasJobDescription = hasMinimumWords;
  const isButtonActive = hasMinimumWords || selectedRole !== null;

  const handleRoleSelect = (role: string) => {
    // Don't allow role selection if there's a job description
    if (hasJobDescription) return;
    setSelectedRole(selectedRole === role ? null : role);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setJobDescription(newValue);
    
    // Clear selected role when typing job description
    if (newValue.trim() && selectedRole) {
      setSelectedRole(null);
    }
  };

  const handleCreateInterview = async () => {
    if (!isButtonActive) return;

    setIsProcessing(true);

    // Immediately navigate to results page with creating state
    if (hasMinimumWords && jobDescription.trim()) {
      router.push(`/practice/results?creating=true&type=job&description=${encodeURIComponent(jobDescription.trim())}`);
    } else if (selectedRole) {
      router.push(`/practice/results?creating=true&type=role&role=${encodeURIComponent(selectedRole)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-2xl shadow-lg border border-gray-200 bg-white">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Paste the job description to start your mock interview
                </h1>
                <p className="text-base text-gray-600">
                  Adding your job description will help us create a relevant interview for you
                </p>
              </div>

              <div className="space-y-8">
                <div className={`transition-opacity duration-200 ${selectedRole ? 'opacity-50' : ''}`}>
                  <textarea
                    placeholder={selectedRole ? "Job description disabled - role selected below" : "Paste the job description here..."}
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    disabled={!!selectedRole}
                    className={`w-full min-h-[180px] max-h-[400px] text-sm border focus:ring-2 focus:ring-blue-100 focus:outline-none rounded-lg p-4 resize-none transition-all duration-200 ${
                      selectedRole 
                        ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed" 
                        : "border-gray-300 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
                    }`}
                    rows={6}
                  />
                </div>

                <div className="space-y-6">
                  <p className="text-gray-600 text-sm">
                    Or select opportunities of interest:
                  </p>
                  
                  <div className={`flex flex-wrap gap-3 justify-center transition-opacity duration-200 ${hasJobDescription ? 'opacity-50' : ''}`}>
                    {roles.map((role) => (
                      <Button
                        key={role}
                        variant="outline"
                        onClick={() => handleRoleSelect(role)}
                        disabled={hasJobDescription}
                        className={`
                          px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 border
                          ${hasJobDescription 
                            ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed" 
                            : selectedRole === role 
                              ? "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100" 
                              : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300"
                          }
                        `}
                      >
                        {role}
                      </Button>
                    ))}
                  </div>
                </div>


                <div className="pt-4">
                  <Button
                    onClick={handleCreateInterview}
                    disabled={!isButtonActive}
                    className={`
                      w-full max-w-sm mx-auto px-6 py-3 text-sm font-semibold rounded-lg transition-all duration-200
                      ${isButtonActive
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    Create mock interview
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}