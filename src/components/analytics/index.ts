/**
 * Analytics Components
 *
 * Centralized analytics tracking for user behavior and performance monitoring.
 * All analytics are loaded with Next.js Script component using 'afterInteractive' strategy
 * to ensure optimal performance without blocking page loads.
 *
 * Available integrations:
 * - Google Analytics 4 (GA4): Page views, events, user behavior
 * - Microsoft Clarity: Session recordings, heatmaps, user insights
 *
 * ## Setup
 *
 * Add the following environment variables to your `.env.local`:
 *
 * ```env
 * NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 * NEXT_PUBLIC_CLARITY_PROJECT_ID=your-project-id
 * ```
 *
 * Analytics will only load when the respective environment variables are set.
 *
 * ## Usage
 *
 * Import and add to your root layout:
 *
 * ```tsx
 * import { GoogleAnalytics, MicrosoftClarity } from '~/components/analytics';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         {children}
 *         <GoogleAnalytics />
 *         <MicrosoftClarity />
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

export { GoogleAnalytics } from './google-analytics';
export { MicrosoftClarity } from './clarity';
