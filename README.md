# Skillvee - AI-Powered Technical Interview Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![tRPC](https://img.shields.io/badge/tRPC-11.0.0-2596be)](https://trpc.io/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)](https://clerk.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)

**Live Demo**: [https://skillvee.vercel.app](https://skillvee.vercel.app)

An AI-powered mock interview platform designed for data science and technical roles, featuring real-time AI conversation, comprehensive assessment, and detailed performance analytics.

## 🚀 What Skillvee Does

Skillvee transforms technical interview preparation through AI-powered mock interviews:

1. **📋 Job Description Input** → Users paste job descriptions or select from templates
2. **🤖 AI Case Generation** → Gemini 2.5 Pro creates realistic interview scenarios (3-5 questions)
3. **🎙️ Live Interview Session** → Screen + audio recording with real-time AI conversation via Gemini Live
4. **📊 AI Assessment** → Video processing, transcription, and detailed performance evaluation
5. **🔗 Platform Integration** → Connects to job matching and career development platforms

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 15.2.3](https://nextjs.org/)** - App Router with React 19 and TypeScript
- **[tRPC 11.0.0](https://trpc.io/)** - End-to-end type-safe APIs with comprehensive middleware
- **[TypeScript 5.8.2](https://www.typescriptlang.org/)** - Full type safety across the stack

### Authentication & Database
- **[Clerk](https://clerk.com/)** - User authentication and management
- **[Supabase](https://supabase.com/)** - PostgreSQL database with real-time capabilities
- **[Prisma](https://prisma.io/)** - Type-safe database ORM with migrations

### AI & Media
- **[Gemini 2.5 Pro](https://ai.google.dev/)** - AI case generation and assessment
- **[Gemini Live API](https://ai.google.dev/)** - Real-time AI conversation during interviews
- **MediaRecorder API** - Screen and audio capture for interview sessions

### UI & Styling
- **[Shadcn/ui](https://ui.shadcn.com/)** - Modern component library
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first styling
- **[Lucide React](https://lucide.dev/)** - Beautiful icons

### Development & Testing
- **[Jest 29.7.0](https://jestjs.io/)** - Testing framework with 67+ passing tests
- **[ESLint](https://eslint.org/)** - Code linting with TypeScript integration
- **[Prettier](https://prettier.io/)** - Code formatting

## 🏗️ Architecture Overview

### tRPC API Structure
```
📁 src/server/api/
├── 🔧 trpc.ts                 # Core tRPC setup with auth context
├── 📁 routers/
│   ├── 📄 jobDescription.ts   # Job posting management
│   ├── 🎯 interview.ts        # Interview lifecycle
│   ├── 🤖 ai.ts              # AI operations & generation
│   ├── 📹 media.ts           # Recording management
│   └── 📊 assessment.ts      # Evaluation & analytics
├── 📁 middleware/
│   ├── 🛡️ rateLimit.ts       # Multi-tier rate limiting
│   └── ✅ validation.ts      # Input sanitization & validation
├── 📁 schemas/               # Zod validation schemas
├── 📁 types/                 # Custom error types
└── 📁 utils/                 # Pagination & helpers
```

### Key Features
- **🔒 Authentication**: Clerk integration with role-based access control
- **⚡ Rate Limiting**: Multi-tier protection (5/min strict, 30/min moderate, 20/min AI)
- **🛡️ Security**: XSS protection, input sanitization, file upload validation
- **📄 Pagination**: Cursor-based pagination for optimal performance
- **🚦 Error Handling**: Comprehensive error types with detailed logging
- **📝 Type Safety**: End-to-end TypeScript with Zod validation

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.17 or later
- **npm** 10.x or later
- **PostgreSQL** database (Supabase recommended)

### 1. Clone & Install
```bash
git clone https://github.com/matiashoyld/skillvee.git
cd skillvee
npm install
```

### 2. Environment Setup
Create `.env` file with required variables:

```bash
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# AI Services (Optional for development)
GEMINI_API_KEY=""
NEXT_PUBLIC_GEMINI_API_KEY=""

# Supabase (Optional)
SUPABASE_ACCESS_TOKEN=""
```

### 3. Database Setup
```bash
# Push schema to database
npx prisma db push

# Optional: Open Prisma Studio
npx prisma studio
```

### 4. Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🧪 Testing

### Test Suite Overview
- **Framework**: Jest with TypeScript support
- **Coverage**: 67+ passing tests across middleware and utilities
- **Areas**: Rate limiting, validation, XSS protection, business logic

### Running Tests
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test patterns
npm test -- --testPathPattern=middleware
```

### Test Structure
```
📁 src/test/
├── 📁 __mocks__/          # External dependency mocks
├── 📁 helpers/           # Test utilities & contexts
└── 📄 setup.ts          # Jest configuration
```

## 🚢 Deployment

### Vercel (Recommended)
1. **Connect Repository**: Link your GitHub repository to Vercel
2. **Environment Variables**: Add all required env vars in Vercel dashboard
3. **Deploy**: Automatic deployments on `main` branch push

### Pre-deployment Checklist
```bash
# Verify build passes
npm run build

# Run type checking
npm run typecheck

# Verify tests pass
npm test

# Check linting
npm run lint
```

### Environment Variables in Production
Ensure all required environment variables are configured:
- Database URLs (with connection pooling)
- Clerk authentication keys
- AI service keys (when implementing)
- Webhook secrets

## 🤝 Contributing

### Development Workflow
1. **Branch**: Create feature branch from `main`
2. **Develop**: Implement changes with tests
3. **Test**: Ensure all tests pass (`npm test`)
4. **Build**: Verify production build (`npm run build`)
5. **Commit**: Use conventional commits format
6. **PR**: Create pull request with description

### Commit Convention
```bash
feat(scope): add new feature
fix(scope): resolve bug
test(scope): add or update tests
docs(scope): update documentation
refactor(scope): code refactoring
```

### Code Quality
- **TypeScript**: Strict mode enabled
- **ESLint**: Comprehensive linting rules
- **Prettier**: Automatic code formatting
- **Testing**: Required for new features

## 📚 API Documentation

### tRPC Routers

#### Job Description Router
- **CRUD Operations**: Create, read, update, delete job postings
- **Template System**: Pre-built job description templates
- **AI Integration**: Focus area detection and analysis

#### Interview Router
- **Lifecycle Management**: Schedule → Start → Complete workflow
- **Real-time Sessions**: Live interview session management
- **Question Management**: Dynamic question generation and tracking
- **Notes System**: Real-time note-taking with auto-save

#### AI Router
- **Case Generation**: Intelligent interview case creation
- **Assessment Analysis**: Performance evaluation and scoring
- **Transcription**: Audio-to-text conversion with analysis
- **Response Validation**: Answer evaluation against criteria

#### Media Router
- **Recording Management**: Upload, download, and stream recordings
- **File Validation**: Security checks and format validation
- **Storage Integration**: Efficient media storage and retrieval

#### Assessment Router
- **Evaluation System**: Comprehensive performance scoring
- **Analytics Dashboard**: Interview analytics and insights
- **Benchmarking**: Performance comparison and tracking
- **Export Capabilities**: Data export in multiple formats

## 🛡️ Security Features

- **🔒 Authentication**: Clerk-based user management with role separation
- **🛡️ Input Validation**: XSS protection and sanitization
- **⚡ Rate Limiting**: Multi-tier API protection
- **🔐 File Security**: Upload validation and virus scanning
- **📊 Audit Logging**: Comprehensive request and error logging

## 📊 Performance

- **⚡ Fast Loading**: Optimized builds with code splitting
- **📱 Responsive**: Mobile-first design with touch support
- **🚀 Edge Deployment**: Vercel Edge Runtime for global performance
- **💾 Efficient Caching**: Strategic caching at multiple layers

## 🔮 Upcoming Features

- **🎥 Video Analysis**: Advanced video processing and analysis
- **📈 Analytics Dashboard**: Comprehensive performance insights
- **🔗 Integration APIs**: Third-party platform connections
- **📱 Mobile App**: Native mobile applications
- **🌐 Multi-language**: Internationalization support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

- **📧 Email**: [matiashoyld@example.com](mailto:matiashoyld@example.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/matiashoyld/skillvee/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/matiashoyld/skillvee/discussions)

---

**Made with ❤️ by [Matias](https://github.com/matiashoyld)**

*Transforming technical interview preparation through AI-powered solutions.*