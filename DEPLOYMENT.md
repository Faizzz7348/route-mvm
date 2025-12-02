# Vercel Deployment Guide

## Prerequisites

- Vercel account
- PostgreSQL database (e.g., Neon, Supabase, or Vercel Postgres)
- Google Maps API key (optional, for route optimization features)
- OpenRouteService API key (optional, for route optimization features)

## Environment Variables

Before deploying to Vercel, you need to set up the following environment variables in your Vercel project settings:

### Required Variables

```bash
# Database Connection
DATABASE_URL=your_postgres_connection_string

# Node Environment
NODE_ENV=production
```

### Optional Variables (for route optimization features)

```bash
# Google Maps API Key (for distance calculations)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# OpenRouteService API Key (for toll calculations)
OPENROUTESERVICE_API_KEY=your_openrouteservice_api_key
```

## Deployment Steps

### 1. Install Vercel CLI (optional, for command-line deployment)

```bash
npm install -g vercel
```

### 2. Connect Your Repository to Vercel

#### Option A: Using Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure the project:
   - **Build Command**: `npm run build` (automatically uses `vercel-build` script)
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`
5. Add environment variables in the "Environment Variables" section
6. Click "Deploy"

#### Option B: Using Vercel CLI

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy from the project root:
   ```bash
   vercel
   ```

3. Follow the prompts to configure your project

4. For production deployment:
   ```bash
   vercel --prod
   ```

### 3. Database Setup

After deployment, you need to push your database schema:

```bash
# Set your DATABASE_URL environment variable locally
export DATABASE_URL="your_postgres_connection_string"

# Push the database schema
npm run db:push
```

Alternatively, you can import the CSV data:

```bash
npm run import:csv
```

## Project Structure

```
/
├── api/                 # Serverless API functions
│   └── index.ts        # Main API handler
├── client/             # Frontend React application
│   ├── src/           # React components and pages
│   └── index.html     # HTML entry point
├── server/             # Backend logic (used by API functions)
│   ├── routes.ts      # API route definitions
│   ├── db.ts          # Database connection
│   └── storage.ts     # Database operations
├── shared/             # Shared types and schemas
│   └── schema.ts      # Zod schemas
├── dist/public/        # Build output (generated)
└── vercel.json        # Vercel configuration
```

## How It Works

- **Frontend**: Built with Vite and deployed as static files to `dist/public/`
- **Backend API**: Deployed as serverless functions in the `/api` directory
- **Routing**: 
  - `/api/*` routes go to the serverless function
  - All other routes serve the static frontend
  - Frontend uses client-side routing (Wouter)

## Troubleshooting

### Build Failures

1. **TypeScript errors**: Run `npm run check` locally to verify TypeScript compilation
2. **Missing dependencies**: Ensure all dependencies are in `dependencies`, not `devDependencies` if they're needed at runtime
3. **Build timeout**: Consider optimizing build performance or upgrading Vercel plan

### API Errors

1. **500 Internal Server Error**: Check Vercel function logs in the dashboard
2. **Database connection issues**: Verify `DATABASE_URL` is set correctly in environment variables
3. **Cold start timeouts**: Serverless functions may have cold start delays; consider using Vercel's Edge Functions for critical paths

### Environment Variables

- Environment variables set in Vercel dashboard are available to both build and runtime
- Changes to environment variables require a redeploy
- Use the Vercel CLI to check current environment variables:
  ```bash
  vercel env ls
  ```

## Performance Optimization

1. **Enable caching**: Static assets are automatically cached
2. **Database connection pooling**: Use connection pooling for PostgreSQL (e.g., Neon's serverless driver)
3. **Code splitting**: Already configured in `vite.config.ts`
4. **Image optimization**: Consider using Vercel's Image Optimization

## Monitoring

- View logs in Vercel Dashboard under "Deployments" > "Functions"
- Set up error tracking (e.g., Sentry) for production monitoring
- Monitor database performance through your database provider's dashboard

## Updates and Redeployment

Vercel automatically redeploys on every push to your main branch (if connected via Git).

For manual redeployment:
```bash
vercel --prod
```

## Security Notes

- Never commit `.env` files with sensitive credentials
- Use Vercel's environment variable encryption
- Enable CORS only for trusted domains in production
- Regularly update dependencies for security patches
