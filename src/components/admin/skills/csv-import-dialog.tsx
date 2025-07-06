"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Alert, AlertDescription } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  Upload, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Download,
  X,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

interface CSVImportDialogProps {
  onClose: () => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ImportPreview {
  totalRows: number;
  validRows: number;
  errors: ValidationError[];
  sample: Array<{
    domain: string;
    category: string;
    skill: string;
    competency: string;
    priority: string;
  }>;
}

export function CSVImportDialog({ onClose }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "text/csv") {
      setFile(file);
      
      // Simulate file validation
      setTimeout(() => {
        setPreview({
          totalRows: 150,
          validRows: 142,
          errors: [
            { row: 5, field: "priority", message: "Invalid priority value 'HIGH'. Must be PRIMARY, SECONDARY, or NONE." },
            { row: 12, field: "domain", message: "Domain name exceeds 100 character limit." },
            { row: 23, field: "competency", message: "Competency name cannot be empty." },
            { row: 34, field: "level_1_description", message: "Description is required for level 1." },
            { row: 45, field: "category", message: "Category name contains invalid characters." },
            { row: 67, field: "skill", message: "Duplicate skill name within category." },
            { row: 89, field: "level_3_name", message: "Level 3 name is required when description is provided." },
            { row: 101, field: "priority", message: "Priority cannot be PRIMARY for skill without competencies." },
          ],
          sample: [
            {
              domain: "Technical Skills",
              category: "Programming",
              skill: "JavaScript",
              competency: "Async Programming",
              priority: "PRIMARY"
            },
            {
              domain: "Technical Skills",
              category: "Programming",
              skill: "JavaScript", 
              competency: "DOM Manipulation",
              priority: "SECONDARY"
            },
            {
              domain: "Cognitive",
              category: "Problem Solving",
              skill: "Analytical Thinking",
              competency: "Pattern Recognition",
              priority: "PRIMARY"
            }
          ]
        });
        setActiveTab("preview");
      }, 1000);
    } else {
      toast.error("Please upload a valid CSV file");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Simulate final processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success(`Successfully imported ${preview?.validRows} competencies!`);
    setIsUploading(false);
    onClose();
  };

  const downloadTemplate = () => {
    // Create sample CSV content
    const csvContent = `Domain,Category,Skill,Competency,Priority,Level_1_Name,Level_1_Description,Level_2_Name,Level_2_Description,Level_3_Name,Level_3_Description,Level_4_Name,Level_4_Description,Level_5_Name,Level_5_Description
Technical Skills,Programming,JavaScript,Async Programming,PRIMARY,Beginning/Novice,Struggles with basic async concepts...,Developing/Basic,Understands promises but makes errors...,Competent/Proficient,Uses async/await correctly...,Accomplished/Advanced,Handles complex async patterns...,Exemplary/Expert,Masters all async programming concepts...
Technical Skills,Programming,JavaScript,DOM Manipulation,SECONDARY,Beginning/Novice,Basic element selection...,Developing/Basic,Can modify element properties...,Competent/Proficient,Creates dynamic interfaces...,Accomplished/Advanced,Optimizes DOM operations...,Exemplary/Expert,Masters virtual DOM concepts...`;
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "skills-template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Template downloaded successfully!");
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Skills Data
        </DialogTitle>
        <DialogDescription>
          Upload a CSV file to bulk import domains, categories, skills, and competencies
        </DialogDescription>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="preview" disabled={!preview}>Preview</TabsTrigger>
          <TabsTrigger value="import" disabled={!preview}>Import</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="space-y-4">
            {/* Upload Area */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input {...getInputProps()} />
              <div className="space-y-4">
                <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">
                    {isDragActive ? "Drop your CSV file here" : "Upload CSV file"}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Drag and drop or click to select a CSV file
                  </p>
                </div>
                {file && (
                  <div className="flex items-center justify-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <File className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Template Download */}
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Don't have a CSV file? Download our template to get started with the correct format.
                <Button
                  variant="link"
                  className="p-0 h-auto ml-2"
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download Template
                </Button>
              </AlertDescription>
            </Alert>

            {/* Format Requirements */}
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                CSV Format Requirements
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Headers: Domain, Category, Skill, Competency, Priority, Level_1_Name, Level_1_Description, etc.</li>
                <li>• Priority values: PRIMARY, SECONDARY, or NONE</li>
                <li>• All 5 competency levels must be provided (Level_1 through Level_5)</li>
                <li>• Domain and category names will be created if they don't exist</li>
                <li>• Maximum file size: 10MB</li>
              </ul>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          {preview && (
            <div className="space-y-4">
              {/* Validation Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{preview.totalRows}</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Rows</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{preview.validRows}</div>
                  <div className="text-sm text-green-700 dark:text-green-300">Valid Rows</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{preview.errors.length}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">Errors</div>
                </div>
              </div>

              {/* Errors */}
              {preview.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Found {preview.errors.length} validation errors. Please fix these before importing.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error List */}
              {preview.errors.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {preview.errors.slice(0, 5).map((error, index) => (
                    <div key={index} className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950 rounded text-sm">
                      <Badge variant="destructive" className="text-xs">
                        Row {error.row}
                      </Badge>
                      <div>
                        <span className="font-medium">{error.field}:</span> {error.message}
                      </div>
                    </div>
                  ))}
                  {preview.errors.length > 5 && (
                    <div className="text-sm text-gray-500 text-center">
                      And {preview.errors.length - 5} more errors...
                    </div>
                  )}
                </div>
              )}

              {/* Sample Data */}
              <div>
                <h4 className="font-medium mb-2">Sample Data Preview</h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="p-2 text-left">Domain</th>
                        <th className="p-2 text-left">Category</th>
                        <th className="p-2 text-left">Skill</th>
                        <th className="p-2 text-left">Competency</th>
                        <th className="p-2 text-left">Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.sample.slice(0, 3).map((row, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{row.domain}</td>
                          <td className="p-2">{row.category}</td>
                          <td className="p-2">{row.skill}</td>
                          <td className="p-2">{row.competency}</td>
                          <td className="p-2">
                            <Badge 
                              variant={
                                row.priority === "PRIMARY" 
                                  ? "destructive" 
                                  : row.priority === "SECONDARY"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              {row.priority}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <div className="text-center space-y-4">
            {isUploading ? (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Upload className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Importing Data...</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Processing {preview?.validRows} competencies
                  </p>
                </div>
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-gray-500">{uploadProgress}% complete</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Ready to Import</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {preview?.validRows} valid competencies will be imported
                  </p>
                </div>
                {preview && preview.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {preview.errors.length} rows with errors will be skipped
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        {activeTab === "upload" && (
          <Button 
            onClick={() => setActiveTab("preview")} 
            disabled={!file}
          >
            Continue
          </Button>
        )}
        {activeTab === "preview" && (
          <Button 
            onClick={() => setActiveTab("import")}
            disabled={preview?.errors.length === preview?.totalRows}
          >
            Continue to Import
          </Button>
        )}
        {activeTab === "import" && (
          <Button 
            onClick={handleImport} 
            disabled={isUploading || !preview}
          >
            {isUploading ? "Importing..." : `Import ${preview?.validRows} Items`}
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
}