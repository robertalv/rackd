# Cloudflare Integration Guide

This guide explains how to integrate Cloudflare services into the Rackd application.

> **📋 Need help finding configuration values?** See [CLOUDFLARE_CONFIG_GUIDE.md](./CLOUDFLARE_CONFIG_GUIDE.md) for step-by-step instructions on where to get all API keys, tokens, and credentials.

## Overview

Cloudflare provides several services that can enhance the Rackd app:

1. **Cloudflare Images** - Automatic image optimization and CDN delivery
2. **Cloudflare Workers** - Edge functions for API proxying and caching
3. **Cloudflare R2** - Object storage (S3-compatible, no egress fees)
4. **Cloudflare Turnstile** - Bot protection

## 1. Cloudflare Images Setup

### Benefits
- Automatic image optimization (WebP, AVIF)
- On-the-fly resizing and cropping
- Global CDN delivery
- Reduced bandwidth costs
- Better performance for mobile users

### Setup Steps

1. **Create a Cloudflare account** and add your domain
2. **Enable Cloudflare Images** in the dashboard
3. **Get your credentials**:
   - Account ID: Found in Cloudflare dashboard URL
   - API Token: Create one with Images:Edit permissions
   - Account Hash: Found in Images dashboard

4. **Add environment variables** to your Convex backend:

```bash
# In your Convex dashboard or .env.local
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash
```

5. **Add frontend environment variables**:

```bash
# apps/app/.env.local
VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash

# apps/native/.env.local (or app.json for Expo)
EXPO_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH=your_account_hash
```

### Usage

#### Client-side (Web & React Native)

```typescript
import { getCloudflareImageUrl, getCloudflareImageSrcSet } from "@rackd/cloudflare/client";

// Get optimized image URL
const imageUrl = getCloudflareImageUrl(imageId, {
  width: 800,
  quality: 85,
  format: "webp"
});

// Responsive image (web)
const srcSet = getCloudflareImageSrcSet(imageId, [320, 640, 1024, 1920]);

// Device density (React Native)
import { getCloudflareImageUrlForDensity } from "@rackd/cloudflare/client";
const imageUrl = getCloudflareImageUrlForDensity(imageId, 2); // 2x density
```

#### Backend (Convex Actions)

First, create Convex actions that wrap the package functions:

```typescript
// packages/backend/convex/lib/cloudflare.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { uploadToCloudflareImages, deleteFromCloudflareImages } from "@rackd/cloudflare/backend";

export const uploadToCloudflareImagesAction = action({
  args: {
    imageUrl: v.string(),
    metadata: v.optional(v.object({
      filename: v.optional(v.string()),
      requireSignedURLs: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    return await uploadToCloudflareImages(args);
  },
});

export const deleteFromCloudflareImagesAction = action({
  args: { imageId: v.string() },
  handler: async (ctx, args) => {
    return await deleteFromCloudflareImages(args);
  },
});
```

Then use in your app:

```typescript
// 1. Upload to Convex first (as you do now)
const { storageId } = await uploadFile(file);

// 2. Get Convex URL
const convexUrl = await getFileUrl({ storageId });

// 3. Upload to Cloudflare Images for optimization
const cloudflareResult = await uploadToCloudflareImagesAction({
  imageUrl: convexUrl,
  metadata: { filename: file.name }
});

// 4. Store cloudflareImageId in your database
// 5. Use Cloudflare URL for display
const optimizedUrl = getCloudflareImageUrl(cloudflareResult.imageId, {
  width: 800,
  quality: 85,
  format: "webp"
});
```

### Image Transformations

```typescript
import { getCloudflareImageUrl } from "@rackd/cloudflare/client";

// Thumbnail
const thumbnail = getCloudflareImageUrl(imageId, {
  width: 200,
  height: 200,
  fit: "cover",
  quality: 80
});

// Responsive image
const srcSet = getCloudflareImageSrcSet(imageId, [320, 640, 1024, 1920]);
```

## 2. Cloudflare Workers Setup

### Benefits
- Edge caching for external APIs (FargoRate, APA)
- CORS handling
- Rate limiting
- Request transformation
- Reduced latency

### Setup Steps

1. **Install Wrangler CLI**:
```bash
npm install -g wrangler
# or
pnpm add -D wrangler
```

2. **Login to Cloudflare**:
```bash
wrangler login
```

3. **Deploy the worker**:
```bash
cd cloudflare-workers
wrangler publish
```

4. **Configure your domain** (optional):
   - Add a route in Cloudflare dashboard
   - Or use workers.dev subdomain

5. **Update API calls** in your app:

```typescript
// Before
const response = await fetch(
  `https://dashboard.fargorate.com/api/indexsearch?q=${query}`
);

// After
const response = await fetch(
  `https://api-proxy.rackd.net/api/fargorate/indexsearch?q=${query}`
);
```

### Advanced: Persistent Caching with KV

```bash
# Create KV namespace
wrangler kv:namespace create "CACHE_KV"

# Update wrangler.toml with namespace ID
# Deploy again
wrangler publish
```

## 3. Cloudflare R2 Setup (Optional)

### Benefits
- S3-compatible object storage
- No egress fees
- Can replace or supplement Convex storage for large files

### Setup Steps

1. **Create R2 bucket** in Cloudflare dashboard
2. **Install AWS SDK** (R2 is S3-compatible):
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

3. **Create R2 client**:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
```

## 4. Cloudflare Turnstile Setup

### Benefits
- Bot protection for forms
- Privacy-focused (better than reCAPTCHA)
- Free tier available
- No user interaction required (invisible mode)

### Setup Steps

1. **Add Turnstile site** in Cloudflare dashboard
2. **Get site key and secret key**
3. **Add environment variables**:

```bash
# apps/app/.env.local
VITE_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key

# apps/native/.env.local (or app.json for Expo)
EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=your_site_key

# Backend (Convex)
CLOUDFLARE_TURNSTILE_SECRET_KEY=your_secret_key
```

### Usage

#### Web Forms

```tsx
import { useTurnstile, TurnstileWidget } from "@rackd/cloudflare/client/turnstile";

// Option 1: Using the hook
function PostComposer() {
  const { token, containerRef, reset } = useTurnstile({
    siteKey: import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY!,
    theme: "auto",
    size: "normal",
    onSuccess: (token) => {
      console.log("Turnstile verified:", token);
    },
  });

  const handleSubmit = async () => {
    if (!token) {
      alert("Please complete the verification");
      return;
    }
    
    // Submit form with token
    await createPost({ content, turnstileToken: token });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <div ref={containerRef} className="my-4" />
      <button disabled={!token}>Post</button>
    </form>
  );
}

// Option 2: Using the component
function TournamentForm() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <TurnstileWidget
        siteKey={import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setToken(token)}
        theme="auto"
        size="normal"
      />
      <button disabled={!token}>Create Tournament</button>
    </form>
  );
}
```

#### Backend Verification

Create a Convex action to verify Turnstile tokens:

```typescript
// packages/backend/convex/lib/cloudflare.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import { verifyTurnstileToken, isTurnstileVerified } from "@rackd/cloudflare/backend/turnstile";

export const verifyTurnstile = action({
  args: {
    token: v.string(),
    remoteip: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("Turnstile secret key not configured");
    }

    const result = await verifyTurnstileToken(
      args.token,
      secretKey,
      args.remoteip
    );

    if (!isTurnstileVerified(result)) {
      throw new Error("Turnstile verification failed");
    }

    return { success: true, hostname: result.hostname };
  },
});
```

Then verify in your mutations:

```typescript
// In your post creation mutation
export const create = mutation({
  args: {
    content: v.string(),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify Turnstile token if provided
    if (args.turnstileToken) {
      await ctx.runAction(api.cloudflare.verifyTurnstile, {
        token: args.turnstileToken,
      });
    }

    // Create post...
  },
});
```

#### React Native

For React Native, you can verify tokens on the backend without showing a widget, or use a WebView if needed:

```typescript
// Verify token from backend
const verifyToken = useAction(api.cloudflare.verifyTurnstile);

const handleSubmit = async () => {
  // Get token from WebView or skip client-side verification
  // Verify on backend
  await verifyToken({ token: turnstileToken });
  
  // Submit form
  await createPost({ content });
};
```

## Package Structure

All Cloudflare utilities are now in the `@rackd/cloudflare` package:

- `@rackd/cloudflare/client` - Client-side utilities (web & React Native)
- `@rackd/cloudflare/client/images` - Image URL generation utilities
- `@rackd/cloudflare/client/turnstile` - Turnstile widget for web forms
- `@rackd/cloudflare/client/turnstile-native` - Turnstile helpers for React Native
- `@rackd/cloudflare/backend` - Backend utility functions (reference implementations)
- `@rackd/cloudflare/backend/images` - Image upload/delete functions
- `@rackd/cloudflare/backend/turnstile` - Turnstile verification utilities

## Migration Strategy

### Phase 1: Add Cloudflare Images (Non-Breaking)
1. Install/update the `@rackd/cloudflare` package (already in monorepo)
2. Keep existing Convex storage
3. Add Cloudflare Images upload after Convex upload
4. Store `cloudflareImageId` alongside `storageId`
5. Gradually migrate display URLs to use Cloudflare Images

### Phase 2: Add API Proxy
1. Deploy Cloudflare Worker
2. Update API calls to use proxy
3. Monitor cache hit rates
4. Adjust cache TTLs as needed

### Phase 3: Add Turnstile (Bot Protection)
1. Create Turnstile site in Cloudflare dashboard
2. Add Turnstile widget to post creation forms
3. Add Turnstile widget to tournament creation forms
4. Verify tokens on backend before processing submissions
5. Optionally add to signup/login forms

### Phase 4: Optimize (Optional)
1. Consider R2 for large files (tournament flyers, videos)
2. Implement rate limiting
3. Add additional security measures

## Cost Considerations

- **Cloudflare Images**: 
  - Free: 100,000 images/month
  - Paid: $1 per 100,000 images
  - Storage: $5 per 100,000 images/month

- **Cloudflare Workers**:
  - Free: 100,000 requests/day
  - Paid: $5/month for 10M requests

- **Cloudflare R2**:
  - Storage: $0.015/GB/month
  - Class A operations: $4.50 per million
  - Class B operations: $0.36 per million
  - No egress fees!

- **Cloudflare Turnstile**:
  - Free: Unlimited verifications
  - No cost for bot protection

## Best Practices

1. **Image Optimization**:
   - Use WebP format for better compression
   - Set appropriate quality (80-85 is usually good)
   - Use responsive images with srcset

2. **Caching**:
   - Cache external API responses for 5 minutes
   - Use longer cache for static data
   - Invalidate cache when needed

3. **Error Handling**:
   - Always fallback to Convex URLs if Cloudflare fails
   - Log errors for monitoring
   - Show user-friendly error messages

## Troubleshooting

### Images not loading
- Check account hash is correct
- Verify image ID format
- Check CORS settings in Cloudflare dashboard

### Worker not responding
- Check worker logs: `wrangler tail`
- Verify routes are configured correctly
- Check rate limits

### High costs
- Review image usage in dashboard
- Optimize cache TTLs
- Consider R2 for large files instead of Images

## Resources

- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

