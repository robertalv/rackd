# @rackd/cloudflare

Cloudflare integration utilities for the Rackd application.

## Installation

This package is part of the Rackd monorepo and is automatically available to other packages.

## Usage

### Client-side (Web & React Native)

```typescript
import { getCloudflareImageUrl, getCloudflareImageSrcSet } from "@rackd/cloudflare/client";

// Get optimized image URL
const imageUrl = getCloudflareImageUrl(imageId, {
  width: 800,
  quality: 85,
  format: "webp"
});

// Get responsive srcset
const srcSet = getCloudflareImageSrcSet(imageId, [320, 640, 1024, 1920]);
```

### Backend (Convex)

The backend functions are reference implementations. To use them in Convex:

1. Copy the implementations from `packages/cloudflare/src/backend/images.ts`
2. Wrap them in Convex actions in `packages/backend/convex/lib/cloudflare.ts`

Example:

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";
import { uploadToCloudflareImages } from "@rackd/cloudflare/backend";

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
```

### Turnstile (Bot Protection)

#### Web

```typescript
import { useTurnstile, TurnstileWidget } from "@rackd/cloudflare/client/turnstile";

// Using the hook
function MyForm() {
  const { token, containerRef, reset } = useTurnstile({
    siteKey: process.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY!,
    onSuccess: (token) => console.log("Verified:", token),
  });

  return (
    <form onSubmit={handleSubmit}>
      <div ref={containerRef} />
      <button disabled={!token}>Submit</button>
    </form>
  );
}

// Using the component
function MyForm() {
  const [token, setToken] = useState<string | null>(null);

  return (
    <form onSubmit={handleSubmit}>
      <TurnstileWidget
        siteKey={process.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY!}
        onSuccess={(token) => setToken(token)}
        theme="auto"
      />
      <button disabled={!token}>Submit</button>
    </form>
  );
}
```

#### React Native

For React Native, verify tokens on the backend:

```typescript
import { verifyTurnstileToken } from "@rackd/cloudflare/backend/turnstile";

// In your Convex action
export const verifyTurnstile = action({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
    return await verifyTurnstileToken(args.token, secretKey!);
  },
});
```

## Environment Variables

### Client
- `VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH` (web)
- `EXPO_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH` (React Native)
- `VITE_CLOUDFLARE_TURNSTILE_SITE_KEY` (web)
- `EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY` (React Native)

### Backend
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_IMAGES_ACCOUNT_HASH`
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`

## Exports

- `@rackd/cloudflare/client` - Client-side utilities
- `@rackd/cloudflare/client/images` - Image utilities
- `@rackd/cloudflare/client/turnstile` - Turnstile widget (web)
- `@rackd/cloudflare/client/turnstile-native` - Turnstile helpers (React Native)
- `@rackd/cloudflare/backend` - Backend utilities (reference implementations)
- `@rackd/cloudflare/backend/images` - Image backend utilities
- `@rackd/cloudflare/backend/turnstile` - Turnstile verification utilities

