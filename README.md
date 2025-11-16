# rackd

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines React, TanStack Start, Convex, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **TanStack Start** - SSR framework with TanStack Router
- **React Native** - Build mobile apps using React
- **Expo** - Tools for React Native development
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Convex** - Reactive backend-as-a-service platform
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Convex Setup

This project uses Convex as a backend. You'll need to set up Convex before running the app:

```bash
pnpm run dev:setup
```

Follow the prompts to create a new Convex project and connect it to your application.

Then, run the development server:

```bash
pnpm run dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
Use the Expo Go app to run the mobile application.
Your app will connect to the Convex cloud backend automatically.







## Project Structure

```
rackd/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Start)
│   ├── native/      # Mobile application (React Native, Expo)
├── packages/
│   ├── backend/     # Convex backend functions and schema
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
- `pnpm run dev:web`: Start only the web application
- `pnpm run dev:setup`: Setup and configure your Convex project
- `pnpm run check-types`: Check TypeScript types across all apps
- `pnpm run dev:native`: Start the React Native/Expo development server

## Code Review

This project uses [CodeRabbit](https://www.coderabbit.ai/) for AI-powered code reviews:

- **Automated PR Reviews**: Every pull request is automatically reviewed
- **IDE Integration**: Get real-time code reviews in Cursor/VS Code
- **Configuration**: See `.coderabbit.yaml` for project-specific settings

To enable CodeRabbit:
1. Install the [GitHub App](https://github.com/apps/coderabbitai) for your repository
2. (Optional) Install the CodeRabbit extension in Cursor/VS Code for IDE reviews

## Web Scraping with Firecrawl

This project uses [Firecrawl](https://www.firecrawl.dev/) for web scraping and data extraction:

- **Tournament Import**: Extract tournament information from URLs (Facebook events, tournament websites, etc.)
- **Venue Information**: Auto-populate venue details from website URLs
- **AI-Powered Extraction**: Uses Firecrawl Extract API for accurate data extraction
- **Screenshot Support**: Capture tournament flyers and venue images

### Setup

1. Get your Firecrawl API key from [https://www.firecrawl.dev/](https://www.firecrawl.dev/)
2. Add `FIRECRAWL_API_KEY` to your environment variables:
   - For local development: Add to `.env` files
   - For Convex backend: Set in Convex dashboard
   - For production: Set in deployment environment

### Usage

**Tournament Import:**
- Use the `TournamentUrlImporter` component to extract tournament details from URLs
- Automatically extracts: name, date, venue, entry fee, game type, max players, etc.

**Venue Import:**
- Use the `VenueUrlImporter` component to extract venue information from websites
- Automatically extracts: name, address, contact info, operating hours, social links, etc.

**Backend Actions:**
- `extractTournamentFromUrl`: Convex action for server-side tournament extraction (uses Extract API)
- `extractVenueFromUrl`: Convex action for server-side venue extraction (uses Extract API)
- `searchTournaments`: Search the web for tournaments using Firecrawl Search API
- `discoverTournamentsFromVenue`: Map venue websites to discover tournament pages

See [Firecrawl Documentation](https://docs.firecrawl.dev/) for more details.

## Error Monitoring with Sentry

This project uses [Sentry](https://sentry.io/) for error monitoring and performance tracking:

- **Error Monitoring**: Automatic error tracking and alerting
- **Performance Monitoring**: Track slow transactions and API calls
- **Session Replay**: Visual debugging with user session recordings
- **Release Tracking**: Associate errors with code deployments

### Setup

1. **Get your Sentry DSN:**
   - Create a project at [https://sentry.io/](https://sentry.io/)
   - Navigate to Settings → Projects → Client Keys (DSN)
   - Copy your DSN

2. **Configure Environment Variables:**

   For web apps (`apps/app` and `apps/web`):
   ```env
   VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id
   VITE_SENTRY_RELEASE=your-release-version  # Optional: for release tracking
   VITE_SENTRY_TRACES_SAMPLE_RATE=0.1  # Optional: 10% for production
   ```

   For React Native app (`apps/native`):
   - Already configured in `apps/native/app/_layout.tsx`
   - Set `SENTRY_AUTH_TOKEN` for source map uploads in EAS builds

3. **Production Deployment:**
   - Set environment variables in your hosting platform (Netlify, Vercel, etc.)
   - For source maps, upload them after builds or use Sentry's build integration

### Features

- **Automatic Error Tracking**: Catches unhandled errors and promise rejections
- **Performance Monitoring**: Tracks page loads, API calls, and user interactions
- **User Context**: Automatically associates errors with user IDs
- **Source Maps**: Full stack traces with original source code
- **Session Replay**: Visual debugging for errors (privacy-focused)
- **Release Tracking**: Know which deployment introduced bugs

### Usage

Errors are automatically tracked. For manual error reporting:

```typescript
import * as Sentry from "@sentry/react";

// Capture exceptions
try {
  // risky code
} catch (error) {
  Sentry.captureException(error);
}

// Add breadcrumbs for debugging
Sentry.addBreadcrumb({
  category: "auth",
  message: "User logged in",
  level: "info",
});

// Set custom tags
Sentry.setTag("feature", "tournaments");
```

### React Native

The React Native app already has Sentry configured with:
- Automatic crash reporting
- Source map uploads for iOS and Android
- User feedback integration

See [Sentry Documentation](https://docs.sentry.io/) for more details.
