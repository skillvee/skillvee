# 🔐 Test Account Setup Guide

## Step 1: Create Your Test Account

### Option A: Google Account (Recommended)
1. **Create a new Gmail account** specifically for testing:
   - Go to https://accounts.google.com/signup
   - Use a name like `SkillVee Test` 
   - Choose an email like `skillvee.test.yourname@gmail.com`
   - Use a simple password you'll remember (e.g., `TestPassword123!`)

2. **Or use an existing secondary Gmail account** that you don't mind using for testing

### Option B: Email/Password Account
1. **Use any email you control** (not Gmail)
2. **First create the account** through your SkillVee application:
   - Go to http://localhost:3000/sign-up
   - Create account with your test email
   - Set a simple password (e.g., `TestPassword123!`)

## Step 2: Update Test Credentials

Open the `.env.test` file and update with your actual test account credentials:

```env
# Replace with your actual test account credentials
PLAYWRIGHT_TEST_EMAIL=your-test-email@gmail.com
PLAYWRIGHT_TEST_PASSWORD=YourActualTestPassword

# Optional: Set to 'true' for debugging
PLAYWRIGHT_HEADED=false
PLAYWRIGHT_SLOW_MO=false
```

## Step 3: Test the Setup

Run the authentication setup to verify it works:

```bash
# Test the authentication setup
npm run test:e2e:auth
```

If successful, you should see:
- ✅ Authentication setup completed
- ✅ User authenticated successfully
- ✅ Auth state saved to playwright/.auth/user.json

## Step 4: Test Protected Page Access

```bash
# Test accessing protected pages
npm run test:e2e:authenticated
```

This should now be able to access:
- ✅ /practice/results
- ✅ /dashboard  
- ✅ /interview
- ✅ All other protected pages

## Troubleshooting

### If authentication fails:

1. **Check your credentials** in `.env.test`
2. **Verify the account exists** by manually logging in at http://localhost:3000/sign-in
3. **Run in headed mode** to see what's happening:
   ```bash
   # Set in .env.test:
   PLAYWRIGHT_HEADED=true
   
   # Then run:
   npm run test:e2e:auth
   ```

### If tests are flaky:

1. **Enable slow mode** for more reliable automation:
   ```bash
   # Set in .env.test:
   PLAYWRIGHT_SLOW_MO=true
   ```

2. **Check the saved auth state**:
   ```bash
   ls -la playwright/.auth/
   cat playwright/.auth/user.json
   ```

### If Google OAuth fails:

1. Try using email/password instead of Google OAuth
2. Or create a regular email/password account through Clerk

## Security Notes

⚠️  **IMPORTANT**:
- Never use your personal accounts for testing
- The `.env.test` file is in .gitignore (won't be committed)
- Test credentials are only used locally for automation
- Consider using disposable email services for testing

## Ready to Test!

Once setup is complete, you can:

```bash
# Run all e2e tests
npm run test:e2e

# Run only authenticated tests  
npm run test:e2e:authenticated

# Run in UI mode for interactive testing
npm run test:e2e:ui

# Debug specific tests
npm run test:e2e:debug
```

Your Playwright tests will now be able to access all protected pages in your SkillVee application! 🎉