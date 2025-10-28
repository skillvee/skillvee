import { type Metadata } from "next";

export const siteConfig = {
  name: "SkillVee",
  description:
    "Turn interview prep into real job offers. Practice with realistic, AI-powered interviews tailored to your target roles and unlock new job opportunities through our partner network.",
  url: "https://www.skillvee.com",
  ogImage: "https://www.skillvee.com/og-image.jpg",
  links: {
    twitter: "https://twitter.com/skillvee",
    github: "https://github.com/skillvee/skillvee",
  },
};

interface GenerateMetadataParams {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function generateMetadata({
  title,
  description,
  path,
  ogImage = siteConfig.ogImage,
  noIndex = false,
  keywords = [],
}: GenerateMetadataParams): Metadata {
  const url = `${siteConfig.url}${path}`;

  return {
    title,
    description,
    keywords: [
      "AI interview practice",
      "data science interviews",
      "technical interview prep",
      "mock interviews",
      "job preparation",
      ...keywords,
    ],
    authors: [{ name: "SkillVee" }],
    creator: "SkillVee",
    metadataBase: new URL(siteConfig.url),
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      title,
      description,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
      creator: "@skillvee",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
