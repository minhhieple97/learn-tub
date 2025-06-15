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
│   └── auth/             # Auth callback and error pages/routes
├── components/           # Shared UI components
│   └── ui/               # Shadcn UI components
├── features/             # Feature-specific modules (AI, Auth, Notes, Videos)
│   ├── ai/               # AI Usage Tracking System
│   │   ├── types.ts      # TypeScript definitions with I prefix
│   │   ├── schemas.ts    # Zod validation schemas
│   │   ├── queries/      # Database operations for AI usage analytics
│   │   ├── services/     # AI usage tracker service (singleton)
│   │   ├── examples/     # Integration examples and usage patterns
│   │   └── README.md     # Detailed AI usage tracking documentation
│   ├── notes/            # Note-taking features with AI evaluation
│   │   ├── components/   # Note UI components (evaluation, feedback display)
│   │   ├── hooks/        # Note-related React hooks
│   │   ├── services/     # Note service with integrated AI tracking
│   │   └── types/        # Note-related TypeScript types
│   ├── quizzes/          # Quiz features with AI generation
│   │   ├── components/   # Quiz UI components
│   │   ├── hooks/        # Quiz-related React hooks
│   │   ├── services/     # Quiz service with integrated AI tracking
│   │   └── types/        # Quiz-related TypeScript types
│   ├── auth/
│   └── videos/
├── hooks/                # Custom React hooks (e.g., use-mobile, use-toast)
├── lib/                  # Core utilities, Supabase clients, Safe Action setup
│   ├── supabase/
│   └── utils/
├── public/               # Static assets
├── supabase/             # Supabase local development files
│   └── migrations/       # Database schema migrations (includes AI usage logs)
├── .vscode/              # VSCode specific settings (Deno integration)
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

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm run start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Add tests for new features

## 📊 Features in Detail

### 🧠 AI-Powered Learning

#### 📝 AI Note Evaluation

- **Comprehensive Note Evaluation**: AI analyzes your notes for accuracy, completeness, and understanding
- **Multiple AI Providers**: Choose between OpenAI and Google Gemini models for evaluation
- **Real-time Streaming**: Get instant feedback as the AI processes your notes
- **Structured Feedback**: Receive detailed analysis including correct points, areas for improvement, and specific suggestions
- **Performance Scoring**: Get numerical ratings (1-10) to track your note-taking quality
- **Copyable Insights**: Save or share AI feedback for future reference

#### 🎯 AI Quiz Assistant

- **Smart Question Generation**: AI creates 5-20 multiple-choice questions based on video content
- **Adaptive Difficulty**: Choose from easy, medium, hard, or mixed difficulty levels
- **Interactive Quiz Interface**: Beautiful, responsive UI with progress tracking and navigation
- **Personalized Feedback**: Get detailed performance analysis with strengths and improvement areas
- **Question Review**: Review each question with explanations and correct answers
- **Topic-Based Analytics**: Performance breakdown by subject areas and difficulty levels
- **Customizable Settings**: Adjust question count, difficulty, and AI provider preferences

### 📝 Smart Note-Taking

- Real-time synchronization with video timestamps
- Rich text formatting and organization
- Tag-based categorization system
- Search and filter capabilities

### 📈 Progress Analytics

- Learning streak tracking
- Time spent analysis
- Completion rates and milestones
- Visual progress dashboards

## 🔒 Security & Privacy

- **Authentication:** Secure user authentication via Supabase Auth
- **Data Protection:** All user data encrypted and stored securely
- **AI Usage Privacy:** AI tracking data is user-specific with Row Level Security
- **Privacy First:** No tracking, no ads, user data stays private
- **GDPR Compliant:** Full compliance with data protection regulations

## 🤖 AI Features

### AI Note Evaluation

The AI evaluation system provides comprehensive feedback on your learning notes:

- **Multi-Provider Support**: Choose between OpenAI and Google Gemini
- **Streaming Responses**: Real-time feedback as AI analyzes your notes
- **Automatic Tracking**: All AI interactions are automatically tracked for analytics
- **Structured Analysis**: Get detailed feedback including:
  - Overall summary and assessment
  - Correct points identification
  - Areas needing improvement
  - Specific enhancement suggestions
  - Numerical scoring (1-10 scale)
  - Detailed analysis breakdown

### AI Quiz Assistant

The AI Quiz Assistant transforms passive video watching into active learning through intelligent testing:

- **Intelligent Question Generation**: AI analyzes video content to create relevant multiple-choice questions
- **Automatic Usage Tracking**: All quiz generation and evaluation is tracked for analytics
- **Flexible Configuration**:
  - **Question Count**: Generate 5-20 questions per quiz
  - **Difficulty Levels**: Easy, medium, hard, or mixed difficulty
  - **AI Provider Choice**: Select between OpenAI GPT models or Google Gemini
- **Interactive Learning Experience**:
  - **Progress Tracking**: Visual progress bars and question indicators
  - **Navigation**: Jump between questions or navigate sequentially
  - **Answer Validation**: Instant visual feedback for selected answers
- **Comprehensive Feedback System**:
  - **Performance Scoring**: Percentage-based scoring with detailed breakdowns
  - **Personalized Analysis**: AI-generated insights on strengths and weaknesses
  - **Question-by-Question Review**: Detailed explanations for each answer
  - **Topic Performance**: Analytics grouped by subject areas
- **Beautiful UI/UX**:
  - **Responsive Design**: Works seamlessly on all devices
  - **Dark/Light Theme**: Full compatibility with theme preferences
  - **Smooth Animations**: Loading states and transitions for better UX
  - **Accessibility**: ARIA labels and keyboard navigation support

### AI Usage Analytics

The comprehensive AI usage tracking system provides insights into your AI interactions:

- **Usage Monitoring**: Track all AI operations across note evaluation and quiz features
- **Cost Analysis**: Real-time cost calculation and budget tracking
- **Performance Metrics**: Monitor response times, success rates, and error patterns
- **Provider Comparison**: Compare performance and costs across different AI providers
- **Historical Data**: Access detailed usage history and trends over time
- **Privacy-First**: All tracking data is user-specific and secure

## 💡 Potential Future Enhancements

- **Courses Feature**: Group videos into courses. (Schema exists)
- **Advanced Search & Filtering**: For notes and videos.
- **Spaced Repetition System (SRS)**: For quizzes and key concepts.
- **Collaborative Note-Taking**: Allow users to share notes or collaborate.
- **User Profile Customization**: More options for learning preferences.
- **Enhanced AI Features**:
  - Content summarization and insights
  - Personalized learning recommendations
  - Automated concept extraction
  - Advanced quiz features (timed quizzes, adaptive difficulty)
  - AI-powered study plans and learning paths
- **Advanced AI Analytics**:
  - Predictive cost modeling
  - AI performance optimization recommendations
  - Usage pattern analysis and insights
  - Automated budget alerts and recommendations

## 🤝 Contributing

Contributions are welcome! Please follow standard Git practices: fork the repository, create a feature branch, and submit a pull request. Ensure your code adheres to the existing linting and formatting rules.
