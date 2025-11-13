import { createServerFn } from "@tanstack/react-start";
import { scrapeUrl } from "@/lib/firecrawl";

/**
 * Extract tournament information from a URL
 * This function scrapes a URL and attempts to extract tournament details
 * Useful for importing tournaments from external sources (Facebook events, tournament websites, etc.)
 */
export const extractTournamentInfo = createServerFn({ method: "POST" })
	.handler(async ({ request }) => {
		const body = await request.json();
		const { url } = body as { url: string };
		
		if (!url || typeof url !== 'string') {
			throw new Error('URL is required');
		}

		try {
			const result = await scrapeUrl(url, {
				formats: ['markdown', 'html'],
			});

			// Extract tournament information from the scraped content
			const markdown = result.markdown || '';
			const html = result.html || '';
			
			// Basic extraction logic - you can enhance this with AI/LLM parsing
			const extractedInfo = {
				// Try to extract date patterns
				dateTimestamp: extractDate(markdown + html),
				// Try to extract venue information
				venue: extractVenue(markdown + html),
				// Try to extract entry fee
				entryFee: extractEntryFee(markdown + html),
				// Try to extract tournament name
				name: extractTournamentName(markdown + html, result.metadata?.title),
				// Try to extract game type
				gameType: extractGameType(markdown + html),
				// Try to extract max players
				maxPlayers: extractMaxPlayers(markdown + html),
				// Description
				description: markdown.substring(0, 500), // First 500 chars as description
				// Original scraped data
				rawData: {
					markdown: markdown.substring(0, 2000), // Limit size
					metadata: result.metadata,
				},
			};

			return {
				success: true,
				data: extractedInfo,
			};
		} catch (error) {
			console.error('Firecrawl extraction error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	});

// Helper functions for extracting tournament information
function extractDate(text: string): number | null {
	// Look for common date patterns
	const datePatterns = [
		/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, // MM/DD/YYYY
		/(\d{4})-(\d{1,2})-(\d{1,2})/g, // YYYY-MM-DD
		/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(\d{4})/gi,
	];
	
	for (const pattern of datePatterns) {
		const match = text.match(pattern);
		if (match) {
			try {
				const date = new Date(match[0]);
				if (!isNaN(date.getTime())) {
					return date.getTime();
				}
			} catch {
				// Continue to next pattern
			}
		}
	}
	return null;
}

function extractVenue(text: string): string | null {
	// Look for venue keywords followed by text
	const venuePatterns = [
		/(?:venue|location|at|hosted by|hosted at)[:\s]+([A-Z][A-Za-z\s&]+(?:Billiards?|Pool|Hall|Club|Lounge|Bar|Room))/i,
		/([A-Z][A-Za-z\s&]+(?:Billiards?|Pool|Hall|Club|Lounge|Bar|Room))/,
	];
	
	for (const pattern of venuePatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			return match[1].trim();
		}
	}
	return null;
}

function extractEntryFee(text: string): number | null {
	// Look for entry fee patterns
	const feePatterns = [
		/\$(\d+)/g,
		/(?:entry|fee|cost)[:\s]*\$?(\d+)/i,
	];
	
	for (const pattern of feePatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			const fee = parseInt(match[1], 10);
			if (!isNaN(fee) && fee > 0 && fee < 10000) {
				return fee;
			}
		}
	}
	return null;
}

function extractTournamentName(text: string, title?: string): string | null {
	// Use page title if available, otherwise look for tournament name patterns
	if (title) {
		return title;
	}
	
	const namePatterns = [
		/(?:tournament|championship|tour|event)[:\s]+([A-Z][A-Za-z0-9\s&'-]+)/i,
	];
	
	for (const pattern of namePatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			return match[1].trim();
		}
	}
	return null;
}

function extractGameType(text: string): "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool" | null {
	const lowerText = text.toLowerCase();
	if (lowerText.includes('8-ball') || lowerText.includes('eight ball')) return 'eight_ball';
	if (lowerText.includes('9-ball') || lowerText.includes('nine ball')) return 'nine_ball';
	if (lowerText.includes('10-ball') || lowerText.includes('ten ball')) return 'ten_ball';
	if (lowerText.includes('one pocket')) return 'one_pocket';
	if (lowerText.includes('bank pool')) return 'bank_pool';
	return null;
}

function extractMaxPlayers(text: string): number | null {
	const patterns = [
		/(?:max|limit|maximum)[:\s]*(\d+)\s*(?:players?|entries?)/i,
		/(\d+)\s*(?:player|entry)\s*(?:limit|max|maximum)/i,
	];
	
	for (const pattern of patterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			const max = parseInt(match[1], 10);
			if (!isNaN(max) && max > 0 && max < 1000) {
				return max;
			}
		}
	}
	return null;
}

