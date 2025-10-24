import "~/styles/globals.css";
import "~/styles/clerk-custom.css";

import { type Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";

import { TRPCReactProvider } from "~/trpc/react";
import AnimationProvider from "~/components/animation-provider";
import { MicrosoftClarity } from "~/components/analytics/clarity";
import { GoogleAnalytics } from "~/components/analytics/google-analytics";

export const metadata: Metadata = {
  title: "SkillVee - AI-Powered Data Science Interview Practice",
  description: "Turn interview prep into real job offers. Practice with realistic, AI-powered interviews tailored to your target roles and unlock new job opportunities through our partner network.",
  icons: [
    { rel: "icon", url: "/Skillvee favicon.png" },
    { rel: "apple-touch-icon", url: "/Skillvee webclip.png" },
  ],
};


export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      appearance={{
        layout: {
          logoPlacement: "none",
          showOptionalFields: false,
          shimmer: false,
          animations: false,
        },
        variables: {
          colorPrimary: "rgb(35, 124, 241)",
        },
        elements: {
          footerPages: {
            display: "none !important",
            visibility: "hidden !important",
            height: "0 !important",
            width: "0 !important",
            overflow: "hidden !important",
            position: "absolute !important",
            left: "-9999px !important",
          },
          footer: {
            display: "none !important",
            visibility: "hidden !important",
            height: "0 !important",
            width: "0 !important",
            overflow: "hidden !important",
            position: "absolute !important",
            left: "-9999px !important",
          },
          badge: {
            display: "none !important",
            visibility: "hidden !important",
            height: "0 !important",
            width: "0 !important",
            overflow: "hidden !important",
            position: "absolute !important",
            left: "-9999px !important",
          },
          rootBox: {
            "&[data-clerk-provider]": {
              "&::after": {
                display: "none !important",
              },
              "&::before": {
                display: "none !important",
              },
            },
          },
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <html lang="en">
        <body>
          <TRPCReactProvider>
            <AnimationProvider>
              {children}
            </AnimationProvider>
          </TRPCReactProvider>
          <GoogleAnalytics />
          <MicrosoftClarity />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                // Comprehensive Clerk branding removal
                const removeClerkBranding = () => {
                  // Visual element selectors
                  const brandingSelectors = [
                    '[data-localization-key="badge__developmentMode"]',
                    '.cl-badge',
                    '.cl-footer',
                    '.cl-footerPages',
                    '[class*="badge"]',
                    '[class*="secured"]',
                    '[class*="development"]',
                    '[class*="cl-footer"]',
                    '[class*="clerk-footer"]',
                    '.clerk-footer',
                    '.clerk-badge',
                    // UserButton specific selectors
                    '.cl-userButtonPopoverFooter',
                    '.cl-userButtonPopover .cl-footer',
                    '.cl-userButtonPopover .cl-footerPages',
                    '.cl-userButtonPopover [class*="badge"]',
                    '.cl-userButtonPopover [class*="secured"]',
                    '.cl-userButtonPopover [class*="development"]',
                    '.cl-userButton .cl-footer',
                    '.cl-userButton .cl-footerPages',
                    '.cl-userButton [class*="badge"]'
                  ];

                  brandingSelectors.forEach(selector => {
                    document.querySelectorAll(selector).forEach(el => {
                      el.style.display = 'none !important';
                      el.style.visibility = 'hidden !important';
                      el.style.height = '0px !important';
                      el.style.width = '0px !important';
                      el.style.overflow = 'hidden !important';
                      el.style.opacity = '0 !important';
                      el.style.position = 'absolute !important';
                      el.style.left = '-9999px !important';
                      el.style.zIndex = '-9999 !important';
                      // Also remove from DOM completely
                      if (el.parentNode) {
                        try {
                          el.parentNode.removeChild(el);
                        } catch (e) {
                          // Ignore errors if element is already removed
                        }
                      }
                    });
                  });

                  // Remove elements containing specific text (more aggressive)
                  document.querySelectorAll('*').forEach(el => {
                    if (el.nodeType === 1 && el.textContent) { // Element nodes only
                      const text = el.textContent.toLowerCase();
                      if (text.includes('development mode') ||
                          text.includes('secured by clerk') ||
                          text.includes('secured by') ||
                          (text.includes('clerk') && text.includes('development')) ||
                          text.includes('clerk.com') ||
                          text.includes('clerk.dev')) {
                        el.style.display = 'none !important';
                        if (el.parentNode && el.textContent.trim() === text.trim()) {
                          try {
                            el.parentNode.removeChild(el);
                          } catch (e) {
                            // Ignore errors
                          }
                        }
                      }
                    }
                  });

                  // Specifically target UserButton dropdowns
                  const userButtonPopover = document.querySelector('.cl-userButtonPopover, .cl-userButton [role="dialog"]');
                  if (userButtonPopover) {
                    // Hide footer in UserButton popover
                    userButtonPopover.querySelectorAll('.cl-footer, .cl-footerPages, [class*="footer"], [class*="badge"]').forEach(el => {
                      el.style.display = 'none !important';
                      if (el.parentNode) {
                        try {
                          el.parentNode.removeChild(el);
                        } catch (e) {}
                      }
                    });

                    // Remove text content with branding
                    userButtonPopover.querySelectorAll('*').forEach(el => {
                      if (el.textContent && (
                          el.textContent.includes('Secured by') ||
                          el.textContent.includes('Development mode'))) {
                        el.style.display = 'none !important';
                        if (el.parentNode) {
                          try {
                            el.parentNode.removeChild(el);
                          } catch (e) {}
                        }
                      }
                    });
                  }

                  // Force blue background only on avatar circle elements (not text in popover)
                  document.querySelectorAll('.cl-avatarBox, .cl-userButtonTrigger').forEach(el => {
                    // Only apply if it's the avatar circle, not text elements in popover
                    if (!el.closest('.cl-userButtonPopover') || el.classList.contains('cl-avatarBox')) {
                      el.style.backgroundColor = 'rgb(35, 124, 241) !important';
                      el.style.color = 'white !important';
                    }
                  });

                  // Specifically ensure text elements in popover don't get blue background
                  document.querySelectorAll('.cl-userButtonPopover .cl-userPreviewMainIdentifier, .cl-userButtonPopover .cl-userPreviewSecondaryIdentifier').forEach(el => {
                    el.style.backgroundColor = 'transparent !important';
                    el.style.color = '#000000 !important';
                  });

                  // Remove any iframes or embeds from Clerk
                  document.querySelectorAll('iframe[src*="clerk"], iframe[src*="clerk.dev"], iframe[src*="clerk.com"]').forEach(el => {
                    if (el.parentNode) {
                      el.parentNode.removeChild(el);
                    }
                  });

                  // Hide React components in dev tools by setting display names
                  if (window.React && window.React.Component) {
                    const originalCreateElement = window.React.createElement;
                    window.React.createElement = function(type, props, ...children) {
                      if (typeof type === 'function' && type.displayName) {
                        if (type.displayName.includes('Clerk') &&
                            (type.displayName.includes('Badge') ||
                             type.displayName.includes('Footer') ||
                             type.displayName.includes('Development'))) {
                          return null;
                        }
                      }
                      return originalCreateElement.apply(this, arguments);
                    };
                  }
                };

                // Enhanced execution schedule
                removeClerkBranding();

                // Multiple timeouts to catch different loading phases
                setTimeout(removeClerkBranding, 50);
                setTimeout(removeClerkBranding, 100);
                setTimeout(removeClerkBranding, 250);
                setTimeout(removeClerkBranding, 500);
                setTimeout(removeClerkBranding, 1000);
                setTimeout(removeClerkBranding, 2000);

                // DOM loaded event
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', removeClerkBranding);
                }

                // Window loaded event
                window.addEventListener('load', removeClerkBranding);

                // Enhanced mutation observer
                const observer = new MutationObserver((mutations) => {
                  let shouldClean = false;
                  mutations.forEach(mutation => {
                    if (mutation.addedNodes.length > 0) {
                      mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) { // Element node
                          const el = node;
                          if (el.className && typeof el.className === 'string') {
                            if (el.className.includes('cl-') ||
                                el.className.includes('clerk') ||
                                el.className.includes('badge') ||
                                el.className.includes('footer')) {
                              shouldClean = true;
                            }
                          }
                          if (el.textContent && (
                              el.textContent.includes('Development mode') ||
                              el.textContent.includes('Secured by'))) {
                            shouldClean = true;
                          }
                        }
                      });
                    }
                  });
                  if (shouldClean) {
                    setTimeout(removeClerkBranding, 10);
                  }
                });

                // Observe the entire document
                observer.observe(document.documentElement, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['class', 'data-localization-key']
                });

                // Also clean on focus/blur in case of lazy loading
                window.addEventListener('focus', removeClerkBranding);
                window.addEventListener('blur', removeClerkBranding);
              `
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
