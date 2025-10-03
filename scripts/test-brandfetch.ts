#!/usr/bin/env tsx

/**
 * Test script for Brandfetch integration and company deduplication
 * Run with: npx tsx scripts/test-brandfetch.ts
 */

import { PrismaClient } from "@prisma/client";
import { BrandfetchService } from "../src/server/services/brandfetch.service";
import { CompanyService, normalizeOrganizationName } from "../src/server/services/company.service";

const prisma = new PrismaClient();

// Test cases for company name normalization
const testCompanyNames = [
  { input: "Google Inc.", expected: "google" },
  { input: "Google LLC", expected: "google" },
  { input: "Microsoft Corporation", expected: "microsoft" },
  { input: "Apple Inc", expected: "apple" },
  { input: "The Goldman Sachs Group, Inc.", expected: "goldman sachs group" },
  { input: "JPMorgan Chase & Co.", expected: "jpmorgan chase" },
  { input: "Meta Platforms, Inc.", expected: "meta platforms" },
  { input: "Amazon.com, Inc.", expected: "amazon com" },
  { input: "Tesla, Inc.", expected: "tesla" },
  { input: "NVIDIA Corporation", expected: "nvidia" },
];

// Test cases for similar company detection
const similarCompanies = [
  ["Google", "Google Inc", "Google LLC", "Google Inc."],
  ["Microsoft", "Microsoft Corp", "Microsoft Corporation"],
  ["Goldman Sachs", "The Goldman Sachs Group", "Goldman Sachs & Co"],
];

async function testNormalization() {
  console.log("\n🧪 Testing Company Name Normalization\n");
  console.log("-".repeat(50));

  for (const test of testCompanyNames) {
    const normalized = normalizeOrganizationName(test.input, "company");
    const passed = normalized === test.expected;
    console.log(
      `${passed ? "✅" : "❌"} "${test.input}" → "${normalized}" ${
        passed ? "" : `(expected: "${test.expected}")`
      }`
    );
  }
}

async function testBrandfetchCDN() {
  console.log("\n🖼️  Testing Brandfetch CDN URL Generation\n");
  console.log("-".repeat(50));

  const brandfetch = new BrandfetchService();

  const testDomains = [
    "google.com",
    "microsoft.com",
    "apple.com",
    "github.com",
    "vercel.com",
  ];

  for (const domain of testDomains) {
    const logoUrl = brandfetch.getLogoUrl(domain, {
      format: "png",
      height: 200,
    });
    console.log(`${domain}: ${logoUrl}`);
  }
}

async function testCompanyDeduplication() {
  console.log("\n🔍 Testing Company Deduplication\n");
  console.log("-".repeat(50));

  const companyService = new CompanyService(prisma);

  for (const group of similarCompanies) {
    console.log(`\nTesting group: ${group.join(", ")}`);

    // Create first company
    const firstCompany = await companyService.findOrCreateCompany({
      name: group[0]!,
      skipLogoFetch: true, // Skip for testing
    });
    console.log(`Created: ${firstCompany.name} (ID: ${firstCompany.id})`);

    // Try to create similar companies (should find existing)
    for (let i = 1; i < group.length; i++) {
      const company = await companyService.findOrCreateCompany({
        name: group[i]!,
        skipLogoFetch: true,
      });

      const isMatch = company.id === firstCompany.id;
      console.log(
        `${isMatch ? "✅ Matched" : "❌ Created New"}: "${group[i]}" → ${
          company.name
        } (ID: ${company.id})`
      );
    }
  }
}

async function testLogoFetching() {
  console.log("\n🎨 Testing Logo Fetching\n");
  console.log("-".repeat(50));

  const brandfetch = new BrandfetchService();

  const testCompanies = [
    { name: "Google", domain: "google.com" },
    { name: "Microsoft", domain: "microsoft.com" },
    { name: "OpenAI", domain: "openai.com" },
    { name: "Anthropic", domain: "anthropic.com" },
    { name: "Vercel", domain: "vercel.com" },
  ];

  for (const company of testCompanies) {
    try {
      const logoUrl = await brandfetch.getLogoWithFallback(company.domain);
      console.log(`✅ ${company.name}: ${logoUrl}`);
    } catch (error) {
      console.log(`❌ ${company.name}: Failed to fetch logo`);
    }
  }
}

async function testFullIntegration() {
  console.log("\n🚀 Testing Full Integration\n");
  console.log("-".repeat(50));

  const companyService = new CompanyService(prisma);

  // Test creating a company with logo fetching
  const company = await companyService.findOrCreateCompany({
    name: "Skillvee Test Company",
    domain: "skillvee.com",
    skipLogoFetch: false,
    aliases: ["Skillvee", "SkillVee Inc"],
  });

  console.log("Created company:", {
    id: company.id,
    name: company.name,
    normalizedName: company.normalizedName,
    domain: company.domain,
    logo: company.logo,
    aliases: company.aliases,
  });

  // Test finding similar company
  const similarFound = await companyService.findOrCreateCompany({
    name: "SkillVee Inc.",
    skipLogoFetch: true,
  });

  console.log(
    `\nDuplicate detection: ${
      company.id === similarFound.id ? "✅ Correctly matched" : "❌ Created duplicate"
    }`
  );
}

async function cleanup() {
  // Clean up test data
  await prisma.company.deleteMany({
    where: {
      name: {
        contains: "Test",
      },
    },
  });
}

async function main() {
  console.log("🧪 Brandfetch Integration Test Suite");
  console.log("=" .repeat(50));

  try {
    await testNormalization();
    await testBrandfetchCDN();

    if (process.env.BRANDFETCH_API_KEY) {
      await testLogoFetching();
    } else {
      console.log("\n⚠️  Skipping API tests (BRANDFETCH_API_KEY not set)");
    }

    console.log("\n💾 Database Integration Tests");
    console.log("=" .repeat(50));

    await testCompanyDeduplication();
    await testFullIntegration();

    await cleanup();

    console.log("\n✅ All tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);