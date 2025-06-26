# LearnTub 🎓

[![Turborepo](https://img.shields.io/badge/Built%20with-Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/minh-hiep-les-projects/v0-learn-tub)
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

### Monorepo Architecture

- **Build System:** [Turborepo](https://turbo.build/) for efficient monorepo management
- **Package Manager:** [pnpm](https://pnpm.io/) with workspace support

### Frontend (Web App)

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design system
- **UI Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/) for client-side state management
- **Data Fetching:** [React Query (TanStack Query)](https://tanstack.com/query) for server state management
- **Forms:** React Hook Form with Zod validation
- **Animations:** Framer Motion

### Backend (Server App)

- **Framework:** [NestJS](https://nestjs.com/) for scalable server-side applications
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Use Cases:** Heavy task processing, webhook handling, background jobs

### Shared Infrastructure

- **Database:** [PostgreSQL](https://www.postgresql.org/) ([Supabase](https://supabase.com/))
- **Authentication:** Supabase Auth
- **Payments:** [Stripe](https://stripe.com/) for payment processing and subscription management
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

3. **Server Setup**

   Navigate to the server application and install dependencies:

   ```bash
   cd apps/server
   pnpm install
   ```

   Create a `.env` file in the `apps/server` directory with the server-specific environment variables (see `apps/server/README.md` for details).

4. **Database Setup**

   Navigate to the database package and set it up:

   ```bash
   cd ../../packages/database
   pnpm install
   npm run db
   ```

   Navigate back to the root directory:

   ```bash
   cd ../../
   ```

5. **Web Application Environment Setup**

   Create a `.env` file in the `apps/web` directory with the following environment variables:

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

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

   # App Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NODE_ENV=development
   CRON_SECRET=your_cron_secret
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   The applications will run on different ports:
   - **Web App:** [http://localhost:3000](http://localhost:3000)
   - **Server API:** [http://localhost:3001](http://localhost:3001)

## 🏗️ Project Structure

```
learn-tub/                           # Turborepo monorepo root
├── apps/                            # Applications
│   ├── web/                         # Next.js Frontend Application
│   │   ├── app/                     # Next.js App Router: Pages, Layouts, Routes
│   │   │   ├── (app)/               # Authenticated routes (dashboard, learn, settings)
│   │   │   ├── (auth)/              # Authentication routes (login, register)
│   │   │   ├── api/                 # API routes for frontend functionality
│   │   │   └── auth/                # Auth callback and error pages/routes
│   │   ├── components/              # Shared UI components
│   │   │   ├── home/                # Homepage-specific components
│   │   │   ├── pricing/             # Pricing page components
│   │   │   ├── shared/              # Shared components across features
│   │   │   └── ui/                  # Shadcn UI components
│   │   ├── features/                # Feature-specific modules organized by domain
│   │   │   ├── ai/                  # AI Usage Tracking & Integration System
│   │   │   │   ├── components/      # AI model selector and UI components
│   │   │   │   ├── hooks/           # AI-related React hooks
│   │   │   │   ├── queries/         # Database operations for AI usage analytics
│   │   │   │   ├── services/        # AI client service and usage tracker
│   │   │   │   ├── schemas.ts       # Zod validation schemas for AI operations
│   │   │   │   └── types.ts         # TypeScript definitions
│   │   │   ├── auth/                # Authentication & User Management
│   │   │   ├── dashboard/           # Dashboard & Analytics
│   │   │   ├── notes/               # Note-taking with AI Evaluation
│   │   │   ├── payments/            # Payment & Subscription System
│   │   │   ├── profile/             # User Profile Management
│   │   │   ├── quizzes/             # AI-Powered Quiz System
│   │   │   ├── settings/            # User Settings & Preferences
│   │   │   └── videos/              # Video Management & Player
│   │   ├── hooks/                   # Global custom React hooks
│   │   ├── lib/                     # Core utilities and configurations
│   │   │   ├── cache/               # Caching utilities
│   │   │   ├── supabase/            # Supabase client configurations
│   │   │   └── utils/               # Utility functions
│   │   ├── public/                  # Static assets
│   │   ├── supabase/                # Supabase local development
│   │   │   └── migrations/          # Database schema migrations
│   │   ├── config/                  # Configuration files
│   │   ├── env.mjs                  # Environment variable validation (t3-env)
│   │   ├── middleware.ts            # Next.js middleware for route protection
│   │   ├── package.json             # Web app dependencies
│   │   ├── tsconfig.json            # TypeScript configuration
│   │   └── tailwind.config.ts       # Tailwind CSS configuration
│   └── server/                      # NestJS Backend Application
│       ├── src/                     # Server source code
│       │   ├── config/              # Configuration management
│       │   │   ├── configuration.ts # App configuration
│       │   │   ├── env-validation.* # Environment validation
│       │   │   └── index.ts         # Config exports
│       │   ├── modules/             # NestJS modules
│       │   │   ├── credit/          # Credit management module
│       │   │   ├── payment/         # Payment processing module
│       │   │   ├── prisma/          # Database module
│       │   │   ├── subscription/    # Subscription management module
│       │   │   └── webhook/         # Webhook handling module
│       │   ├── app.controller.ts    # Main app controller
│       │   ├── app.module.ts        # Root application module
│       │   ├── app.service.ts       # Main app service
│       │   └── main.ts              # Application entry point
│       ├── nest-cli.json            # NestJS CLI configuration
│       ├── package.json             # Server app dependencies
│       └── tsconfig.json            # TypeScript configuration
├── packages/                        # Shared packages
│   ├── database/                    # Shared database package
│   │   ├── prisma/                  # Prisma schema and migrations
│   │   ├── src/                     # Database utilities and types
│   │   └── package.json             # Database package dependencies
│   ├── eslint-config/               # Shared ESLint configurations
│   │   ├── base.js                  # Base ESLint config
│   │   ├── library.js               # Library-specific config
│   │   ├── nest.js                  # NestJS-specific config
│   │   ├── next.js                  # Next.js-specific config
│   │   ├── react-internal.js        # React internal config
│   │   └── package.json             # ESLint config dependencies
│   └── typescript-config/           # Shared TypeScript configurations
│       ├── base.json                # Base TypeScript config
│       ├── nestjs.json              # NestJS-specific config
│       ├── nextjs.json              # Next.js-specific config
│       ├── react-library.json       # React library config
│       └── package.json             # TypeScript config dependencies
├── .gitignore                       # Git ignore rules
├── package.json                     # Root package.json with workspace config
├── pnpm-lock.yaml                   # pnpm lockfile
├── pnpm-workspace.yaml              # pnpm workspace configuration
├── turbo.json                       # Turborepo configuration
└── tsconfig.json                    # Root TypeScript configuration
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

- **🔄 Idempotent Stripe Event Processing** ✅ **(done)**
  - Implement idempotent handling for Stripe webhook events to prevent duplicate processing
  - Add event deduplication mechanism and processing state tracking
  - Ensure reliable payment and subscription event handling

- **💳 Transaction-Safe Credit Processing** 🚧 **(in progress)**
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
