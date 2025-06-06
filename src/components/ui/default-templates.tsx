import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { FileText, Sparkles } from "lucide-react";

export interface JobDescriptionTemplate {
  id: string;
  title: string;
  company?: string;
  description: string;
  requirements: string[];
  focusAreas: string[];
  difficulty: "JUNIOR" | "MEDIUM" | "SENIOR";
  category: string;
}

const DEFAULT_TEMPLATES: JobDescriptionTemplate[] = [
  {
    id: "data-scientist-junior",
    title: "Junior Data Scientist",
    company: "TechCorp",
    description: "We are seeking a motivated Junior Data Scientist to join our growing analytics team. You will work on exciting projects involving machine learning, statistical analysis, and data visualization to drive business insights and decision-making.",
    requirements: [
      "Bachelor's degree in Data Science, Statistics, Computer Science, or related field",
      "Proficiency in Python and SQL",
      "Experience with pandas, numpy, and scikit-learn",
      "Basic understanding of machine learning algorithms",
      "Strong analytical and problem-solving skills",
      "Excellent communication skills"
    ],
    focusAreas: ["Machine Learning", "Python Programming", "SQL", "Data Analysis", "Statistics"],
    difficulty: "JUNIOR",
    category: "Data Science"
  },
  {
    id: "data-scientist-senior",
    title: "Senior Data Scientist",
    company: "AI Innovations Inc",
    description: "Lead complex data science initiatives and mentor junior team members. You will design and implement advanced machine learning models, work with large-scale data infrastructure, and drive strategic data-driven decisions across the organization.",
    requirements: [
      "Master's or PhD in Data Science, Machine Learning, or related field",
      "5+ years of experience in data science and machine learning",
      "Expert-level Python, R, and SQL skills",
      "Experience with deep learning frameworks (TensorFlow, PyTorch)",
      "Knowledge of cloud platforms (AWS, GCP, Azure)",
      "Experience with MLOps and model deployment",
      "Strong leadership and mentoring skills"
    ],
    focusAreas: ["Deep Learning", "MLOps", "Cloud Computing", "Machine Learning", "Data Engineering"],
    difficulty: "SENIOR",
    category: "Data Science"
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    company: "Business Analytics Co",
    description: "Join our analytics team to transform raw data into actionable business insights. You will create dashboards, perform statistical analysis, and work closely with stakeholders to understand and solve business problems through data.",
    requirements: [
      "Bachelor's degree in Analytics, Statistics, Economics, or related field",
      "Proficiency in SQL and Excel",
      "Experience with BI tools (Tableau, Power BI)",
      "Statistical analysis skills",
      "Business acumen and domain knowledge",
      "Strong presentation and communication skills"
    ],
    focusAreas: ["Data Analysis", "SQL", "Business Intelligence", "Data Visualization", "Statistics"],
    difficulty: "MEDIUM",
    category: "Analytics"
  },
  {
    id: "ml-engineer",
    title: "Machine Learning Engineer",
    company: "ML Solutions Ltd",
    description: "Design, develop, and deploy scalable machine learning systems. You will work at the intersection of data science and software engineering to build production-ready ML applications and infrastructure.",
    requirements: [
      "Computer Science or Engineering degree",
      "Strong software engineering skills",
      "Experience with ML frameworks and libraries",
      "Knowledge of model deployment and monitoring",
      "Experience with containerization (Docker, Kubernetes)",
      "Understanding of data pipelines and ETL processes",
      "Experience with version control and CI/CD"
    ],
    focusAreas: ["Machine Learning", "MLOps", "Data Engineering", "Python Programming", "Cloud Computing"],
    difficulty: "SENIOR",
    category: "Engineering"
  }
];

export interface DefaultTemplatesProps {
  onSelectTemplate: (template: JobDescriptionTemplate) => void;
  selectedTemplate?: string;
  className?: string;
}

export function DefaultTemplates({
  onSelectTemplate,
  selectedTemplate,
  className,
}: DefaultTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");
  
  const categories = ["all", ...Array.from(new Set(DEFAULT_TEMPLATES.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === "all" 
    ? DEFAULT_TEMPLATES 
    : DEFAULT_TEMPLATES.filter(t => t.category === selectedCategory);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "JUNIOR":
        return "bg-green-50 text-green-700 border-green-200";
      case "MEDIUM":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "SENIOR":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Job Description Templates</h3>
        </div>
        <p className="text-sm text-gray-600">
          Choose from our pre-built templates to get started quickly
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              selectedTemplate === template.id && "ring-2 ring-blue-500 shadow-md"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base">{template.title}</CardTitle>
                  {template.company && (
                    <CardDescription className="text-sm text-gray-500">
                      {template.company}
                    </CardDescription>
                  )}
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", getDifficultyColor(template.difficulty))}
                >
                  {template.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">
                {template.description}
              </p>
              
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">Focus Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {template.focusAreas.slice(0, 3).map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {template.focusAreas.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.focusAreas.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-700">Key Requirements:</div>
                <ul className="text-xs text-gray-600 space-y-1">
                  {template.requirements.slice(0, 2).map((req, idx) => (
                    <li key={idx} className="line-clamp-1">• {req}</li>
                  ))}
                  {template.requirements.length > 2 && (
                    <li className="text-xs text-gray-500">
                      +{template.requirements.length - 2} more requirements
                    </li>
                  )}
                </ul>
              </div>

              <Button 
                size="sm" 
                className="w-full mt-3"
                variant={selectedTemplate === template.id ? "default" : "outline"}
              >
                {selectedTemplate === template.id ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />
                    Selected
                  </>
                ) : (
                  "Use This Template"
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No templates found for the selected category.</p>
        </div>
      )}
    </div>
  );
}