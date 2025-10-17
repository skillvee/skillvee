/**
 * Script to setup Supabase storage bucket for interview question videos
 *
 * Run with: npx tsx scripts/setup-storage-bucket.ts
 */

import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "interview-question-videos";

async function setupStorageBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in environment variables");
    console.error("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🚀 Setting up Supabase storage bucket...\n");

  // Check if bucket already exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Error listing buckets:", listError);
    process.exit(1);
  }

  const existingBucket = buckets?.find(b => b.name === BUCKET_NAME);

  if (existingBucket) {
    console.log(`✅ Bucket "${BUCKET_NAME}" already exists`);
    console.log(`   Created at: ${existingBucket.created_at}`);
    console.log(`   Public: ${existingBucket.public}`);
    return;
  }

  // Create bucket
  console.log(`📦 Creating bucket "${BUCKET_NAME}"...`);

  const { data: bucket, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: false, // Private bucket, access via signed URLs
    fileSizeLimit: 1024 * 1024 * 1024, // 1GB per file
    allowedMimeTypes: ["video/webm", "video/mp4"],
  });

  if (createError) {
    console.error("❌ Error creating bucket:", createError);
    process.exit(1);
  }

  console.log("✅ Bucket created successfully!\n");

  // Note: Storage policies need to be set in Supabase Dashboard
  console.log("⚠️  IMPORTANT: Configure storage policies in Supabase Dashboard:");
  console.log("   1. Go to Storage > Policies");
  console.log(`   2. Select bucket: ${BUCKET_NAME}`);
  console.log("   3. Add policy for INSERT (authenticated users can upload to their folder):");
  console.log("      Policy name: Users can upload their videos");
  console.log("      Target roles: authenticated");
  console.log("      WITH CHECK: (bucket_id = 'interview-question-videos' AND (storage.foldername(name))[1] = auth.uid()::text)");
  console.log("");
  console.log("   4. Add policy for SELECT (authenticated users can read their videos):");
  console.log("      Policy name: Users can read their videos");
  console.log("      Target roles: authenticated");
  console.log("      USING: (bucket_id = 'interview-question-videos' AND (storage.foldername(name))[1] = auth.uid()::text)");
  console.log("");
  console.log("   5. Add policy for SELECT (admins can read all videos):");
  console.log("      Policy name: Admins can read all videos");
  console.log("      Target roles: authenticated");
  console.log("      USING: (bucket_id = 'interview-question-videos' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'ADMIN'))");
  console.log("\n✅ Setup complete!");
}

setupStorageBucket()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  });
