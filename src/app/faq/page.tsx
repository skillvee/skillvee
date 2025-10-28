"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, MessageSquare, BookOpen, Users, CreditCard, Shield, ChevronRight } from "lucide-react";
import Navigation from "~/components/navigation";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: React.ReactNode;
  color: string;
  items: FAQItem[];
}

function FAQAccordion({ item, index }: { item: FAQItem; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white border-2 border-gray-100 hover:border-blue-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-blue-50/50 transition-colors"
      >
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-primary font-bold text-sm">Q</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-lg pr-4">{item.question}</h3>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-5 animate-fade-in">
          <div className="pl-12 text-gray-600 leading-relaxed">{item.answer}</div>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  const faqSections: FAQSection[] = [
    {
      title: "Getting Started",
      icon: <BookOpen className="w-6 h-6 text-blue-600" />,
      color: "blue",
      items: [
        {
          question: "How do I sign up for SkillVee?",
          answer: "Simply click \"Sign up\" in the top navigation. You can create an account using your email or Google account. No credit card required - everything is completely free."
        },
        {
          question: "Do I need any experience to start?",
          answer: "Not at all! SkillVee is designed for everyone from complete beginners to experienced professionals. Our AI adapts to your level and helps you progress at your own pace."
        },
        {
          question: "What should I expect in my first interview session?",
          answer: "Your first session will be an assessment to understand your current level. The AI will ask a mix of basic questions across different areas (Python, SQL, statistics, behavioral) and provide gentle feedback to help you improve."
        }
      ]
    },
    {
      title: "AI Interview Practice",
      icon: <MessageSquare className="w-6 h-6 text-blue-600" />,
      color: "blue",
      items: [
        {
          question: "How realistic are the AI interviews?",
          answer: "Very realistic! Our AI is trained on thousands of actual interview questions from top tech companies. It conducts structured interviews with follow-up questions, technical challenges, and behavioral scenarios that mirror real interview experiences."
        },
        {
          question: "What types of questions can I practice?",
          answer: "We cover all major areas: Technical Skills (Python, SQL, R, machine learning algorithms, statistics), Case Studies (business problems, A/B testing, data analysis), Behavioral Questions (leadership, problem-solving, communication), and Company-Specific scenarios based on actual interview patterns."
        },
        {
          question: "Can I choose specific companies to practice for?",
          answer: "Yes! You can select from our database of 500+ companies including Google, Meta, Amazon, Microsoft, Netflix, and many others. Each company has customized question sets based on their actual interview processes."
        },
        {
          question: "How does the AI provide feedback?",
          answer: "After each answer, the AI provides immediate feedback on technical accuracy, communication clarity, and areas for improvement. You'll also receive a detailed report after each session with personalized recommendations for further study."
        },
        {
          question: "Can I retake interviews or practice the same questions?",
          answer: "Absolutely! You can practice as many times as you want. Each session may include some repeat questions to track your improvement, plus new questions to expand your experience."
        }
      ]
    },
    {
      title: "Job Matching & Opportunities",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: "blue",
      items: [
        {
          question: "How does the job matching work?",
          answer: "As you practice and demonstrate your skills, our AI builds a verified profile of your abilities. We then connect you with companies in our partner network who are actively hiring for roles that match your validated skills and experience level."
        },
        {
          question: "How long does it take to get matched with opportunities?",
          answer: "It varies based on your skill level and market demand. Typically, users who practice consistently see their first opportunities within 2-4 weeks."
        },
        {
          question: "What happens when a company expresses interest?",
          answer: "You'll receive a notification and can review the opportunity. If interested, you can connect directly with the company. If not, simply decline and continue practicing - there's no pressure or obligation."
        }
      ]
    },
    {
      title: "Pricing & Features",
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      color: "blue",
      items: [
        {
          question: "Is SkillVee really completely free?",
          answer: "Yes! All core features - AI interview practice, skill validation, and job matching - are completely free. No hidden fees, no premium tiers, no credit card required. We believe everyone should have access to quality career opportunities."
        },
        {
          question: "How do you make money if it's free for users?",
          answer: "We partner with companies who pay us when they successfully hire through our platform. This aligns our incentives - we only succeed when you succeed in finding a great job."
        },
        {
          question: "Are there any usage limits?",
          answer: "No daily or monthly limits on practice sessions. You can use SkillVee as much as you want. The only \"limit\" is that we focus on quality matches rather than quantity when connecting you with opportunities."
        },
        {
          question: "Will this always be free?",
          answer: "Yes, our core platform will remain free. We may introduce premium features in the future (like 1-on-1 coaching or advanced analytics), but the essential interview practice and job matching will always be available at no cost."
        }
      ]
    },
    {
      title: "Technical & Privacy",
      icon: <Shield className="w-6 h-6 text-blue-600" />,
      color: "blue",
      items: [
        {
          question: "What information do you collect about me?",
          answer: "We collect your interview responses to assess your skills, basic profile information (experience level, interests), and performance data to improve our AI. We never sell your personal data to third parties."
        },
        {
          question: "Is my practice data private?",
          answer: "Yes. Your individual practice sessions are private. Companies only see your validated skill levels and overall performance metrics, not your specific answers or practice history."
        },
        {
          question: "What browsers and devices are supported?",
          answer: "SkillVee works on all modern browsers (Chrome, Safari, Firefox, Edge) and is optimized for both desktop and mobile devices. For the best experience, we recommend using a desktop or laptop for interview practice."
        },
        {
          question: "Can I delete my account and data?",
          answer: "Absolutely. You can delete your account at any time from your settings page. This will remove all your personal data, though we may retain aggregated, anonymized data for improving our AI."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <Navigation currentPage="faq" />

      {/* Hero Section - Matching Homepage Style */}
      <section className="relative overflow-hidden bg-white">
        {/* Animated Background - Similar to Homepage */}
        <div className="absolute inset-0 opacity-5 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-pulse duration-3000">
            <div className="font-mono text-sm text-blue-600">
              def get_answer():<br/>
              &nbsp;&nbsp;&nbsp;&nbsp;return clarity
            </div>
          </div>
          <div className="absolute top-40 right-20 animate-pulse duration-4000 delay-1000">
            <div className="font-mono text-sm text-green-600">
              SELECT * FROM questions<br/>
              WHERE answered = true
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-6 py-16 sm:py-20 relative z-10">
          <div className="text-center">
            {/* Badge - Matching Homepage Style */}
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 w-fit mx-auto mb-6 animate-bounce-in hover:scale-105 transition-transform duration-300">
              📚 Knowledge Base
            </Badge>

            {/* Title - Matching Homepage Style */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6 animate-slide-up">
              <span className="text-gray-900">Get answers to your </span>
              <span className="text-primary bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">questions</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto mb-8 animate-fade-in-delay">
              Everything you need to know about SkillVee, from getting started to landing your dream job
            </p>

            {/* Quick Links */}
            <div className="flex flex-wrap justify-center gap-3 animate-fade-in-delay-2">
              <Button
                variant="outline"
                className="bg-white border border-primary text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                onClick={() => {
                  const element = document.getElementById('getting-started');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Getting Started
              </Button>
              <Button
                variant="outline"
                className="bg-white border border-primary text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                onClick={() => {
                  const element = document.getElementById('pricing');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Pricing Info
              </Button>
              <Button
                variant="outline"
                className="bg-white border border-primary text-primary hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                onClick={() => {
                  const element = document.getElementById('jobs');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Job Matching
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Content - Updated Style */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-6">
          <div className="space-y-16">
            {faqSections.map((section, sectionIndex) => (
              <div
                key={sectionIndex}
                id={
                  section.title === "Getting Started" ? "getting-started" :
                  section.title === "Pricing & Features" ? "pricing" :
                  section.title === "Job Matching & Opportunities" ? "jobs" :
                  section.title.toLowerCase().replace(/ /g, '-')
                }
                className="animate-on-scroll"
              >
                {/* Section Header - Matching Homepage Style */}
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                    {section.icon}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  {section.items.map((item, itemIndex) => (
                    <FAQAccordion
                      key={itemIndex}
                      item={item}
                      index={itemIndex}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Matching Homepage Style */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-blue-500 via-blue-600 to-blue-800 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 border border-white rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 border border-white rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-6 text-center relative z-10">
          <Badge className="bg-yellow-400 text-yellow-900 mb-6 sm:mb-8 text-sm font-semibold">
            💡 Still have questions?
          </Badge>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            We're here to <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">help</span>
          </h2>

          <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Can't find what you're looking for? Our support team is ready to assist you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-white/10 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300 hover:scale-105"
            >
              <Link href="mailto:support@skillvee.com">
                Email Support
              </Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-gray-50 shadow-xl font-semibold transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/practice">
                Start Practicing Free
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}