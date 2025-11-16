import { createServerFn } from "@tanstack/react-start";
import { scrapeUrl } from "@/lib/firecrawl";

/**
 * Extract venue information from a URL
 * This function scrapes a venue website and attempts to extract venue details
 * Useful for importing venue information from websites
 */
export const extractVenueInfo = createServerFn({ method: "POST" })
	.handler(async ({ data }) => {
		const { url } = (data ?? {}) as { url: string };
		
		if (!url || typeof url !== 'string') {
			throw new Error('URL is required');
		}

		try {
			const result = await scrapeUrl(url, {
				formats: ['markdown', 'html'],
			});

			// Extract venue information from the scraped content
			const markdown = result.markdown || '';
			const html = result.html || '';
			
			// Enhanced extraction logic for venues
			const extractedInfo = {
				name: extractVenueName(markdown + html, result.metadata?.title),
				description: markdown.substring(0, 1000), // First 1000 chars as description
				address: extractAddress(markdown + html),
				city: extractCity(markdown + html),
				region: extractRegion(markdown + html),
				country: extractCountry(markdown + html),
				phone: extractPhone(markdown + html),
				email: extractEmail(markdown + html),
				website: url,
				operatingHours: extractOperatingHours(markdown + html),
				socialLinks: extractSocialLinks(markdown + html, url),
				numberOfTables: extractNumberOfTables(markdown + html),
			};

			return {
				success: true,
				data: extractedInfo,
			};
		} catch (error) {
			console.error('Firecrawl venue extraction error:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred',
			};
		}
	});

// Helper functions for extracting venue information
function extractVenueName(text: string, title?: string): string | null {
	// Use page title if available
	if (title) {
		return title.trim();
	}
	
	// Look for venue name patterns
	const namePatterns = [
		/(?:Pool|Billiard|Hall|Club|Lounge|Bar|Room|Venue)[:\s]+([A-Z][A-Za-z\s&'-]+)/i,
		/([A-Z][A-Za-z\s&'-]+(?:Pool|Billiard|Hall|Club|Lounge|Bar|Room))/i,
	];
	
	for (const pattern of namePatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			return match[1].trim();
		}
	}
	return null;
}

function extractAddress(text: string): string | null {
	// Look for address patterns
	const addressPatterns = [
		/\d+\s+[A-Za-z0-9\s,'-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Court|Ct|Place|Pl)[\s,]+(?:[A-Za-z\s]+)[\s,]+(?:[A-Z]{2})[\s,]+(?:\d{5}(?:-\d{4})?)/i,
	];
	
	for (const pattern of addressPatterns) {
		const match = text.match(pattern);
		if (match) {
			return match[0].trim();
		}
	}
	return null;
}

function extractCity(text: string): string | null {
	// Look for city patterns (usually before state)
	const cityPattern = /(?:City|in|from)[:\s]+([A-Z][A-Za-z\s'-]+?)(?:,\s*[A-Z]{2}|\s+[A-Z]{2})/i;
	const match = text.match(cityPattern);
	if (match && match[1]) {
		return match[1].trim();
	}
	return null;
}

function extractRegion(text: string): string | null {
	// Look for state/region patterns
	const regionPattern = /,\s*([A-Z]{2})\s*(?:,|\d{5})/i;
	const match = text.match(regionPattern);
	if (match && match[1]) {
		return match[1].trim();
	}
	return null;
}

function extractCountry(text: string): string | null {
	// Default to US for now, could be enhanced
	const countryPattern = /(?:Country|Location)[:\s]+([A-Za-z]+)/i;
	const match = text.match(countryPattern);
	if (match && match[1]) {
		return match[1].trim();
	}
	return "US"; // Default
}

function extractPhone(text: string): string | null {
	// Look for phone patterns
	const phonePatterns = [
		/\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})/,
		/(?:Phone|Tel|Call)[:\s]+([\d\s\-\(\)\.]+)/i,
	];
	
	for (const pattern of phonePatterns) {
		const match = text.match(pattern);
		if (match) {
			return match[0].trim();
		}
	}
	return null;
}

function extractEmail(text: string): string | null {
	// Look for email patterns
	const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/;
	const match = text.match(emailPattern);
	if (match && match[1]) {
		return match[1].trim();
	}
	return null;
}

function extractOperatingHours(text: string): string | null {
	// Look for hours patterns
	const hoursPatterns = [
		/(?:Hours|Open|Operating)[:\s]+([A-Za-z\s\d:,-]+)/i,
		/(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[:\s]+[\d:]+[\s-]+[\d:]+/i,
	];
	
	for (const pattern of hoursPatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			return match[1].trim().substring(0, 200); // Limit length
		}
	}
	return null;
}

function extractSocialLinks(text: string, baseUrl: string): { platform: string; url: string; icon: string }[] {
	const links: { platform: string; url: string; icon: string }[] = [];
	
	// Look for social media URLs
	const socialPatterns = [
		{ pattern: /facebook\.com\/[^\s\)]+/gi, platform: "facebook", icon: "facebook" },
		{ pattern: /instagram\.com\/[^\s\)]+/gi, platform: "instagram", icon: "instagram" },
		{ pattern: /twitter\.com\/[^\s\)]+/gi, platform: "twitter", icon: "twitter" },
		{ pattern: /x\.com\/[^\s\)]+/gi, platform: "twitter", icon: "twitter" },
		{ pattern: /youtube\.com\/[^\s\)]+/gi, platform: "youtube", icon: "youtube" },
		{ pattern: /linkedin\.com\/[^\s\)]+/gi, platform: "linkedin", icon: "linkedin" },
	];
	
	for (const { pattern, platform, icon } of socialPatterns) {
		const matches = text.match(pattern);
		if (matches) {
			for (const match of matches) {
				const url = match.startsWith('http') ? match : `https://${match}`;
				if (!links.find(l => l.url === url)) {
					links.push({ platform, url, icon });
				}
			}
		}
	}
	
	return links;
}

function extractNumberOfTables(text: string): number | null {
	// Look for table count patterns
	const tablePatterns = [
		/(\d+)\s*(?:tables?|pool tables?|billiard tables?)/i,
		/(?:has|features?|includes?)[:\s]+(\d+)\s*(?:tables?|pool tables?)/i,
	];
	
	for (const pattern of tablePatterns) {
		const match = text.match(pattern);
		if (match && match[1]) {
			const count = parseInt(match[1], 10);
			if (!isNaN(count) && count > 0 && count < 100) {
				return count;
			}
		}
	}
	return null;
}

