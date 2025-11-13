# Production Deployment Checklist

Quick reference checklist for deploying to production.

## ✅ Convex Production Setup

- [ ] Create production Convex project
  ```bash
  cd packages/backend
  npx convex dev --configure
  # Create new project: rackd-production
  ```

- [ ] Deploy Convex functions to production
  ```bash
  cd packages/backend
  pnpm deploy:prod
  # or: npx convex deploy --prod
  ```

- [ ] Get production Convex URL
  - Check Convex dashboard or output from deployment
  - Format: `https://your-project.convex.cloud`

- [ ] Set production environment variables in Convex Dashboard
  - [ ] `CONVEX_SITE_URL=https://rackd.net`
  - [ ] `AUTH_GOOGLE_ID`
  - [ ] `AUTH_GOOGLE_SECRET`
  - [ ] `AUTH_APPLE_ID`
  - [ ] `AUTH_APPLE_SECRET`
  - [ ] `APPLE_APP_BUNDLE_IDENTIFIER=net.rackd.app`
  - [ ] `CLOUDFLARE_ACCOUNT_ID`
  - [ ] `CLOUDFLARE_API_TOKEN`
  - [ ] `R2_PUBLIC_URL`
  - [ ] `CLOUDFLARE_TURNSTILE_SECRET_KEY`
  - [ ] `RESEND_API_KEY` (if using email)

## ✅ Native App - Environment Setup

- [ ] Install EAS CLI
  ```bash
  npm install -g eas-cli
  ```

- [ ] Login to Expo
  ```bash
  cd apps/native
  eas login
  ```

- [ ] Configure EAS Build
  ```bash
  eas build:configure
  ```

- [ ] Update `apps/native/eas.json` with production Convex URL
  - Replace `https://your-production-project.convex.cloud` with actual URL
  - Replace `https://rackd.net` if different

- [ ] Create `.env.production` file (optional, for local builds)
  ```bash
  cd apps/native
  # Create .env.production with:
  # EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
  # EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
  ```

## ✅ Build Native Apps

### Option A: EAS Build (Recommended)

- [ ] Build iOS
  ```bash
  cd apps/native
  pnpm build:ios
  # or: eas build --platform ios --profile production
  ```

- [ ] Build Android
  ```bash
  cd apps/native
  pnpm build:android
  # or: eas build --platform android --profile production
  ```

- [ ] Build Both
  ```bash
  cd apps/native
  pnpm build:all
  # or: eas build --platform all --profile production
  ```

### Option B: Local Build

- [ ] iOS Local Build
  ```bash
  cd apps/native
  export EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
  export EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
  pnpm build:ios:local
  ```

- [ ] Android Local Build
  ```bash
  cd apps/native
  export EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
  export EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
  pnpm build:android:local
  ```

## ✅ App Store Submission (Optional)

- [ ] iOS App Store
  - [ ] Configure App Store Connect
  - [ ] Submit build
    ```bash
    cd apps/native
    pnpm submit:ios
    # or: eas submit --platform ios --profile production
    ```

- [ ] Google Play Store
  - [ ] Configure Google Play Console
  - [ ] Submit build
    ```bash
    cd apps/native
    pnpm submit:android
    # or: eas submit --platform android --profile production
    ```

## ✅ Verification

- [ ] Test production Convex connection
  - Verify app connects to production Convex URL
  - Test authentication flows
  - Test data operations

- [ ] Test deep links
  - Universal links: `https://rackd.net/username`
  - Custom scheme: `rackd:///(drawer)/(tabs)/username`

- [ ] Monitor production
  - Check Convex logs: `cd packages/backend && pnpm logs:prod`
  - Monitor Sentry for errors
  - Check app analytics

## 📝 Quick Commands Reference

```bash
# Convex
cd packages/backend
pnpm deploy:prod          # Deploy to production
pnpm logs:prod           # View production logs

# Native App
cd apps/native
pnpm build:ios           # Build iOS (EAS)
pnpm build:android       # Build Android (EAS)
pnpm build:all           # Build both platforms (EAS)
pnpm submit:ios          # Submit to App Store
pnpm submit:android      # Submit to Play Store
```

## 🔗 Useful Links

- [Convex Dashboard](https://dashboard.convex.dev/)
- [Expo Dashboard](https://expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)

---

**Note:** Replace `https://your-production-project.convex.cloud` with your actual production Convex URL throughout this checklist.

