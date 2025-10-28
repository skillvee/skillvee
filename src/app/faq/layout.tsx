import { type Metadata } from "next";
import { generateMetadata as genMeta } from "~/lib/seo/metadata";
import StructuredData from "~/components/seo/StructuredData";
import { generateFAQPageSchema } from "~/lib/seo/schemas/faq";
import { faqData } from "./faq-data";

export const metadata: Metadata = genMeta({
  title: "FAQ - Frequently Asked Questions",
  description:
    "Find answers to common questions about SkillVee's AI-powered interview practice platform. Learn about our features, pricing, interview process, and how we help data scientists land their dream jobs.",
  path: "/faq",
  keywords: [
    "interview practice FAQ",
    "AI interview questions",
    "mock interview help",
    "data science career questions",
    "interview platform support",
  ],
});

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <StructuredData data={generateFAQPageSchema(faqData)} />
      {children}
    </>
  );
}
