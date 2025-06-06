import { TRPCError } from "@trpc/server";
import { createTestContext, createTestCaller, mockDatabaseResponses, resetAllMocks, sampleData } from "~/test/helpers/trpc";

describe("interview router", () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe("create", () => {
    it("should create an interview successfully", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const input = {
        jobDescriptionId: "test-job-id",
        scheduledAt: new Date(),
        notes: "Initial notes",
      };

      // Mock job description exists
      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);
      
      // Mock interview creation
      const createdInterview = {
        ...sampleData.interview,
        ...input,
        status: "SCHEDULED" as const,
      };
      ctx.db.interview.create.mockResolvedValue(createdInterview);

      const result = await caller.interview.create(input);

      expect(result.jobDescriptionId).toBe(input.jobDescriptionId);
      expect(result.status).toBe("SCHEDULED");
      expect(ctx.db.interview.create).toHaveBeenCalledWith({
        data: {
          userId: "test-user",
          jobDescriptionId: input.jobDescriptionId,
          status: "SCHEDULED",
          scheduledAt: input.scheduledAt,
          startedAt: null,
          notes: input.notes,
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
              focusAreas: true,
            },
          },
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
      });
    });

    it("should create interview as IN_PROGRESS if no scheduledAt provided", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const input = {
        jobDescriptionId: "test-job-id",
      };

      mockDatabaseResponses.jobDescription.findFirst(sampleData.jobDescription);
      
      const createdInterview = {
        ...sampleData.interview,
        ...input,
        status: "IN_PROGRESS" as const,
        startedAt: new Date(),
      };
      ctx.db.interview.create.mockResolvedValue(createdInterview);

      const result = await caller.interview.create(input);

      expect(result.status).toBe("IN_PROGRESS");
      expect(ctx.db.interview.create).toHaveBeenCalledWith({
        data: {
          userId: "test-user",
          jobDescriptionId: input.jobDescriptionId,
          status: "IN_PROGRESS",
          scheduledAt: undefined,
          startedAt: expect.any(Date),
          notes: undefined,
        },
        include: expect.any(Object),
      });
    });

    it("should throw error if job description not found", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      mockDatabaseResponses.jobDescription.findFirst(null);

      await expect(caller.interview.create({
        jobDescriptionId: "non-existent-id",
      })).rejects.toThrow(TRPCError);
    });
  });

  describe("getById", () => {
    it("should get interview by ID with basic info", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      ctx.db.interview.findFirst.mockResolvedValue(sampleData.interview);

      const result = await caller.interview.getById({
        id: "test-interview-id",
        includeQuestions: false,
        includeAssessment: false,
        includeMediaRecordings: false,
        includeNotes: false,
      });

      expect(result.id).toBe("test-interview-id");
      expect(ctx.db.interview.findFirst).toHaveBeenCalledWith({
        where: {
          id: "test-interview-id",
          deletedAt: null,
          OR: [
            { userId: "test-user" },
          ],
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
              focusAreas: true,
            },
          },
          questions: false,
          assessment: false,
          mediaRecordings: false,
          interviewNotes: false,
          _count: {
            select: {
              questions: true,
              interviewNotes: true,
              mediaRecordings: true,
            },
          },
        },
      });
    });

    it("should include questions when requested", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const interviewWithQuestions = {
        ...sampleData.interview,
        questions: [
          {
            id: "q1",
            questionText: "Test question",
            questionType: "TECHNICAL",
            difficulty: "MEDIUM",
          },
        ],
      };
      ctx.db.interview.findFirst.mockResolvedValue(interviewWithQuestions);

      const result = await caller.interview.getById({
        id: "test-interview-id",
        includeQuestions: true,
      });

      expect(result.questions).toBeDefined();
      expect(result.questions).toHaveLength(1);
    });

    it("should allow admin to access any interview", async () => {
      const ctx = createTestContext({ userId: "admin-user", userRole: "ADMIN" });
      const caller = createTestCaller(ctx);

      ctx.db.interview.findFirst.mockResolvedValue(sampleData.interview);

      await caller.interview.getById({ id: "test-interview-id" });

      expect(ctx.db.interview.findFirst).toHaveBeenCalledWith({
        where: {
          id: "test-interview-id",
          deletedAt: null,
          OR: [
            { userId: "admin-user" },
            {}, // Admin can see all
          ],
        },
        include: expect.any(Object),
      });
    });
  });

  describe("start", () => {
    it("should start a scheduled interview", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const scheduledInterview = {
        ...sampleData.interview,
        status: "SCHEDULED" as const,
      };

      ctx.db.interview.findFirst.mockResolvedValue(scheduledInterview);
      
      const startedInterview = {
        ...scheduledInterview,
        status: "IN_PROGRESS" as const,
        startedAt: new Date(),
        geminiSessionId: "session_123",
      };
      ctx.db.interview.update.mockResolvedValue(startedInterview);

      const result = await caller.interview.start({
        id: "test-interview-id",
        geminiSessionId: "session_123",
      });

      expect(result.status).toBe("IN_PROGRESS");
      expect(result.geminiSessionId).toBe("session_123");
      expect(ctx.db.interview.update).toHaveBeenCalledWith({
        where: { id: "test-interview-id" },
        data: {
          status: "IN_PROGRESS",
          startedAt: expect.any(Date),
          geminiSessionId: "session_123",
          updatedAt: expect.any(Date),
        },
        include: {
          jobDescription: {
            select: {
              id: true,
              title: true,
              company: true,
              focusAreas: true,
            },
          },
        },
      });
    });

    it("should throw error if interview is not scheduled", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const inProgressInterview = {
        ...sampleData.interview,
        status: "IN_PROGRESS" as const,
      };

      ctx.db.interview.findFirst.mockResolvedValue(inProgressInterview);

      await expect(caller.interview.start({
        id: "test-interview-id",
      })).rejects.toThrow(TRPCError);
    });
  });

  describe("complete", () => {
    it("should complete an in-progress interview", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const inProgressInterview = {
        ...sampleData.interview,
        status: "IN_PROGRESS" as const,
        startedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      };

      ctx.db.interview.findFirst.mockResolvedValue(inProgressInterview);
      
      const completedInterview = {
        ...inProgressInterview,
        status: "COMPLETED" as const,
        completedAt: new Date(),
        duration: 30,
      };
      ctx.db.interview.update.mockResolvedValue(completedInterview);

      const result = await caller.interview.complete({
        id: "test-interview-id",
        duration: 30,
        finalNotes: "Interview completed successfully",
      });

      expect(result.status).toBe("COMPLETED");
      expect(result.duration).toBe(30);
      expect(ctx.db.interview.update).toHaveBeenCalledWith({
        where: { id: "test-interview-id" },
        data: {
          status: "COMPLETED",
          completedAt: expect.any(Date),
          duration: 30,
          notes: "Interview completed successfully",
          updatedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });
    });

    it("should calculate duration if not provided", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const startTime = new Date(Date.now() - 45 * 60 * 1000); // 45 minutes ago
      const inProgressInterview = {
        ...sampleData.interview,
        status: "IN_PROGRESS" as const,
        startedAt: startTime,
      };

      ctx.db.interview.findFirst.mockResolvedValue(inProgressInterview);
      ctx.db.interview.update.mockResolvedValue({
        ...inProgressInterview,
        status: "COMPLETED" as const,
      });

      await caller.interview.complete({
        id: "test-interview-id",
      });

      expect(ctx.db.interview.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            duration: expect.any(Number),
          }),
        })
      );
    });

    it("should throw error if interview is not in progress", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const completedInterview = {
        ...sampleData.interview,
        status: "COMPLETED" as const,
      };

      ctx.db.interview.findFirst.mockResolvedValue(completedInterview);

      await expect(caller.interview.complete({
        id: "test-interview-id",
      })).rejects.toThrow(TRPCError);
    });
  });

  describe("cancel", () => {
    it("should cancel a scheduled interview", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const scheduledInterview = {
        ...sampleData.interview,
        status: "SCHEDULED" as const,
        notes: "Original notes",
      };

      ctx.db.interview.findFirst.mockResolvedValue(scheduledInterview);
      
      const cancelledInterview = {
        ...scheduledInterview,
        status: "CANCELLED" as const,
        notes: "Original notes\n\nCancellation reason: Technical issues",
      };
      ctx.db.interview.update.mockResolvedValue(cancelledInterview);

      const result = await caller.interview.cancel({
        id: "test-interview-id",
        reason: "Technical issues",
      });

      expect(result.status).toBe("CANCELLED");
      expect(ctx.db.interview.update).toHaveBeenCalledWith({
        where: { id: "test-interview-id" },
        data: {
          status: "CANCELLED",
          notes: "Original notes\n\nCancellation reason: Technical issues",
          updatedAt: expect.any(Date),
        },
      });
    });

    it("should throw error if trying to cancel completed interview", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const completedInterview = {
        ...sampleData.interview,
        status: "COMPLETED" as const,
      };

      ctx.db.interview.findFirst.mockResolvedValue(completedInterview);

      await expect(caller.interview.cancel({
        id: "test-interview-id",
        reason: "Changed mind",
      })).rejects.toThrow(TRPCError);
    });
  });

  describe("list", () => {
    it("should list interviews with filtering", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      const mockInterviews = [sampleData.interview];
      ctx.db.interview.findMany.mockResolvedValue(mockInterviews);
      ctx.db.interview.count.mockResolvedValue(1);

      const result = await caller.interview.list({
        limit: 10,
        status: "SCHEDULED",
      });

      expect(result.items).toHaveLength(1);
      expect(result.totalCount).toBe(1);
      expect(ctx.db.interview.findMany).toHaveBeenCalled();
      expect(ctx.db.interview.count).toHaveBeenCalled();
    });

    it("should filter by date range", async () => {
      const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
      const caller = createTestCaller(ctx);

      ctx.db.interview.findMany.mockResolvedValue([]);
      ctx.db.interview.count.mockResolvedValue(0);

      const from = new Date("2024-01-01");
      const to = new Date("2024-12-31");

      await caller.interview.list({
        limit: 10,
        from,
        to,
      });

      expect(ctx.db.interview.findMany).toHaveBeenCalled();
    });
  });

  describe("questions", () => {
    describe("create", () => {
      it("should create a question for an interview", async () => {
        const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
        const caller = createTestCaller(ctx);

        ctx.db.interview.findFirst.mockResolvedValue(sampleData.interview);
        
        const questionData = {
          id: "new-question-id",
          interviewId: "test-interview-id",
          questionText: "What is machine learning?",
          questionType: "TECHNICAL" as const,
          difficulty: "MEDIUM" as const,
          expectedAnswer: "ML is a subset of AI...",
          orderIndex: 1,
        };

        ctx.db.question.create.mockResolvedValue(questionData);

        const result = await caller.interview.questions.create({
          interviewId: "test-interview-id",
          questionText: "What is machine learning?",
          questionType: "TECHNICAL",
          difficulty: "MEDIUM",
          expectedAnswer: "ML is a subset of AI...",
          orderIndex: 1,
        });

        expect(result.questionText).toBe("What is machine learning?");
        expect(ctx.db.question.create).toHaveBeenCalledWith({
          data: {
            interviewId: "test-interview-id",
            questionText: "What is machine learning?",
            questionType: "TECHNICAL",
            difficulty: "MEDIUM",
            expectedAnswer: "ML is a subset of AI...",
            orderIndex: 1,
          },
        });
      });
    });

    describe("bulkCreate", () => {
      it("should create multiple questions at once", async () => {
        const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
        const caller = createTestCaller(ctx);

        ctx.db.interview.findFirst.mockResolvedValue(sampleData.interview);
        ctx.db.question.createMany.mockResolvedValue({ count: 3 });

        const questions = [
          {
            questionText: "Question 1",
            questionType: "TECHNICAL" as const,
            difficulty: "EASY" as const,
            orderIndex: 1,
          },
          {
            questionText: "Question 2",
            questionType: "BEHAVIORAL" as const,
            difficulty: "MEDIUM" as const,
            orderIndex: 2,
          },
          {
            questionText: "Question 3",
            questionType: "PROBLEM_SOLVING" as const,
            difficulty: "HARD" as const,
            orderIndex: 3,
          },
        ];

        const result = await caller.interview.questions.bulkCreate({
          interviewId: "test-interview-id",
          questions,
        });

        expect(result.success).toBe(true);
        expect(result.createdCount).toBe(3);
        expect(ctx.db.question.createMany).toHaveBeenCalledWith({
          data: questions.map(q => ({
            ...q,
            interviewId: "test-interview-id",
          })),
        });
      });
    });
  });

  describe("notes", () => {
    describe("create", () => {
      it("should create an interview note", async () => {
        const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
        const caller = createTestCaller(ctx);

        ctx.db.interview.findFirst.mockResolvedValue(sampleData.interview);
        
        const noteData = {
          id: "new-note-id",
          interviewId: "test-interview-id",
          userId: "test-user",
          content: "Candidate shows strong technical skills",
          timestamp: new Date(),
          positionX: 100,
          positionY: 200,
          user: {
            firstName: "Test",
            lastName: "User",
          },
        };

        ctx.db.interviewNote.create.mockResolvedValue(noteData);

        const result = await caller.interview.notes.create({
          interviewId: "test-interview-id",
          content: "Candidate shows strong technical skills",
          timestamp: new Date(),
          positionX: 100,
          positionY: 200,
        });

        expect(result.content).toBe("Candidate shows strong technical skills");
        expect(result.user.firstName).toBe("Test");
      });
    });

    describe("list", () => {
      it("should list interview notes", async () => {
        const ctx = createTestContext({ userId: "test-user", userRole: "INTERVIEWER" });
        const caller = createTestCaller(ctx);

        ctx.db.interview.findFirst.mockResolvedValue(sampleData.interview);
        
        const mockNotes = [
          {
            id: "note-1",
            content: "First note",
            timestamp: new Date(),
            user: { firstName: "Test", lastName: "User" },
          },
        ];

        ctx.db.interviewNote.findMany.mockResolvedValue(mockNotes);

        const result = await caller.interview.notes.list({
          interviewId: "test-interview-id",
          limit: 10,
        });

        expect(result.items).toHaveLength(1);
        expect(result.items[0]?.content).toBe("First note");
      });
    });
  });
});