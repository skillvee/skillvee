import { siteConfig } from "../metadata";

export interface ProductOffer {
  "@type": string;
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
  priceValidUntil?: string;
  availability?: string;
}

export interface ProductSchema {
  "@context": string;
  "@type": string;
  name: string;
  description: string;
  url: string;
  offers: ProductOffer;
}

export function generateProductSchema(
  name: string,
  description: string,
  price: string,
  url: string,
): Record<string, unknown> {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url: `${siteConfig.url}${url}`,
    offers: {
      "@type": "Offer",
      name,
      description,
      price,
      priceCurrency: "USD",
      priceValidUntil: nextYear.toISOString().split("T")[0],
      availability: "https://schema.org/InStock",
    },
  };
}
