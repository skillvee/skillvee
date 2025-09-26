# Claude Memory for Skillvee Project

## Project Overview

**Name**: Skillvee - AI-Powered Technical Interview Platform  
**Type**: T3 Stack Application
**Repository**: <https://github.com/matiashoyld/skillvee>  
**Live URL**: <https://skillvee.vercel.app>  

## What Skillvee Does

AI-powered mock interview platform for data science roles:

1. **Job Description Input** → AI-powered parsing with Gemini 2.5 Flash
2. **AI Case Generation** → Gemini 2.5 Pro creates realistic interview questions
3. **Live Interview Session** → Full screen + audio recording with MediaRecorder API
4. **AI Assessment** → Video processing, transcription, and performance evaluation
5. **SkillVee Platform Hook** → Connects to job matching platform

## Tech Stack & Architecture

### Core Framework

- **Next.js 15.2.3** with App Router, **TypeScript**, **React 19**, **tRPC**

### Key Services

- **Clerk** for authentication
- **Supabase** PostgreSQL + **Prisma** ORM
- **Gemini 2.5** Flash/Pro for AI processing
- **MediaRecorder API** for screen/audio capture
- **Shadcn/ui** + **Tailwind CSS v4** for UI
- **Vercel** for deployment

## Key Commands

- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run typecheck` - TypeScript checking  
- `npm run lint` - ESLint checking
- `npm test` - Run Jest test suite
- `npx prisma db push` - Push schema to database
- `supabase db pull` - Pull remote schema changes

## Development Guidelines

- **Clean, minimal approach** - Remove unnecessary boilerplate
- **Type safety first** - Strong TypeScript usage
- **Modern tooling** - Latest versions and best practices  
- **Testing before deployment** - Verify connections and builds
- **Conventional Commits** - Use format: `type(scope): short description`
  - Examples: `feat(auth): add Clerk integration`, `fix(db): resolve connection pooling issue`
- **NO Claude attribution** - Do not add "Generated with Claude Code" or "Co-Authored-By: Claude" to commits or PRs
- **NO secrets in PRs** - Never include actual secrets, tokens, or API keys in pull request descriptions or commit messages
- **NO secrets in documentation** - Never commit actual secrets to CLAUDE.md, README.md, or any tracked files
-

## File Structure

### Core Application Structure

```bash
src/
├── app/                           # Next.js App Router pages
│   ├── (auth)/                   # Authentication-protected routes
│   │   ├── dashboard/           # User dashboard
│   │   ├── interview/           # Interview session pages
│   │   │   ├── [id]/           # Dynamic interview routes
│   │   │   └── prepare/        # Interview preparation
│   │   ├── jobs/               # Job description management
│   │   └── results/            # Interview results & feedback
│   ├── api/                     # API routes
│   │   ├── trpc/               # tRPC endpoints
│   │   └── webhooks/           # External service webhooks
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
│
├── components/
│   ├── ui/                      # Shadcn/ui components
│   │   ├── interview-recorder.tsx
│   │   ├── media-recorder.tsx
│   │   ├── job-form.tsx
│   │   └── [shadcn components]
│   ├── interview/               # Interview-specific components
│   │   ├── question-display.tsx
│   │   ├── timer.tsx
│   │   └── controls.tsx
│   └── shared/                  # Reusable components
│       ├── navigation.tsx
│       └── footer.tsx
│
├── hooks/
│   ├── useMediaCapture.ts      # Core recording functionality
│   ├── usePermissions.ts       # Browser permissions
│   ├── useMediaUpload.ts       # Upload to storage
│   ├── useInterview.ts         # Interview state management
│   └── useTimer.ts             # Interview timer logic
│
├── lib/
│   ├── ai/                     # AI service integrations
│   │   ├── gemini.ts          # Gemini API client
│   │   └── prompts.ts         # AI prompt templates
│   ├── db/                    # Database utilities
│   │   └── prisma.ts         # Prisma client singleton
│   ├── media/                 # Media handling
│   │   ├── compatibility.ts  # Browser compatibility
│   │   └── processing.ts     # Video/audio processing
│   ├── utils.ts               # General utilities
│   └── validators.ts          # Zod schemas & validation
│
├── server/
│   ├── api/
│   │   ├── routers/          # tRPC routers
│   │   │   ├── interview.ts
│   │   │   ├── job.ts
│   │   │   └── assessment.ts
│   │   ├── root.ts          # Root router
│   │   └── trpc.ts          # tRPC configuration
│   └── services/             # Business logic services
│       ├── interview.service.ts
│       ├── assessment.service.ts
│       └── job.service.ts
│
├── styles/
│   └── globals.css           # Tailwind CSS v4
│
└── types/
    ├── interview.ts          # Interview-related types
    ├── job.ts               # Job description types
    └── api.ts               # API response types
```

### Configuration Files

```bash
/
├── .env.local               # Local environment variables
├── .eslintrc.json          # ESLint configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.ts      # Tailwind CSS v4 config
├── tsconfig.json           # TypeScript configuration
├── prisma/
│   └── schema.prisma       # Database schema
├── supabase/
│   ├── config.toml        # Supabase configuration
│   └── migrations/        # Database migrations
└── playwright.config.ts    # Playwright E2E config
```

## Testing Framework

### Testing Infrastructure

- **Framework**: Jest 29.7.0 with TypeScript + React Testing Library
- **Coverage**: API middleware, media capture hooks, React components, integration flows
- **Mock Strategy**: MediaRecorder API, tRPC endpoints, browser permissions, DOM environment

### Test Suite Structure

```bash
src/
├── hooks/
│   └── __tests__/
│       ├── useMediaCapture.test.ts      # Recording functionality tests
│       ├── usePermissions.test.ts       # Browser permission tests
│       ├── useMediaUpload.test.ts       # Upload integration tests
│       ├── useInterview.test.ts         # Interview state tests
│       └── useTimer.test.ts             # Timer logic tests
│
├── components/
│   ├── ui/__tests__/
│   │   ├── interview-recorder.test.tsx  # Complete recorder tests
│   │   ├── media-recorder.test.tsx      # Basic recorder tests
│   │   └── job-form.test.tsx           # Job form validation tests
│   ├── interview/__tests__/
│   │   ├── question-display.test.tsx    # Question rendering tests
│   │   ├── timer.test.tsx              # Timer component tests
│   │   └── controls.test.tsx           # Interview control tests
│   └── shared/__tests__/
│       ├── navigation.test.tsx         # Navigation component tests
│       └── footer.test.tsx            # Footer component tests
│
├── lib/
│   ├── ai/__tests__/
│   │   ├── gemini.test.ts             # AI service integration tests
│   │   └── prompts.test.ts            # Prompt template tests
│   ├── db/__tests__/
│   │   └── prisma.test.ts            # Database client tests
│   ├── media/__tests__/
│   │   ├── compatibility.test.ts     # Browser compatibility tests
│   │   └── processing.test.ts        # Media processing tests
│   └── __tests__/
│       ├── utils.test.ts             # Utility function tests
│       └── validators.test.ts        # Validation schema tests
│
├── server/
│   ├── api/
│   │   └── routers/__tests__/
│   │       ├── interview.test.ts     # Interview API tests
│   │       ├── job.test.ts          # Job API tests
│   │       └── assessment.test.ts   # Assessment API tests
│   └── services/__tests__/
│       ├── interview.service.test.ts # Interview business logic
│       ├── assessment.service.test.ts # Assessment logic
│       └── job.service.test.ts      # Job service tests
│
└── app/
    ├── (auth)/
    │   └── interview/__tests__/
    │       ├── [id]/page.test.tsx   # Dynamic interview page tests
    │       └── prepare/page.test.tsx # Preparation page tests
    └── api/
        └── __tests__/
            ├── trpc/               # tRPC endpoint tests
            └── webhooks/           # Webhook handler tests
```

### Test Configuration Files

```bash
/
├── jest.config.js              # Jest configuration
├── jest.setup.js              # Test environment setup
├── __mocks__/                 # Global mocks
│   ├── mediaRecorder.ts      # MediaRecorder API mock
│   ├── permissions.ts        # Browser permissions mock
│   └── clerk.ts             # Clerk authentication mock
└── playwright-tests/
    ├── auth.setup.simplified.ts    # Authentication setup
    ├── auth.utils.ts               # Auth helper utilities
    ├── authenticated-pages.spec.ts # Protected routes testing
    ├── public-pages.unauth.spec.ts # Public routes testing
    └── README.md                   # E2E test documentation
```

### Test Coverage Goals

- **API Layer**: Rate limiting, validation, tRPC routers (67+ tests)
- **Media Capture**: Hooks, components, browser compatibility, error scenarios (56+ tests)
- **Integration**: Full interview flow, job description creation, recording lifecycle
- **Error Handling**: Permission denied, device failures, network timeouts, upload failures
- **Business Logic**: Interview assessment, AI processing, data validation
- **Authentication**: Clerk integration, route protection, session management

## Playwright E2E Testing

### Configuration

- **Framework**: Playwright 1.55.0 with TypeScript
- **Browser**: Chromium only (optimized for speed)
- **Authentication**: Persistent auth state with Clerk integration
- **Projects**: Setup, authenticated, and unauthenticated test suites

### Test Structure

```bash
playwright-tests/
├── auth.setup.simplified.ts       # Authentication setup
├── auth.utils.ts                  # Auth helper utilities
├── authenticated-pages.spec.ts    # Protected routes testing
├── public-pages.unauth.spec.ts   # Public routes testing
└── README.md                      # Setup documentation
```

## Supabase CLI Essentials

**Status**: ✅ Configured with project ID: buyxawgqsxvmxbzooekf

```bash
# Essential commands
supabase db pull                    # Pull remote schema changes  
supabase db push                    # Push local schema changes
supabase gen types typescript       # Generate TypeScript types
supabase migration new <name>       # Create new migration
```

## AI Integration Architecture

### Folder Structure
```
src/server/ai/
├── providers/          # LLM provider clients (Gemini, OpenAI, etc.)
│   └── gemini/
│       ├── client.ts   # Provider initialization & config
│       ├── types.ts    # Response schemas & interfaces
│       └── index.ts    # Public exports
├── prompts/           # Organized prompt templates
│   ├── practice/      # Feature-specific prompts
│   │   ├── job-analysis.ts
│   │   └── case-generation.ts
│   ├── schemas/       # JSON schemas for structured outputs
│   └── templates/     # Reusable prompt components
├── services/          # Business logic & orchestration
│   └── job-analysis.service.ts
└── index.ts           # Module exports
```

### Best Practices for AI Features

1. **Prompt Organization**
   - Each feature gets its own prompts subfolder
   - Keep prompts as pure functions that return strings
   - Include example responses in prompts for better formatting
   - Use clear section headers and formatting in prompts

2. **Schema Definition**
   - Define response schemas in provider types.ts
   - Use TypeScript interfaces matching the schemas
   - Include validation and fallback handling

3. **Service Layer**
   - Handle all AI API calls through service functions
   - Include logging and error handling
   - Pass context (userId, sessionId) for tracking
   - Return consistent success/error response format

4. **Adding New AI Features**
   ```typescript
   // 1. Create prompt template
   src/server/ai/prompts/[feature]/[action].ts

   // 2. Define response schema
   src/server/ai/providers/gemini/types.ts

   // 3. Create service function
   src/server/ai/services/[feature].service.ts

   // 4. Use in router/API
   import { analyzeFeature } from "~/server/ai/services/feature.service";
   ```

5. **Model Configuration**
   - Use constants for model names (GEMINI_MODELS)
   - Centralize temperature and token settings
   - Allow override per feature if needed

## Production Deployment

- **Vercel Integration**: Automatic deployments on main branch push
- **Environment Variables**: Ensure all required env vars are set in Vercel dashboard
- **Database Migrations**: Run `npx prisma db push` before deployment if schema changes
- **Build Verification**: Always run `npm run build` locally before pushing to production
