# Claude Memory for Skillvee Project

## Project Overview
**Name**: Skillvee - AI-Powered Technical Interview Platform  
**Type**: T3 Stack Application  
**Owner**: Matias (@matiashoyld)  
**Repository**: https://github.com/matiashoyld/skillvee  
**Live URL**: https://skillvee-73r7zusqs-matiashoyls-projects.vercel.app  

## What Skillvee Does
AI-powered mock interview platform for data science roles:
1. **Job Description Input** → User pastes JD or selects template
2. **AI Case Generation** → Gemini 2.5 Pro creates realistic interview case (3-5 questions)
3. **Live Interview Session** → Screen + audio recording with real-time AI conversation via Gemini Live
4. **AI Assessment** → Video processing, transcription, and detailed performance evaluation
5. **SkillVee Platform Hook** → Connects to job matching platform

## Tech Stack & Architecture

### Core Framework
- **Next.js 15.2.3** with App Router, **TypeScript**, **React 19**, **tRPC**

### Key Services
- **Clerk** for authentication
- **Supabase** PostgreSQL + **Prisma** ORM
- **Gemini 2.5 Pro** for case generation + **Gemini Live API** for real-time conversation
- **Shadcn/ui** + **Tailwind CSS v4** for UI
- **Vercel** for deployment

## Environment Variables Required
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_... # For user sync

# Supabase Database  
DATABASE_URL="postgresql://postgres.xyz:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xyz:password@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
SUPABASE_ACCESS_TOKEN="sbp_***" # For CLI access

# AI Services (TODO: Add when implementing)
GEMINI_API_KEY="" # For case generation and assessment
NEXT_PUBLIC_GEMINI_API_KEY="" # For Gemini Live client-side
```

## Key Commands
- `npm run dev` - Start development server
- `npm run typecheck` - TypeScript checking  
- `npm run lint` - ESLint checking
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

## GitHub Issues - Development Roadmap
**Status**: ✅ 12 comprehensive issues created covering full MVP

### Foundation Issues (Start Here)
1. **Database Schema** - Core data models with Prisma
2. **Authentication** - Clerk integration with protected routes  
3. **tRPC API** - Type-safe API routes and procedures

### Core Features  
4. **Job Description Input** - AI-powered focus area detection
5. **Media Capture** - Screen recording & audio capture
6. **Gemini Live Integration** - Real-time AI conversation
7. **AI Case Generation** - Interview case creation engine
8. **Note-Taking Component** - Interactive notes with auto-save
9. **Video Processing & Assessment** - AI-powered evaluation
10. **Assessment Dashboard** - Results visualization & feedback

### Quality & Scale
11. **Testing Strategy** - Comprehensive testing implementation
12. **Performance Optimization** - Monitoring & optimization

**Estimated Timeline**: 10-14 weeks for 2-3 developers working in parallel

## Key Technical Insights

### Gemini Live API Constraints & Solutions
- **Constraint**: 15-minute session limit for audio-only mode
- **Solution**: Session renewal every 14 minutes with seamless context preservation
- **Benefits**: Full 20-30 minute real-time AI conversation for interviews

### Critical Architecture Decisions
- **AI Services**: Gemini 2.5 Pro for case generation, Gemini Live for real-time conversation
- **Media Handling**: Browser MediaRecorder API for screen/audio capture
- **Processing Pipeline**: Background job queues for video processing and AI assessment
- **Real-time Features**: WebSocket connections for live AI interaction

## Supabase CLI Essentials
**Status**: ✅ Configured with project ID: buyxawgqsxvmxbzooekf

```bash
# Essential commands
supabase db pull                    # Pull remote schema changes  
supabase db push                    # Push local schema changes
supabase gen types typescript       # Generate TypeScript types
supabase migration new <name>       # Create new migration
```

## Troubleshooting Notes
- **TypeScript errors**: Ensure tRPC routers are not empty
- **Database connection**: Use `npx prisma studio` to verify connection  
- **Auth issues**: Verify Clerk keys and callback URLs in Vercel dashboard
- **Schema sync**: Use `supabase db pull` if local/remote schemas drift
- **Gemini API**: Rate limits may affect development - implement proper error handling