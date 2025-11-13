# Netlify Deployment Guide

This document explains how to deploy the TanStack Start app to Netlify.

## Configuration

The app uses a custom build script (`netlify-build.sh`) that ensures builds run from the monorepo root, regardless of where Netlify starts the build process.

## Netlify Dashboard Settings

### Required Settings

1. **Base Directory**: Leave empty (repo root)
   - Site settings → Build & deploy → Continuous Deployment → Base directory: (empty)

2. **Build Command**: Already configured in `netlify.toml`
   - Uses `apps/app/netlify-build.sh` script

3. **Publish Directory**: `apps/app/dist/client`
   - Set automatically from `netlify.toml`

4. **Functions Directory**: `apps/app/netlify/functions`
   - Set automatically from `netlify.toml`

### Environment Variables

- `VITE_CONVEX_URL`: Set automatically during build by Convex deploy
- Add any other required environment variables in Netlify dashboard

## Build Process

1. Convex deployment runs and sets `VITE_CONVEX_URL`
2. App is built using `pnpm --filter app build`
3. Server files are copied to `netlify/functions/server/`
4. Client files are published from `dist/client/`

## Local Development

Run `npx netlify dev` from the `apps/app` directory to test the Netlify setup locally.

## Troubleshooting

- **Build fails with path errors**: Ensure "Base directory" is empty in Netlify dashboard
- **Function not found**: Check that server files were copied to `netlify/functions/server/`
- **Environment variables missing**: Verify they're set in Netlify dashboard under Site settings → Environment variables

