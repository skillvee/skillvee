import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "~/lib/clerk-theme";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  // Await searchParams in Next.js 15+
  const params = await searchParams;

  // Determine where to redirect after sign-up
  const getRedirectUrl = () => {
    const redirectUrl = params.redirect_url;

    if (redirectUrl) {
      // If coming from practice flow, keep them in practice
      if (redirectUrl.includes("/practice")) {
        return "/practice";
      }
      // For other specific pages, redirect back to that page
      return redirectUrl;
    }

    // Default: if signing up from home/landing, go to job description flow
    return "/job-description";
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignUp
        appearance={clerkAppearance}
        signInUrl={`/sign-in${params.redirect_url ? `?redirect_url=${encodeURIComponent(params.redirect_url)}` : ""}`}
        afterSignUpUrl={getRedirectUrl()}
      />
    </div>
  );
}
