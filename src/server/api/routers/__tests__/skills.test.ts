import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { TRPCError } from "@trpc/server";
import { skillsRouter } from "../skills";
import { createTRPCMsw } from "msw-trpc";
import { type AppRouter } from "../../root";

// Mock the database
const mockDb = {
  domain: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  category: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  skill: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  competency: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    count: jest.fn(),
  },
  competencyLevel: {
    create: jest.fn(),
    createMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock context
const createMockContext = (userRole: "ADMIN" | "INTERVIEWER" = "ADMIN") => ({
  db: mockDb,
  user: {
    id: "test-user-id",
    role: userRole,
    email: "test@example.com",
  },
});

// Helper to create caller
const createCaller = (ctx: any) => {
  return skillsRouter.createCaller(ctx);
};

describe("Skills Router", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Domain Operations", () => {
    describe("createDomain", () => {
      it("should create a new domain successfully", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock database responses
        mockDb.domain.findFirst.mockResolvedValue(null); // No existing domain
        mockDb.domain.create.mockResolvedValue({
          id: "domain-1",
          name: "Technical Skills",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          _count: { categories: 0 },
        });

        const result = await caller.createDomain({
          name: "Technical Skills",
        });

        expect(result.name).toBe("Technical Skills");
        expect(mockDb.domain.findFirst).toHaveBeenCalledWith({
          where: { name: "Technical Skills", deletedAt: null },
        });
        expect(mockDb.domain.create).toHaveBeenCalledWith({
          data: { name: "Technical Skills" },
          include: { _count: { select: { categories: true } } },
        });
      });

      it("should throw error for duplicate domain name", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock existing domain
        mockDb.domain.findFirst.mockResolvedValue({
          id: "existing-domain",
          name: "Technical Skills",
        });

        await expect(
          caller.createDomain({ name: "Technical Skills" })
        ).rejects.toThrow("Domain with this name already exists");
      });

      it("should throw error for non-admin user", async () => {
        const ctx = createMockContext("INTERVIEWER");
        const caller = createCaller(ctx);

        await expect(
          caller.createDomain({ name: "Technical Skills" })
        ).rejects.toThrow(TRPCError);
      });
    });

    describe("listDomains", () => {
      it("should list domains with pagination", async () => {
        const ctx = createMockContext();
        const caller = createCaller(ctx);

        const mockDomains = [
          {
            id: "domain-1",
            name: "Technical Skills",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            _count: { categories: 5 },
          },
          {
            id: "domain-2", 
            name: "Cognitive Skills",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
            _count: { categories: 3 },
          },
        ];

        mockDb.domain.findMany.mockResolvedValue(mockDomains);
        mockDb.domain.count.mockResolvedValue(2);

        const result = await caller.listDomains({
          limit: 20,
          sortBy: "name",
          sortDirection: "asc",
        });

        expect(result.items).toHaveLength(2);
        expect(result.totalCount).toBe(2);
        expect(mockDb.domain.findMany).toHaveBeenCalled();
      });

      it("should filter domains by search query", async () => {
        const ctx = createMockContext();
        const caller = createCaller(ctx);

        mockDb.domain.findMany.mockResolvedValue([]);
        mockDb.domain.count.mockResolvedValue(0);

        await caller.listDomains({
          limit: 20,
          query: "Technical",
        });

        expect(mockDb.domain.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({
                  name: expect.objectContaining({
                    contains: "Technical",
                    mode: "insensitive",
                  }),
                }),
              ]),
            }),
          })
        );
      });
    });
  });

  describe("Category Operations", () => {
    describe("createCategory", () => {
      it("should create a new category successfully", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock domain exists
        mockDb.domain.findFirst.mockResolvedValue({
          id: "domain-1",
          name: "Technical Skills",
        });

        // Mock no existing category
        mockDb.category.findFirst.mockResolvedValue(null);

        // Mock category creation
        mockDb.category.create.mockResolvedValue({
          id: "category-1",
          name: "Programming",
          domainId: "domain-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          domain: { id: "domain-1", name: "Technical Skills" },
          _count: { skills: 0 },
        });

        const result = await caller.createCategory({
          name: "Programming",
          domainId: "domain-1",
        });

        expect(result.name).toBe("Programming");
        expect(result.domainId).toBe("domain-1");
      });

      it("should throw error if domain does not exist", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock domain does not exist
        mockDb.domain.findFirst.mockResolvedValue(null);

        await expect(
          caller.createCategory({
            name: "Programming",
            domainId: "nonexistent-domain",
          })
        ).rejects.toThrow("Domain not found");
      });
    });
  });

  describe("Skill Operations", () => {
    describe("createSkill", () => {
      it("should create a new skill successfully", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock category exists
        mockDb.category.findFirst.mockResolvedValue({
          id: "category-1",
          name: "Programming",
        });

        // Mock no existing skill
        mockDb.skill.findFirst.mockResolvedValue(null);

        // Mock skill creation
        mockDb.skill.create.mockResolvedValue({
          id: "skill-1",
          name: "JavaScript",
          categoryId: "category-1",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          category: {
            id: "category-1",
            name: "Programming",
            domain: { id: "domain-1", name: "Technical Skills" },
          },
          _count: { competencies: 0 },
        });

        const result = await caller.createSkill({
          name: "JavaScript",
          categoryId: "category-1",
        });

        expect(result.name).toBe("JavaScript");
        expect(result.categoryId).toBe("category-1");
      });
    });
  });

  describe("Competency Operations", () => {
    describe("createCompetency", () => {
      it("should create a competency with levels successfully", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock skill exists
        mockDb.skill.findFirst.mockResolvedValue({
          id: "skill-1",
          name: "JavaScript",
        });

        // Mock no existing competency
        mockDb.competency.findFirst.mockResolvedValue(null);

        // Mock transaction
        mockDb.$transaction.mockImplementation(async (callback) => {
          const mockTx = {
            competency: {
              create: jest.fn().mockResolvedValue({
                id: "competency-1",
                name: "Async Programming",
                priority: "PRIMARY",
                skillId: "skill-1",
              }),
              findUnique: jest.fn().mockResolvedValue({
                id: "competency-1",
                name: "Async Programming",
                priority: "PRIMARY",
                skillId: "skill-1",
                skill: {
                  id: "skill-1",
                  name: "JavaScript",
                  category: {
                    id: "category-1",
                    name: "Programming",
                    domain: { id: "domain-1", name: "Technical Skills" },
                  },
                },
                levels: [
                  { id: "level-1", level: 1, name: "Novice", competencyId: "competency-1" },
                  { id: "level-2", level: 2, name: "Beginner", competencyId: "competency-1" },
                ],
                _count: { levels: 2 },
              }),
            },
            competencyLevel: {
              createMany: jest.fn().mockResolvedValue({ count: 2 }),
            },
          };
          return await callback(mockTx);
        });

        const result = await caller.createCompetency({
          name: "Async Programming",
          priority: "PRIMARY",
          skillId: "skill-1",
          levels: [
            { level: 1, name: "Novice", description: "Basic understanding" },
            { level: 2, name: "Beginner", description: "Can apply with guidance" },
          ],
        });

        expect(result?.name).toBe("Async Programming");
        expect(result?.priority).toBe("PRIMARY");
      });

      it("should throw error for duplicate levels", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        // Mock skill exists
        mockDb.skill.findFirst.mockResolvedValue({
          id: "skill-1",
          name: "JavaScript",
        });

        await expect(
          caller.createCompetency({
            name: "Async Programming",
            priority: "PRIMARY",
            skillId: "skill-1",
            levels: [
              { level: 1, name: "Novice", description: "Basic understanding" },
              { level: 1, name: "Duplicate", description: "Duplicate level" }, // Duplicate level
            ],
          })
        ).rejects.toThrow("Duplicate levels are not allowed");
      });
    });
  });

  describe("Statistics", () => {
    describe("getStats", () => {
      it("should return comprehensive statistics", async () => {
        const ctx = createMockContext();
        const caller = createCaller(ctx);

        // Mock all count queries
        mockDb.domain.count.mockResolvedValue(3);
        mockDb.category.count.mockResolvedValue(8);
        mockDb.skill.count.mockResolvedValue(25);
        mockDb.competency.count
          .mockResolvedValueOnce(50) // total competencies
          .mockResolvedValueOnce(15) // primary competencies
          .mockResolvedValueOnce(20); // secondary competencies
        mockDb.competencyLevel.count.mockResolvedValue(250);

        // Mock recent activity queries
        mockDb.domain.findMany.mockResolvedValue([
          { id: "d1", name: "Domain 1", createdAt: new Date() },
        ]);
        mockDb.category.findMany.mockResolvedValue([
          { id: "c1", name: "Category 1", createdAt: new Date() },
        ]);
        mockDb.skill.findMany.mockResolvedValue([
          { id: "s1", name: "Skill 1", createdAt: new Date() },
        ]);
        mockDb.competency.findMany.mockResolvedValue([
          { id: "comp1", name: "Competency 1", createdAt: new Date() },
        ]);

        const result = await caller.getStats();

        expect(result).toEqual({
          totalDomains: 3,
          totalCategories: 8,
          totalSkills: 25,
          totalCompetencies: 50,
          totalLevels: 250,
          primaryCompetencies: 15,
          secondaryCompetencies: 20,
          recentlyAdded: expect.any(Array),
        });
      });
    });
  });

  describe("CSV Operations", () => {
    describe("getCSVTemplate", () => {
      it("should return CSV template", async () => {
        const ctx = createMockContext();
        const caller = createCaller(ctx);

        const result = await caller.getCSVTemplate();

        expect(result.filename).toBe("skills-template.csv");
        expect(result.mimeType).toBe("text/csv");
        expect(result.content).toContain("Domain,Category,Skill,Competency");
      });
    });

    describe("validateCSV", () => {
      it("should validate CSV content successfully", async () => {
        const ctx = createMockContext("ADMIN");
        const caller = createCaller(ctx);

        const csvContent = `Domain,Category,Skill,Competency,Priority,Level_1_Name,Level_1_Description,Level_2_Name,Level_2_Description,Level_3_Name,Level_3_Description,Level_4_Name,Level_4_Description,Level_5_Name,Level_5_Description
Technical Skills,Programming,JavaScript,Async Programming,PRIMARY,Novice,Basic understanding,Beginner,Can apply with guidance,Proficient,Independent application,Advanced,Complex scenarios,Expert,Innovation and teaching`;

        const result = await caller.validateCSV({ csvContent });

        expect(result.isValid).toBe(true);
        expect(result.stats.totalRows).toBe(1);
        expect(result.stats.validRows).toBe(1);
        expect(result.preview).toHaveLength(1);
      });
    });
  });

  describe("Hierarchy Operations", () => {
    describe("getHierarchy", () => {
      it("should return full hierarchy when no filters provided", async () => {
        const ctx = createMockContext();
        const caller = createCaller(ctx);

        const mockHierarchy = [
          {
            id: "domain-1",
            name: "Technical Skills",
            categories: [
              {
                id: "category-1",
                name: "Programming",
                skills: [
                  {
                    id: "skill-1",
                    name: "JavaScript",
                    competencies: [
                      {
                        id: "competency-1",
                        name: "Async Programming",
                        priority: "PRIMARY",
                        levels: [
                          { id: "level-1", level: 1, name: "Novice" },
                          { id: "level-2", level: 2, name: "Beginner" },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ];

        mockDb.domain.findMany.mockResolvedValue(mockHierarchy);

        const result = await caller.getHierarchy({});

        expect(result.domains).toEqual(mockHierarchy);
        expect(mockDb.domain.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            include: expect.objectContaining({
              categories: expect.objectContaining({
                include: expect.objectContaining({
                  skills: expect.objectContaining({
                    include: expect.objectContaining({
                      competencies: expect.any(Object),
                    }),
                  }),
                }),
              }),
            }),
          })
        );
      });
    });
  });
});