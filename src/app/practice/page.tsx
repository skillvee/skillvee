"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { AutoResizeTextarea } from "~/components/ui/auto-resize-textarea";

export default function PracticePage() {
  const router = useRouter();
  const [jobDescription, setJobDescription] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-4xl shadow-xl border-0">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold text-gray-900">
                  Paste the job description to start your mock interview
                </h1>
                <p className="text-lg text-gray-600">
                  Adding your job description will help us create a relevant interview for you
                </p>
              </div>

              <div className="space-y-8">
                <div>
                  <AutoResizeTextarea
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="min-h-[200px] text-base border-2 border-gray-200 focus-visible:border-blue-500 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl"
                    maxRows={12}
                  />
                </div>

                <div className="space-y-6">
                  <p className="text-gray-500 text-base">
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
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700" 
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
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
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
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