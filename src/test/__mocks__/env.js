// Mock implementation of env for Jest tests
module.exports = {
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    DIRECT_URL: 'postgresql://test:test@localhost:5432/test',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_mock',
    CLERK_SECRET_KEY: 'sk_test_mock',
    SUPABASE_ACCESS_TOKEN: 'test_token',
    GEMINI_API_KEY: 'test_gemini_api_key',
    NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test_anon_key',
    SUPABASE_SERVICE_ROLE_KEY: 'test_service_role_key',
  }
};