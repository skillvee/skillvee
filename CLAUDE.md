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
├── middleware.ts                     # Next.js middleware for request handling
├── env.js                            # Environment variable validation (T3 pattern)
│
├── app/                              # Next.js App Router pages and routes
│   ├── layout.tsx                    # Root layout component
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global styles
│   │
│   ├── admin/                        # Admin management dashboard
│   │   ├── layout.tsx                # Admin layout with sidebar
│   │   ├── page.tsx                  # Admin homepage
│   │   ├── archetypes/
│   │   │   └── page.tsx              # Archetypes management
│   │   ├── logs/
│   │   │   └── page.tsx              # System logs viewer
│   │   ├── setup/
│   │   │   └── page.tsx              # Admin setup page
│   │   └── skills/
│   │       └── page.tsx              # Skills management interface
│   │
│   ├── api/                          # API routes
│   │   ├── trpc/
│   │   │   └── [trpc]/
│   │   │       └── route.ts          # tRPC HTTP endpoint handler
│   │   └── webhooks/
│   │       └── clerk/
│   │           └── route.ts          # Clerk authentication webhooks
│   │
│   ├── interview/                    # Interview session routes
│   │   ├── page.tsx                  # Interview selection/launcher
│   │   ├── __tests__/
│   │   │   └── page.test.tsx         # Interview page tests
│   │   ├── case/
│   │   │   └── [caseId]/
│   │   │       └── page.tsx          # Dynamic case detail page
│   │   ├── live/
│   │   │   └── page.tsx              # Live interview session
│   │   └── results/
│   │       └── [id]/
│   │           └── page.tsx          # Interview results & feedback
│   │
│   ├── practice/                     # Practice interview routes
│   │   ├── page.tsx                  # Practice selection page
│   │   ├── cases/
│   │   │   └── page.tsx              # Available practice cases
│   │   ├── feedback/
│   │   │   └── page.tsx              # Practice feedback page
│   │   ├── feedback-demo/
│   │   │   └── page.tsx              # Demo feedback display
│   │   └── results/
│   │       └── page.tsx              # Practice session results
│   │
│   ├── profile/                      # User profile routes
│   │   └── [username]/
│   │       ├── page.tsx              # Public profile page
│   │       └── fallback-page.tsx     # Profile fallback/loading
│   │
│   ├── sign-in/                      # Authentication routes
│   │   └── [[...sign-in]]/
│   │       ├── page.tsx              # Sign-in page
│   │       └── custom-page.tsx       # Custom sign-in UI
│   │
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx              # Sign-up page
│   │
│   ├── dashboard/
│   │   └── page.tsx                  # User dashboard
│   │
│   ├── demo/                         # Demo/testing routes
│   │   ├── page.tsx                  # Demo launcher page
│   │   └── full-transcript/
│   │       └── page.tsx              # Full transcript demo display
│   │
│   ├── candidates/
│   │   └── page.tsx                  # Candidates listing page
│   │
│   ├── companies/
│   │   └── page.tsx                  # Companies listing page
│   │
│   ├── pricing/
│   │   └── page.tsx                  # Pricing page
│   │
│   ├── faq/
│   │   └── page.tsx                  # FAQ page
│   │
│   ├── privacy/
│   │   └── page.tsx                  # Privacy policy page
│   │
│   ├── terms/
│   │   └── page.tsx                  # Terms of service page
│   │
│   ├── candidate-terms/
│   │   └── page.tsx                  # Candidate-specific terms
│   │
│   ├── company-terms/
│   │   └── page.tsx                  # Company-specific terms
│   │
│   └── unauthorized/
│       └── page.tsx                  # Unauthorized access page
│
├── components/                       # Reusable React components
│   ├── animation-provider.tsx        # Animation context provider
│   ├── hero-lottie.tsx               # Hero section with Lottie animation
│   ├── navigation.tsx                # Main navigation component
│   │
│   ├── ui/                           # Shadcn/ui components library
│   │   ├── __tests__/
│   │   │   └── interview-recorder.test.tsx  # Recorder component tests
│   │   ├── auto-resize-textarea.tsx  # Auto-resizing textarea
│   │   ├── alert.tsx                 # Alert component
│   │   ├── audio-visualizer.tsx      # Audio waveform visualizer
│   │   ├── avatar.tsx                # User avatar component
│   │   ├── badge.tsx                 # Badge/tag component
│   │   ├── breadcrumb.tsx            # Breadcrumb navigation
│   │   ├── button.tsx                # Button component
│   │   ├── card.tsx                  # Card container
│   │   ├── checkbox.tsx              # Checkbox input
│   │   ├── collapsible.tsx           # Collapsible panel
│   │   ├── default-templates.tsx     # Default template definitions
│   │   ├── dialog.tsx                # Modal dialog
│   │   ├── dropdown-menu.tsx         # Dropdown menu
│   │   ├── focus-area-selector.tsx   # Focus area selection component
│   │   ├── input.tsx                 # Text input
│   │   ├── interview-recorder.tsx    # Interview recording UI component
│   │   ├── label.tsx                 # Form label
│   │   ├── media-recorder.tsx        # Media recording component
│   │   ├── progress.tsx              # Progress bar
│   │   ├── scroll-area.tsx           # Scrollable area
│   │   ├── select.tsx                # Select dropdown
│   │   ├── separator.tsx             # Visual separator
│   │   ├── sheet.tsx                 # Sliding sheet/drawer
│   │   ├── sidebar.tsx               # Sidebar navigation
│   │   ├── skeleton.tsx              # Loading skeleton
│   │   ├── slider.tsx                # Slider control
│   │   ├── switch.tsx                # Toggle switch
│   │   ├── table.tsx                 # Table component
│   │   ├── tabs.tsx                  # Tabbed interface
│   │   ├── textarea.tsx              # Multi-line text input
│   │   └── tooltip.tsx               # Tooltip component
│   │
│   ├── admin/                        # Admin-specific components
│   │   ├── site-header.tsx           # Admin page header
│   │   ├── app-sidebar.tsx           # Admin sidebar navigation
│   │   └── skills/
│   │       ├── __tests__/
│   │       │   └── skills-archetypes-matrix.test.tsx  # Archetype matrix tests
│   │       ├── create-domain-form.tsx     # Domain creation form
│   │       ├── csv-import-dialog.tsx      # CSV import modal
│   │       ├── section-cards.tsx          # Section card display
│   │       ├── skills-archetypes-matrix.tsx   # Skills/archetype matrix visualization
│   │       ├── skills-data-table.tsx      # Skills data table
│   │       ├── skills-stats.tsx           # Skills statistics display
│   │       └── skills-tree-view.tsx       # Hierarchical tree view
│   │
│   ├── interview/                    # Interview-specific components
│   │   ├── __tests__/
│   │   │   └── LiveInterviewSession.test.tsx  # Interview session tests
│   │   ├── CaseContextDisplay.tsx    # Case problem context display
│   │   ├── CurrentQuestionDisplay.tsx    # Current question renderer
│   │   ├── FullTranscriptDemo.tsx    # Full transcript demo viewer
│   │   ├── GeminiLiveSettings.tsx    # Gemini Live configuration UI
│   │   ├── InterviewNotepad.tsx      # Candidate note-taking area
│   │   ├── LiveInterviewSession.tsx  # Main interview session component
│   │   ├── NextQuestionDialog.tsx    # Next question confirmation dialog
│   │   └── PermissionsConsentDialog.tsx  # Browser permissions consent
│   │
│   ├── profile/                      # Profile-specific components
│   │   ├── EducationSection.tsx      # Education history section
│   │   ├── ExperienceSection.tsx     # Work experience section
│   │   ├── ProfileHeader.tsx         # Profile header/intro
│   │   └── SkillsSection.tsx         # Skills display section
│   │
│   ├── analytics/                    # Analytics tracking components
│   │   ├── index.ts                  # Analytics exports
│   │   ├── clarity.tsx               # Microsoft Clarity integration
│   │   └── google-analytics.tsx      # Google Analytics integration
│   │
│   ├── hooks/
│   │   └── use-mobile.tsx            # Mobile detection hook
│   │
│   └── lib/
│       └── utils.ts                  # Component utility functions
│
├── hooks/                            # Custom React hooks
│   ├── __tests__/
│   │   ├── connection-state-sync.test.ts   # Connection state tests
│   │   ├── error-scenarios.test.ts         # Error handling tests
│   │   ├── useGeminiLive-new.test.ts       # New Gemini Live hook tests
│   │   ├── useGeminiLive.test.ts           # Gemini Live hook tests
│   │   ├── useMediaCapture.test.ts         # Media capture tests
│   │   ├── useMediaUpload.test.ts          # Upload functionality tests
│   │   └── usePermissions.test.ts          # Permission checking tests
│   ├── useCSVValidation.ts           # CSV validation logic hook
│   ├── useGeminiLive.ts              # Gemini Live API integration hook
│   ├── useMediaCapture.ts            # Recording capture functionality
│   ├── useMediaUpload.ts             # Media upload to storage
│   ├── usePermissions.ts             # Browser permissions checking
│   ├── useQuestionVideoRecorder.ts   # Question-specific video recording
│   └── useQuestionVideoUpload.ts     # Question video upload
│
├── lib/                              # Utility libraries and helpers
│   ├── __tests__/
│   │   ├── gemini-live-audio.test.ts         # Audio module tests
│   │   ├── gemini-live-core.test.ts          # Core functionality tests
│   │   ├── gemini-live-integration.test.ts   # Integration tests
│   │   ├── gemini-live.test.ts               # Main module tests
│   │   └── media-compatibility.test.ts       # Compatibility tests
│   ├── animations.ts                 # Animation utilities
│   ├── audio-mixer.ts                # Audio mixing utility
│   ├── clerk-theme.ts                # Clerk authentication theme
│   ├── csv-parser.ts                 # CSV parsing utility
│   ├── gemini-live.ts                # Gemini Live client wrapper
│   ├── media-compatibility.ts        # Browser compatibility checking
│   ├── supabase.ts                   # Supabase client initialization
│   ├── utils.ts                      # General utility functions
│   │
│   └── gemini-live/                  # Gemini Live WebSocket integration
│       ├── CLAUDE.md                 # Detailed module documentation
��       ├── index.ts                  # Public API exports
│       ├── types.ts                  # TypeScript interfaces and types
│       │
│       ├── audio/                    # Audio recording and playback
│       │   ├── __tests__/
│       │   │   ├── recorder.test.ts  # Audio recorder tests
│       │   │   └── streamer.test.ts  # Audio playback tests
│       │   ├── index.ts              # Audio module exports
│       │   ├── recorder.ts           # AudioWorklet-based microphone capture
│       │   └── streamer.ts           # Audio playback with buffering
│       │
│       ├── video/                    # Video capture
│       │   ├── __tests__/
│       │   │   └── screen-recorder.test.ts  # Video capture tests
│       │   ├── index.ts              # Video module exports
│       │   └── screen-recorder.ts    # Screen sharing and screenshot capture
│       │
│       └── client/                   # WebSocket and API communication
│           ├── __tests__/
│           │   ├── gemini-client.test.ts     # Client tests
│           │   └── websocket-client.test.ts  # WebSocket tests
│           ├── index.ts              # Client module exports
│           ├── gemini-client.ts      # Main orchestrator class
│           └── websocket-client.ts   # WebSocket connection management
│
├── server/                           # Server-side code
│   ├── db.ts                         # Prisma client singleton
│   │
│   ├── ai/                           # AI integration services
│   │   ├── index.ts                  # AI module exports
│   │   │
│   │   ├── providers/
│   │   │   └── gemini/
│   │   │       ├── index.ts          # Gemini provider exports
│   │   │       ├── client.ts         # Gemini API client initialization
│   │   │       └── types.ts          # Response schemas and interfaces
│   │   │
│   │   ├── prompts/
│   │   │   ├── assessment/
│   │   │   │   ├── index.ts          # Assessment prompts exports
│   │   │   │   ├── types.ts          # Assessment response types
│   │   │   │   ├── assessment-aggregation.ts  # Aggregation logic prompts
│   │   │   │   └── video-assessment.ts        # Video assessment evaluation prompts
│   │   │   └── practice/
│   │   │       ├── case-generation.ts    # Case generation prompts
│   │   │       ├── focus-areas.ts        # Focus area identification prompts
│   │   │       └── job-analysis.ts       # Job description analysis prompts
│   │   │
│   │   └── services/
│   │       ├── case-generation.service.ts    # Case generation business logic
│   │       ├── job-analysis.service.ts       # Job analysis service
│   │       └── role-focus.service.ts         # Role focus identification service
│   │
│   ├── api/                          # API layer (tRPC)
│   │   ├── trpc.ts                   # tRPC configuration
│   │   ├── root.ts                   # Root router combining all routers
│   │   │
│   │   ├── routers/                  # tRPC route handlers
│   │   │   ├── __tests__/
│   │   │   │   ├── ai-gemini-live.test.ts    # Gemini Live API tests
│   │   │   │   ├── interview.test.ts         # Interview router tests
│   │   │   │   └── jobDescription.test.ts    # Job description router tests
│   │   │   ├── admin.ts              # Admin management endpoints
│   │   │   ├── ai.ts                 # AI service endpoints
│   │   │   ├── assessment.ts         # Assessment endpoints
│   │   │   ├── example.ts            # Example/template router
│   │   │   ├── interview.ts          # Interview management endpoints
│   │   │   ├── jobDescription.ts     # Job description endpoints
│   │   │   ├── media.ts              # Media upload/processing endpoints
│   │   │   ├── practice.ts           # Practice session endpoints
│   │   │   ├── profile.ts            # User profile endpoints
│   │   │   ├── questionRecording.ts  # Question recording endpoints
│   │   │   ├── skills-new.ts         # New skills management endpoints
│   │   │   └── user.ts               # User management endpoints
│   │   │
│   │   ├── middleware/
│   │   │   ├── __tests__/
│   │   │   │   ├── rateLimit.test.ts # Rate limiting tests
│   │   │   │   └── validation.test.ts    # Validation middleware tests
│   │   │   ├── rateLimit.ts          # Rate limiting middleware
│   │   │   └── validation.ts         # Request validation middleware
│   │   │
│   │   ├── schemas/                  # Zod validation schemas
│   │   │   ├── ai.ts                 # AI request schemas
│   │   │   ├── assessment.ts         # Assessment schemas
│   │   │   ├── common.ts             # Common/shared schemas
│   │   │   ├── interview.ts          # Interview schemas
│   │   │   ├── jobDescription.ts     # Job description schemas
│   │   │   ├── media.ts              # Media upload schemas
│   │   │   ├── questionRecording.ts  # Question recording schemas
│   │   │   └── skills.ts             # Skills management schemas
│   │   │
│   │   ├── types/
│   │   │   └── errors.ts             # Custom error types
│   │   │
│   │   └── utils/
│   │       ├── __tests__/
│   │       │   └── csv-parser.test.ts    # CSV parsing tests
│   │       ├── csv-parser.ts         # CSV file parsing utility
│   │       ├── gemini-db-logger.ts   # Database logging for Gemini calls
│   │       ├── interview-categories.ts   # Interview category definitions
│   │       ├── log-store.ts          # Logging storage utility
│   │       └── pagination.ts         # Pagination helpers
│   │
│   └── services/                     # Business logic services
│       ├── brandfetch.service.ts     # Brand/company data fetching
│       └── conversation-export.service.ts  # Conversation export functionality
│
├── styles/                           # Global stylesheets
│   ├── clerk-custom.css              # Clerk authentication styling
│   └── globals.css                   # Global Tailwind/CSS styles
│
├── trpc/                             # tRPC client configuration
│   ├── query-client.ts               # React Query client setup
│   ├── react.tsx                     # React hooks for tRPC
│   └── server.ts                     # Server-side tRPC caller
│
└── test/                             # Test utilities and setup
    ├── setup.ts                      # Jest configuration setup
    ├── __mocks__/
    │   ├── env.js                    # Environment variable mocks
    │   └── superjson.js              # SuperJSON serialization mock
    └── helpers/
        └── trpc.ts                   # tRPC test helpers
```

**Summary**: 69+ directories, 151+ TypeScript/TSX files across 8 major sections

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

## Gemini Live Integration (`src/lib/gemini-live/`)

**Client-side real-time WebSocket API** for audio/video streaming with Gemini Live.
**Note**: Separate from `server/ai/` which handles server-side text-based AI processing.

### Modular Architecture

```
src/lib/gemini-live/
├── types.ts                          # All TypeScript interfaces and types
├── audio/                            # Audio recording and playback
│   ├── recorder.ts                   # Microphone capture using AudioWorklet
│   ├── streamer.ts                   # Audio playback with smart buffering
│   ├── __tests__/                    # Audio module tests
│   └── index.ts                      # Audio module exports
├── video/                            # Video capture
│   ├── screen-recorder.ts            # Screen sharing and screenshot capture
│   ├── __tests__/                    # Video module tests
│   └── index.ts                      # Video module exports
├── client/                           # API communication
│   ├── websocket-client.ts           # WebSocket connection management
│   ├── gemini-client.ts              # Main orchestrator class
│   ├── __tests__/                    # Client module tests
│   └── index.ts                      # Client module exports
├── index.ts                          # Public API (use for imports)
└── CLAUDE.md                         # Detailed module documentation
```

**Usage**: Always import from `~/lib/gemini-live` for backward compatibility
**Modification guide**: See `src/lib/gemini-live/CLAUDE.md` for detailed architecture

### Key Differences: lib/gemini-live vs server/ai

| Feature | lib/gemini-live | server/ai |
|---------|----------------|-----------|
| **Purpose** | Real-time interview conversations | Job analysis, case generation |
| **API** | Gemini Live WebSocket | Google Generative AI SDK |
| **Location** | Client-side (browser) | Server-side (tRPC) |
| **Communication** | Bidirectional streaming | Request/response |
| **Data** | Audio/video streams | Text prompts/responses |

## AI Integration Architecture (Server-side)

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
