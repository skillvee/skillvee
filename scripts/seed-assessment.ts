import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting assessment seed...");

  // Find or create a test user
  let user = await prisma.user.findFirst({
    where: { email: "test@example.com" }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkId: "test_clerk_id",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User"
      }
    });
  }

  // Find or create a practice session
  let practiceSession = await prisma.practiceSession.findFirst({
    where: { userId: user.id }
  });

  if (!practiceSession) {
    practiceSession = await prisma.practiceSession.create({
      data: {
        userId: user.id,
        sessionType: "JOB_DESCRIPTION",
        jobTitle: "Product Manager",
        company: "Meta",
        team: "Commons Team",
        experience: "Senior",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
  }

  // Find or create an interview case
  let interviewCase = await prisma.interviewCase.findFirst({
    where: { practiceSessionId: practiceSession.id }
  });

  if (!interviewCase) {
    interviewCase = await prisma.interviewCase.create({
      data: {
        practiceSessionId: practiceSession.id,
        caseTitle: "Meta Commons PM Interview",
        caseContext: "You are a Senior Product Manager at Meta, focused on evolving the social interaction features within the core Facebook app.",
        caseData: {
          role: "Senior Product Manager",
          productOverview: "The Rooms product currently allows users to create temporary video chat rooms. The new initiative, codenamed Commons, aims to enable users to create personalized, persistent digital spaces.",
          challenge: "Despite initial excitement about the new features, user retention within these persistent spaces after the first week is lower than anticipated."
        },
        totalDuration: 45
      }
    });
  }

  // Find or create a job description
  let jobDescription = await prisma.jobDescription.findFirst({
    where: { userId: user.id }
  });

  if (!jobDescription) {
    jobDescription = await prisma.jobDescription.create({
      data: {
        title: "Product Manager",
        company: "Meta",
        description: "Lead product development for social interaction features",
        requirements: ["5+ years PM experience", "Data analysis skills", "User empathy"],
        focusAreas: ["User retention", "Engagement metrics", "A/B testing"],
        userId: user.id
      }
    });
  }

  // Find or create an interview
  let interview = await prisma.interview.findFirst({
    where: {
      userId: user.id,
      interview_case_id: interviewCase.id
    }
  });

  if (!interview) {
    interview = await prisma.interview.create({
      data: {
        userId: user.id,
        jobDescriptionId: jobDescription.id,
        status: "COMPLETED",
        scheduledAt: new Date(),
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 1422,
        interview_case_id: interviewCase.id
      }
    });
  }

  // Check if assessment already exists
  const existingAssessment = await prisma.interviewAssessment.findFirst({
    where: { interviewId: interview.id }
  });

  if (existingAssessment) {
    console.log("Assessment already exists for this interview");
    console.log(`View at: http://localhost:3000/practice/feedback?assessmentId=${existingAssessment.id}`);
    return;
  }

  // Create the assessment
  const assessment = await prisma.interviewAssessment.create({
    data: {
      userId: user.id,
      interviewId: interview.id,
      caseId: interviewCase.id,
      overallScore: 3,
      performanceLabel: "Strong Foundation",
      whatYouDidBest: "You demonstrated strong strategic thinking by immediately structuring your response using the OKR framework. Your ability to connect business problems to measurable data points showed solid analytical skills, particularly when you linked retention drops to specific user behavior patterns. The way you reframed technical features around user motivations displayed excellent user empathy.",
      topOpportunitiesForGrowth: "Focus on adding specificity to your success metrics by defining concrete targets and timeframes using the SMART criteria. Strengthen your statistical analysis by incorporating sample size calculations and significance levels in your A/B test proposals. When proposing features, include systematic trade-off analysis using frameworks like ICE scoring to demonstrate structured decision-making.",
      videoUrl: null,
      videoDurationSeconds: 1422,
      startedAt: new Date(Date.now() - 1422000),
      completedAt: new Date(),
      interviewDurationSeconds: 1422,

      // Create feedback items
      feedbackItems: {
        create: [
          // Strengths
          {
            feedbackType: "STRENGTH",
            timestampDisplay: "2:15",
            timestampSeconds: 135,
            behaviorTitle: "Structured KPI Framework Approach",
            whatYouDid: "You immediately structured your response using the OKR framework, starting with objectives before diving into key results.",
            whyItWorked: "This systematic approach shows strategic thinking and aligns with how senior PMs organize complex problems.",
            impactStatement: "Demonstrated Level 3/5 Strategic Thinking competency",
            displayOrder: 1
          },
          {
            feedbackType: "STRENGTH",
            timestampDisplay: "8:42",
            timestampSeconds: 522,
            behaviorTitle: "Data-Driven Hypothesis Formation",
            whatYouDid: "You connected the retention drop to specific user behavior patterns in the commons_spaces table.",
            whyItWorked: "Shows you can translate business problems into measurable data points and form testable hypotheses.",
            impactStatement: "Demonstrated Level 3/5 Data Analysis competency",
            displayOrder: 2
          },
          {
            feedbackType: "STRENGTH",
            timestampDisplay: "15:20",
            timestampSeconds: 920,
            behaviorTitle: "User-Centric Problem Framing",
            whatYouDid: "You shifted focus from technical features to user motivations: 'Why do users leave after the first week?'",
            whyItWorked: "This reframe shows empathy and understanding that engagement is fundamentally about user value.",
            impactStatement: "Demonstrated Level 3/5 User Empathy competency",
            displayOrder: 3
          },

          // Growth Areas
          {
            feedbackType: "GROWTH_AREA",
            timestampDisplay: "4:30",
            timestampSeconds: 270,
            behaviorTitle: "Vague Success Thresholds",
            whatYouDid: "You said 'increase engagement' without defining specific targets or timeframes.",
            whatWasMissing: "Specific, measurable thresholds (e.g., '15% increase in 7-day retention within Q2')",
            actionableNextStep: "Practice the SMART criteria: 'By Q2, increase 7-day retention from 23% to 35% for Commons spaces with 5+ members'",
            impactStatement: "Limited Level 2/5 Strategic Thinking - needs quantification",
            displayOrder: 1
          },
          {
            feedbackType: "GROWTH_AREA",
            timestampDisplay: "12:18",
            timestampSeconds: 738,
            behaviorTitle: "Surface-Level Statistical Analysis",
            whatYouDid: "You mentioned A/B testing but didn't discuss sample size, significance levels, or confidence intervals.",
            whatWasMissing: "Statistical rigor in experimental design and interpretation methodology",
            actionableNextStep: "When proposing A/B tests, specify: sample size calculation, significance level (95%), and minimum detectable effect",
            impactStatement: "Limited Level 2/5 Data Analysis - needs statistical depth",
            displayOrder: 2
          },
          {
            feedbackType: "GROWTH_AREA",
            timestampDisplay: "18:45",
            timestampSeconds: 1125,
            behaviorTitle: "Incomplete Trade-off Analysis",
            whatYouDid: "You proposed AI features but didn't weigh development cost vs. user impact vs. technical complexity.",
            whatWasMissing: "Systematic evaluation of opportunity cost and resource allocation",
            actionableNextStep: "Use frameworks like ICE scoring (Impact/Confidence/Ease) to justify feature prioritization decisions",
            impactStatement: "Limited Level 2/5 Technical Communication - needs structured decision reasoning",
            displayOrder: 3
          }
        ]
      },

      // Create skill scores
      skillScores: {
        create: [
          // Statistics and Experimentation
          {
            categoryName: "Statistics and Experimentation",
            categoryIcon: "bar-chart",
            categoryOrder: 1,
            skillName: "Data Visualization",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 1
          },
          {
            categoryName: "Statistics and Experimentation",
            categoryIcon: "bar-chart",
            categoryOrder: 1,
            skillName: "Statistics",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 2
          },
          {
            categoryName: "Statistics and Experimentation",
            categoryIcon: "bar-chart",
            categoryOrder: 1,
            skillName: "Hypothesis Testing",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 3
          },
          {
            categoryName: "Statistics and Experimentation",
            categoryIcon: "bar-chart",
            categoryOrder: 1,
            skillName: "A/B Testing",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 4
          },
          {
            categoryName: "Statistics and Experimentation",
            categoryIcon: "bar-chart",
            categoryOrder: 1,
            skillName: "Experimental Design",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 5
          },

          // Product & Business Sense
          {
            categoryName: "Product & Business Sense",
            categoryIcon: "target",
            categoryOrder: 2,
            skillName: "User Analysis",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 1
          },
          {
            categoryName: "Product & Business Sense",
            categoryIcon: "target",
            categoryOrder: 2,
            skillName: "Product Analysis",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 2
          },
          {
            categoryName: "Product & Business Sense",
            categoryIcon: "target",
            categoryOrder: 2,
            skillName: "User Experience",
            skillScore: 5,
            isFocusArea: true,
            skillOrder: 3
          },
          {
            categoryName: "Product & Business Sense",
            categoryIcon: "target",
            categoryOrder: 2,
            skillName: "Business Strategy",
            skillScore: 5,
            isFocusArea: true,
            skillOrder: 4
          },

          // System Design & Architecture
          {
            categoryName: "System Design & Architecture",
            categoryIcon: "brain",
            categoryOrder: 3,
            skillName: "Data Pipeline Design",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 1
          },
          {
            categoryName: "System Design & Architecture",
            categoryIcon: "brain",
            categoryOrder: 3,
            skillName: "Data Architecture",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 2
          },
          {
            categoryName: "System Design & Architecture",
            categoryIcon: "brain",
            categoryOrder: 3,
            skillName: "Scalability Design",
            skillScore: 5,
            isFocusArea: false,
            skillOrder: 3
          },
          {
            categoryName: "System Design & Architecture",
            categoryIcon: "brain",
            categoryOrder: 3,
            skillName: "Real-time Processing",
            skillScore: 5,
            isFocusArea: true,
            skillOrder: 4
          }
        ]
      }
    },
    include: {
      feedbackItems: true,
      skillScores: true
    }
  });

  console.log("✅ Assessment created successfully!");
  console.log(`Assessment ID: ${assessment.id}`);
  console.log(`View at: http://localhost:3000/practice/feedback?assessmentId=${assessment.id}`);
  console.log(`Or by interview: http://localhost:3000/practice/feedback?interviewId=${interview.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });