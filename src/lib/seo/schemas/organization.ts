import { siteConfig } from "../metadata";

export interface OrganizationSchema {
  "@context": string;
  "@type": string;
  name: string;
  url: string;
  logo?: string;
  description: string;
  sameAs?: string[];
  contactPoint?: {
    "@type": string;
    contactType: string;
    email?: string;
  };
}

export function generateOrganizationSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/Skillvee favicon.png`,
    description: siteConfig.description,
    sameAs: [
      siteConfig.links.github,
      // Add more social links when available
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      // email: "support@skillvee.com", // Add when available
    },
  };
}
