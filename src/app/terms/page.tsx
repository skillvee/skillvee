import Link from "next/link";
import { type Metadata } from "next";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Users, Building2, FileText, ArrowRight } from "lucide-react";
import { generateMetadata as genMeta } from "~/lib/seo/metadata";

export const metadata: Metadata = genMeta({
  title: "Terms of Service - Usage Guidelines",
  description:
    "Review SkillVee's terms of service for candidates and companies. Understand your rights and responsibilities when using our AI-powered interview platform.",
  path: "/terms",
  noIndex: false,
});

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-6 py-4 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
            ← Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms of Service
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the appropriate Terms of Service based on how you're using SkillVee
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Candidate Terms */}
          <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                For Candidates
              </CardTitle>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 w-fit mx-auto">
                Job Seekers & Students
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Terms for individuals using SkillVee to practice interviews, validate skills, and find job opportunities.
              </p>
              <div className="space-y-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>12-month non-circumvention period</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Platform-exclusive communications</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Data usage and privacy rights</span>
                </div>
              </div>
              <Link href="/candidate-terms" target="_blank">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  View Candidate Terms
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Company Terms */}
          <Card className="border-2 border-orange-200 hover:border-orange-300 transition-colors">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl text-gray-900">
                For Companies
              </CardTitle>
              <Badge className="bg-orange-50 text-orange-700 border-orange-200 w-fit mx-auto">
                Employers & Recruiters
              </Badge>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-6">
                Terms for organizations using SkillVee to access candidates, conduct evaluations, and make hiring decisions.
              </p>
              <div className="space-y-3 text-sm text-gray-500 mb-6">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>24-month candidate non-solicitation</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Platform placement fee structure</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Data confidentiality obligations</span>
                </div>
              </div>
              <Link href="/company-terms" target="_blank">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  View Company Terms
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}