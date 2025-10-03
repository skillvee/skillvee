import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://buyxawgqsxvmxbzooekf.supabase.co';
const supabaseServiceKey = 'sb_secret_YWrWDg8EPpKns9TEp0Kraw_qCsAym08';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sqlStatements = [
  // Create InterviewAssessment table
  `CREATE TABLE IF NOT EXISTS "InterviewAssessment" (
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
  );`,

  // Create AssessmentFeedback table
  `CREATE TABLE IF NOT EXISTS "AssessmentFeedback" (
    "id" TEXT PRIMARY KEY,
    "assessmentId" TEXT NOT NULL,
    "feedbackType" TEXT NOT NULL CHECK ("feedbackType" IN ('STRENGTH', 'GROWTH_AREA')),
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
  );`,

  // Create AssessmentSkillScore table
  `CREATE TABLE IF NOT EXISTS "AssessmentSkillScore" (
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
  );`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS "InterviewAssessment_userId_idx" ON "InterviewAssessment"("userId");`,
  `CREATE INDEX IF NOT EXISTS "AssessmentFeedback_assessmentId_idx" ON "AssessmentFeedback"("assessmentId");`,
  `CREATE INDEX IF NOT EXISTS "AssessmentSkillScore_assessmentId_idx" ON "AssessmentSkillScore"("assessmentId");`,
];

async function createTables() {
  console.log('Creating assessment tables in Supabase...\n');

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const shortDesc = sql.substring(0, 60).replace(/\n/g, ' ').trim();

    try {
      console.log(`[${i + 1}/${sqlStatements.length}] Executing: ${shortDesc}...`);

      // Use Supabase's raw SQL execution
      const { data, error } = await supabase.rpc('exec', { sql_query: sql });

      if (error) {
        // Try alternative approach
        const { error: error2 } = await supabase.from('_sql').select().single().throwOnError();
        if (error2) {
          console.error(`✗ Failed: ${error.message || error2.message}`);
        }
      } else {
        console.log('✓ Success');
      }
    } catch (err) {
      console.error(`✗ Failed: ${err.message}`);
    }
  }

  // Try to verify tables were created
  console.log('\nVerifying tables...');

  try {
    const { data: assessments } = await supabase.from('InterviewAssessment').select('id').limit(1);
    console.log('✓ InterviewAssessment table exists');
  } catch (err) {
    console.log('✗ InterviewAssessment table not found');
  }

  try {
    const { data: feedback } = await supabase.from('AssessmentFeedback').select('id').limit(1);
    console.log('✓ AssessmentFeedback table exists');
  } catch (err) {
    console.log('✗ AssessmentFeedback table not found');
  }

  try {
    const { data: scores } = await supabase.from('AssessmentSkillScore').select('id').limit(1);
    console.log('✓ AssessmentSkillScore table exists');
  } catch (err) {
    console.log('✗ AssessmentSkillScore table not found');
  }

  console.log('\nDone!');
  process.exit(0);
}

createTables().catch(console.error);