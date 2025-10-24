import Script from 'next/script';

/**
 * Microsoft Clarity Analytics Component
 *
 * Integrates Microsoft Clarity for session recordings, heatmaps, and user behavior analytics.
 * Uses Next.js Script component with 'afterInteractive' strategy for optimal performance.
 *
 * @see https://clarity.microsoft.com
 */
export function MicrosoftClarity() {
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  // Only render in production or if explicitly enabled
  if (!clarityId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "${clarityId}");
        `,
      }}
    />
  );
}
