import { TRPCError } from "@trpc/server";
import { createTestContext, createTestCaller, mockDatabaseResponses, resetAllMocks, sampleData } from "~/test/helpers/trpc";

describe("jobDescription router", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("create", () => {
    it("should create a job description successfully", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const input = {
        title: "Senior Data Scientist",
        company: "Test Company",
        description: "We are looking for a senior data scientist...",
        requirements: ["Python", "Machine Learning", "SQL"],
        focusAreas: ["Machine Learning", "Data Analysis"],
        isTemplate: false,
      };

      mockDatabaseResponses.jobDescription.create({
        ...sampleData.jobDescription,
        ...input,
      });

      const result = await caller.jobDescription.create(input);

      expect(result.title).toBe(input.title);
      expect(result.company).toBe(input.company);
      expect(result.requirements).toEqual(input.requirements);
      expect(ctx.db.jobDescription.create).toHaveBeenCalledWith({
        data: {
          ...input,
          userId: "test-user",
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });

    it("should prevent non-admin users from creating templates", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const input = {
        title: "Template Job",
        description: "Template description",
        requirements: ["Skill 1"],
        isTemplate: true,
      };

      await expect(caller.jobDescription.create(input)).rejects.toThrow(TRPCError);
    });

    it("should allow admin users to create templates", async () => {
      const ctx = createTestContext({ userId: "admin-user", userRole: "ADMIN" });
      const caller = createTestCaller(ctx);

      const input = {
        title: "Template Job",
        description: "Template description",
        requirements: ["Skill 1"],
        isTemplate: true,
      };

      mockDatabaseResponses.jobDescription.create({
        ...sampleData.jobDescription,
        ...input,
        userId: null, // Templates are system-wide
      });

      const result = await caller.jobDescription.create(input);

      expect(result.title).toBe(input.title);
      expect(ctx.db.jobDescription.create).toHaveBeenCalledWith({
        data: {
          ...input,
          userId: null,
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });
  });

  describe("getById", () => {
    it("should get a job description by ID", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);

      const result = await caller.jobDescription.getById({ id: "test-job-id" });

      expect(result.id).toBe("test-job-id");
      expect(result.title).toBe("Senior Data Scientist");
      expect(ctx.db.jobDescription.findFirst).toHaveBeenCalledWith({
        where: {
          id: "test-job-id",
          deletedAt: null,
          OR: [
            { userId: "test-user" },
            { isTemplate: true },
          ],
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });

    it("should throw error if job description not found", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findFirst(null);

      await expect(caller.jobDescription.getById({ id: "non-existent-id" })).rejects.toThrow(TRPCError);
    });

    it("should allow admin to access any job description", async () => {
      const ctx = createTestContext({ userId: "admin-user", userRole: "ADMIN" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);

      await caller.jobDescription.getById({ id: "test-job-id" });

      expect(ctx.db.jobDescription.findFirst).toHaveBeenCalledWith({
        where: {
          id: "test-job-id",
          deletedAt: null,
          OR: [
            { userId: "admin-user" },
            { isTemplate: true },
            {}, // Admin can see all
          ],
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });
  });

  describe("list", () => {
    it("should list job descriptions with pagination", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const mockJobDescriptions = [sampleData.jobDescription];
      mockDatabaseResponses.jobDescription.findMany(mockJobDescriptions);
      mockDatabaseResponses.jobDescription.count(1);

      const result = await caller.jobDescription.list({
        limit: 10,
        sortBy: "createdAt",
        sortDirection: "desc",
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]?.title).toBe("Senior Data Scientist");
      expect(result.totalCount).toBe(1);
    });

    it("should filter job descriptions by search query", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findMany([]);
      mockDatabaseResponses.jobDescription.count(0);

      await caller.jobDescription.list({
        limit: 10,
        query: "Python",
      });

      expect(ctx.db.jobDescription.findMany).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update a job description", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      // Mock finding the existing job description
      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);
      
      // Mock the update
      const updatedData = {
        ...sampleData.jobDescription,
        title: "Updated Title",
      };
      mockDatabaseResponses.jobDescription.update(updatedData);

      const result = await caller.jobDescription.update({
        id: "test-job-id",
        title: "Updated Title",
      });

      expect(result.title).toBe("Updated Title");
      expect(ctx.db.jobDescription.findFirst).toHaveBeenCalled();
      expect(ctx.db.jobDescription.update).toHaveBeenCalledWith({
        where: { id: "test-job-id" },
        data: {
          title: "Updated Title",
          updatedAt: expect.any(Date),
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });

    it("should prevent non-admin from modifying templates", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const templateJobDescription = {
        ...sampleData.jobDescription,
        isTemplate: true,
      };

      mockDatabaseResponses.jobDescription.findFirst(templateJobDescription);

      await expect(caller.jobDescription.update({
        id: "test-job-id",
        title: "Updated Title",
      })).rejects.toThrow(TRPCError);
    });
  });

  describe("delete", () => {
    it("should soft delete a job description", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const jobDescriptionWithNoInterviews = {
        ...sampleData.jobDescription,
        _count: { interviews: 0 },
      };

      mockDatabaseResponses.jobDescription.findFirst(jobDescriptionWithNoInterviews);
      mockDatabaseResponses.jobDescription.update({ success: true });

      const result = await caller.jobDescription.delete({ id: "test-job-id" });

      expect(result.success).toBe(true);
      expect(ctx.db.jobDescription.update).toHaveBeenCalledWith({
        where: { id: "test-job-id" },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it("should prevent deletion if job description has interviews", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const jobDescriptionWithInterviews = {
        ...sampleData.jobDescription,
        _count: { interviews: 3 },
      };

      mockDatabaseResponses.jobDescription.findFirst(jobDescriptionWithInterviews);

      await expect(caller.jobDescription.delete({ id: "test-job-id" })).rejects.toThrow(TRPCError);
    });
  });

  describe("getTemplates", () => {
    it("should get public templates", async () => {
      const ctx = createTestContext();
      const caller = createTestCaller(ctx);

      const templates = [
        {
          ...sampleData.jobDescription,
          isTemplate: true,
          userId: null,
        },
      ];

      mockDatabaseResponses.jobDescription.findMany(templates);

      const result = await caller.jobDescription.getTemplates({});

      expect(result).toHaveLength(1);
      expect(result[0]?.isTemplate).toBe(true);
      expect(ctx.db.jobDescription.findMany).toHaveBeenCalledWith({
        where: { isTemplate: true, deletedAt: null },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          description: true,
          requirements: true,
          focusAreas: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });
  });

  describe("duplicate", () => {
    it("should duplicate a job description", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);
      
      const duplicatedData = {
        ...sampleData.jobDescription,
        id: "duplicated-id",
        title: "Senior Data Scientist (Copy)",
      };
      mockDatabaseResponses.jobDescription.create(duplicatedData);

      const result = await caller.jobDescription.duplicate({
        id: "test-job-id",
      });

      expect(result.title).toBe("Senior Data Scientist (Copy)");
      expect(ctx.db.jobDescription.create).toHaveBeenCalledWith({
        data: {
          title: "Senior Data Scientist (Copy)",
          company: sampleData.jobDescription.company,
          description: sampleData.jobDescription.description,
          requirements: sampleData.jobDescription.requirements,
          focusAreas: sampleData.jobDescription.focusAreas,
          isTemplate: false,
          userId: "test-user",
        },
        include: {
          _count: {
            select: {
              interviews: true,
            },
          },
        },
      });
    });

    it("should allow custom title for duplicated job description", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);
      
      const duplicatedData = {
        ...sampleData.jobDescription,
        id: "duplicated-id",
        title: "Custom Title",
      };
      mockDatabaseResponses.jobDescription.create(duplicatedData);

      const result = await caller.jobDescription.duplicate({
        id: "test-job-id",
        newTitle: "Custom Title",
      });

      expect(result.title).toBe("Custom Title");
    });
  });
});