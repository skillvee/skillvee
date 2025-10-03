# Brandfetch Logo Integration Strategy

## Overview
Integration of Brandfetch API to automatically fetch and update company/institution logos when users upload resumes or add work/education experiences.

## Key Challenges & Solutions

### 1. Company Name Deduplication Strategy

**Problem:** Slight variations in company names (e.g., "Google", "Google LLC", "Google Inc.")

**Solution: Multi-layered approach**
```typescript
// 1. Normalized name column in database
interface CompanySchema {
  id: string
  name: string              // Original name as entered
  normalizedName: string    // Lowercase, no punctuation, no common suffixes
  domain?: string          // Company domain for Brandfetch API
  brandfetchId?: string    // Cached Brandfetch identifier
  logo?: string           // Current logo URL
  logoUpdatedAt?: Date    // Last logo fetch timestamp
}

// 2. Normalization function
function normalizeCompanyName(name: string): string {
  const suffixes = ['inc', 'llc', 'ltd', 'corp', 'corporation', 'company', 'co', 'gmbh', 'sa', 'plc']
  let normalized = name.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '') // Remove punctuation
    .trim()

  // Remove common suffixes
  suffixes.forEach(suffix => {
    const regex = new RegExp(`\\b${suffix}\\b$`, 'i')
    normalized = normalized.replace(regex, '').trim()
  })

  return normalized
}

// 3. Fuzzy matching for similar names
import { distance } from 'fastest-levenshtein'

function findSimilarCompany(name: string, threshold = 0.85): Promise<Company | null> {
  const normalized = normalizeCompanyName(name)

  // First try exact match on normalized name
  const exact = await db.company.findFirst({
    where: { normalizedName: normalized }
  })
  if (exact) return exact

  // Then try fuzzy matching
  const companies = await db.company.findMany()
  const matches = companies.map(company => ({
    company,
    similarity: 1 - (distance(normalized, company.normalizedName) / Math.max(normalized.length, company.normalizedName.length))
  }))

  const bestMatch = matches.filter(m => m.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)[0]

  return bestMatch?.company ?? null
}
```

### 2. Logo Fetching & Caching Strategy

**Brandfetch API Integration:**
```typescript
// src/server/services/brandfetch.service.ts
import { z } from 'zod'

const BRANDFETCH_API_KEY = process.env.BRANDFETCH_API_KEY
const BRANDFETCH_API_URL = 'https://api.brandfetch.io/v2'
const LOGO_CDN_URL = 'https://cdn.brandfetch.io'

interface BrandfetchOptions {
  domain?: string
  companyName?: string
}

export class BrandfetchService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  // Method 1: Direct CDN Link (no API call needed, but requires domain)
  getLogoUrl(domain: string, options?: { theme?: 'light' | 'dark', height?: number }) {
    const params = new URLSearchParams()
    if (options?.theme) params.append('theme', options.theme)
    if (options?.height) params.append('h', options.height.toString())

    return `${LOGO_CDN_URL}/${domain}?${params.toString()}`
  }

  // Method 2: API lookup (when we need to search or get more info)
  async fetchBrandInfo(identifier: string) {
    const response = await fetch(`${BRANDFETCH_API_URL}/brands/${identifier}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded')
      }
      throw new Error(`Brandfetch API error: ${response.status}`)
    }

    return response.json()
  }

  // Search for brand by name when domain is unknown
  async searchBrand(query: string) {
    const response = await fetch(`${BRANDFETCH_API_URL}/brands/search?query=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    return response.json()
  }
}
```

### 3. Database Schema Updates

```prisma
// Update Company model
model Company {
  id              String           @id @default(cuid())
  name            String           @unique
  normalizedName  String           // New: for deduplication
  domain          String?          // New: company domain
  brandfetchId    String?          // New: Brandfetch brand ID
  logo            String?
  logoFormat      String?          // New: 'svg', 'png', etc.
  logoUpdatedAt   DateTime?        // New: track freshness
  verified        Boolean          @default(false) // New: manually verified
  aliases         String[]         @default([]) // New: alternative names
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  workExperiences WorkExperience[]

  @@index([normalizedName])
  @@index([domain])
  @@map("companies")
}

// Similar updates for Institution model
model Institution {
  id             String      @id @default(cuid())
  name           String      @unique
  normalizedName String      // New
  domain         String?     // New
  brandfetchId   String?     // New
  logo           String?
  logoFormat     String?     // New
  logoUpdatedAt  DateTime?   // New
  verified       Boolean     @default(false) // New
  aliases        String[]    @default([]) // New
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  educations     Education[]

  @@index([normalizedName])
  @@index([domain])
  @@map("institutions")
}
```

### 4. Implementation Flow

```typescript
// src/server/services/company.service.ts
export class CompanyService {
  private brandfetch: BrandfetchService
  private db: PrismaClient

  constructor(db: PrismaClient) {
    this.db = db
    this.brandfetch = new BrandfetchService(process.env.BRANDFETCH_API_KEY!)
  }

  async findOrCreateCompany(input: {
    name: string
    domain?: string
    skipLogoFetch?: boolean
  }): Promise<Company> {
    const normalizedName = normalizeCompanyName(input.name)

    // 1. Check for existing company
    let company = await this.findSimilarCompany(input.name)

    if (company) {
      // Update if we have new domain info
      if (input.domain && !company.domain) {
        company = await this.db.company.update({
          where: { id: company.id },
          data: { domain: input.domain }
        })
      }

      // Check if logo needs refresh (older than 30 days)
      if (this.shouldRefreshLogo(company) && !input.skipLogoFetch) {
        await this.refreshCompanyLogo(company)
      }

      return company
    }

    // 2. Create new company
    company = await this.db.company.create({
      data: {
        name: input.name,
        normalizedName,
        domain: input.domain,
      }
    })

    // 3. Fetch logo asynchronously (don't block the request)
    if (!input.skipLogoFetch) {
      this.fetchAndUpdateLogo(company).catch(err => {
        console.error(`Failed to fetch logo for ${company.name}:`, err)
      })
    }

    return company
  }

  private shouldRefreshLogo(company: Company): boolean {
    if (!company.logo) return true
    if (!company.logoUpdatedAt) return true

    const daysSinceUpdate = (Date.now() - company.logoUpdatedAt.getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceUpdate > 30 // Refresh every 30 days
  }

  private async fetchAndUpdateLogo(company: Company): Promise<void> {
    try {
      let logoUrl: string | null = null
      let brandfetchId: string | null = null

      // Try domain-based lookup first
      if (company.domain) {
        logoUrl = this.brandfetch.getLogoUrl(company.domain)
        brandfetchId = company.domain
      } else {
        // Fall back to search
        const searchResults = await this.brandfetch.searchBrand(company.name)
        if (searchResults?.[0]) {
          const brand = searchResults[0]
          brandfetchId = brand.id || brand.domain
          if (brand.domain) {
            logoUrl = this.brandfetch.getLogoUrl(brand.domain)
          }
        }
      }

      if (logoUrl) {
        await this.db.company.update({
          where: { id: company.id },
          data: {
            logo: logoUrl,
            brandfetchId,
            logoUpdatedAt: new Date(),
          }
        })
      }
    } catch (error) {
      // Log but don't fail the main operation
      console.error(`Logo fetch failed for ${company.name}:`, error)
    }
  }
}
```

### 5. Resume Parsing Integration

```typescript
// When processing resume upload
async function processResumeCompanies(resumeData: ParsedResume) {
  const companyService = new CompanyService(db)

  // Process work experiences
  for (const work of resumeData.workExperiences) {
    const company = await companyService.findOrCreateCompany({
      name: work.companyName,
      domain: work.companyDomain, // If extracted from email/LinkedIn
    })

    // Create work experience with company reference
    await db.workExperience.create({
      data: {
        userId: resumeData.userId,
        companyId: company.id,
        title: work.title,
        // ... other fields
      }
    })
  }

  // Similar for educational institutions
  for (const edu of resumeData.education) {
    const institution = await institutionService.findOrCreateInstitution({
      name: edu.schoolName,
      domain: edu.schoolDomain,
    })

    // ... create education record
  }
}
```

### 6. Rate Limiting & Error Handling

```typescript
// src/server/services/brandfetch-queue.service.ts
import { Queue } from 'bullmq'

// Use a queue for batch logo updates to respect rate limits
export const logoFetchQueue = new Queue('logo-fetch', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  },
})

// Worker to process logo fetches
logoFetchQueue.process(async (job) => {
  const { companyId, domain, name } = job.data
  const brandfetch = new BrandfetchService(process.env.BRANDFETCH_API_KEY!)

  // Rate limiting: 1000 requests/second max
  await rateLimiter.consume(1)

  // Fetch and update logo
  // ... implementation
})
```

### 7. Manual Override System

```typescript
// Allow manual logo updates and mark as verified
async function manuallyUpdateCompanyLogo(
  companyId: string,
  logoUrl: string,
  domain?: string
) {
  return await db.company.update({
    where: { id: companyId },
    data: {
      logo: logoUrl,
      domain,
      verified: true, // Won't be auto-updated
      logoUpdatedAt: new Date(),
    }
  })
}
```

## Best Practices

1. **Batch Processing**: When importing multiple companies (e.g., from bulk resume upload), batch the Brandfetch API calls
2. **Graceful Degradation**: Always handle logo fetch failures gracefully - don't block core functionality
3. **User Corrections**: Allow users to manually correct company matches and logos
4. **Caching Strategy**: Cache logos locally or use CDN to reduce Brandfetch API calls
5. **Domain Extraction**: Try to extract company domains from LinkedIn URLs or email addresses in resumes for better matching

## Environment Variables

```env
# .env.local
BRANDFETCH_API_KEY=your_api_key_here
BRANDFETCH_CACHE_DAYS=30
BRANDFETCH_RATE_LIMIT=1000
```

## Migration Steps

1. Add new columns to Company and Institution tables
2. Run normalization on existing company names
3. Implement the service layer
4. Add background job for batch logo fetching
5. Update UI components to display logos with fallbacks
6. Add admin interface for manual corrections

## API Usage Estimation

- Free tier: 250 requests
- For initial setup with existing companies: ~100-200 requests
- Ongoing: ~10-20 requests per day for new companies
- Consider paid plan if scaling beyond 250 companies/month