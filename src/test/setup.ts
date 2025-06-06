import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/skillvee_test';
process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_mock';
process.env.CLERK_SECRET_KEY = 'sk_test_mock';
process.env.CLERK_WEBHOOK_SECRET = 'whsec_test_mock';

// Global test utilities
declare global {
  namespace globalThis {
    var __JEST_TESTING__: boolean;
  }
}

globalThis.__JEST_TESTING__ = true;