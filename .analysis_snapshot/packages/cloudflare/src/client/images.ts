/**
 * Cloudflare Images client utilities
 * 
 * Helper functions for working with Cloudflare Images in the frontend.
 * Works for both web and React Native applications.
 */

export interface CloudflareImageOptions {
  width?: number;
  height?: number;
  fit?: "scale-down" | "contain" | "cover" | "crop" | "pad";
  quality?: number; // 1-100
  format?: "webp" | "avif" | "json";
}

/**
 * Get an optimized image URL from Cloudflare Images
 * 
 * @param imageId - The Cloudflare Images image ID
 * @param options - Transformation options
 * @returns Optimized image URL
 */
export function getCloudflareImageUrl(
  imageId: string,
  options?: CloudflareImageOptions
): string {
  // Get account hash from environment
  // For web: VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH
  // For native: EXPO_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH
  let accountHash: string | undefined;
  
  // Check for web environment (Vite)
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    accountHash = (import.meta as any).env.VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH;
  }
  
  // Check for React Native environment
  if (!accountHash && typeof process !== "undefined" && process.env) {
    accountHash = process.env.EXPO_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH;
  }
  
  // Fallback: check global window object (for runtime injection)
  if (!accountHash && typeof globalThis !== "undefined") {
    const globalWindow = globalThis as { __CLOUDFLARE_IMAGES_ACCOUNT_HASH__?: string };
    accountHash = globalWindow.__CLOUDFLARE_IMAGES_ACCOUNT_HASH__;
  }
  
  if (!accountHash) {
    console.warn("Cloudflare Images account hash not configured, using imageId as fallback");
    return imageId;
  }

  // Build transformation string
  let variant = "public";
  if (options) {
    const transforms: string[] = [];
    if (options.width) transforms.push(`w${options.width}`);
    if (options.height) transforms.push(`h${options.height}`);
    if (options.fit) transforms.push(`fit-${options.fit}`);
    if (options.quality) transforms.push(`quality-${options.quality}`);
    if (options.format) transforms.push(`format-${options.format}`);
    
    if (transforms.length > 0) {
      variant = transforms.join(",");
    }
  }

  return `https://imagedelivery.net/${accountHash}/${imageId}/${variant}`;
}

/**
 * Get a responsive image URL with multiple sizes
 * Useful for srcset attributes (web) or different device densities (native)
 */
export function getCloudflareImageSrcSet(
  imageId: string,
  sizes: number[] = [320, 640, 1024, 1920],
  options?: Omit<CloudflareImageOptions, "width">
): string {
  return sizes
    .map((width) => {
      const url = getCloudflareImageUrl(imageId, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(", ");
}

/**
 * Get image URL optimized for specific device density (React Native)
 */
export function getCloudflareImageUrlForDensity(
  imageId: string,
  density: 1 | 2 | 3 = 2,
  options?: Omit<CloudflareImageOptions, "width">
): string {
  // Common screen widths for mobile devices
  const widths: Record<1 | 2 | 3, number> = {
    1: 320,
    2: 640,
    3: 960,
  };

  return getCloudflareImageUrl(imageId, {
    ...options,
    width: widths[density],
  });
}

/**
 * Check if a URL is a Cloudflare Images URL
 */
export function isCloudflareImageUrl(url: string): boolean {
  return url.includes("imagedelivery.net");
}

/**
 * Extract image ID from Cloudflare Images URL
 */
export function extractCloudflareImageId(url: string): string | null {
  const match = url.match(/imagedelivery\.net\/[^/]+\/([^/]+)/);
  return match?.[1] ?? null;
}

