# Claude Memory for Skillvee Project

## Project Overview
**Name**: Skillvee - AI-Powered Technical Interview Platform  
**Type**: T3 Stack Application  
**Owner**: Matias (@matiashoyld)  
**Repository**: https://github.com/matiashoyld/skillvee  
**Live URL**: https://skillvee.vercel.app  
**Branch**: Currently on `feat/landing-page` (main: `main`)

## What Skillvee Does
AI-powered mock interview platform for technical roles with full user journey:
1. **Modern Landing Experience** → Professional marketing site with animations
2. **Job Description Input** → AI-powered parsing with Gemini 2.5 Flash  
3. **Dual Interview Modes** → Traditional recorded + Live AI conversation (Gemini Live API)
4. **Smart Assessment** → AI-powered feedback with video analysis and skill mapping
5. **Career Integration** → Job matching and skill certification pathway

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
### Development
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run typecheck` - TypeScript checking  
- `npm run lint` - ESLint checking
- `npm run lint:fix` - Auto-fix ESLint issues

### Testing
- `npm test` - Run Jest test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:e2e` - Run Playwright end-to-end tests
- `npm run test:e2e:ui` - Interactive Playwright UI mode
- `npm run test:e2e:debug` - Debug Playwright tests
- `npm run test:e2e:auth` - Run authentication setup tests
- `npm run test:e2e:authenticated` - Run authenticated user tests
- `npm run test:e2e:public` - Run unauthenticated tests

### Database
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Database management UI
- `supabase db pull` - Pull remote schema changes

### UI Verification
- `npm run ui:check [url]` - Visual UI testing across all browsers
- `npm run ui:responsive [url]` - Test responsive design across viewports
- `npm run ui:accessibility [url]` - Run accessibility checks

## Development Guidelines
- **Clean, minimal approach** - Remove unnecessary boilerplate
- **Type safety first** - Strong TypeScript usage
- **Modern tooling** - Latest versions and best practices  
- **Testing before deployment** - Verify connections and builds
- **Visual UI verification** - Always run Playwright checks before completing UI tasks
- **Conventional Commits** - Use format: `type(scope): short description`
  - Examples: `feat(auth): add Clerk integration`, `fix(db): resolve connection pooling issue`
- **NO Claude attribution** - Do not add "Generated with Claude Code" or "Co-Authored-By: Claude" to commits or PRs
- **NO secrets in PRs** - Never include actual secrets, tokens, or API keys in pull request descriptions or commit messages
- **NO secrets in documentation** - Never commit actual secrets to CLAUDE.md, README.md, or any tracked files

## Current Implementation Status

### ✅ Fully Implemented Features
1. **Landing Page (`/`)** - Modern marketing site with Lottie animations, responsive design
2. **Job Description Input (`/job-description`)** - 3-step wizard with AI parsing via Gemini 2.5 Flash
3. **Live AI Interview (`/interview/live`)** - Real-time conversation with Gemini Live API
4. **Practice System (`/practice`)** - Interview practice with comprehensive feedback
5. **Feedback Analysis (`/practice/feedback`)** - Detailed performance analytics with mock data
6. **Authentication Flow** - Complete Clerk integration with user roles and protected routes
7. **Database Architecture** - Full Prisma schema with Users, Interviews, Assessments, Media, etc.

### 🔄 Partially Implemented
1. **Traditional Interview Mode (`/interview`)** - Basic structure, needs MediaRecorder integration
2. **Dashboard (`/dashboard`)** - Exists but needs user data integration
3. **Result Pages (`/practice/results`)** - Implemented but needs real assessment connection

### Available Application Routes
```bash
/                           # Landing page with animations
/sign-in, /sign-up         # Clerk authentication
/job-description           # AI-powered job parsing wizard  
/interview                 # Traditional interview mode
/interview/live            # Live AI conversation (Gemini Live)
/practice                  # Mock interview practice
/practice/feedback         # Detailed feedback analysis
/practice/results          # Assessment results
/dashboard                 # User dashboard
/candidates, /companies    # B2B landing pages  
/pricing                   # Pricing information
/faq                       # FAQ page
/terms, /privacy           # Legal pages
/candidate-terms           # Candidate-specific terms
/company-terms             # Company-specific terms
/demo                      # Demo page
```

### User Journey Flows
1. **Standard Flow**: Landing → Sign Up → Job Description → Practice Interview → Feedback
2. **Live AI Flow**: Landing → Sign Up → Job Description → Live AI Interview → Results  
3. **Quick Practice**: Landing → Sign Up → Practice → Feedback (uses mock job data)

## Key Technical Insights

### Critical Architecture Decisions
- **AI Services**: Gemini 2.5 Flash for job description parsing, Gemini 2.5 Pro for case generation
- **Media Capture**: Browser MediaRecorder API with cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- **Processing Pipeline**: Background job queues for video processing and AI assessment
- **Upload Strategy**: Chunked uploads via tRPC with progress tracking and error recovery

## Media Capture Implementation
**Status**: ✅ Complete with comprehensive browser support

### Core Components
- **`useMediaCapture`**: Screen/audio recording with MediaRecorder API
- **`usePermissions`**: Unified permission management for camera/mic/screen
- **`useMediaUpload`**: tRPC integration with chunked uploads and progress tracking
- **`InterviewRecorder`**: Complete recording UI with controls and real-time feedback
- **Media Compatibility**: Cross-browser MIME type detection and Safari fallbacks

### Key Features
- **Recording Types**: Screen-only, audio-only, or combined screen+audio
- **Real-time Controls**: Start/stop/pause/resume with live duration and file size
- **Permission Flow**: Graceful permission requests with detailed error handling
- **Upload Integration**: Auto-upload with progress tracking and cancellation
- **Browser Support**: Optimized constraints and bitrates per browser
- **Error Recovery**: Comprehensive error handling for all failure modes

### File Structure
```bash
src/hooks/
├── useMediaCapture.ts     # Core recording functionality
├── usePermissions.ts      # Permission management
└── useMediaUpload.ts      # Upload integration

src/components/ui/
├── interview-recorder.tsx # Complete recording interface
└── media-recorder.tsx     # Basic recorder component

src/lib/
└── media-compatibility.ts # Cross-browser compatibility
```

## tRPC API Implementation
**Status**: ✅ Complete with comprehensive testing framework

### Architecture Overview
- **Type-Safe Procedures**: Public, protected, admin, and AI-specific endpoints
- **Enhanced Middleware**: Rate limiting (3 tiers), validation with XSS protection, timing
- **5 Main Routers**: JobDescription, Interview, AI, Media, Assessment
- **Advanced Features**: Cursor-based pagination, role-based access control, error handling

### Key Features Implemented
- **Authentication Integration**: Seamless Clerk integration with user role checking
- **Rate Limiting**: Multiple tiers (strict: 5/min, moderate: 30/min, AI: 20/min)
- **Input Validation**: XSS protection, file upload validation, business rule validation
- **Error Handling**: Custom error types with detailed formatting
- **Mock AI Integrations**: Ready for Gemini 2.5 Pro implementation

### Production-Ready Capabilities
- **Job Description Management**: CRUD operations with template system and AI focus detection
- **Interview Lifecycle**: Complete workflow from scheduling to completion with real-time session management
- **AI Operations**: Case generation, assessment analysis, transcription, response validation
- **Media Handling**: Recording management with upload/download capabilities
- **Assessment System**: Comprehensive evaluation with analytics and benchmarking

## Testing Framework
**Status**: ✅ Jest configured with 120+ comprehensive tests + Playwright for UI verification

### Testing Infrastructure
- **Framework**: Jest 29.7.0 with TypeScript + React Testing Library
- **UI Testing**: Playwright for cross-browser visual verification and accessibility
- **Coverage**: API middleware, media capture hooks, React components, integration flows
- **Mock Strategy**: MediaRecorder API, tRPC endpoints, browser permissions, DOM environment

### Test Coverage Areas
- **API Layer**: Rate limiting, validation, tRPC routers (67 tests)
- **Media Capture**: Hooks, components, browser compatibility, error scenarios (56+ tests)
- **Integration**: Full interview flow, job description creation, recording lifecycle
- **Error Handling**: Permission denied, device failures, network timeouts, upload failures
- **UI Verification**: Cross-browser testing (Chrome, Firefox, Safari), responsive design, accessibility

### Key Test Suites
```bash
src/hooks/__tests__/           # Hook testing with mocked APIs
src/components/ui/__tests__/   # Component integration tests  
src/app/interview/__tests__/   # End-to-end flow testing
src/lib/__tests__/            # Utility and compatibility tests
scripts/ui-check.ts           # Playwright UI verification helper
playwright-tests/             # Playwright test specifications
```

## Playwright UI Verification
**Status**: ✅ Complete with automated visual testing capabilities

### Core Features
- **Cross-Browser Testing**: Automated checks in Chromium, Firefox, and WebKit
- **Responsive Testing**: Viewport testing across desktop, tablet, and mobile sizes
- **Accessibility Checks**: Alt text validation, heading hierarchy, form labels
- **Screenshot Capture**: Automatic screenshots saved to `playwright-screenshots/`
- **Interactive Mode**: Headed browser mode for visual debugging

### Usage Workflow
```bash
# Start development server
npm run dev

# Run UI verification (in separate terminal)
npm run ui:check [url]           # Check all browsers
npm run ui:responsive [url]      # Test responsive design
npm run ui:accessibility [url]   # Accessibility audit

# Run Playwright tests
npm run playwright               # Headless mode
npm run playwright:headed        # With visible browser
npm run playwright:ui           # Interactive UI mode
```

### Configuration
- **Base URL**: http://localhost:3000 (auto-starts dev server)
- **Browsers**: Desktop Chrome/Firefox/Safari, Mobile Chrome/Safari
- **Reports**: HTML reports with screenshots and video on failure
- **Parallel Execution**: Fully parallel test execution for speed

## Supabase CLI Essentials
**Status**: ✅ Configured with project ID: buyxawgqsxvmxbzooekf

```bash
# Essential commands
supabase db pull                    # Pull remote schema changes  
supabase db push                    # Push local schema changes
supabase gen types typescript       # Generate TypeScript types
supabase migration new <name>       # Create new migration
```

## Build Configuration & Deployment
**Status**: ✅ Production build successfully configured

### Build Process
- **Next.js 15.2.3**: Optimized production builds with turbo mode for development
- **TypeScript Compilation**: Strict mode enabled with proper type checking
- **ESLint Integration**: Comprehensive linting with custom rules for tRPC patterns
- **Test Exclusion**: Test files properly excluded from production builds

### Build Commands & Verification
```bash
npm run build                      # Production build with type checking and linting
npm run typecheck                  # Standalone TypeScript verification
npm run lint                       # ESLint checking with auto-fix available
npm run preview                    # Local production preview
```

### Build Optimization Features
- **Tree Shaking**: Unused code elimination for smaller bundles
- **Static Generation**: Pre-rendered pages where possible
- **Code Splitting**: Automatic chunking for optimal loading
- **Image Optimization**: Built-in Next.js image optimization

## Troubleshooting Notes

### Critical Issues to Watch For
- **Gemini Live API**: WebSocket connections may fail without proper error handling - check browser compatibility first
- **State Management**: Avoid checking React state for immediate WebSocket operations - use direct client state
- **Database Schema**: Always run `npx prisma db push` after schema changes, use `supabase db pull` to sync
- **Authentication**: Verify Clerk environment variables if auth issues occur
- **Rate Limits**: Gemini API has rate limits - implement proper error handling and retries

### Development Workflow Issues  
- **Build Errors**: Run `npm run typecheck` and `npm run lint` before committing
- **Test Failures**: Use `npm run test:coverage` to identify uncovered code paths
- **E2E Test Issues**: Use `npm run test:e2e:debug` for Playwright debugging
- **UI Regressions**: Run `npm run ui:check` before deploying design changes

### Production Deployment
- **Environment Variables**: Ensure all Clerk, Supabase, and Gemini API keys are set in Vercel
- **Database Migrations**: Push schema changes before deployment: `npx prisma db push`
- **Build Verification**: Always test locally with `npm run build` and `npm run preview`

## Development Priorities & Next Steps

### High Priority
1. **Connect Live AI Interview to Database** - Currently uses mock data, needs real interview/assessment persistence
2. **Complete MediaRecorder Integration** - Traditional interview mode (`/interview`) needs full recording capabilities
3. **Real Assessment Pipeline** - Connect practice feedback to actual AI assessment instead of mock data

### Medium Priority  
1. **Dashboard Data Integration** - Connect user dashboard to real interview history and progress
2. **Performance Optimization** - Bundle size analysis and code splitting improvements
3. **Advanced Analytics** - Real user behavior tracking and performance metrics

### Technical Debt
1. **Test Coverage Expansion** - Add E2E tests for complete user flows
2. **Error Boundaries** - Better error handling for production edge cases
3. **Accessibility Audit** - Comprehensive a11y testing across all pages

### Current Branch Status
- **Working Branch**: `feat/landing-page`
- **Ready for Merge**: Landing page implementation is complete and production-ready
- **Next Feature Branch**: Should focus on connecting mock data to real AI services

## Job Description Input with AI Focus Detection
**Status**: ✅ Complete - Modern 3-step wizard with comprehensive AI parsing

### Feature Overview
Interactive job description input system (`/job-description`) using a 3-step wizard flow that leverages Gemini 2.5 Flash for intelligent parsing and extraction of key information from job postings.

### User Experience Flow
1. **Input Step**: Clean single-field textarea with examples and validation
2. **AI Processing**: ChatGPT-style typing animation with progressive status messages  
3. **Interactive Review**: Comprehensive editing interface with collapsible sections and live editing

### Key Features Implemented

#### Modern 3-Step Wizard Design
- **Step 1**: Large textarea with placeholder examples and real-time validation
- **Step 2**: Animated processing screen with typing effect and progress indicators
- **Step 3**: Detailed review interface with sidebar controls and inline editing
- **Responsive Layout**: Grid system adapts from mobile to desktop seamlessly

#### AI-Powered Parsing with Gemini 2.5 Flash  
- **Real-time Extraction**: Job title, company, experience level, detailed requirements, focus areas
- **Structured Output**: Zod schema validation ensuring type-safe data structures
- **Error Handling**: Graceful fallbacks with user-friendly error messages
- **Smart Detection**: Context-aware analysis of technical requirements and skill categories

#### Advanced Interactive Review Features
- **Collapsible Job Description**: Smart truncation with expandable full text view
- **Live Requirements Editing**: In-place editing, add/remove with smooth animations
- **Experience Level Selector**: Visual cards with icons and descriptions for Junior/Mid/Senior
- **Focus Areas Management**: Interactive badge system with predefined + custom options
- **Real-time Form State**: React Hook Form with Zod validation throughout the flow
- **Visual Feedback**: Hover effects, loading states, and completion indicators

### Technical Implementation

#### Component Architecture
```
src/app/job-description/page.tsx     # Main page with 3-step flow
src/components/ui/typing-loader.tsx  # ChatGPT-style animation component
src/components/ui/auto-resize-textarea.tsx  # Auto-resizing input field
```

#### AI Integration
- **SDK**: @google/genai v1.4.0 (latest official SDK)
- **Model**: gemini-2.5-flash-preview-05-20 for fast parsing
- **Schema**: Comprehensive TypeScript types for structured extraction
- **Processing**: Debounced API calls with visual feedback

#### State Management
- **Form Library**: React Hook Form with Zod validation
- **Interactive States**: Local state for editing modes and UI interactions
- **Type Safety**: Full TypeScript coverage throughout the flow

### Environment Configuration
```bash
# Required environment variable
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key

# Verification commands
npm run typecheck  # Verify TypeScript compilation
npm run build     # Test production build
npm run dev       # Start development server
```

### API Endpoints
- `ai.parseJobDescription` - Main parsing endpoint using Gemini 2.5 Flash
- `jobDescription.create` - Saves parsed data to database
- `jobDescription.detectFocusAreas` - Legacy endpoint (replaced by AI parsing)

### Performance Metrics
- **Bundle Size**: 39.4 kB (optimized)
- **Build Time**: ~2000ms (fast compilation)
- **API Response**: ~2-3 seconds for job description parsing
- **TypeScript**: Zero compilation errors

### Future Enhancements
- **Template System**: Pre-built job description templates (implemented but disabled)
- **Advanced Editing**: Rich text editing capabilities
- **Collaboration**: Multi-user editing and commenting
- **Analytics**: Usage tracking and optimization insights

### Troubleshooting
- **API Errors**: Check GOOGLE_GENERATIVE_AI_API_KEY environment variable
- **Parsing Issues**: Verify job description length (minimum 10 characters)
- **UI Issues**: Clear browser cache and restart development server
- **Build Errors**: Run `npm run typecheck` to identify TypeScript issues

## Gemini Live Audio-to-Audio Implementation
**Status**: ✅ Complete - Natural conversation flow with proper audio buffering

### Critical Insights
- **❌ Don't use**: Complex VAD, ScriptProcessorNode, setTimeout delays for audio finishing
- **✅ Use**: Continuous streaming, AudioWorklet, callback-based completion

### Key Files
- **`src/lib/gemini-live.ts`** - Core implementation (AudioRecorder, AudioStreamer, WebSocket)
- **`src/hooks/useGeminiLive.ts`** - React hook interface
- **`public/audio-worklet.js`** - Modern audio processor

### Audio Flow
1. AudioWorklet → Base64 → WebSocket → Gemini Live API
2. WebSocket → ArrayBuffer → AudioStreamer buffering → smooth playback
3. Turn complete → `finishPlayback()` → callback when done → state change

## Practice & Feedback System Implementation  
**Status**: ✅ Complete - Comprehensive mock interview experience with detailed analytics

### Live AI Interview (`/interview/live`)
Full-featured real-time AI conversation system using Gemini Live API:

#### Core Features
- **Real-time Audio**: WebSocket streaming with 16-bit PCM at 16kHz
- **Browser Compatibility**: Cross-browser WebSocket, MediaDevices, and AudioContext support  
- **AI Configuration**: Customizable models (Gemini 2.0 Flash), voices (Puck, Charon, etc.), system instructions
- **Session Management**: 25-minute auto-renewal, graceful connection handling
- **Question Flow**: Structured progression through technical, behavioral, and system design questions

#### Implementation Architecture
- **Page States**: Setup → Settings → Active → Completed with proper state management
- **Mock Questions**: Generated data science interview questions with evaluation criteria
- **Interactive Controls**: Start/stop interview, configure AI settings, browser compatibility checks
- **Error Handling**: Connection failures, permission denied, audio processing errors

### Practice Interview System (`/practice`)
Mock interview interface with recording capabilities:

#### User Experience
- **Role Selection**: Choose interview type and technical focus areas
- **Recording Integration**: Screen + audio capture using MediaRecorder API
- **Question Progression**: Structured interview flow with timing and evaluation
- **Real-time Feedback**: Live indicators during practice session

### Comprehensive Feedback Analysis (`/practice/feedback`)
Advanced post-interview analytics with detailed performance insights:

#### Performance Overview  
- **Overall Rating**: Star-based scoring with qualitative assessment (e.g., "Solid Foundation")
- **Strength Analysis**: Timestamped behavioral observations with AI reasoning
- **Growth Areas**: Specific improvement recommendations with actionable next steps
- **Impact Mapping**: Each behavior linked to competency levels and skill development

#### Skills Assessment Framework
- **Technical Competencies**: Data visualization, statistics, hypothesis testing, A/B testing, experimental design
- **Product & Business Sense**: User analysis, product analysis, UX understanding, business strategy
- **System Design**: Data pipeline design, architecture, scalability, real-time processing
- **Star Rating System**: Visual competency levels with gap identification

#### Interactive Features
- **Tabbed Interface**: Feedback, Skills Assessment, Video Recording, Interview Context
- **Collapsible Details**: Expandable feedback items with timestamps and detailed analysis
- **Video Integration**: Mock video player with session duration and case context
- **Context Preservation**: Full case study details including database schemas and challenge context

#### Advanced Analytics
- **Timestamped Feedback**: Video timestamp references (e.g., "2:15", "8:42") with specific behaviors
- **Behavioral Analysis**: "What You Did", "Why It Worked", "Impact" structure for strengths
- **Improvement Framework**: "What Was Missing", "Actionable Next Step" for growth areas
- **Competency Mapping**: Direct connection between behaviors and skill level progression

## Landing Page & Marketing Site Implementation
**Status**: ✅ Complete - Modern professional marketing experience

### Landing Page (`/`)
Full-featured marketing site with advanced animations and responsive design:

#### Modern Design System
- **Gradient Backgrounds**: Subtle gradients with proper contrast and accessibility
- **Component Library**: Consistent use of shadcn/ui components with custom styling
- **Typography Hierarchy**: Strategic use of font weights, sizes, and colors for clear information flow
- **Responsive Grid**: Mobile-first design with breakpoints for tablet and desktop

#### Advanced Animations  
- **Lottie Integration**: Hero section animations using `@lottiefiles/dotlottie-react`
- **Staggered Animations**: CSS animation classes for fade-in, slide-up, and bounce effects
- **Interactive Hover States**: Smooth transitions and micro-interactions throughout
- **Performance Optimized**: Animations respect `prefers-reduced-motion` for accessibility

#### Marketing Content Structure
- **Hero Section**: Value proposition, animation, and clear CTAs
- **Features Showcase**: Key platform benefits with icons and descriptions  
- **Social Proof**: User testimonials and success metrics
- **Pricing Information**: Clear pricing tiers and feature comparison
- **FAQ Section**: Common questions with expandable answers
- **Footer**: Comprehensive site navigation and legal links

#### Authentication Integration
- **Clerk Integration**: Seamless sign-in/sign-up with conditional rendering
- **User State Awareness**: Different CTAs and content based on authentication status
- **Protected Routes**: Automatic redirection for authenticated users
- **Role-Based Navigation**: Different paths for different user types

### Supporting Pages
- **B2B Landing Pages** (`/candidates`, `/companies`): Targeted marketing for different audiences
- **Legal Pages** (`/terms`, `/privacy`, `/candidate-terms`, `/company-terms`): Complete legal framework
- **Product Pages** (`/pricing`, `/faq`): Detailed product information and support
- **Demo Page** (`/demo`): Product demonstration and trial access