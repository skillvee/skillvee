import Script from 'next/script';

/**
 * Google Analytics Component
 *
 * Integrates Google Analytics 4 (GA4) for tracking page views, events, and user behavior.
 * Uses Next.js Script component with optimal loading strategies.
 *
 * @see https://analytics.google.com
 */
export function GoogleAnalytics() {
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  // Only render in production or if explicitly enabled
  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Load gtag.js script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />

      {/* Initialize Google Analytics */}
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}
