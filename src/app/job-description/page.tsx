"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { AutoResizeTextarea } from "~/components/ui/auto-resize-textarea";
import { TypingLoader } from "~/components/ui/typing-loader";
import { Badge } from "~/components/ui/badge";
import { 
  Sparkles, 
  ArrowRight, 
  Building2, 
  MapPin,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Edit3,
  X,
  Plus,
  Check
} from "lucide-react";

// Form validation schema
const jobDescriptionFormSchema = z.object({
  title: z.string()
    .min(1, "Job title is required")
    .max(150, "Job title must be less than 150 characters"),
  company: z.string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  description: z.string()
    .min(10, "Job description must be at least 10 characters")
    .max(50000, "Job description is too long"),
  requirements: z.array(z.string().min(1)).min(1, "At least one requirement is required"),
  focusAreas: z.array(z.string()),
  difficulty: z.enum(["JUNIOR", "MEDIUM", "SENIOR"]),
  isTemplate: z.boolean(),
});

type JobDescriptionFormData = z.infer<typeof jobDescriptionFormSchema>;

const DIFFICULTY_LABELS = {
  JUNIOR: { label: "Junior Level", description: "0-2 years experience", icon: "👨‍🎓" },
  MEDIUM: { label: "Mid Level", description: "2-5 years experience", icon: "👨‍💼" },
  SENIOR: { label: "Senior Level", description: "5+ years experience", icon: "👨‍🏫" },
} as const;

const AI_PROCESSING_MESSAGES = [
  "Analyzing job description...",
  "Extracting key information...",
  "Identifying requirements...", 
  "Detecting focus areas...",
  "Finalizing parsed data..."
];

export default function JobDescriptionPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<"input" | "processing" | "results">("input");
  const [parsedData, setParsedData] = React.useState<{ extractedInfo?: { location?: string; employmentType?: string } } | null>(null);
  
  // Interactive state for results step
  const [showFullDescription, setShowFullDescription] = React.useState(false);
  const [editingRequirement, setEditingRequirement] = React.useState<number | null>(null);
  const [newRequirement, setNewRequirement] = React.useState("");
  const [editingDifficulty, setEditingDifficulty] = React.useState(false);

  // Form setup
  const form = useForm<JobDescriptionFormData>({
    resolver: zodResolver(jobDescriptionFormSchema),
    defaultValues: {
      title: "",
      company: "",
      description: "",
      requirements: [],
      focusAreas: [],
      difficulty: "MEDIUM",
      isTemplate: false,
    },
  });

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const description = watch("description");

  // tRPC mutations
  const createJobDescriptionMutation = api.jobDescription.create.useMutation({
    onSuccess: (data) => {
      console.log("Job description created:", data);
      router.push(`/interview?jobDescriptionId=${data.id}`);
    },
    onError: (error) => {
      console.error("Error creating job description:", error);
    },
  });

  const parseJobDescriptionMutation = api.ai.parseJobDescription.useMutation({
    onSuccess: (data) => {
      setParsedData(data);
      // Auto-populate form fields
      setValue("title", data.title ?? "");
      setValue("company", data.company ?? "");
      setValue("difficulty", data.difficulty ?? "MEDIUM");
      setValue("requirements", data.requirements ?? []);
      setValue("focusAreas", data.focusAreas ?? []);
      
      setCurrentStep("results");
    },
    onError: (error) => {
      console.error("Error parsing job description:", error);
      setCurrentStep("input");
    },
  });

  const handleAnalyzeJob = () => {
    if (description.trim().length < 10) return;
    
    setCurrentStep("processing");
    parseJobDescriptionMutation.mutate({ description });
  };

  const handleCreateInterview = async (data: JobDescriptionFormData) => {
    try {
      await createJobDescriptionMutation.mutateAsync(data);
    } catch (error) {
      console.error("Failed to create job description:", error);
    }
  };

  // Helper functions for editing
  const updateRequirement = (index: number, newText: string) => {
    const currentReqs = watch("requirements");
    const updatedReqs = [...currentReqs];
    updatedReqs[index] = newText;
    setValue("requirements", updatedReqs);
    setEditingRequirement(null);
  };

  const removeRequirement = (index: number) => {
    const currentReqs = watch("requirements");
    setValue("requirements", currentReqs.filter((_, i) => i !== index));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      const currentReqs = watch("requirements");
      setValue("requirements", [...currentReqs, newRequirement.trim()]);
      setNewRequirement("");
    }
  };

  const toggleFocusArea = (area: string) => {
    const currentAreas = watch("focusAreas");
    if (currentAreas.includes(area)) {
      setValue("focusAreas", currentAreas.filter(a => a !== area));
    } else {
      setValue("focusAreas", [...currentAreas, area]);
    }
  };

  const renderInputStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Create Interview Questions
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Paste your job description below and let AI extract the key information to generate tailored interview questions.
          </p>
        </div>

        <Card className="border-0 shadow-2xl">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Job Description *
                </label>
                <AutoResizeTextarea
                  {...register("description")}
                  placeholder="Paste the complete job description here...

Example:
Senior Data Scientist - TechCorp

We are looking for an experienced Senior Data Scientist to join our AI team. You'll be responsible for developing machine learning models, analyzing large datasets, and driving data-driven decisions.

Requirements:
• 5+ years of experience in machine learning
• Strong Python and SQL skills
• Experience with cloud platforms (AWS, GCP)
• PhD in Computer Science or related field preferred"
                  minRows={12}
                  maxRows={20}
                  className="w-full text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-2">{errors.description.message}</p>
                )}
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleAnalyzeJob}
                  disabled={description.trim().length < 10}
                  size="lg"
                  className="px-12 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                >
                  <Sparkles className="h-5 w-5 mr-3" />
                  Analyze with AI
                  <ArrowRight className="h-5 w-5 ml-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Processing Your Job Description
          </h1>
          <p className="text-lg text-gray-600">
            Our AI is analyzing the content and extracting key information
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-12">
            <TypingLoader
              messages={AI_PROCESSING_MESSAGES}
              className="text-center"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const description = watch("description");
    const truncatedDescription = description.length > 300 ? description.slice(0, 300) + "..." : description;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Review Extracted Information
              </h1>
              <p className="text-lg text-gray-600">
                Verify and edit the details before creating interview questions
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentStep("input")}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Job Header */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {watch("title") || "Job Title"}
                      </h2>
                      <div className="flex items-center space-x-4 text-gray-600">
                        {watch("company") && (
                          <div className="flex items-center space-x-1">
                            <Building2 className="h-4 w-4" />
                            <span>{watch("company")}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{DIFFICULTY_LABELS[watch("difficulty")].label}</span>
                        </div>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-50 text-green-700 border-green-200 px-3 py-1"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      AI Extracted
                    </Badge>
                  </div>

                  <div className="prose max-w-none">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {showFullDescription ? description : truncatedDescription}
                    </p>
                    {description.length > 300 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullDescription(!showFullDescription)}
                        className="mt-2 text-blue-600 hover:text-blue-700 p-0 h-auto"
                      >
                        {showFullDescription ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Show less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            Read complete description
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Requirements - Editable */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-xl font-semibold text-gray-900">Requirements</h3>
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                        {watch("requirements").length} items
                      </Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingRequirement(-1)}
                      className="flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {watch("requirements").map((req, index) => (
                      <div key={index} className="group">
                        {editingRequirement === index ? (
                          <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <Input
                              defaultValue={req}
                              className="flex-1"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  updateRequirement(index, e.currentTarget.value);
                                }
                              }}
                              onBlur={(e) => updateRequirement(index, e.target.value)}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingRequirement(null)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="flex items-start space-x-3 flex-1">
                              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-700">{req}</span>
                            </div>
                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingRequirement(index)}
                                className="h-8 w-8 p-0"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeRequirement(index)}
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {editingRequirement === -1 && (
                      <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <Input
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          placeholder="Add a new requirement..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              addRequirement();
                              setEditingRequirement(null);
                            }
                          }}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            addRequirement();
                            setEditingRequirement(null);
                          }}
                          disabled={!newRequirement.trim()}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingRequirement(null);
                            setNewRequirement("");
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Experience Level - Editable */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingDifficulty(!editingDifficulty)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {editingDifficulty ? (
                    <div className="space-y-2">
                      {Object.entries(DIFFICULTY_LABELS).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => {
                            setValue("difficulty", key as "JUNIOR" | "MEDIUM" | "SENIOR");
                            setEditingDifficulty(false);
                          }}
                          className={`w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            watch("difficulty") === key
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-xl">{value.icon}</span>
                          <div className="text-left">
                            <div className="font-semibold text-gray-900">{value.label}</div>
                            <div className="text-sm text-gray-600">{value.description}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
                      <span className="text-2xl">
                        {DIFFICULTY_LABELS[watch("difficulty")].icon}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {DIFFICULTY_LABELS[watch("difficulty")].label}
                        </div>
                        <div className="text-sm text-gray-600">
                          {DIFFICULTY_LABELS[watch("difficulty")].description}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Focus Areas - Interactive */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Focus Areas</h3>
                  <div className="space-y-4">
                    {/* Selected Areas */}
                    <div className="flex flex-wrap gap-2">
                      {watch("focusAreas").map((area) => (
                        <Badge
                          key={area}
                          variant="default"
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 cursor-pointer text-white"
                          onClick={() => toggleFocusArea(area)}
                        >
                          {area}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Available Areas */}
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-3">Add more focus areas:</p>
                      <div className="flex flex-wrap gap-2">
                        {["Machine Learning", "Data Analysis", "Python Programming", "SQL", "Statistics", "Data Visualization", "Deep Learning", "Cloud Computing", "A/B Testing", "ETL/Data Engineering"].filter(area => !watch("focusAreas").includes(area)).map((area) => (
                          <Badge
                            key={area}
                            variant="outline"
                            className="px-3 py-1 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleFocusArea(area)}
                          >
                            {area}
                            <Plus className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Info */}
              {(parsedData?.extractedInfo?.location ?? parsedData?.extractedInfo?.employmentType) ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
                    <div className="space-y-3 text-sm">
                      {parsedData?.extractedInfo?.location && (
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{parsedData?.extractedInfo?.location}</span>
                        </div>
                      )}
                      {parsedData?.extractedInfo?.employmentType && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700">{parsedData?.extractedInfo?.employmentType}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              {/* Actions */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Continue?</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    This information will be used to generate tailored interview questions.
                  </p>
                  <Button
                    onClick={handleSubmit(handleCreateInterview)}
                    disabled={createJobDescriptionMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  >
                    {createJobDescriptionMutation.isPending ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Interview...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Create Interview Questions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {currentStep === "input" && renderInputStep()}
      {currentStep === "processing" && renderProcessingStep()}
      {currentStep === "results" && renderResultsStep()}
    </div>
  );
}