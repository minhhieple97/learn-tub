# LearnTub Server | API

## Getting Started

### Environment Variables

This application uses Joi for environment variable validation. Create a `.env.local` or `.env` file in the root directory with the following variables:

```bash
# Application Configuration
PORT=3001
NODE_ENV=development

# Database Configuration  
DATABASE_URL="postgresql://username:password@localhost:5432/learnTub"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Logging Configuration
LOG_LEVEL=info

# Cache Configuration (TTL in seconds)
CACHE_TTL=300
```

The application will validate all environment variables on startup and throw descriptive errors for any missing or invalid values.

### Running the Server

First, run the development server:

```bash
pnpm run dev
```

By default, your server will run at [http://localhost:3001](http://localhost:3001). You can use your favorite API platform like [Insomnia](https://insomnia.rest/) or [Postman](https://www.postman.com/) to test your APIs

### ⚠️ Note about build

If you plan to only build this app. Please make sure you've built the packages first.

## Learn More

To learn more about NestJs, take a look at the following resources:

- [Official Documentation](https://docs.nestjs.com) - A progressive Node.js framework for building efficient, reliable and scalable server-side applications.
- [Official NestJS Courses](https://courses.nestjs.com) - Learn everything you need to master NestJS and tackle modern backend applications at any scale.
- [GitHub Repo](https://github.com/nestjs/nest)
