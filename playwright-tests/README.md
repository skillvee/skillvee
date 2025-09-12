# Playwright Authentication Setup for SkillVee

This directory contains Playwright tests with authentication support for the SkillVee application.

## Setup

### 1. Install Dependencies
```bash
npm install @playwright/test
npx playwright install
```

### 2. Configure Test Credentials

Create a `.env.test` file (copy from `.env.test.example`):
```bash
cp .env.test.example .env.test
```

Edit `.env.test` with your test credentials:
```env
PLAYWRIGHT_TEST_EMAIL=your-test-email@example.com  
PLAYWRIGHT_TEST_PASSWORD=your-test-password
```

**Important:** Use a dedicated test account, not your personal account.

### 3. Test Account Setup

You'll need a test user account in your Clerk application:

1. Go to your Clerk dashboard
2. Create a test user with the email/password from `.env.test`  
3. Or use Google OAuth with a test Google account

## File Structure

```
playwright-tests/
├── README.md                     # This file
├── auth.setup.ts                 # Authentication setup (runs before tests)
├── auth.utils.ts                 # Authentication utility functions
├── authenticated-pages.spec.ts   # Tests for pages requiring authentication
└── public-pages.unauth.spec.ts   # Tests for public pages (no auth needed)
```

## How Authentication Works

### Authentication Flow
1. `auth.setup.ts` runs first and authenticates a user
2. Authentication state is saved to `./playwright/.auth/user.json`  
3. All subsequent tests use this saved authentication state
4. Tests marked `.unauth.spec.ts` run without authentication

### Test Projects
- **setup**: Runs authentication setup
- **chromium/firefox/webkit/mobile**: Authenticated tests
- **unauthenticated**: Tests that run without authentication

## Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Only Authenticated Tests
```bash
npx playwright test --project=chromium
```

### Run Only Unauthenticated Tests  
```bash
npx playwright test --project=unauthenticated
```

### Run Authentication Setup Only
```bash
npx playwright test --project=setup
```

### Debug Mode
```bash
npx playwright test --debug
```

### UI Mode
```bash
npx playwright test --ui
```

## Test Categories

### Authenticated Tests (`*.spec.ts`)
- **Purpose**: Test pages and features that require user authentication
- **Pages**: `/dashboard`, `/practice`, `/interview`, etc.
- **Setup**: Uses saved authentication state
- **Examples**: 
  - Dashboard functionality
  - Practice interview flow  
  - User profile access

### Unauthenticated Tests (`*.unauth.spec.ts`)
- **Purpose**: Test public pages and verify auth protection
- **Pages**: `/`, `/companies`, `/pricing`, `/faq`, `/sign-in`, `/sign-up`
- **Setup**: Clears any authentication state
- **Examples**:
  - Home page accessibility
  - Public content visibility
  - Auth requirement verification

## Utility Functions

The `auth.utils.ts` file provides helpful functions:

- `verifyAuthenticated(page)` - Check if user is authenticated
- `expectAuthenticated(page)` - Assert user is authenticated  
- `navigateToProtectedPage(page, url)` - Navigate to protected page
- `verifyPageRequiresAuth(page, url)` - Verify page requires auth
- `getCurrentUserInfo(page)` - Get current user information
- `signOut(page)` - Sign out current user

## Troubleshooting

### Authentication Fails
1. Check your `.env.test` credentials
2. Verify test account exists in Clerk  
3. Run setup manually: `npx playwright test --project=setup`
4. Check saved auth state: `./playwright/.auth/user.json`

### Tests Flake
1. Increase timeouts in auth setup
2. Add more wait conditions
3. Check for app-specific loading states

### Clerk Changes
If Clerk UI changes, update the selectors in `auth.setup.ts`:
- Google button selectors
- Email/password form selectors  
- User button/menu selectors

## Best Practices

1. **Use dedicated test accounts** - Never use personal accounts
2. **Keep credentials secure** - Add `.env.test` to `.gitignore`
3. **Update selectors** - When Clerk UI changes, update test selectors
4. **Test both states** - Test both authenticated and unauthenticated flows
5. **Clean state** - Ensure tests don't depend on previous test state

## CI/CD Integration

For CI environments:
1. Set environment variables for `PLAYWRIGHT_TEST_EMAIL` and `PLAYWRIGHT_TEST_PASSWORD`
2. Ensure test account exists in production Clerk instance
3. Consider using Clerk testing tokens if available
4. Run tests in headless mode: `CI=true npx playwright test`