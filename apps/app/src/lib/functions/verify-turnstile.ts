import { createServerFn } from "@tanstack/react-start";

/**
 * Verify Turnstile token on the server
 * This should be called before authentication to prevent bot signups/logins
 */
export const verifyTurnstileToken = createServerFn({ method: "POST" })
	.handler(async (args: any) => {
		console.log('Turnstile verification - received args:', args);
		console.log('Turnstile verification - args type:', typeof args);
		
		// Try to get data from different possible locations
		const data = args?.data ?? args;
		console.log('Turnstile verification - extracted data:', data);
		console.log('Turnstile verification - data type:', typeof data);
		console.log('Turnstile verification - data keys:', data && typeof data === 'object' ? Object.keys(data) : 'N/A');
		
		// Extract token - data should be { token: string } when called from client
		let token: string | null = null;
		
		if (data && typeof data === 'object' && !Array.isArray(data)) {
			// Check if data has token property
			if ('token' in data) {
				token = (data as { token: unknown }).token as string | null;
			}
		} else if (typeof data === 'string') {
			token = data;
		}

		console.log('Turnstile verification - extracted token:', token ? `${token.substring(0, 20)}...` : 'null');

		if (!token || typeof token !== 'string' || token.trim().length === 0) {
			const errorDetails = {
				args,
				data,
				dataType: typeof data,
				dataIsNull: data === null,
				dataIsUndefined: data === undefined,
				dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
				tokenValue: token,
				tokenType: typeof token,
				tokenLength: token ? token.length : 0
			};
			console.error('Turnstile verification failed: Token missing or invalid', errorDetails);
			return { success: false, error: 'Token is required' };
		}

		try {
			const secretKey = process.env.VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY || import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY;
			
			if (!secretKey) {
				// In development, allow requests if Turnstile is not configured
				console.warn("Turnstile secret key not configured, skipping verification");
				return { success: true, verified: false };
			}

			const formData = new FormData();
			formData.append("secret", secretKey);
			formData.append("response", token);

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

			if (!result.success || result.error_codes?.length) {
				return {
					success: false,
					error: `Verification failed: ${result.error_codes?.join(", ") || "Unknown error"}`,
				};
			}

			return {
				success: true,
				verified: true,
				hostname: result.hostname,
			};
		} catch (error) {
			console.error('Turnstile verification error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Verification failed',
			};
		}
	});

