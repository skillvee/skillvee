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
import { api } from "~/trpc/react";

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
    domain?: string;
    skill?: string;
    level?: string;
    level_name?: string;
    general_description?: string;
    bucket?: string;
    description?: string;
    roles_count?: number;
    mappings_count?: number;
    // Legacy fields for backward compatibility
    category?: string;
    competency?: string;
    priority?: string;
  }>;
}

export function CSVImportDialog({ onClose }: CSVImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [activeTab, setActiveTab] = useState("upload");

  // tRPC hooks
  const validateCSV = api.skills.validateCSV.useMutation();
  const importCSV = api.skills.importCSV.useMutation();
  const { data: csvTemplate } = api.skills.getCSVTemplate.useQuery();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === "text/csv") {
      setFile(file);
      setIsValidating(true);
      
      try {
        // Read file content
        const csvContent = await file.text();
        
        // Validate CSV using tRPC endpoint
        const result = await validateCSV.mutateAsync({ csvContent });
        
        setPreview({
          totalRows: result.stats.totalRows,
          validRows: result.stats.validRows,
          errors: result.errors,
          sample: result.preview
        });
        setActiveTab("preview");
      } catch (error) {
        console.error("CSV validation error:", error);
        toast.error("Failed to validate CSV file");
      } finally {
        setIsValidating(false);
      }
    } else {
      toast.error("Please upload a valid CSV file");
    }
  }, [validateCSV]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
    maxFiles: 1,
  });

  const handleImport = async () => {
    if (!file || !preview) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Read file content
      const csvContent = await file.text();
      
      // Show progress while importing
      setUploadProgress(30);
      
      // Import CSV using tRPC endpoint
      const result = await importCSV.mutateAsync({ 
        csvContent,
        skipErrors: true 
      });
      
      setUploadProgress(100);
      
      const message = 'domainsCreated' in result.stats 
        ? `Successfully imported ${result.stats.skillLevelsCreated} skill levels across ${result.stats.domainsCreated} domains and ${result.stats.skillsCreated} skills!`
        : `Successfully imported ${result.stats.archetypesCreated} role archetypes with ${result.stats.rolesCreated} roles!`;
      
      toast.success(message);
      
      // Refresh the page data (you might want to invalidate queries here)
      setTimeout(() => {
        onClose();
        window.location.reload(); // Simple refresh - you could use tRPC invalidation instead
      }, 1000);
      
    } catch (error) {
      console.error("CSV import error:", error);
      toast.error("Failed to import CSV file");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    if (csvTemplate) {
      const blob = new Blob([csvTemplate.content], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = csvTemplate.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success("Template downloaded successfully!");
    } else {
      toast.error("Template not available");
    }
  };

  return (
    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Import Skills Data
        </DialogTitle>
        <DialogDescription>
          Upload CSV files to bulk import skills taxonomy (domains, skills, skill levels) or role archetypes with skill mappings
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
                    {isValidating && (
                      <div className="ml-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-green-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                        setActiveTab("upload");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                
                {isValidating && (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Validating CSV file...
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
              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Skills Taxonomy CSV:</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-2">
                    <li>• Headers: Domain, Skill, Level, Level_Name, General_Description, Observable_Behaviors, Example_Responses, Common_Mistakes</li>
                    <li>• Level values: 1, 2, 3 (Developing, Proficient, Advanced)</li>
                    <li>• Level_Name values: "Developing", "Proficient", "Advanced"</li>
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200">Role Archetypes CSV:</h5>
                  <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1 ml-2">
                    <li>• Headers: Bucket, Description, Example_Titles, [Skill Names with ✔/✔✔/✔✔✔]</li>
                    <li>• Bucket = Archetype name (e.g., "Data Infrastructure Engineering")</li>
                    <li>• Example_Titles = Job roles separated by newlines or bullet points</li>
                    <li>• Skills marked with ✔ (LOW), ✔✔ (MEDIUM), or ✔✔✔ (HIGH) importance</li>
                  </ul>
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">
                  • Maximum file size: 10MB
                </div>
              </div>
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
            disabled={!file || isValidating || !preview}
          >
            {isValidating ? "Validating..." : "Continue"}
          </Button>
        )}
        {activeTab === "preview" && (
          <Button 
            onClick={() => setActiveTab("import")}
            disabled={!preview || preview.validRows === 0}
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