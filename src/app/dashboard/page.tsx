import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { type Metadata } from "next";

import { api } from "~/trpc/server";
import { generateMetadata as genMeta } from "~/lib/seo/metadata";

export const metadata: Metadata = genMeta({
  title: "Dashboard",
  description: "Your SkillVee dashboard. Track your interview practice progress, view results, and manage your profile.",
  path: "/dashboard",
  noIndex: true, // Private page - don't index
});

export default async function DashboardPage() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    redirect("/sign-in");
  }

  try {
    const user = await api.user.getCurrentUser();
    const stats = await api.user.getUserStats();

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName ?? user.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Role: <span className="font-medium">{user.role}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Total Interviews
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {stats.totalInterviews}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Completed
            </h3>
            <p className="text-3xl font-bold text-teal-600">
              {stats.completedInterviews}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Average Score
            </h3>
            <p className="text-3xl font-bold text-orange-600">
              {stats.averageScore ? `${stats.averageScore.toFixed(1)}/10` : "N/A"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Interviews
            </h2>
          </div>
          <div className="p-6">
            {stats.recentInterviews.length > 0 ? (
              <div className="space-y-4">
                {stats.recentInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {interview.jobDescription.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {interview.jobDescription.company}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          interview.status === "COMPLETED"
                            ? "bg-teal-100 text-teal-800"
                            : interview.status === "IN_PROGRESS"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {interview.status}
                      </span>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No interviews yet. Start your first interview to see data here!
              </p>
            )}
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Admin Panel
            </h3>
            <p className="text-blue-700">
              You have admin access. Additional admin features will be available here.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
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