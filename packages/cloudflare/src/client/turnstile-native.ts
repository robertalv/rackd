/**
 * Cloudflare Turnstile utilities for React Native
 * 
 * Note: Turnstile is a web-based solution. For React Native, you have a few options:
 * 1. Use a WebView to render Turnstile (recommended for forms)
 * 2. Verify on the backend without client-side widget
 * 3. Use alternative bot protection methods
 * 
 * This module provides helper functions for backend verification.
 */

/**
 * Verify a Turnstile token on the backend
 * This should be called from your backend/Convex action
 * 
 * @param token - The Turnstile token from the client
 * @param secretKey - Your Turnstile secret key
 * @param remoteip - Optional IP address of the user
 * @returns Verification result
 */
export async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteip?: string
): Promise<{
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  action?: string;
  cdata?: string;
}> {
  const formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);
  if (remoteip) {
    formData.append("remoteip", remoteip);
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Turnstile verification failed: ${response.statusText}`);
    }

    const result = (await response.json()) as {
      success: boolean;
      challenge_ts?: string;
      hostname?: string;
      error_codes?: string[];
      action?: string;
      cdata?: string;
    };
    return result;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    throw error;
  }
}

/**
 * Get Turnstile site key from environment
 * For React Native, you'll need to pass this from your app config
 */
export function getTurnstileSiteKey(): string | null {
  // In React Native, you'd typically get this from your app config
  // or pass it as a prop/parameter
  if (typeof process !== "undefined" && process.env) {
    return process.env.EXPO_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || null;
  }
  return null;
}

