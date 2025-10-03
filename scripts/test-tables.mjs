import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://buyxawgqsxvmxbzooekf.supabase.co';
const supabaseKey = 'sb_secret_YWrWDg8EPpKns9TEp0Kraw_qCsAym08';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  console.log('Testing table existence...\n');

  // Test InterviewAssessment
  const { data: assessment, error: assessmentError } = await supabase
    .from('InterviewAssessment')
    .select('*')
    .limit(1);

  if (assessmentError) {
    console.log('❌ InterviewAssessment:', assessmentError.message);
  } else {
    console.log('✅ InterviewAssessment table exists');
  }

  // Test AssessmentFeedback
  const { data: feedback, error: feedbackError } = await supabase
    .from('AssessmentFeedback')
    .select('*')
    .limit(1);

  if (feedbackError) {
    console.log('❌ AssessmentFeedback:', feedbackError.message);
  } else {
    console.log('✅ AssessmentFeedback table exists');
  }

  // Test AssessmentSkillScore
  const { data: skills, error: skillsError } = await supabase
    .from('AssessmentSkillScore')
    .select('*')
    .limit(1);

  if (skillsError) {
    console.log('❌ AssessmentSkillScore:', skillsError.message);
  } else {
    console.log('✅ AssessmentSkillScore table exists');
  }

  // List all tables
  console.log('\nFetching all tables...');
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_tables', { schema_name: 'public' })
    .catch(() => ({ data: null, error: 'RPC not available' }));

  if (tables) {
    console.log('Tables in database:', tables);
  }

  process.exit(0);
}

testTables().catch(console.error);