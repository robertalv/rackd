# Netlify Deployment Guide for @app and @web

This guide covers deploying both the `@app` and `@web` applications to Netlify.

## Prerequisites

- A Netlify account ([sign up here](https://app.netlify.com/signup))
- Your repository connected to GitHub/GitLab/Bitbucket
- pnpm installed (version 10.13.1 or compatible)

## Deployment Options

You have two options for deploying:
1. **Two separate Netlify sites** (recommended) - One for each app
2. **Single Netlify site** - Deploy one app, or use branch-based deployments

---

## Option 1: Deploy Both Apps as Separate Sites (Recommended)

### Deploying @app

1. **Go to Netlify Dashboard:**
   - Visit [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"

2. **Connect your repository:**
   - Select your Git provider (GitHub/GitLab/Bitbucket)
   - Choose the `rackd` repository

3. **Configure build settings:**
   - **Base directory:** `/` (repo root) - **IMPORTANT:** This must be set to repo root for monorepo
   - **Config file:** `apps/app/netlify.toml` (or leave empty to auto-detect)
   - **Build command:** Will be read from `netlify.toml` (or set to `pnpm --filter app build`)
   - **Publish directory:** Will be read from `netlify.toml` (or set to `apps/app/dist`)
   - **Package manager:** `pnpm`

4. **Set environment variables:**
   - Go to Site settings → Environment variables
   - Add the following:
     ```
     VITE_CONVEX_URL=https://your-production-project.convex.cloud
     NODE_VERSION=20 (or your preferred Node version)
     PNPM_VERSION=10.13.1
     ```

5. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy

### Deploying @web

1. **Create a new site** (repeat steps 1-2 from above)

2. **Configure build settings:**
   - **Base directory:** `/` (repo root) - **IMPORTANT:** This must be set to repo root for monorepo
   - **Config file:** `apps/web/netlify.toml` (or leave empty to auto-detect)
   - **Build command:** Will be read from `netlify.toml` (or set to `pnpm --filter web build`)
   - **Publish directory:** Will be read from `netlify.toml` (or set to `apps/web/dist`)
   - **Package manager:** `pnpm`

3. **Set environment variables:**
   ```
   VITE_CONVEX_URL=https://your-production-project.convex.cloud
   NODE_VERSION=20
   PNPM_VERSION=10.13.1
   ```

4. **Deploy:**
   - Click "Deploy site"

---

## Option 2: Using Netlify Configuration Files (Already Created)

The `netlify.toml` files have been created in both `apps/app/` and `apps/web/` directories. When you connect your repository, Netlify will automatically detect these files.

### For @app:

1. Connect repository to Netlify
2. Netlify will auto-detect `apps/app/netlify.toml`
3. Set environment variables in Netlify dashboard
4. Deploy

### For @web:

1. Create a second site in Netlify
2. Connect the same repository
3. Netlify will auto-detect `apps/web/netlify.toml` (you may need to set the base directory)
4. Set environment variables
5. Deploy

**Note:** If Netlify doesn't auto-detect the config file, you can manually specify:
- **Base directory:** `apps/app` or `apps/web`
- Netlify will then use the `netlify.toml` in that directory

---

## Environment Variables

Both apps require the following environment variables:

### Required:
- `VITE_CONVEX_URL` - Your production Convex deployment URL

### Optional (if needed):
- `VITE_CONVEX_SITE_URL` - Your production site URL
- `NODE_VERSION` - Node.js version (default: 20)
- `PNPM_VERSION` - pnpm version (default: 10.13.1)

### Setting Environment Variables:

**Via Netlify Dashboard:**
1. Go to Site settings → Environment variables
2. Add each variable
3. Set scope (All scopes, or specific to Production/Deploy previews)

**Via Netlify CLI:**
```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Login
netlify login

# Set environment variables for @app site
netlify env:set VITE_CONVEX_URL=https://your-production-project.convex.cloud --site=your-app-site-id

# Set environment variables for @web site
netlify env:set VITE_CONVEX_URL=https://your-production-project.convex.cloud --site=your-web-site-id
```

---

## Build Configuration Details

### Build Process:

1. Netlify installs dependencies using pnpm (from root)
2. Runs `pnpm --filter app build` or `pnpm --filter web build`
3. This builds only the specified app and its dependencies
4. Outputs to `apps/app/dist` or `apps/web/dist`
5. Netlify serves from the dist directory

### Monorepo Considerations:

- **Base directory:** Set to repo root (`/`) to access all workspace packages
- **Build command:** Uses pnpm filter to build only the target app
- **Dependencies:** pnpm automatically resolves workspace dependencies (`@rackd/*` packages)

---

## Custom Domain Setup

### For @app:

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Enter your domain (e.g., `app.rackd.net`)
4. Follow DNS configuration instructions

### For @web:

1. Repeat for the @web site
2. Use a different subdomain (e.g., `www.rackd.net` or `rackd.net`)

---

## Continuous Deployment

Netlify automatically deploys when you push to your connected branch:

- **Production branch:** Usually `main` or `master`
- **Deploy previews:** Created for pull requests
- **Branch deploys:** Created for other branches (optional)

### Branch Configuration:

1. Go to Site settings → Build & deploy → Continuous Deployment
2. Set production branch (e.g., `main`)
3. Configure branch deploys if needed

---

## Troubleshooting

### Build Fails: "Cannot find module"

**Solution:** Ensure `base` directory is set correctly and build command uses `pnpm --filter`

### Build Fails: "pnpm not found"

**Solution:** 
- Set `PNPM_VERSION` environment variable
- Or add `netlify.toml` with:
  ```toml
  [build.environment]
    PNPM_VERSION = "10.13.1"
  ```

### Build Succeeds but Site Shows 404

**Solution:** 
- Verify `publish` directory is correct (`apps/app/dist` or `apps/web/dist`)
- Check that `dist` folder exists after build
- Ensure redirects are configured (already in `netlify.toml`)

### Environment Variables Not Working

**Solution:**
- Ensure variables are prefixed with `VITE_` for Vite apps
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)

### Monorepo Dependencies Not Found

**Solution:**
- Ensure build runs from root (base directory = `/`)
- Verify `pnpm --filter` command includes dependencies
- Check that workspace packages are built before the app

---

## Quick Deploy Commands (Netlify CLI)

### Deploy @app:

```bash
cd apps/app
netlify deploy --prod --dir=dist
```

### Deploy @web:

```bash
cd apps/web
netlify deploy --prod --dir=dist
```

### Build and Deploy:

```bash
# Build @app
pnpm --filter app build
cd apps/app
netlify deploy --prod --dir=dist

# Build @web
pnpm --filter web build
cd apps/web
netlify deploy --prod --dir=dist
```

---

## Next Steps

1. ✅ Create Netlify accounts/sites for both apps
2. ✅ Connect repositories
3. ✅ Configure build settings
4. ✅ Set environment variables
5. ✅ Deploy and test
6. ✅ Set up custom domains
7. ✅ Configure continuous deployment

For more information:
- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Monorepo Guide](https://docs.netlify.com/configure-builds/monorepos/)
- [pnpm Documentation](https://pnpm.io/)

