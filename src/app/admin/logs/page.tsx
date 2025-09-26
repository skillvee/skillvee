"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { RefreshCw, Trash2, Eye, ChevronDown, ChevronUp, AlertCircle, CheckCircle, Clock } from "lucide-react";

export default function AdminLogsPage() {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch logs with polling
  const { data, isLoading, error, refetch } = api.admin.getGeminiLogs.useQuery(
    { limit: 100 },
    {
      refetchInterval: 30000, // Auto-refresh every 30 seconds to avoid rate limiting
    }
  );

  const clearLogsMutation = api.admin.clearGeminiLogs.useMutation({
    onSuccess: () => {
      setRefreshKey(k => k + 1);
      refetch();
    },
  });

  const toggleLogExpansion = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'REQUEST':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'RESPONSE':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ERROR':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-red-50 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-700">Access Denied</CardTitle>
              <CardDescription className="text-red-600">
                You don't have permission to view this page. Admin access required.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gemini API Logs</h1>
            <p className="text-gray-600 mt-2">Monitor job description analysis and case generation from database</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="destructive"
              onClick={() => clearLogsMutation.mutate()}
              disabled={clearLogsMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Old Logs (30+ days)
            </Button>
          </div>
        </div>

        {/* Statistics */}
        {data?.stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Total Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data.stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-blue-600">{data.stats.requests}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-green-600">{data.stats.responses}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-600">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{data.stats.averageResponseTime}ms</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Logs List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : data?.logs && data.logs.length > 0 ? (
          <div className="space-y-4">
            {data.logs.map((log) => {
              // Debug log to check error field
              if (log.type === 'ERROR') {
                console.log('Error log:', { id: log.id, type: log.type, error: log.error, errorLength: log.error?.length });
              }
              return (
              <Card key={log.id} className={`overflow-hidden ${log.type === 'ERROR' ? 'border-red-200' : ''}`}>
                <CardHeader
                  className={`cursor-pointer transition-colors ${
                    log.type === 'ERROR' ? 'hover:bg-red-50 bg-red-50/50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => toggleLogExpansion(log.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getLogTypeIcon(log.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{log.jobTitle || 'Unknown Job'}</span>
                          {log.company && (
                            <span className="text-gray-500">@ {log.company}</span>
                          )}
                          <span className={`px-2 py-1 text-xs rounded ${
                            log.type === 'REQUEST' ? 'bg-blue-100 text-blue-700' :
                            log.type === 'RESPONSE' ? 'bg-green-100 text-green-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {log.type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(log.timestamp)}
                          {log.responseTime && (
                            <span className="ml-2">• {log.responseTime}ms</span>
                          )}
                          {log.skills && (
                            <span className="ml-2">• {log.skills.length} skills</span>
                          )}
                        </div>
                        {(log.error || log.type === 'ERROR') && (
                          <div className="text-sm text-red-600 mt-1 font-medium">
                            {log.error ? (
                              <>Error: {log.error.substring(0, 150)}{log.error.length > 150 ? '...' : ''}</>
                            ) : (
                              'Error occurred (expand for details)'
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLogExpansion(log.id);
                      }}
                    >
                      {expandedLogId === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {expandedLogId === log.id && (
                  <CardContent className="border-t bg-gray-50">
                    <div className="space-y-4 pt-4">
                      {/* Skills */}
                      {log.skills && log.skills.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Skills Evaluated:</h4>
                          <div className="flex flex-wrap gap-2">
                            {log.skills.map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prompt */}
                      {log.prompt && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Prompt ({log.promptLength} characters):
                          </h4>
                          <pre className="bg-white p-4 rounded border text-xs overflow-x-auto max-h-96 overflow-y-auto">
                            {log.prompt}
                          </pre>
                        </div>
                      )}

                      {/* Response */}
                      {log.response && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Response:</h4>
                          <pre className="bg-white p-4 rounded border text-xs overflow-x-auto max-h-96 overflow-y-auto">
                            {JSON.stringify(log.response, null, 2)}
                          </pre>
                        </div>
                      )}

                      {/* Error */}
                      {log.error && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2 text-red-600">Error Details:</h4>
                          <div className="bg-red-50 p-4 rounded border border-red-200">
                            <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-words">
                              {(() => {
                                try {
                                  // Try to parse and format JSON errors
                                  const parsed = JSON.parse(log.error);
                                  return JSON.stringify(parsed, null, 2);
                                } catch {
                                  // If not JSON, display as is
                                  return log.error;
                                }
                              })()}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Additional Details:</h4>
                          <pre className="bg-white p-4 rounded border text-xs overflow-x-auto">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">No logs available. Generate an interview case to see logs.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}