/**
 * Script to test Supabase storage bucket configuration
 *
 * Run with: npx tsx scripts/test-storage-bucket.ts
 */

import * as dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const BUCKET_NAME = "interview-question-videos";

async function testStorageBucket() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in environment variables");
    console.error("   Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🧪 Testing Supabase storage bucket configuration...\n");

  // Test 1: Check if bucket exists
  console.log("Test 1: Checking if bucket exists...");
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
    console.error("❌ Error listing buckets:", listError);
    process.exit(1);
  }

  const bucket = buckets?.find(b => b.name === BUCKET_NAME);

  if (!bucket) {
    console.error(`❌ Bucket "${BUCKET_NAME}" not found`);
    console.error("   Please create the bucket in Supabase Dashboard");
    process.exit(1);
  }

  console.log(`✅ Bucket "${BUCKET_NAME}" exists`);
  console.log(`   Public: ${bucket.public}`);
  console.log(`   Created: ${bucket.created_at}`);
  console.log("");

  // Test 2: Try to create a signed upload URL
  console.log("Test 2: Testing signed upload URL generation...");
  const testFilePath = `test-user-id/test-interview-id/test_${Date.now()}.webm`;

  const { data: uploadUrl, error: uploadUrlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUploadUrl(testFilePath);

  if (uploadUrlError) {
    console.error("❌ Error creating signed upload URL:", uploadUrlError);
    process.exit(1);
  }

  if (!uploadUrl?.signedUrl) {
    console.error("❌ No signed URL returned");
    process.exit(1);
  }

  console.log("✅ Signed upload URL generated successfully");
  console.log(`   Path: ${testFilePath}`);
  console.log(`   Token: ${uploadUrl.token}`);
  console.log("");

  // Test 3: Test upload (using service role, bypasses RLS)
  console.log("Test 3: Testing file upload...");
  const testContent = new Blob(["test video content"], { type: "video/webm" });

  const { error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(testFilePath, testContent, {
      contentType: "video/webm",
      upsert: false,
    });

  if (uploadError) {
    console.error("❌ Error uploading test file:", uploadError);
    process.exit(1);
  }

  console.log("✅ Test file uploaded successfully");
  console.log("");

  // Test 4: Create signed URL for reading
  console.log("Test 4: Testing signed read URL generation...");
  const { data: readUrl, error: readUrlError } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(testFilePath, 3600);

  if (readUrlError) {
    console.error("❌ Error creating signed read URL:", readUrlError);
    process.exit(1);
  }

  if (!readUrl?.signedUrl) {
    console.error("❌ No signed read URL returned");
    process.exit(1);
  }

  console.log("✅ Signed read URL generated successfully");
  console.log(`   URL: ${readUrl.signedUrl.substring(0, 80)}...`);
  console.log("");

  // Test 5: Clean up - delete test file
  console.log("Test 5: Cleaning up test file...");
  const { error: deleteError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([testFilePath]);

  if (deleteError) {
    console.error("⚠️  Warning: Could not delete test file:", deleteError);
    console.log("   Please manually delete:", testFilePath);
  } else {
    console.log("✅ Test file deleted successfully");
  }

  console.log("");
  console.log("🎉 All tests passed! Storage bucket is configured correctly.");
  console.log("");
  console.log("Note: These tests use the service role key which bypasses RLS policies.");
  console.log("      The actual user policies will be enforced when users upload from the app.");
}

testStorageBucket()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
