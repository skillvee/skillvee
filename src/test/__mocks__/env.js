// Mock implementation of env for Jest tests
module.exports = {
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
    DIRECT_URL: 'postgresql://test:test@localhost:5432/test',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_mock',
    CLERK_SECRET_KEY: 'sk_test_mock',
    SUPABASE_ACCESS_TOKEN: 'test_token'
  }
};