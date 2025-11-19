import Firecrawl from '@mendable/firecrawl-js';

/**
 * Initialize Firecrawl client with API key from environment variable
 * The API key should be set as FIRECRAWL_API_KEY in your environment
 */
export function getFirecrawlClient() {
	const apiKey = process.env.FIRECRAWL_API_KEY;
	
	if (!apiKey) {
		throw new Error('FIRECRAWL_API_KEY environment variable is not set');
	}

	return new Firecrawl({ apiKey });
}

/**
 * Scrape a single URL
 */
export async function scrapeUrl(url: string, options?: {
	formats?: ('markdown' | 'html')[];
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.scrape(url, {
		formats: options?.formats || ['markdown', 'html'],
	});
}

/**
 * Start a crawl job (returns job ID immediately)
 */
export async function startCrawl(url: string, options?: {
	limit?: number;
	excludePaths?: string[];
	scrapeOptions?: {
		formats?: ('markdown' | 'html')[];
	};
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.startCrawl(url, {
		limit: options?.limit,
		excludePaths: options?.excludePaths,
		scrapeOptions: options?.scrapeOptions,
	});
}

/**
 * Crawl a website (waits for completion)
 */
export async function crawlUrl(url: string, options?: {
	limit?: number;
	pollInterval?: number;
	timeout?: number;
	excludePaths?: string[];
	scrapeOptions?: {
		formats?: ('markdown' | 'html')[];
	};
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.crawl(url, {
		limit: options?.limit,
		pollInterval: options?.pollInterval,
		timeout: options?.timeout,
		excludePaths: options?.excludePaths,
		scrapeOptions: options?.scrapeOptions,
	});
}

/**
 * Check the status of a crawl job
 */
export async function getCrawlStatus(crawlId: string, options?: {
	autoPaginate?: boolean;
	maxPages?: number;
	maxResults?: number;
	maxWaitTime?: number;
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.getCrawlStatus(crawlId, options);
}

/**
 * Cancel a crawl job
 */
export async function cancelCrawl(crawlId: string) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.cancelCrawl(crawlId);
}

/**
 * Map a website (get all links without scraping content)
 */
export async function mapUrl(url: string, options?: {
	limit?: number;
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.map(url, {
		limit: options?.limit,
	});
}

/**
 * Extract structured data from a URL using AI (Firecrawl Extract API)
 * Perfect for extracting tournament, venue, or player information
 */
export async function extractData(url: string, schema: Record<string, any>) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.extract(url, {
		schema,
	});
}

/**
 * Search the web and get full content from results (Firecrawl Search API)
 * Useful for finding tournaments, venues, or player profiles
 */
export async function searchWeb(query: string, options?: {
	numResults?: number;
	scrapeOptions?: {
		formats?: ('markdown' | 'html')[];
	};
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.search(query, {
		numResults: options?.numResults || 5,
		scrapeOptions: options?.scrapeOptions,
	});
}

/**
 * Scrape URL with screenshot capability
 * Useful for tournament flyers and venue images
 */
export async function scrapeUrlWithScreenshot(url: string, options?: {
	formats?: ('markdown' | 'html')[];
	screenshot?: boolean;
}) {
	const firecrawl = getFirecrawlClient();
	return await firecrawl.scrape(url, {
		formats: options?.formats || ['markdown', 'html'],
		screenshot: options?.screenshot || false,
	});
}


