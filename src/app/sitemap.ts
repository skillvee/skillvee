import { type MetadataRoute } from "next";
import { db } from "~/server/db";

/**
 * Dynamic Sitemap Generator for SkillVee
 *
 * This sitemap automatically includes:
 * 1. Static routes (manually defined below)
 * 2. Dynamic routes from database (public profiles, interviews, cases)
 *
 * IMPORTANT: When adding new static pages:
 * - Add them to the staticRoutes array below
 * - Specify priority (1.0 = highest, 0.1 = lowest)
 * - Choose appropriate changeFrequency
 *
 * Dynamic routes are automatically fetched from the database.
 * No manual updates needed for user profiles, interviews, or cases!
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.skillvee.com";

  // ===== STATIC ROUTES =====
  // Add new pages here with their SEO priorities
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0, // Homepage: Highest priority
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9, // Key conversion page
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9, // Key conversion page
    },
    {
      url: `${baseUrl}/candidates`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9, // Key conversion page
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8, // Important support page
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9, // Core feature
    },
    {
      url: `${baseUrl}/practice/cases`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8, // Practice content
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5, // Legal page
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5, // Legal page
    },
    {
      url: `${baseUrl}/candidate-terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4, // Legal page
    },
    {
      url: `${baseUrl}/company-terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4, // Legal page
    },
  ];

  // ===== DYNAMIC ROUTES FROM DATABASE =====
  try {
    // Fetch public user profiles with their usernames
    const profiles = await db.user.findMany({
      where: {
        // Only include profiles that should be public
        // Add your visibility conditions here (e.g., profile completed, not private)
      },
      select: {
        username: true,
        updatedAt: true,
      },
      take: 1000, // Limit to prevent huge sitemaps
    });

    // Add profile routes
    const profileRoutes: MetadataRoute.Sitemap = profiles
      .filter((profile) => profile.username) // Only profiles with usernames
      .map((profile) => ({
        url: `${baseUrl}/profile/${profile.username}`,
        lastModified: profile.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));

    // Fetch public interview results
    // Note: Only include interviews that should be publicly shareable
    const interviews = await db.interview.findMany({
      where: {
        // Add conditions for public interviews
        // e.g., completed: true, isPublic: true
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 500,
    });

    // Add interview result routes
    const interviewRoutes: MetadataRoute.Sitemap = interviews.map(
      (interview) => ({
        url: `${baseUrl}/interview/results/${interview.id}`,
        lastModified: interview.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.5,
      })
    );

    // Fetch public practice cases
    const cases = await db.interviewCase.findMany({
      where: {
        // Add conditions for public cases
      },
      select: {
        id: true,
        updatedAt: true,
      },
      take: 200,
    });

    // Add case routes
    const caseRoutes: MetadataRoute.Sitemap = cases.map((interviewCase) => ({
      url: `${baseUrl}/interview/case/${interviewCase.id}`,
      lastModified: interviewCase.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Combine all routes
    return [...staticRoutes, ...profileRoutes, ...interviewRoutes, ...caseRoutes];
  } catch (error) {
    // If database query fails, return static routes only
    console.error("Error generating dynamic sitemap routes:", error);
    return staticRoutes;
  }
}
