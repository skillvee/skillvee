import StructuredData from "~/components/seo/StructuredData";
import { generateProductSchema } from "~/lib/seo/schemas/product";

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const candidateProduct = generateProductSchema(
    "SkillVee for Data Scientists",
    "Free AI-powered interview practice, skill validation, and job matching for data scientists. Practice with realistic interviews, get instant feedback, and unlock job opportunities.",
    "0",
    "/pricing",
  );

  const companyProduct = generateProductSchema(
    "SkillVee for Companies",
    "Pre-vetted data science talent with 48-hour placement and 90-day guarantee. Access interview-ready candidates with AI-powered matching. 25% success fee - no upfront costs.",
    "Contact for pricing",
    "/pricing",
  );

  return (
    <>
      <StructuredData
        data={[candidateProduct, companyProduct]}
      />
      {children}
    </>
  );
}
