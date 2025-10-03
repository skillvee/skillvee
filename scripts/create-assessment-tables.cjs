const https = require('https');

const SUPABASE_URL = 'buyxawgqsxvmxbzooekf.supabase.co';
const SUPABASE_KEY = 'sb_secret_YWrWDg8EPpKns9TEp0Kraw_qCsAym08';

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
  )`,

  // Create AssessmentFeedback table
  `CREATE TABLE IF NOT EXISTS "AssessmentFeedback" (
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
  )`,

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
  )`,

  // Create indexes
  `CREATE INDEX IF NOT EXISTS "InterviewAssessment_userId_idx" ON "InterviewAssessment"("userId")`,
  `CREATE INDEX IF NOT EXISTS "AssessmentFeedback_assessmentId_idx" ON "AssessmentFeedback"("assessmentId")`,
  `CREATE INDEX IF NOT EXISTS "AssessmentSkillScore_assessmentId_idx" ON "AssessmentSkillScore"("assessmentId")`,

  // Add foreign key constraints
  `ALTER TABLE "InterviewAssessment" ADD CONSTRAINT "InterviewAssessment_userId_fkey"
   FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "InterviewAssessment" ADD CONSTRAINT "InterviewAssessment_interviewId_fkey"
   FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "InterviewAssessment" ADD CONSTRAINT "InterviewAssessment_caseId_fkey"
   FOREIGN KEY ("caseId") REFERENCES "InterviewCase"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,

  `ALTER TABLE "AssessmentFeedback" ADD CONSTRAINT "AssessmentFeedback_assessmentId_fkey"
   FOREIGN KEY ("assessmentId") REFERENCES "InterviewAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE`,

  `ALTER TABLE "AssessmentSkillScore" ADD CONSTRAINT "AssessmentSkillScore_assessmentId_fkey"
   FOREIGN KEY ("assessmentId") REFERENCES "InterviewAssessment"("id") ON DELETE CASCADE ON UPDATE CASCADE`
];

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query: sql });

    const options = {
      hostname: SUPABASE_URL,
      port: 443,
      path: '/rest/v1/rpc',
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201 || res.statusCode === 204) {
          resolve(responseData);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('Creating assessment tables in Supabase...\n');

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    const shortDesc = sql.substring(0, 50).replace(/\n/g, ' ');

    try {
      console.log(`[${i + 1}/${sqlStatements.length}] Executing: ${shortDesc}...`);
      await executeSQL(sql);
      console.log('✓ Success\n');
    } catch (error) {
      console.error(`✗ Failed: ${error.message}\n`);
      // Continue with other statements even if one fails
    }
  }

  console.log('Done!');
}

main().catch(console.error);