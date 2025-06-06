import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { api } from "~/trpc/server";

export default async function InterviewPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  try {
    const user = await api.user.getCurrentUser();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Interview Platform
            </h1>
            <p className="text-gray-600">
              Welcome, {user.firstName ?? user.email}. This is a protected interview page.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Start New Interview
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Paste the job description here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                  <option value="technical">Technical Interview</option>
                  <option value="behavioral">Behavioral Interview</option>
                  <option value="case-study">Case Study</option>
                  <option value="system-design">System Design</option>
                </select>
              </div>

              <div className="flex justify-between items-center pt-4">
                <div className="text-sm text-gray-500">
                  Your role: <span className="font-medium">{user.role}</span>
                </div>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                  Start Interview
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              How it works
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Paste or select a job description</li>
              <li>AI generates relevant interview questions</li>
              <li>Conduct live interview with AI guidance</li>
              <li>Receive detailed performance assessment</li>
            </ol>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading interview page:", error);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-red-700">
            Unable to load user data. Please try signing out and signing back in.
          </p>
        </div>
      </div>
    );
  }
}