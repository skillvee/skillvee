import type { PrismaClient, Company, Institution } from "@prisma/client";
import { BrandfetchService } from "./brandfetch.service";

// Common company suffixes to remove for normalization
const COMPANY_SUFFIXES = [
  "inc", "llc", "ltd", "corp", "corporation", "company", "co",
  "gmbh", "sa", "plc", "ag", "nv", "bv", "srl", "spa", "limited",
  "incorporated", "enterprises", "holdings", "group", "partners",
];

// Common educational suffixes
const EDUCATION_SUFFIXES = [
  "university", "college", "institute", "school", "academy",
  "polytechnic", "community college", "state university",
  "technical institute", "business school",
];

/**
 * Normalize company/institution name for deduplication
 */
export function normalizeOrganizationName(
  name: string,
  type: "company" | "institution" = "company"
): string {
  const suffixes = type === "company" ? COMPANY_SUFFIXES : EDUCATION_SUFFIXES;

  let normalized = name.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, " ") // Replace punctuation with space
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .trim();

  // Remove common suffixes
  suffixes.forEach(suffix => {
    const regex = new RegExp(`\\b${suffix}\\b$`, "i");
    normalized = normalized.replace(regex, "").trim();
  });

  // Remove "the" prefix
  normalized = normalized.replace(/^the\s+/i, "");

  return normalized;
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0]![j] = j;
  }

  // Calculate distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        matrix[i]![j] = matrix[i - 1]![j - 1]!;
      } else {
        matrix[i]![j] = Math.min(
          matrix[i - 1]![j]! + 1,    // deletion
          matrix[i]![j - 1]! + 1,    // insertion
          matrix[i - 1]![j - 1]! + 1 // substitution
        );
      }
    }
  }

  const distance = matrix[len1]![len2]!;
  const maxLength = Math.max(len1, len2);
  return 1 - (distance / maxLength);
}

export class CompanyService {
  private brandfetch: BrandfetchService;

  constructor(
    private db: PrismaClient,
    brandfetchApiKey?: string
  ) {
    this.brandfetch = new BrandfetchService(brandfetchApiKey);
  }

  /**
   * Find existing company using fuzzy matching
   */
  async findSimilarCompany(
    name: string,
    threshold = 0.85
  ): Promise<Company | null> {
    const normalized = normalizeOrganizationName(name, "company");

    // First try exact match on normalized name
    const exact = await this.db.company.findFirst({
      where: {
        OR: [
          { normalizedName: normalized },
          { aliases: { has: normalized } },
        ],
      },
    });

    if (exact) return exact;

    // Then try fuzzy matching on all companies
    const companies = await this.db.company.findMany({
      select: {
        id: true,
        name: true,
        normalizedName: true,
        domain: true,
        logo: true,
        logoUpdatedAt: true,
        verified: true,
        aliases: true,
        brandfetchId: true,
        logoFormat: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const matches = companies
      .map(company => ({
        company,
        similarity: Math.max(
          calculateSimilarity(normalized, company.normalizedName ?? ""),
          ...((company.aliases ?? []).map(alias =>
            calculateSimilarity(normalized, alias)
          ))
        ),
      }))
      .filter(m => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return matches[0]?.company ?? null;
  }

  /**
   * Find or create a company with logo fetching
   */
  async findOrCreateCompany(input: {
    name: string;
    domain?: string;
    skipLogoFetch?: boolean;
    aliases?: string[];
  }): Promise<Company> {
    const normalizedName = normalizeOrganizationName(input.name, "company");

    // 1. Check for existing company
    let company = await this.findSimilarCompany(input.name);

    if (company) {
      // Update domain if we have new info
      if (input.domain && !company.domain) {
        company = await this.db.company.update({
          where: { id: company.id },
          data: { domain: input.domain },
        });
      }

      // Add any new aliases
      if (input.aliases?.length) {
        const newAliases = input.aliases.filter(
          alias => !company.aliases?.includes(alias)
        );
        if (newAliases.length > 0) {
          company = await this.db.company.update({
            where: { id: company.id },
            data: {
              aliases: {
                push: newAliases.map(a => normalizeOrganizationName(a, "company")),
              },
            },
          });
        }
      }

      // Check if logo needs refresh
      if (this.shouldRefreshLogo(company) && !input.skipLogoFetch) {
        void this.refreshCompanyLogo(company);
      }

      return company;
    }

    // 2. Create new company
    company = await this.db.company.create({
      data: {
        name: input.name,
        normalizedName,
        domain: input.domain,
        aliases: input.aliases?.map(a => normalizeOrganizationName(a, "company")) ?? [],
      },
    });

    // 3. Fetch logo asynchronously
    if (!input.skipLogoFetch) {
      void this.fetchAndUpdateLogo(company);
    }

    return company;
  }

  /**
   * Check if logo needs refreshing
   */
  private shouldRefreshLogo(company: Company): boolean {
    // Never refresh manually verified logos
    if (company.verified) return false;

    // Refresh if no logo
    if (!company.logo) return true;

    // Refresh if no update timestamp
    if (!company.logoUpdatedAt) return true;

    // Refresh if older than 30 days
    const daysSinceUpdate = (Date.now() - company.logoUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30;
  }

  /**
   * Refresh company logo
   */
  private async refreshCompanyLogo(company: Company): Promise<void> {
    try {
      // First validate existing logo is still accessible
      if (company.logo) {
        const isValid = await this.brandfetch.validateLogoUrl(company.logo);
        if (isValid) {
          // Just update timestamp
          await this.db.company.update({
            where: { id: company.id },
            data: { logoUpdatedAt: new Date() },
          });
          return;
        }
      }

      // Fetch new logo
      await this.fetchAndUpdateLogo(company);
    } catch (error) {
      console.error(`Failed to refresh logo for ${company.name}:`, error);
    }
  }

  /**
   * Fetch and update company logo
   */
  private async fetchAndUpdateLogo(company: Company): Promise<void> {
    try {
      let logoUrl: string | null = null;
      let brandfetchId: string | null = null;
      let logoFormat = "png";

      // Try domain-based lookup first
      if (company.domain) {
        logoUrl = this.brandfetch.getLogoUrl(company.domain, {
          format: "png",
          height: 200,
        });
        brandfetchId = company.domain;
      } else {
        // Fall back to search
        logoUrl = await this.brandfetch.getLogoWithFallback(company.name, {
          isCompanyName: true,
          format: "png",
          height: 200,
        });

        if (logoUrl?.includes("cdn.brandfetch.io")) {
          // Extract domain from CDN URL
          const match = logoUrl.match(/cdn\.brandfetch\.io\/([^/?]+)/);
          if (match?.[1]) {
            brandfetchId = match[1];
          }
        }
      }

      if (logoUrl) {
        await this.db.company.update({
          where: { id: company.id },
          data: {
            logo: logoUrl,
            brandfetchId,
            logoFormat,
            logoUpdatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`Failed to fetch logo for ${company.name}:`, error);
    }
  }

  /**
   * Manually update company logo and mark as verified
   */
  async manuallyUpdateCompanyLogo(
    companyId: string,
    logoUrl: string,
    domain?: string
  ): Promise<Company> {
    return await this.db.company.update({
      where: { id: companyId },
      data: {
        logo: logoUrl,
        domain,
        verified: true,
        logoUpdatedAt: new Date(),
      },
    });
  }

  /**
   * Batch fetch logos for multiple companies
   */
  async batchFetchLogos(companyIds: string[]): Promise<void> {
    const companies = await this.db.company.findMany({
      where: {
        id: { in: companyIds },
        verified: false,
      },
    });

    // Process in batches to respect rate limits
    const BATCH_SIZE = 10;
    for (let i = 0; i < companies.length; i += BATCH_SIZE) {
      const batch = companies.slice(i, i + BATCH_SIZE);
      await Promise.all(
        batch.map(company => this.fetchAndUpdateLogo(company))
      );

      // Small delay between batches
      if (i + BATCH_SIZE < companies.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
}

/**
 * Similar service for educational institutions
 */
export class InstitutionService {
  private brandfetch: BrandfetchService;

  constructor(
    private db: PrismaClient,
    brandfetchApiKey?: string
  ) {
    this.brandfetch = new BrandfetchService(brandfetchApiKey);
  }

  async findSimilarInstitution(
    name: string,
    threshold = 0.85
  ): Promise<Institution | null> {
    const normalized = normalizeOrganizationName(name, "institution");

    // First try exact match
    const exact = await this.db.institution.findFirst({
      where: {
        OR: [
          { normalizedName: normalized },
          { aliases: { has: normalized } },
        ],
      },
    });

    if (exact) return exact;

    // Fuzzy matching
    const institutions = await this.db.institution.findMany({
      select: {
        id: true,
        name: true,
        normalizedName: true,
        domain: true,
        logo: true,
        logoUpdatedAt: true,
        verified: true,
        aliases: true,
        brandfetchId: true,
        logoFormat: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const matches = institutions
      .map(institution => ({
        institution,
        similarity: Math.max(
          calculateSimilarity(normalized, institution.normalizedName ?? ""),
          ...((institution.aliases ?? []).map(alias =>
            calculateSimilarity(normalized, alias)
          ))
        ),
      }))
      .filter(m => m.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);

    return matches[0]?.institution ?? null;
  }

  async findOrCreateInstitution(input: {
    name: string;
    domain?: string;
    skipLogoFetch?: boolean;
    aliases?: string[];
  }): Promise<Institution> {
    const normalizedName = normalizeOrganizationName(input.name, "institution");

    // Check for existing
    let institution = await this.findSimilarInstitution(input.name);

    if (institution) {
      // Update if needed
      if (input.domain && !institution.domain) {
        institution = await this.db.institution.update({
          where: { id: institution.id },
          data: { domain: input.domain },
        });
      }

      if (this.shouldRefreshLogo(institution) && !input.skipLogoFetch) {
        void this.refreshInstitutionLogo(institution);
      }

      return institution;
    }

    // Create new
    institution = await this.db.institution.create({
      data: {
        name: input.name,
        normalizedName,
        domain: input.domain,
        aliases: input.aliases?.map(a => normalizeOrganizationName(a, "institution")) ?? [],
      },
    });

    if (!input.skipLogoFetch) {
      void this.fetchAndUpdateLogo(institution);
    }

    return institution;
  }

  private shouldRefreshLogo(institution: Institution): boolean {
    if (institution.verified) return false;
    if (!institution.logo) return true;
    if (!institution.logoUpdatedAt) return true;

    const daysSinceUpdate = (Date.now() - institution.logoUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > 30;
  }

  private async refreshInstitutionLogo(institution: Institution): Promise<void> {
    try {
      if (institution.logo) {
        const isValid = await this.brandfetch.validateLogoUrl(institution.logo);
        if (isValid) {
          await this.db.institution.update({
            where: { id: institution.id },
            data: { logoUpdatedAt: new Date() },
          });
          return;
        }
      }

      await this.fetchAndUpdateLogo(institution);
    } catch (error) {
      console.error(`Failed to refresh logo for ${institution.name}:`, error);
    }
  }

  private async fetchAndUpdateLogo(institution: Institution): Promise<void> {
    try {
      let logoUrl: string | null = null;
      let brandfetchId: string | null = null;

      if (institution.domain) {
        logoUrl = this.brandfetch.getLogoUrl(institution.domain, {
          format: "png",
          height: 200,
        });
        brandfetchId = institution.domain;
      } else {
        logoUrl = await this.brandfetch.getLogoWithFallback(institution.name, {
          isCompanyName: false,
          format: "png",
          height: 200,
        });

        if (logoUrl?.includes("cdn.brandfetch.io")) {
          const match = logoUrl.match(/cdn\.brandfetch\.io\/([^/?]+)/);
          if (match?.[1]) {
            brandfetchId = match[1];
          }
        }
      }

      if (logoUrl) {
        await this.db.institution.update({
          where: { id: institution.id },
          data: {
            logo: logoUrl,
            brandfetchId,
            logoFormat: "png",
            logoUpdatedAt: new Date(),
          },
        });
      }
    } catch (error) {
      console.error(`Failed to fetch logo for ${institution.name}:`, error);
    }
  }
}