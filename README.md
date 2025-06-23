# LearnTub 🎓

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/minh-hiep-les-projects/v0-learn-tub)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> Transform YouTube into your personalized learning platform with AI-powered insights and smart note-taking.

## 🚀 Overview

LearnTub is a modern learning platform that transforms passive YouTube video watching into active learning experiences. Take smart notes, get AI-powered insights, and organize your learning journey with intelligent features designed to accelerate your growth.

**🌟 Key Features:**

- 🧠 **AI-Powered Notes** - Get intelligent feedback and insights with advanced AI analysis
- 🎯 **AI Quiz Assistant** - Test knowledge with auto-generated questions and personalized feedback
- 📊 **AI Usage Analytics** - Comprehensive tracking and analytics for all AI interactions
- 💰 **Flexible Pricing** - Start free with 50 AI credits/month, upgrade to Pro for 500 credits at $2/month
- ⏰ **Timestamp Sync** - Notes automatically sync with video timestamps for seamless navigation
- 📚 **Smart Organization** - Organize learning with courses, tags, and intelligent categorization
- 📈 **Progress Tracking** - Monitor your learning progress with detailed analytics and insights


## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Vercel/Neon) + [Supabase](https://supabase.com/)
- **Authentication:** Supabase Auth
- **AI Integration:** [OpenAI](https://openai.com/) & [Google Gemini](https://ai.google.dev/) for intelligent note evaluation
- **AI Analytics:** Comprehensive usage tracking with cost calculation and performance metrics
- **External APIs:** YouTube Data API v3 for video integration
- **Environment:** Type-safe environment variables with [@t3-oss/env-nextjs](https://env.t3.gg/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design system
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion
- **Deployment:** [Vercel](https://vercel.com/)

## 🎯 Live Demo

**🔗 [View Live Application](https://learn-tub.vercel.app)**

## 📦 Installation

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker
- Supabase account
- YouTube API key (Google Cloud Console)
- OpenAI API key (optional, for AI features)
- Google Gemini API key (optional, for AI features)

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/minhhieple97/learn-tub.git
   cd learn-tub
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # YouTube API Configuration
   YOUTUBE_API_KEY=your_youtube_api_key

   # AI Configuration
   OPENAI_API_KEY=your_openai_api_key
   GEMINI_API_KEY=your_gemini_api_key

   # QStash Configuration (for background jobs)
   QSTASH_CURRENT_SIGNING_KEY=your_qstash_current_signing_key
   QSTASH_NEXT_SIGNING_KEY=your_qstash_next_signing_key
   QSTASH_TOKEN=your_qstash_token

   # Upstash Redis Configuration (for caching and rate limiting)
   UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
   UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   ```

4. **Database Setup**

   ```bash
   # Pull latest schema from Supabase
   npm run db:pull

   # Reset database (if needed)
   npm run db:reset
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
learn-tub/
├── app/                  # Next.js App Router: Pages, Layouts, Routes
│   ├── (app)/            # Authenticated routes (dashboard, learn, settings)
│   ├── (auth)/           # Authentication routes (login, register)
│   ├── api/              # API routes for backend functionality
│   └── auth/             # Auth callback and error pages/routes
├── components/           # Shared UI components
│   ├── home/             # Homepage-specific components
│   ├── pricing/          # Pricing page components
│   ├── shared/           # Shared components across features
│   └── ui/               # Shadcn UI components
├── features/             # Feature-specific modules organized by domain
│   ├── ai/               # AI Usage Tracking & Integration System
│   │   ├── components/   # AI model selector and UI components
│   │   ├── hooks/        # AI-related React hooks (use-ai-models, use-ai-model-pricing)
│   │   ├── queries/      # Database operations for AI usage analytics and model pricing
│   │   ├── services/     # AI client service and usage tracker (singleton)
│   │   ├── schemas.ts    # Zod validation schemas for AI operations
│   │   └── types.ts      # TypeScript definitions with I prefix
│   ├── auth/             # Authentication & User Management
│   │   ├── actions/      # Server actions for auth operations
│   │   ├── components/   # Login/register forms, Google auth button
│   │   ├── hooks/        # Auth hooks (use-login, use-register, use-google-auth)
│   │   ├── queries-client/ # Client-side user profile queries
│   │   ├── constants.ts  # Auth-related constants
│   │   ├── schemas.ts    # Auth validation schemas
│   │   └── types.ts      # Auth-related TypeScript types
│   ├── dashboard/        # Dashboard & Analytics
│   │   ├── actions/      # Quiz dashboard actions
│   │   ├── components/   # Dashboard widgets, quiz dashboard, statistics
│   │   ├── hooks/        # Dashboard-specific hooks
│   │   ├── queries/      # Dashboard data queries
│   │   ├── schemas.ts    # Dashboard validation schemas
│   │   └── types.ts      # Dashboard-related types
│   ├── notes/            # Note-taking with AI Evaluation
│   │   ├── actions/      # Note-related server actions
│   │   ├── components/   # Note editor, evaluation UI, feedback display
│   │   ├── hooks/        # Note hooks (use-note-evaluation, use-notes-search)
│   │   ├── queries/      # Note database operations
│   │   ├── services/     # Note service with AI integration
│   │   ├── store/        # Zustand store for note management
│   │   ├── schemas.ts    # Note validation schemas
│   │   └── types.ts      # Note-related TypeScript types
│   ├── payments/         # Payment & Subscription System
│   │   ├── actions/      # Payment actions (billing, checkout, credits)
│   │   ├── components/   # Pricing components, payment success
│   │   ├── hooks/        # Payment hooks (use-pricing, use-payment-detail)
│   │   ├── queries/      # Payment database operations
│   │   ├── queries-client/ # Client-side subscription queries
│   │   ├── services/     # Stripe webhook service, credit management
│   │   ├── utils/        # Payment utility functions
│   │   ├── constants.ts  # Payment constants
│   │   ├── schemas.ts    # Payment validation schemas
│   │   └── types.ts      # Payment-related TypeScript types
│   ├── profile/          # User Profile Management
│   │   └── queries/      # Profile database operations
│   ├── quizzes/          # AI-Powered Quiz System
│   │   ├── actions/      # Quiz actions (generate, evaluate)
│   │   ├── components/   # Quiz UI, question cards, results display
│   │   ├── hooks/        # Quiz hooks (use-quiz, use-quiz-retake)
│   │   ├── queries/      # Quiz database operations
│   │   ├── services/     # Quiz service with AI integration
│   │   ├── store/        # Zustand store for quiz state management
│   │   ├── schema.ts     # Quiz validation schemas
│   │   └── types.ts      # Quiz-related TypeScript types
│   ├── settings/         # User Settings & Preferences
│   │   ├── components/   # Settings UI components
│   │   ├── hooks/        # Settings-related hooks
│   │   ├── schemas.ts    # Settings validation schemas
│   │   └── types.ts      # Settings-related types
│   └── videos/           # Video Management & Player
│       ├── actions/      # Video-related server actions
│       ├── components/   # Video player, library, forms
│       ├── hooks/        # Video hooks (use-youtube-player, use-videos)
│       ├── queries/      # Video database operations
│       ├── schemas.ts    # Video validation schemas
│       ├── search-params.ts # URL search parameter definitions
│       └── types.ts      # Video-related TypeScript types
├── hooks/                # Global custom React hooks
├── lib/                  # Core utilities and configurations
│   ├── cache/            # Caching utilities
│   ├── supabase/         # Supabase client configurations
│   └── utils/            # Utility functions
├── public/               # Static assets
├── supabase/             # Supabase local development
│   └── migrations/       # Database schema migrations
├── config/               # Configuration files
├── env.mjs               # Environment variable validation (t3-env)
├── middleware.ts         # Next.js middleware for route protection
├── package.json          # Project dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── tailwind.config.ts    # Tailwind CSS configuration
```

## 🎨 Design System

LearnTub uses a custom neutral color palette with semantic color tokens:

- **Primary Colors:** Sage, Mist, Clay
- **Neutral Colors:** Pearl, Dust, Stone
- **Surface Colors:** Optimized for readability and accessibility
- **Dark Mode:** Full support with automatic theme switching

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:pull      # Pull latest schema from Supabase
npm run db:reset     # Reset database
npm run db           # Pull and reset database
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Configure environment variables** in Vercel dashboard
3. **Deploy** - Vercel will automatically build and deploy your app

## 🎯 Development Milestones

### Upcoming Features & Improvements

- **🔄 Idempotent Stripe Event Processing**
  - Implement idempotent handling for Stripe webhook events to prevent duplicate processing
  - Add event deduplication mechanism and processing state tracking
  - Ensure reliable payment and subscription event handling

- **💳 Transaction-Safe Credit Processing**
  - Set up database transactions for credit processing operations
  - Implement Prisma wrapper for atomic credit deduction and allocation
  - Ensure data consistency across credit buckets and user balances

- **📝 Rich Text Editor for Notes**
  - Implement advanced text editor for note-taking with formatting capabilities
  - Add support for rich text, markdown, and structured content
  - Enhance note-taking experience with better editing tools

- **🖼️ Image Support in Notes**
  - Allow users to paste and insert images directly into the text editor
  - Implement image upload, storage, and optimization
  - Support drag-and-drop image functionality

- **📄 Note Export & Review System**
  - Enable note export to Google Docs and PDF formats
  - Implement AI review summaries for exported content
  - Add batch export functionality for multiple notes

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request