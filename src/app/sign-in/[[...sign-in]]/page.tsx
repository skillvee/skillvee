import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "~/lib/clerk-theme";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string }>;
}) {
  // Await searchParams in Next.js 15+
  const params = await searchParams;
  
  // Determine where to redirect after sign-in
  const getRedirectUrl = () => {
    const redirectUrl = params.redirect_url;
    
    if (redirectUrl) {
      // If coming from practice flow, keep them in practice
      if (redirectUrl.includes('/practice')) {
        return '/practice';
      }
      // If coming from home page, return to home
      if (redirectUrl === '/' || redirectUrl.includes('localhost:3000')) {
        return '/';
      }
      // For other specific pages, redirect back to that page
      return redirectUrl;
    }
    
    // Default: if signing in without context, go to job description flow
    return '/job-description';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <SignIn 
        appearance={clerkAppearance}
        signUpUrl={`/sign-up${params.redirect_url ? `?redirect_url=${encodeURIComponent(params.redirect_url)}` : ''}`}
        afterSignInUrl={getRedirectUrl()}
      />
    </div>
  );
}