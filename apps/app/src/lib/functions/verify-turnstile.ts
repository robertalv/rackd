import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Verify Turnstile token on the server
 * This should be called before authentication to prevent bot signups/logins
 */
export const verifyTurnstileToken = createServerFn({ method: "POST" })
	.handler(async (handlerArgs: any) => {
		// TanStack Start passes handler with { data, request, ... } structure
		// Try to destructure data, but also have access to full handlerArgs for fallback
		const data = handlerArgs?.data ?? (handlerArgs as any)?.data;
		let token: string | null = null;
		
		// Log what we receive for debugging - check all possible locations
		console.log('Turnstile verification - received handlerArgs:', {
			hasHandlerArgs: !!handlerArgs,
			hasData: !!data,
			dataType: typeof data,
			dataValue: data,
			dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
			handlerArgsKeys: handlerArgs && typeof handlerArgs === 'object' ? Object.keys(handlerArgs).filter(k => !k.startsWith('Symbol')) : 'N/A',
			hasContext: !!handlerArgs?.context,
			contextKeys: handlerArgs?.context && typeof handlerArgs.context === 'object' ? Object.keys(handlerArgs.context) : 'N/A',
			hasSendContext: !!handlerArgs?.sendContext,
			sendContextKeys: handlerArgs?.sendContext && typeof handlerArgs.sendContext === 'object' ? Object.keys(handlerArgs.sendContext) : 'N/A',
			requestUrl: handlerArgs?.request?.url,
			requestHeaders: handlerArgs?.request?.headers ? Object.fromEntries(handlerArgs.request.headers.entries()) : 'N/A',
		});
		
		// Extract token from data
		if (data?.token) {
			token = data.token;
		} else if (data && typeof data === 'object' && 'token' in data) {
			token = (data as any).token;
		} else if (typeof data === 'string') {
			token = data;
		}
		
		// Check context and sendContext for data (Netlify fallback)
		if (!token && handlerArgs?.context && typeof handlerArgs.context === 'object') {
			if ('token' in handlerArgs.context) {
				token = (handlerArgs.context as any).token;
			} else if ('data' in handlerArgs.context && handlerArgs.context.data?.token) {
				token = handlerArgs.context.data.token;
			}
		}
		
		if (!token && handlerArgs?.sendContext && typeof handlerArgs.sendContext === 'object') {
			if ('token' in handlerArgs.sendContext) {
				token = (handlerArgs.sendContext as any).token;
			} else if ('data' in handlerArgs.sendContext && handlerArgs.sendContext.data?.token) {
				token = handlerArgs.sendContext.data.token;
			}
		}
		
		// On Netlify, if data is undefined, try reading from request body (fallback)
		if (!token && handlerArgs?.request) {
			try {
				const request = handlerArgs.request;
				const contentLength = request.headers.get('content-length');
				
				console.log('Attempting to read from args.request body', {
					hasRequest: !!request,
					contentLength: contentLength,
					method: request.method,
					url: request.url,
				});
				
				// Only try to read body if content-length is > 0
				if (contentLength && parseInt(contentLength) > 0) {
					// Clone the request to avoid consuming it
					const clonedRequest = request.clone();
					const contentType = clonedRequest.headers.get('content-type') || '';
					
					console.log('Request content-type:', contentType);
					
					if (contentType.includes('application/json')) {
						const body = await clonedRequest.json();
						console.log('Parsed JSON body:', { hasBody: !!body, bodyKeys: body && typeof body === 'object' ? Object.keys(body) : 'N/A' });
						
						if (body?.token) {
							token = body.token;
						} else if (body?.data?.token) {
							token = body.data.token;
						}
					} else {
						// Try parsing as text and then JSON
						const text = await clonedRequest.text();
						console.log('Request body text length:', text?.length || 0);
						
						if (text) {
							try {
								const body = JSON.parse(text);
								console.log('Parsed text body:', { hasBody: !!body, bodyKeys: body && typeof body === 'object' ? Object.keys(body) : 'N/A' });
								
								if (body?.token) {
									token = body.token;
								} else if (body?.data?.token) {
									token = body.data.token;
								}
							} catch (parseErr) {
								console.warn('Could not parse request body as JSON:', parseErr);
							}
						}
					}
				} else {
					console.log('Request body is empty (content-length: 0), data must be passed differently on Netlify');
					// On Netlify with TanStack Start, the body is consumed by the framework
					// The data should be in args.data, but it's undefined, which suggests
					// a serialization issue or the handler signature needs to match Netlify's expectations
				}
			} catch (err) {
				console.error('Error reading from args.request body:', err);
			}
		}
		
		// Last resort: Try getRequest() (works on localhost)
		if (!token) {
			try {
				const request = getRequest();
				if (request && request.bodyUsed === false) {
					console.log('Trying getRequest() as last resort');
					const clonedRequest = request.clone();
					const text = await clonedRequest.text();
					if (text) {
						try {
							const body = JSON.parse(text);
							if (body?.token) {
								token = body.token;
							} else if (body?.data?.token) {
								token = body.data.token;
							}
						} catch (parseErr) {
							console.warn('Could not parse getRequest() body:', parseErr);
						}
					}
				}
			} catch (err) {
				// Ignore - this is expected on Netlify
			}
		}

		// Final validation
		if (!token || typeof token !== 'string' || token.trim().length === 0) {
			console.error('Turnstile verification failed: Token missing or invalid', {
				receivedData: data,
				dataType: typeof data,
				dataKeys: data && typeof data === 'object' ? Object.keys(data) : 'N/A',
				tokenValue: token,
				tokenType: typeof token,
			});
			return { success: false, error: 'Token is required' };
		}

		try {
			// Try multiple ways to get the secret key (Netlify uses process.env, Vite uses import.meta.env)
			const secretKey = 
				process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY ||
				process.env.VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY ||
				import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY ||
				import.meta.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
			
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

