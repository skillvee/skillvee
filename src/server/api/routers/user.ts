import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = createTRPCRouter({
  // Get current user profile
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { 
        clerkId: ctx.userId,
        deletedAt: null,
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    return user;
  }),

  // Admin only: Get all users
  getAllUsers: protectedProcedure
    .query(async ({ ctx }) => {
      // First check if current user is admin
      const currentUser = await ctx.db.user.findUnique({
        where: { 
          clerkId: ctx.userId,
          deletedAt: null,
        },
        select: { role: true },
      });

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return ctx.db.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          profileImage: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  // Admin only: Update user role
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["ADMIN", "INTERVIEWER"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // First check if current user is admin
      const currentUser = await ctx.db.user.findUnique({
        where: { 
          clerkId: ctx.userId,
          deletedAt: null,
        },
        select: { role: true },
      });

      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Admin access required",
        });
      }

      return ctx.db.user.update({
        where: { 
          id: input.userId,
          deletedAt: null,
        },
        data: { role: input.role },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    }),

  // Get user stats (interviews, assessments, etc.)
  getUserStats: protectedProcedure.query(async ({ ctx }) => {
    const [
      totalInterviews,
      completedInterviews,
      avgOverallScore,
      recentInterviews,
    ] = await Promise.all([
      ctx.db.interview.count({
        where: { 
          userId: ctx.userId,
          deletedAt: null,
        },
      }),
      ctx.db.interview.count({
        where: { 
          userId: ctx.userId,
          status: "COMPLETED",
          deletedAt: null,
        },
      }),
      ctx.db.assessment.aggregate({
        where: {
          interview: {
            userId: ctx.userId,
            deletedAt: null,
          },
        },
        _avg: {
          overallScore: true,
        },
      }),
      ctx.db.interview.findMany({
        where: { 
          userId: ctx.userId,
          deletedAt: null,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          jobDescription: {
            select: {
              title: true,
              company: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    return {
      totalInterviews,
      completedInterviews,
      averageScore: avgOverallScore._avg.overallScore,
      recentInterviews,
    };
  }),
});