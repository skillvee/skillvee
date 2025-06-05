# Claude Memory for Skillvee Project

## Project Overview
**Name**: Skillvee  
**Type**: T3 Stack Application  
**Owner**: Matias (@matiashoyld)  
**Repository**: https://github.com/matiashoyld/skillvee  
**Live URL**: https://skillvee-73r7zusqs-matiashoyls-projects.vercel.app  

## Tech Stack & Architecture

### Core Framework
- **Next.js 15.2.3** with App Router
- **TypeScript** for type safety
- **React 19** (latest version)
- **tRPC** for type-safe API routes

### Authentication
- **Clerk** for user authentication
- Sign-in/Sign-up pages configured at `/sign-in` and `/sign-up`
- Environment variables properly configured

### UI & Styling
- **Shadcn/ui** for component library
- **Tailwind CSS v4** for styling
- **Radix UI** primitives for accessibility
- **Lucide React** for icons
- Custom CSS variables for theming (light/dark mode ready)

### Database
- **Supabase** as PostgreSQL database provider
- **Prisma** as ORM
- Connection pooling configured
- Environment variables set up for both direct and pooled connections

### Deployment & DevOps
- **Vercel** for hosting and deployment
- **GitHub** for version control
- Automatic deployments from main branch
- Environment variables synced between local and production

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── _components/        # App-specific components
│   ├── api/trpc/          # tRPC API routes
│   ├── sign-in/           # Clerk sign-in pages
│   ├── sign-up/           # Clerk sign-up pages
│   ├── layout.tsx         # Root layout with Clerk provider
│   └── page.tsx           # Homepage
├── components/ui/         # Shadcn UI components
├── lib/                   # Utility functions
│   ├── utils.ts          # cn() utility for class merging
│   └── supabase.ts       # Supabase client configuration
├── server/               # Server-side code
│   ├── api/              # tRPC routers and configuration
│   └── db.ts             # Database connection
├── styles/               # Global styles
└── trpc/                 # tRPC client configuration
```

## Development Setup

### Environment Variables Required
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Supabase Database
DATABASE_URL="postgresql://postgres.xyz:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xyz:password@aws-0-us-east-2.pooler.supabase.com:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://xyz.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
```

### Key Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run typecheck` - TypeScript type checking
- `npm run lint` - ESLint checking
- `npx prisma db push` - Push schema to database
- `npx prisma studio` - Database management UI

## User Preferences & Development Style

### Code Style Preferences
- **Clean, minimal approach** - Remove unnecessary boilerplate
- **Modern tooling** - Prefers latest versions and best practices
- **Type safety** - Strong preference for TypeScript
- **Component-based architecture** - Shadcn/ui for consistent UI
- **Environment-driven** - Proper separation of development/production configs

### Workflow Preferences
- **CLI-first approach** - Comfortable with command-line tools
- **Automated deployment** - Vercel for seamless deployments
- **GitHub integration** - Standard Git workflow
- **Testing before deployment** - Verify connections and builds

### Architecture Decisions Made
1. **Removed T3 boilerplate "post" examples** - Clean slate approach
2. **Clerk over NextAuth** - Preference for managed auth solution
3. **Supabase over PlanetScale** - PostgreSQL preference
4. **Shadcn over other UI libraries** - Modern, customizable components
5. **Vercel deployment** - Seamless Next.js integration

## Database Schema
Currently clean slate with Prisma schema ready for custom models.

## API Structure
- **tRPC router**: `src/server/api/root.ts`
- **Example router**: Basic hello endpoint for testing
- **Type-safe**: Full end-to-end type safety between client and server

## Deployment Notes
- **Vercel project**: Connected to GitHub repo
- **Automatic deployments**: Push to main triggers deployment
- **Environment variables**: Synced between local `.env` and Vercel dashboard
- **Build command**: `npm run build`
- **Output**: Next.js static optimization enabled

## Next Steps & Recommendations
1. Define database schema in `prisma/schema.prisma`
2. Run `npx prisma db push` to create tables
3. Build core features using tRPC routers
4. Add Shadcn components as needed
5. Configure Clerk webhooks if user data persistence needed

## CLI Tools for Enhanced Control

### Supabase CLI
**Status**: ✅ Installed via Homebrew  
**Version**: 2.24.3

#### Setup
✅ **Already configured** with access token in `.env`
```bash
# Token stored in .env file (never commit actual token!)
SUPABASE_ACCESS_TOKEN="sbp_***" # Actual token in .env only

# Project linked to: buyxawgqsxvmxbzooekf (skillvee)
# Helper script available: ./scripts/supabase.sh
```

#### Key Commands
```bash
supabase projects list                    # List all projects
supabase link --project-ref your-ref     # Link local project
supabase db pull                          # Pull remote schema
supabase db push                          # Push local schema
supabase functions deploy                 # Deploy edge functions
supabase storage ls                       # List storage buckets
supabase gen types typescript            # Generate TypeScript types
```

#### Migration Workflow
```bash
supabase migration new create_table_name  # Create new migration
supabase db reset                         # Reset local DB
supabase db push                          # Apply to remote
```

### Clerk CLI
**Status**: ❌ No official CLI available  
**Alternative**: Use Clerk Dashboard + Admin API

#### Clerk Admin API via curl
```bash
# List users
curl -H "Authorization: Bearer $CLERK_SECRET_KEY" \
     https://api.clerk.com/v1/users

# Create user
curl -X POST -H "Authorization: Bearer $CLERK_SECRET_KEY" \
     -H "Content-Type: application/json" \
     -d '{"email_address": "user@example.com"}' \
     https://api.clerk.com/v1/users
```

## Enhanced Development Workflow

### Database Management
1. **Local Development**: Use `supabase start` for local Supabase instance
2. **Schema Changes**: Create migrations with `supabase migration new`
3. **Type Generation**: Auto-generate types with `supabase gen types typescript`
4. **Production Sync**: Use `supabase db pull` to sync from production

### Authentication Management
1. **User Management**: Use Clerk Dashboard
2. **Webhooks**: Configure via Clerk Dashboard for user sync
3. **API Access**: Use Clerk Admin API for programmatic access

## Troubleshooting Notes
- **TypeScript errors**: Ensure tRPC routers are not empty
- **Database connection**: Use `npx prisma studio` to verify connection
- **Build failures**: Check environment variables in Vercel dashboard
- **Auth issues**: Verify Clerk keys and callback URLs
- **Supabase CLI**: Requires access token from dashboard for authentication
- **Schema sync**: Use `supabase db pull` if local/remote schemas drift