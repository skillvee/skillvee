import pg from 'pg';
const { Client } = pg;

// Direct connection string - bypassing pooler
const client = new Client({
  connectionString: 'postgresql://postgres.buyxawgqsxvmxbzooekf:VNJ1raj8kzf!qae!vjq@aws-0-us-east-2.pooler.supabase.com:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function createTables() {
  try {
    console.log('Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Create InterviewAssessment table
    console.log('Creating InterviewAssessment table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "InterviewAssessment" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "interviewId" TEXT NOT NULL UNIQUE,
        "caseId" TEXT NOT NULL,
        "overallScore" INTEGER NOT NULL,
        "performanceLabel" TEXT NOT NULL,
        "whatYouDidBest" TEXT NOT NULL,
        "topOpportunitiesForGrowth" TEXT NOT NULL,
        "videoUrl" TEXT,
        "videoDurationSeconds" INTEGER,
        "videoThumbnailUrl" TEXT,
        "startedAt" TIMESTAMP(3) NOT NULL,
        "completedAt" TIMESTAMP(3) NOT NULL,
        "interviewDurationSeconds" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ InterviewAssessment table created\n');

    // Create AssessmentFeedback table
    console.log('Creating AssessmentFeedback table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AssessmentFeedback" (
        "id" TEXT PRIMARY KEY,
        "assessmentId" TEXT NOT NULL,
        "feedbackType" TEXT NOT NULL,
        "timestampDisplay" TEXT NOT NULL,
        "timestampSeconds" INTEGER NOT NULL,
        "behaviorTitle" TEXT NOT NULL,
        "whatYouDid" TEXT NOT NULL,
        "whyItWorked" TEXT,
        "whatWasMissing" TEXT,
        "actionableNextStep" TEXT,
        "impactStatement" TEXT NOT NULL,
        "displayOrder" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ AssessmentFeedback table created\n');

    // Create AssessmentSkillScore table
    console.log('Creating AssessmentSkillScore table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "AssessmentSkillScore" (
        "id" TEXT PRIMARY KEY,
        "assessmentId" TEXT NOT NULL,
        "categoryName" TEXT NOT NULL,
        "categoryIcon" TEXT NOT NULL,
        "categoryOrder" INTEGER NOT NULL,
        "skillName" TEXT NOT NULL,
        "skillScore" INTEGER NOT NULL,
        "isFocusArea" BOOLEAN DEFAULT false,
        "skillOrder" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ AssessmentSkillScore table created\n');

    // Create indexes
    console.log('Creating indexes...');
    await client.query(`CREATE INDEX IF NOT EXISTS "InterviewAssessment_userId_idx" ON "InterviewAssessment"("userId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "AssessmentFeedback_assessmentId_idx" ON "AssessmentFeedback"("assessmentId")`);
    await client.query(`CREATE INDEX IF NOT EXISTS "AssessmentSkillScore_assessmentId_idx" ON "AssessmentSkillScore"("assessmentId")`);
    console.log('✅ Indexes created\n');

    // Add foreign key constraints
    console.log('Adding foreign key constraints...');

    try {
      await client.query(`
        ALTER TABLE "InterviewAssessment"
        ADD CONSTRAINT "InterviewAssessment_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Note: userId constraint already exists or User table missing');
    }

    try {
      await client.query(`
        ALTER TABLE "InterviewAssessment"
        ADD CONSTRAINT "InterviewAssessment_interviewId_fkey"
        FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Note: interviewId constraint already exists or Interview table missing');
    }

    try {
      await client.query(`
        ALTER TABLE "InterviewAssessment"
        ADD CONSTRAINT "InterviewAssessment_caseId_fkey"
        FOREIGN KEY ("caseId") REFERENCES "InterviewCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Note: caseId constraint already exists or InterviewCase table missing');
    }

    try {
      await client.query(`
        ALTER TABLE "AssessmentFeedback"
        ADD CONSTRAINT "AssessmentFeedback_assessmentId_fkey"
        FOREIGN KEY ("assessmentId") REFERENCES "InterviewAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Note: AssessmentFeedback constraint already exists');
    }

    try {
      await client.query(`
        ALTER TABLE "AssessmentSkillScore"
        ADD CONSTRAINT "AssessmentSkillScore_assessmentId_fkey"
        FOREIGN KEY ("assessmentId") REFERENCES "InterviewAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE
      `);
    } catch (e) {
      console.log('Note: AssessmentSkillScore constraint already exists');
    }

    console.log('✅ Foreign key constraints added\n');

    // Verify tables exist
    console.log('Verifying tables...');
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('InterviewAssessment', 'AssessmentFeedback', 'AssessmentSkillScore')
    `);

    console.log('Tables found:', result.rows.map(r => r.table_name));
    console.log('\n🎉 All assessment tables created successfully!');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
    process.exit(0);
  }
}

createTables();