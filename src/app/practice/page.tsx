"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { AutoResizeTextarea } from "~/components/ui/auto-resize-textarea";

export default function PracticePage() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Redirect to sign-in if not authenticated
  if (isLoaded && !user) {
    router.push('/sign-in?redirect_url=%2Fpractice');
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
  const isButtonActive = hasMinimumWords || selectedRole !== null;

  const handleRoleSelect = (role: string) => {
    setSelectedRole(selectedRole === role ? null : role);
  };

  const handleCreateInterview = () => {
    if (isButtonActive) {
      // Navigate to results page
      router.push("/practice/results");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-4xl shadow-xl border">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-foreground">
                  Paste the job description to start your mock interview
                </h1>
                <p className="text-lg text-muted-foreground">
                  Adding your job description will help us create a relevant interview for you
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <AutoResizeTextarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px] text-base border-2 border-input focus-visible:border-primary focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md"
                    maxRows={12}
                  />
                </div>

                <div className="space-y-6">
                  <p className="text-muted-foreground text-base">
                    Or select opportunities of interest:
                  </p>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    {roles.map((role) => (
                      <Button
                        key={role}
                        variant={selectedRole === role ? "default" : "outline"}
                        onClick={() => handleRoleSelect(role)}
                        className={`
                          px-6 py-3 rounded-full text-base font-medium transition-all duration-200
                          ${selectedRole === role 
                            ? "bg-primary text-primary-foreground border-primary hover:bg-primary/90" 
                            : "bg-card text-foreground border-border hover:bg-accent hover:border-accent"
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
                      w-full max-w-md mx-auto px-8 py-4 text-lg font-semibold rounded-xl transition-all duration-200
                      ${isButtonActive
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground cursor-not-allowed"
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