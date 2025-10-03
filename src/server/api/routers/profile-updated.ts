// Updated portions for profile.ts router to use the new company service

import { CompanyService, InstitutionService } from "~/server/services/company.service";

// In the profileRouter, update the addWorkExperience mutation:

addWorkExperience: protectedProcedure
  .input(workExperienceSchema.extend({
    companyDomain: z.string().optional(), // Add domain if available
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    // Use CompanyService for deduplication and logo fetching
    const companyService = new CompanyService(ctx.db);
    const company = await companyService.findOrCreateCompany({
      name: input.companyName,
      domain: input.companyDomain,
      // Don't skip logo fetch for new companies
      skipLogoFetch: false,
    });

    // Get max display order
    const maxOrder = await ctx.db.workExperience.findFirst({
      where: { userId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const workExperience = await ctx.db.workExperience.create({
      data: {
        userId,
        companyId: company.id,
        title: input.title,
        startDate: input.startDate,
        endDate: input.endDate,
        description: input.description,
        tags: input.tags,
        location: input.location,
        displayOrder: (maxOrder?.displayOrder ?? 0) + 1,
      },
      include: {
        company: true,
      },
    });

    return workExperience;
  }),

// Update the updateWorkExperience mutation:

updateWorkExperience: protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: workExperienceSchema.extend({
        companyDomain: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    // Verify ownership
    const existing = await ctx.db.workExperience.findFirst({
      where: {
        id: input.id,
        userId,
      },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Work experience not found",
      });
    }

    // Use CompanyService for deduplication and logo fetching
    const companyService = new CompanyService(ctx.db);
    const company = await companyService.findOrCreateCompany({
      name: input.data.companyName,
      domain: input.data.companyDomain,
      // Skip logo fetch if it's the same company
      skipLogoFetch: existing.companyId === company.id,
    });

    const workExperience = await ctx.db.workExperience.update({
      where: { id: input.id },
      data: {
        companyId: company.id,
        title: input.data.title,
        startDate: input.data.startDate,
        endDate: input.data.endDate,
        description: input.data.description,
        tags: input.data.tags,
        location: input.data.location,
      },
      include: {
        company: true,
      },
    });

    return workExperience;
  }),

// Similarly update addEducation:

addEducation: protectedProcedure
  .input(educationSchema.extend({
    institutionDomain: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    // Use InstitutionService for deduplication and logo fetching
    const institutionService = new InstitutionService(ctx.db);
    const institution = await institutionService.findOrCreateInstitution({
      name: input.institutionName,
      domain: input.institutionDomain,
      skipLogoFetch: false,
    });

    // Get max display order
    const maxOrder = await ctx.db.education.findFirst({
      where: { userId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });

    const education = await ctx.db.education.create({
      data: {
        userId,
        institutionId: institution.id,
        degree: input.degree,
        fieldOfStudy: input.fieldOfStudy,
        startYear: input.startYear,
        endYear: input.endYear,
        description: input.description,
        displayOrder: (maxOrder?.displayOrder ?? 0) + 1,
      },
      include: {
        institution: true,
      },
    });

    return education;
  }),

// Update the updateEducation mutation similarly:

updateEducation: protectedProcedure
  .input(
    z.object({
      id: z.string(),
      data: educationSchema.extend({
        institutionDomain: z.string().optional(),
      }),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.userId;

    // Verify ownership
    const existing = await ctx.db.education.findFirst({
      where: {
        id: input.id,
        userId,
      },
    });

    if (!existing) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Education not found",
      });
    }

    // Use InstitutionService for deduplication and logo fetching
    const institutionService = new InstitutionService(ctx.db);
    const institution = await institutionService.findOrCreateInstitution({
      name: input.data.institutionName,
      domain: input.data.institutionDomain,
      skipLogoFetch: existing.institutionId === institution.id,
    });

    const education = await ctx.db.education.update({
      where: { id: input.id },
      data: {
        institutionId: institution.id,
        degree: input.data.degree,
        fieldOfStudy: input.data.fieldOfStudy,
        startYear: input.data.startYear,
        endYear: input.data.endYear,
        description: input.data.description,
      },
      include: {
        institution: true,
      },
    });

    return education;
  }),

// Add new endpoint for batch logo refresh:

refreshCompanyLogos: protectedProcedure
  .input(z.object({
    companyIds: z.array(z.string()).optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    const companyService = new CompanyService(ctx.db);

    // If no IDs provided, refresh all companies for this user
    let companyIds = input.companyIds;

    if (!companyIds?.length) {
      const workExperiences = await ctx.db.workExperience.findMany({
        where: { userId: ctx.userId },
        select: { companyId: true },
        distinct: ["companyId"],
      });
      companyIds = workExperiences.map(we => we.companyId);
    }

    await companyService.batchFetchLogos(companyIds);

    return { success: true, refreshed: companyIds.length };
  }),

// Add endpoint for manual logo override:

updateCompanyLogo: protectedProcedure
  .input(z.object({
    companyId: z.string(),
    logoUrl: z.string().url(),
    domain: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Verify user has work experience with this company
    const hasAccess = await ctx.db.workExperience.findFirst({
      where: {
        userId: ctx.userId,
        companyId: input.companyId,
      },
    });

    if (!hasAccess) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You don't have access to update this company",
      });
    }

    const companyService = new CompanyService(ctx.db);
    const company = await companyService.manuallyUpdateCompanyLogo(
      input.companyId,
      input.logoUrl,
      input.domain
    );

    return company;
  }),