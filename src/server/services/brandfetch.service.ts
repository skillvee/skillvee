import { z } from "zod";
import type { Company, Institution } from "@prisma/client";

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY;
const BRANDFETCH_API_URL = "https://api.brandfetch.io/v2";
const LOGO_CDN_URL = "https://cdn.brandfetch.io";

// Response schemas
const BrandResponseSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  domain: z.string().optional(),
  logos: z.array(z.object({
    type: z.string(),
    theme: z.string().optional(),
    formats: z.array(z.object({
      src: z.string(),
      format: z.string(),
      height: z.number().optional(),
      width: z.number().optional(),
    })),
  })).optional(),
});

const SearchResponseSchema = z.array(z.object({
  id: z.string().optional(),
  name: z.string(),
  domain: z.string().optional(),
  icon: z.string().optional(),
}));

export interface BrandfetchOptions {
  theme?: "light" | "dark";
  height?: number;
  width?: number;
  format?: "svg" | "png" | "jpg";
}

export class BrandfetchService {
  private apiKey: string | undefined;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly RATE_LIMIT = 1000; // requests per second
  private readonly RATE_WINDOW = 1000; // 1 second in ms

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? BRANDFETCH_API_KEY;
  }

  /**
   * Get direct CDN logo URL without API call
   * This is the most efficient method when domain is known
   */
  getLogoUrl(domain: string, options?: BrandfetchOptions): string {
    const params = new URLSearchParams();
    if (options?.theme) params.append("theme", options.theme);
    if (options?.height) params.append("h", options.height.toString());
    if (options?.width) params.append("w", options.width.toString());
    if (options?.format) params.append("format", options.format);

    const queryString = params.toString();
    return `${LOGO_CDN_URL}/${domain}${queryString ? `?${queryString}` : ""}`;
  }

  /**
   * Fetch detailed brand information via API
   */
  async fetchBrandInfo(identifier: string): Promise<z.infer<typeof BrandResponseSchema>> {
    await this.checkRateLimit();

    if (!this.apiKey) {
      throw new Error("Brandfetch API key not configured");
    }

    const response = await fetch(`${BRANDFETCH_API_URL}/brands/${identifier}`, {
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Brandfetch rate limit exceeded");
      }
      if (response.status === 404) {
        throw new Error(`Brand not found: ${identifier}`);
      }
      throw new Error(`Brandfetch API error: ${response.status}`);
    }

    const data = await response.json();
    return BrandResponseSchema.parse(data);
  }

  /**
   * Search for brands by name
   */
  async searchBrand(query: string): Promise<z.infer<typeof SearchResponseSchema>> {
    await this.checkRateLimit();

    if (!this.apiKey) {
      throw new Error("Brandfetch API key not configured");
    }

    const response = await fetch(
      `${BRANDFETCH_API_URL}/brands/search?query=${encodeURIComponent(query)}`,
      {
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Brandfetch rate limit exceeded");
      }
      throw new Error(`Search failed: ${response.status}`);
    }

    const data = await response.json();
    return SearchResponseSchema.parse(data);
  }

  /**
   * Check and enforce rate limiting
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Reset counter if window has passed
    if (now - this.lastResetTime >= this.RATE_WINDOW) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    // If we're at the limit, wait until next window
    if (this.requestCount >= this.RATE_LIMIT) {
      const waitTime = this.RATE_WINDOW - (now - this.lastResetTime);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestCount = 0;
        this.lastResetTime = Date.now();
      }
    }

    this.requestCount++;
  }

  /**
   * Get logo with fallback to search if domain is unknown
   */
  async getLogoWithFallback(
    nameOrDomain: string,
    options?: BrandfetchOptions & { isCompanyName?: boolean }
  ): Promise<string | null> {
    try {
      // If it looks like a domain, try direct CDN first
      if (!options?.isCompanyName && nameOrDomain.includes(".")) {
        return this.getLogoUrl(nameOrDomain, options);
      }

      // Otherwise, search for the brand
      const searchResults = await this.searchBrand(nameOrDomain);
      if (searchResults.length > 0) {
        const firstResult = searchResults[0];
        if (firstResult?.domain) {
          return this.getLogoUrl(firstResult.domain, options);
        }
        if (firstResult?.icon) {
          return firstResult.icon;
        }
      }

      return null;
    } catch (error) {
      console.error(`Failed to fetch logo for ${nameOrDomain}:`, error);
      return null;
    }
  }

  /**
   * Validate if a logo URL is still accessible
   */
  async validateLogoUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}