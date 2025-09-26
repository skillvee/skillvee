"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Clock, Calendar, ArrowRight } from "lucide-react";

export default function PracticeCasesPage() {
  const router = useRouter();

  // Get user's interview cases
  const { data: cases, isLoading } = api.practice.getUserCases.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your cases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Interview Cases</h1>
          <p className="text-gray-600">Review and restart your generated interview cases</p>
        </div>

        {cases && cases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((case_) => (
              <Card key={case_.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{case_.caseTitle}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {case_.totalDuration} min
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                    {case_.caseContext}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(case_.createdAt).toLocaleDateString()}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => router.push(`/interview/case/${case_.id}`)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      View Case
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Cases Yet</h3>
            <p className="text-gray-600 mb-6">Create your first interview case to get started</p>
            <Button
              onClick={() => router.push('/practice')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create Interview Case
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}