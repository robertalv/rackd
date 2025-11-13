/**
 * Cloudflare Turnstile backend verification for Convex
 * 
 * This module provides Convex actions to verify Turnstile tokens.
 * 
 * Example Convex action implementation:
 * 
 * ```typescript
 * import { action } from "./_generated/server";
 * import { v } from "convex/values";
 * import { verifyTurnstileToken } from "@rackd/cloudflare/backend/turnstile";
 * 
 * export const verifyTurnstile = action({
 *   args: {
 *     token: v.string(),
 *     remoteip: v.optional(v.string()),
 *   },
 *   handler: async (ctx, args) => {
 *     const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
 *     if (!secretKey) {
 *       throw new Error("Turnstile secret key not configured");
 *     }
 *     
 *     return await verifyTurnstileToken(
 *       args.token,
 *       secretKey,
 *       args.remoteip
 *     );
 *   },
 * });
 * ```
 */

export interface TurnstileVerificationResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  error_codes?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verify a Turnstile token with Cloudflare
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
): Promise<TurnstileVerificationResult> {
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

    const result = (await response.json()) as TurnstileVerificationResult;
    return result;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    throw error;
  }
}

/**
 * Check if Turnstile verification was successful
 * 
 * @param result - Verification result from verifyTurnstileToken
 * @returns true if verification was successful
 */
export function isTurnstileVerified(result: TurnstileVerificationResult): boolean {
  return result.success === true && !result.error_codes?.length;
}

