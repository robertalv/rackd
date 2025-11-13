# Production Deployment Guide

This guide covers building the native app for Expo, iOS, and Android, as well as setting up the production Convex database.

## Table of Contents

1. [Convex Production Setup](#convex-production-setup)
2. [Building for Expo](#building-for-expo)
3. [Building for iOS](#building-for-ios)
4. [Building for Android](#building-for-android)
5. [Environment Variables](#environment-variables)

---

## Convex Production Setup

### Step 1: Create Production Convex Project

1. **Create a new Convex project for production:**
   ```bash
   cd packages/backend
   npx convex dev --configure
   ```
   - When prompted, create a **new project** (e.g., `rackd-production`)
   - This will create a new `convex.json` file or update the existing one

2. **Deploy to production:**
   ```bash
   npx convex deploy --prod
   ```
   Or if you have multiple deployments configured:
   ```bash
   npx convex deploy --prod --project-name rackd-production
   ```

### Step 2: Get Production Convex URL

After deployment, you'll get a production URL like:
```
https://your-production-project.convex.cloud
```

Save this URL - you'll need it for environment variables.

### Step 3: Set Production Environment Variables in Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev/)
2. Select your **production project**
3. Navigate to **Settings** → **Environment Variables**
4. Add all required environment variables:
   - `CONVEX_SITE_URL` - Your production site URL (e.g., `https://rackd.net`)
   - `AUTH_GOOGLE_ID` - Google OAuth client ID
   - `AUTH_GOOGLE_SECRET` - Google OAuth client secret
   - `AUTH_APPLE_ID` - Apple OAuth client ID
   - `AUTH_APPLE_SECRET` - Apple OAuth client secret
   - `APPLE_APP_BUNDLE_IDENTIFIER` - `net.rackd.app`
   - `CLOUDFLARE_ACCOUNT_ID` - Cloudflare account ID
   - `CLOUDFLARE_API_TOKEN` - Cloudflare API token
   - `R2_PUBLIC_URL` - Cloudflare R2 public URL
   - `CLOUDFLARE_TURNSTILE_SECRET_KEY` - Turnstile secret key
   - `RESEND_API_KEY` - Resend API key (if using email)

   Or use CLI:
   ```bash
   cd packages/backend
   npx convex env set CONVEX_SITE_URL=https://rackd.net --prod
   npx convex env set AUTH_GOOGLE_ID=your_value --prod
   # ... etc
   ```

### Step 4: Configure Convex for Multiple Deployments (Optional)

If you want to manage both dev and prod from the same codebase:

1. Create `packages/backend/convex.json` (if it doesn't exist):
   ```json
   {
     "projects": {
       "dev": {
         "project": "your-dev-project-name",
         "team": "your-team-name"
       },
       "prod": {
         "project": "your-prod-project-name",
         "team": "your-team-name"
       }
     }
   }
   ```

2. Deploy to specific environment:
   ```bash
   # Development
   npx convex deploy --project dev
   
   # Production
   npx convex deploy --project prod
   ```

---

## Building for Expo

### Prerequisites

- Install Expo CLI globally:
  ```bash
  npm install -g expo-cli
  # or
  pnpm add -g expo-cli
  ```

- Install EAS CLI (Expo Application Services):
  ```bash
  npm install -g eas-cli
  # or
  pnpm add -g eas-cli
  ```

### Step 1: Set Up Environment Variables

Create `apps/native/.env.production`:
```bash
EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
```

**Important:** For Expo builds, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

### Step 2: Configure EAS Build

1. **Login to Expo:**
   ```bash
   cd apps/native
   eas login
   ```

2. **Configure EAS Build:**
   ```bash
   eas build:configure
   ```
   This creates/updates `eas.json` in `apps/native/`.

3. **Update `eas.json`** (if needed) to include production profile:
   ```json
   {
     "cli": {
       "version": ">= 5.0.0"
     },
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal",
         "ios": {
           "simulator": false
         }
       },
       "production": {
         "env": {
           "EXPO_PUBLIC_CONVEX_URL": "https://your-production-project.convex.cloud",
           "EXPO_PUBLIC_CONVEX_SITE_URL": "https://rackd.net"
         }
       }
     },
     "submit": {
       "production": {}
     }
   }
   ```

### Step 3: Build with EAS

**For iOS:**
```bash
eas build --platform ios --profile production
```

**For Android:**
```bash
eas build --platform android --profile production
```

**For both:**
```bash
eas build --platform all --profile production
```

### Step 4: Submit to App Stores (Optional)

**iOS (App Store):**
```bash
eas submit --platform ios --profile production
```

**Android (Google Play):**
```bash
eas submit --platform android --profile production
```

---

## Building for iOS

### Option 1: EAS Build (Recommended for Production)

Follow the [Building for Expo](#building-for-expo) section above.

### Option 2: Local Build

**Prerequisites:**
- macOS with Xcode installed
- Apple Developer account ($99/year)
- CocoaPods installed: `sudo gem install cocoapods`

**Steps:**

1. **Set environment variables:**
   ```bash
   cd apps/native
   export EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
   export EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
   ```

2. **Prebuild native code:**
   ```bash
   pnpm prebuild
   ```

3. **Install iOS dependencies:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

4. **Build for iOS Simulator:**
   ```bash
   pnpm ios
   ```

5. **Build for physical device:**
   ```bash
   pnpm ios --device
   ```

6. **Build Release for App Store:**
   ```bash
   # Open Xcode
   open ios/rackd.xcworkspace
   
   # In Xcode:
   # 1. Select "Any iOS Device" or your device
   # 2. Product → Archive
   # 3. Distribute App → App Store Connect
   ```

### iOS Configuration

Ensure `apps/native/app.json` has correct iOS settings:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "net.rackd.app",
      "buildNumber": "1.0.0",
      "associatedDomains": [
        "applinks:rackd.net",
        "applinks:www.rackd.net"
      ]
    }
  }
}
```

---

## Building for Android

### Option 1: EAS Build (Recommended for Production)

Follow the [Building for Expo](#building-for-expo) section above.

### Option 2: Local Build

**Prerequisites:**
- Android Studio installed
- Android SDK configured
- Java Development Kit (JDK) installed

**Steps:**

1. **Set environment variables:**
   ```bash
   cd apps/native
   export EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud
   export EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
   ```

2. **Prebuild native code:**
   ```bash
   pnpm prebuild
   ```

3. **Build for Android:**
   ```bash
   # For emulator
   pnpm android
   
   # For physical device (connected via USB)
   pnpm android --device
   ```

4. **Build Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   # APK will be at: android/app/build/outputs/apk/release/app-release.apk
   ```

5. **Build Release AAB (for Google Play):**
   ```bash
   cd android
   ./gradlew bundleRelease
   # AAB will be at: android/app/build/outputs/bundle/release/app-release.aab
   ```

### Android Configuration

Ensure `apps/native/app.json` has correct Android settings:
```json
{
  "expo": {
    "android": {
      "package": "net.rackd.app",
      "versionCode": 1,
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "rackd.net",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## Environment Variables

### For Native App (Expo)

Create `apps/native/.env.production`:
```bash
# Production Convex URL
EXPO_PUBLIC_CONVEX_URL=https://your-production-project.convex.cloud

# Production site URL
EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net

# Optional: Cloudflare Turnstile (if using)
EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key
```

**Note:** Expo only exposes environment variables prefixed with `EXPO_PUBLIC_` to the client.

### For Convex Backend

Set in Convex Dashboard or via CLI:
```bash
cd packages/backend

# Production environment variables
npx convex env set CONVEX_SITE_URL=https://rackd.net --prod
npx convex env set AUTH_GOOGLE_ID=your_value --prod
npx convex env set AUTH_GOOGLE_SECRET=your_value --prod
npx convex env set AUTH_APPLE_ID=your_value --prod
npx convex env set AUTH_APPLE_SECRET=your_value --prod
npx convex env set APPLE_APP_BUNDLE_IDENTIFIER=net.rackd.app --prod
# ... etc
```

---

## Quick Reference Commands

### Convex Production Deployment
```bash
cd packages/backend
npx convex deploy --prod
```

### Build Native App (EAS)
```bash
cd apps/native
eas build --platform all --profile production
```

### Build Native App (Local)
```bash
cd apps/native
pnpm prebuild
pnpm ios --configuration Release
pnpm android --variant release
```

### Check Convex Deployment Status
```bash
cd packages/backend
npx convex logs --prod
```

---

## Troubleshooting

### Environment Variables Not Working

- **Expo:** Ensure variables are prefixed with `EXPO_PUBLIC_`
- **EAS Build:** Add variables to `eas.json` under the build profile's `env` section
- **Local Build:** Export variables before running build commands

### Convex Connection Issues

- Verify `EXPO_PUBLIC_CONVEX_URL` matches your production Convex deployment URL
- Check Convex dashboard for deployment status
- Ensure environment variables are set in Convex dashboard

### Build Failures

- **iOS:** Ensure Xcode and CocoaPods are up to date
- **Android:** Ensure Android SDK and build tools are installed
- **EAS:** Check build logs in Expo dashboard: `https://expo.dev/accounts/[your-account]/builds`

### App Store Submission

- **iOS:** Ensure you have proper certificates and provisioning profiles
- **Android:** Ensure you've signed the app with a release keystore

---

## Next Steps

1. ✅ Set up production Convex project
2. ✅ Configure environment variables
3. ✅ Build native apps (iOS/Android)
4. ✅ Test production builds
5. ✅ Submit to app stores
6. ✅ Monitor production deployments

For more information:
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Convex Documentation](https://docs.convex.dev/)

