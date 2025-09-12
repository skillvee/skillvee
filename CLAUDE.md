# Claude Memory for Skillvee Project

## Project Overview

**Name**: Skillvee - AI-Powered Technical Interview Platform  
**Type**: T3 Stack Application  
**Owner**: Matias (@matiashoyld)  
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
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Database management UI
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

**Status**: ✅ Jest configured with 120+ comprehensive tests

### Testing Infrastructure

- **Framework**: Jest 29.7.0 with TypeScript + React Testing Library
- **Coverage**: API middleware, media capture hooks, React components, integration flows
- **Mock Strategy**: MediaRecorder API, tRPC endpoints, browser permissions, DOM environment

### Test Coverage Areas

- **API Layer**: Rate limiting, validation, tRPC routers (67 tests)
- **Media Capture**: Hooks, components, browser compatibility, error scenarios (56+ tests)
- **Integration**: Full interview flow, job description creation, recording lifecycle
- **Error Handling**: Permission denied, device failures, network timeouts, upload failures

### Key Test Suites

```bash
src/hooks/__tests__/           # Hook testing with mocked APIs
src/components/ui/__tests__/   # Component integration tests  
src/app/interview/__tests__/   # End-to-end flow testing
src/lib/__tests__/            # Utility and compatibility tests
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

### Common Build Issues

- **Test file inclusion**: Ensure test files are excluded from production build via tsconfig.json and eslint.config.js
- **tRPC middleware types**: Rate limiting middleware must return proper `next()` calls with correct typing
- **ESM modules**: Jest configuration requires proper ESM handling for superjson and other dependencies
- **Environment variables**: Mock environment files needed for test isolation

### Development Issues

- **TypeScript errors**: Ensure tRPC routers are not empty and middleware return types match expected signatures
- **Database connection**: Use `npx prisma studio` to verify connection  
- **Auth issues**: Verify Clerk keys and callback URLs in Vercel dashboard
- **Schema sync**: Use `supabase db pull` if local/remote schemas drift
- **Gemini API**: Rate limits may affect development - implement proper error handling
- **React State vs Client State**: When working with WebSocket connections, avoid checking React state (`state.isConnected`) for immediate operations. Use direct client state checks (`client.isConnected`) since React state updates are asynchronous and may cause race conditions in connection flows

### Testing Issues

- **Jest ESM errors**: Ensure jest.config.js uses proper ESM preset and moduleNameMapper
- **Mock dependencies**: Create proper mocks for external dependencies (superjson, env variables)
- **Test isolation**: Use resetAllMocks() and proper test cleanup to avoid test interference
- **Coverage reports**: Test files must be excluded from coverage collection

### Production Deployment

- **Vercel Integration**: Automatic deployments on main branch push
- **Environment Variables**: Ensure all required env vars are set in Vercel dashboard
- **Database Migrations**: Run `npx prisma db push` before deployment if schema changes
- **Build Verification**: Always run `npm run build` locally before pushing to production

## Job Description Input with AI Focus Detection

**Status**: ✅ Complete - Modern minimalist UI with full AI-powered parsing

### Feature Overview

Interactive job description input system that uses Gemini 2.5 Flash for intelligent parsing and extraction of key information from job postings.

### User Experience Flow

1. **Input Step**: Clean single-field interface for pasting job descriptions
2. **AI Processing**: Modern typing animation with progress messages during parsing
3. **Interactive Review**: Fully editable results with in-place editing capabilities

### Key Features Implemented

#### Modern UI/UX Design (2024 Best Practices)

- **Minimalist Layout**: Gradient backgrounds, generous whitespace, shadow-based depth
- **Content-First Approach**: Clear visual hierarchy with strategic use of typography
- **Responsive Design**: Optimized for desktop and mobile experiences
- **Performance**: 39.4 kB bundle size with optimized loading

#### AI-Powered Parsing with Gemini 2.5 Flash

- **Real-time Extraction**: Job title, company, experience level, requirements, focus areas
- **Structured Output**: JSON schema validation for consistent data format
- **Error Handling**: Robust fallback mechanisms for API failures
- **Smart Detection**: Contextual analysis of job requirements and skill categories

#### Interactive Review Features

- **Collapsible Job Description**: Show/hide full content with smooth animations
- **Editable Requirements**: In-place editing, add/remove with hover effects
- **Experience Level Selection**: One-click editing with visual feedback
- **Focus Areas Management**: Interactive badges for adding/removing technical domains
- **Real-time Updates**: Form state synchronized across all components

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
2. WebSocket → ArrayBuffer → AudioStreamer buffering → smooth playbook
3. Turn complete → `finishPlayback()` → callback when done → state change
