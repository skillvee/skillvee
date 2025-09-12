import { SignIn } from "@clerk/nextjs";
import { clerkAppearance } from "~/lib/clerk-theme";

export default function SignInPage({
  searchParams,
}: {
  searchParams: { redirect_url?: string };
}) {
  // Determine where to redirect after sign-in
  const getRedirectUrl = () => {
    const redirectUrl = searchParams.redirect_url;
    
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
        signUpUrl={`/sign-up${searchParams.redirect_url ? `?redirect_url=${encodeURIComponent(searchParams.redirect_url)}` : ''}`}
        afterSignInUrl={getRedirectUrl()}
      />
    </div>
  );
}