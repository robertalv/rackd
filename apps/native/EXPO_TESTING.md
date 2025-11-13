# Testing Rackd App with Expo

## Quick Start

### Option 1: Development Build (Recommended - Full Features)

Since the app uses native modules (expo-media-library, expo-image-picker, etc.), you'll need a development build for full functionality.

#### 1. Install Expo CLI (if not already installed)
```bash
npm install -g expo-cli
# or
pnpm add -g expo-cli
```

#### 2. Set up Environment Variables

Create a `.env` file in `apps/native/`:
```bash
EXPO_PUBLIC_CONVEX_URL=your_convex_url_here
EXPO_PUBLIC_CONVEX_SITE_URL=https://rackd.net
```

#### 3. Start the Development Server

```bash
cd apps/native
pnpm start
# or
pnpm dev  # clears cache
```

#### 4. Build and Run Development Build

**For iOS:**
```bash
# Build and run on iOS simulator
pnpm ios

# Or build for physical device (requires Apple Developer account)
pnpm ios --device
```

**For Android:**
```bash
# Build and run on Android emulator
pnpm android

# Or build for physical device
pnpm android --device
```

### Option 2: Expo Go (Quick Testing - Limited Features)

Expo Go can be used for basic testing, but some features won't work (like media library, image picker, etc.).

#### 1. Install Expo Go App
- **iOS**: Download from [App Store](https://apps.apple.com/app/expo-go/id982107779)
- **Android**: Download from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

#### 2. Start Expo Development Server
```bash
cd apps/native
pnpm start
```

#### 3. Connect Your Device
- **Same Network**: Make sure your phone and computer are on the same Wi-Fi network
- **Scan QR Code**: Open Expo Go app and scan the QR code from the terminal
- **Or Use Tunnel**: Run `pnpm start --tunnel` for testing on different networks

## Testing Deep Links

### Test Custom Scheme Links
```bash
# iOS Simulator
xcrun simctl openurl booted "rackd:///(drawer)/(tabs)/username"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "rackd:///(drawer)/(tabs)/username" net.rackd.app

# Physical Device (via terminal)
# Use the same commands, but ensure device is connected via USB
```

### Test Universal Links (rackd.net)
1. Ensure your domain has proper configuration:
   - iOS: `https://rackd.net/.well-known/apple-app-site-association`
   - Android: `https://rackd.net/.well-known/assetlinks.json`

2. Open links in Safari/Chrome on your device:
   ```
   https://rackd.net/username
   ```

## Troubleshooting

### If QR Code Doesn't Appear
- Make sure you're in the `apps/native` directory
- Check that all dependencies are installed: `pnpm install`
- Try clearing cache: `pnpm dev`

### If Native Modules Don't Work
- Use a development build instead of Expo Go
- Run `pnpm prebuild` to generate native code
- Then run `pnpm ios` or `pnpm android`

### If Deep Links Don't Work
- For custom scheme (`rackd://`): Should work immediately
- For universal links (`https://rackd.net`): Requires domain configuration files
- Check that `scheme` in `app.json` matches your deep link scheme

## Useful Commands

```bash
# Start with tunnel (for testing on different networks)
pnpm start --tunnel

# Start with LAN (same network only)
pnpm start --lan

# Clear cache and start
pnpm dev

# Build for production
pnpm prebuild
pnpm ios --configuration Release
pnpm android --variant release
```

