const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 10000;

class RateLimiter {
	private requests: number[] = [];
	private readonly maxRequests: number;
	private readonly windowMs: number;

	constructor(maxRequests: number = 50, windowMs: number = 60000) {
		this.maxRequests = maxRequests;
		this.windowMs = windowMs;
	}

	async waitIfNeeded(): Promise<void> {
		const now = Date.now();
		
		this.requests = this.requests.filter(timestamp => now - timestamp < this.windowMs);
		
		if (this.requests.length >= this.maxRequests) {
			const oldestRequest = this.requests[0];
			const waitTime = this.windowMs - (now - oldestRequest) + 100;
			if (waitTime > 0) {
				await new Promise(resolve => setTimeout(resolve, waitTime));
			}
			this.requests = this.requests.filter(timestamp => Date.now() - timestamp < this.windowMs);
		}
		
		this.requests.push(Date.now());
	}
}

const rateLimiter = new RateLimiter(50, 60000);

export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries: number = MAX_RETRIES,
	initialDelay: number = INITIAL_RETRY_DELAY
): Promise<T> {
	let lastError: Error | null = null;
	let delay = initialDelay;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			await rateLimiter.waitIfNeeded();
			
			return await fn();
		} catch (error) {
			lastError = error instanceof Error ? error : new Error(String(error));
			
			if (error instanceof Error && 'status' in error) {
				const status = (error as any).status;
				if (status >= 400 && status < 500) {
					throw error;
				}
			}
			
			if (attempt === maxRetries) {
				throw lastError;
			}
			
			await new Promise(resolve => setTimeout(resolve, delay));
			delay = Math.min(delay * 2, MAX_RETRY_DELAY);
		}
	}

	throw lastError || new Error("Retry failed");
}

export async function firecrawlRequest(
	endpoint: string,
	options: RequestInit,
	apiKey: string
): Promise<Response> {
	return retryWithBackoff(async () => {
		const response = await fetch(`https://api.firecrawl.dev/v1/${endpoint}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${apiKey}`,
				...options.headers,
			},
		});

		if (!response.ok) {
			const error: any = new Error(`Firecrawl API error: ${response.statusText}`);
			error.status = response.status;
			throw error;
		}

		return response;
	});
}

