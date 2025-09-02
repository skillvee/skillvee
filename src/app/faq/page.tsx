import { currentUser } from "@clerk/nextjs/server";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { ChevronLeft, Search, BookOpen, Users, Target, Settings, CreditCard } from "lucide-react";

export default async function FAQPage() {
  const user = await currentUser();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/skillvee-logo.png?v=2" 
                alt="SkillVee" 
                width={120} 
                height={32}
                className="object-contain"
                priority
              />
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/companies" className="text-gray-600 hover:text-gray-900">
                Companies
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link href="/faq" className="text-blue-600 font-medium">
                FAQ
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <UserButton />
              </div>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button variant="outline">Log in</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-blue-600 hover:bg-blue-700">Sign up</Button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center mb-6">
            <Link href="/" className="flex items-center text-blue-600 hover:text-blue-700">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Find answers to all your questions about SkillVee
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          
          {/* Getting Started */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How do I sign up for SkillVee?
                  </h3>
                  <p className="text-gray-600">
                    Simply click "Sign up" in the top navigation. You can create an account using your email or Google account. No credit card required - everything is completely free.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Do I need any experience to start?
                  </h3>
                  <p className="text-gray-600">
                    Not at all! SkillVee is designed for everyone from complete beginners to experienced professionals. Our AI adapts to your level and helps you progress at your own pace.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What should I expect in my first interview session?
                  </h3>
                  <p className="text-gray-600">
                    Your first session will be an assessment to understand your current level. The AI will ask a mix of basic questions across different areas (Python, SQL, statistics, behavioral) and provide gentle feedback to help you improve.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Interview Practice */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <Search className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI Interview Practice</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How realistic are the AI interviews?
                  </h3>
                  <p className="text-gray-600">
                    Very realistic! Our AI is trained on thousands of actual interview questions from top tech companies. It conducts structured interviews with follow-up questions, technical challenges, and behavioral scenarios that mirror real interview experiences.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What types of questions can I practice?
                  </h3>
                  <p className="text-gray-600">
                    We cover all major areas: <strong>Technical Skills</strong> (Python, SQL, R, machine learning algorithms, statistics), <strong>Case Studies</strong> (business problems, A/B testing, data analysis), <strong>Behavioral Questions</strong> (leadership, problem-solving, communication), and <strong>Company-Specific</strong> scenarios based on actual interview patterns.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I choose specific companies to practice for?
                  </h3>
                  <p className="text-gray-600">
                    Yes! You can select from our database of 500+ companies including Google, Meta, Amazon, Microsoft, Netflix, and many others. Each company has customized question sets based on their actual interview processes.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How does the AI provide feedback?
                  </h3>
                  <p className="text-gray-600">
                    After each answer, the AI provides immediate feedback on technical accuracy, communication clarity, and areas for improvement. You'll also receive a detailed report after each session with personalized recommendations for further study.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I retake interviews or practice the same questions?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! You can practice as many times as you want. Each session may include some repeat questions to track your improvement, plus new questions to expand your experience.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Job Matching & Opportunities */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Job Matching & Opportunities</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How does the job matching work?
                  </h3>
                  <p className="text-gray-600">
                    As you practice and demonstrate your skills, our AI builds a verified profile of your abilities. We then connect you with companies in our partner network who are actively hiring for roles that match your validated skills and experience level.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Will companies actually contact me?
                  </h3>
                  <p className="text-gray-600">
                    Yes! We have partnerships with 500+ companies ranging from startups to Fortune 500 companies. When your skills match their needs, recruiters and hiring managers can reach out directly through our platform.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How long does it take to get matched with opportunities?
                  </h3>
                  <p className="text-gray-600">
                    It varies based on your skill level and market demand. Typically, users who practice consistently see their first opportunities within 2-4 weeks. Our average match time is 48 hours once your profile reaches the threshold for matching.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I control what types of jobs I'm matched with?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely! You can set preferences for company size, industry, location (remote/hybrid/onsite), salary range, and specific roles. You can also pause matching at any time if you're not currently looking.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What happens when a company expresses interest?
                  </h3>
                  <p className="text-gray-600">
                    You'll receive a notification and can review the opportunity. If interested, you can connect directly with the company. If not, simply decline and continue practicing - there's no pressure or obligation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Pricing & Features */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <CreditCard className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Pricing & Features</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is SkillVee really completely free?
                  </h3>
                  <p className="text-gray-600">
                    Yes! All core features - AI interview practice, skill validation, and job matching - are completely free. No hidden fees, no premium tiers, no credit card required. We believe everyone should have access to quality career opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    How do you make money if it's free for users?
                  </h3>
                  <p className="text-gray-600">
                    We partner with companies who pay us when they successfully hire through our platform. This aligns our incentives - we only succeed when you succeed in finding a great job.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Are there any usage limits?
                  </h3>
                  <p className="text-gray-600">
                    No daily or monthly limits on practice sessions. You can use SkillVee as much as you want. The only "limit" is that we focus on quality matches rather than quantity when connecting you with opportunities.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Will this always be free?
                  </h3>
                  <p className="text-gray-600">
                    Yes, our core platform will remain free. We may introduce premium features in the future (like 1-on-1 coaching or advanced analytics), but the essential interview practice and job matching will always be available at no cost.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Technical & Privacy */}
          <div className="mb-12">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Technical & Privacy</h2>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What information do you collect about me?
                  </h3>
                  <p className="text-gray-600">
                    We collect your interview responses to assess your skills, basic profile information (experience level, interests), and performance data to improve our AI. We never sell your personal data to third parties.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Is my practice data private?
                  </h3>
                  <p className="text-gray-600">
                    Yes. Your individual practice sessions are private. Companies only see your validated skill levels and overall performance metrics, not your specific answers or practice history.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What browsers and devices are supported?
                  </h3>
                  <p className="text-gray-600">
                    SkillVee works on all modern browsers (Chrome, Safari, Firefox, Edge) and is optimized for both desktop and mobile devices. For the best experience, we recommend using a desktop or laptop for interview practice.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Can I delete my account and data?
                  </h3>
                  <p className="text-gray-600">
                    Absolutely. You can delete your account at any time from your settings page. This will remove all your personal data, though we may retain aggregated, anonymized data for improving our AI.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact & Support */}
          <div className="text-center py-12 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              We're here to help! Reach out to our support team anytime.
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="mailto:support@skillvee.com">
                  Email Support
                </Link>
              </Button>
              <Button asChild>
                <Link href="/">
                  Start Practicing
                </Link>
              </Button>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}