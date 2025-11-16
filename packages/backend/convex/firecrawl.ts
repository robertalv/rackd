/**
 * Firecrawl integration for Convex backend
 * 
 * Provides server-side web scraping capabilities for:
 * - Tournament information extraction
 * - Venue information extraction
 * - Player profile enrichment
 * - Web search for tournaments and venues
 */

import { action } from "./_generated/server";
import { v } from "convex/values";

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

/**
 * Scrape a URL and extract tournament information
 * Uses AI-powered extraction for better accuracy
 */
export const extractTournamentFromUrl = action({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		if (!FIRECRAWL_API_KEY) {
			throw new Error("FIRECRAWL_API_KEY not configured");
		}

		try {
			// Use Firecrawl Extract API for better AI-powered extraction
			const extractResponse = await fetch("https://api.firecrawl.dev/v1/extract", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
				},
				body: JSON.stringify({
					url: args.url,
					schema: {
						type: "object",
						properties: {
							name: {
								type: "string",
								description: "Tournament name or title",
							},
							date: {
								type: "string",
								description: "Tournament date in ISO format or readable date",
							},
							time: {
								type: "string",
								description: "Tournament start time",
							},
							venue: {
								type: "string",
								description: "Venue name or location",
							},
							address: {
								type: "string",
								description: "Full address of the venue",
							},
							entryFee: {
								type: "number",
								description: "Entry fee in dollars",
							},
							gameType: {
								type: "string",
								description: "Game type (8-ball, 9-ball, 10-ball, one-pocket, bank-pool)",
							},
							maxPlayers: {
								type: "number",
								description: "Maximum number of players",
							},
							description: {
								type: "string",
								description: "Tournament description or details",
							},
							registrationUrl: {
								type: "string",
								description: "URL for registration if available",
							},
							contactEmail: {
								type: "string",
								description: "Contact email for the tournament",
							},
							contactPhone: {
								type: "string",
								description: "Contact phone number",
							},
						},
					},
				}),
			});

			if (!extractResponse.ok) {
				throw new Error(`Firecrawl Extract API error: ${extractResponse.statusText}`);
			}

			const extractData = await extractResponse.json();
			
			if (!extractData.success || !extractData.data) {
				throw new Error("Failed to extract tournament data");
			}

			// Also get screenshot for tournament flyer
			const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
				},
				body: JSON.stringify({
					url: args.url,
					formats: ["markdown", "html"],
					screenshot: true,
				}),
			});

			let screenshot = null;
			if (scrapeResponse.ok) {
				const scrapeData = await scrapeResponse.json();
				if (scrapeData.success && scrapeData.data?.screenshot) {
					screenshot = scrapeData.data.screenshot;
				}
			}

			// Parse extracted data
			const extracted = extractData.data;
			
			// Convert date string to timestamp
			let dateTimestamp: number | null = null;
			if (extracted.date) {
				try {
					const date = new Date(extracted.date);
					if (!isNaN(date.getTime())) {
						dateTimestamp = date.getTime();
					}
				} catch {
					// Keep dateTimestamp as null if parsing fails
				}
			}

			// Normalize game type
			let gameType: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool" | null = null;
			const gameTypeLower = (extracted.gameType || "").toLowerCase();
			if (gameTypeLower.includes("8") || gameTypeLower.includes("eight")) {
				gameType = "eight_ball";
			} else if (gameTypeLower.includes("9") || gameTypeLower.includes("nine")) {
				gameType = "nine_ball";
			} else if (gameTypeLower.includes("10") || gameTypeLower.includes("ten")) {
				gameType = "ten_ball";
			} else if (gameTypeLower.includes("one") || gameTypeLower.includes("pocket")) {
				gameType = "one_pocket";
			} else if (gameTypeLower.includes("bank")) {
				gameType = "bank_pool";
			}

			return {
				success: true,
				data: {
					name: extracted.name || null,
					dateTimestamp,
					time: extracted.time || null,
					venue: extracted.venue || null,
					address: extracted.address || null,
					entryFee: extracted.entryFee || null,
					gameType,
					maxPlayers: extracted.maxPlayers || null,
					description: extracted.description || null,
					registrationUrl: extracted.registrationUrl || null,
					contactEmail: extracted.contactEmail || null,
					contactPhone: extracted.contactPhone || null,
					screenshot,
				},
			};
		} catch (error) {
			console.error("Firecrawl extraction error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	},
});

/**
 * Extract venue information from a website URL
 */
export const extractVenueFromUrl = action({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		if (!FIRECRAWL_API_KEY) {
			throw new Error("FIRECRAWL_API_KEY not configured");
		}

		try {
			const extractResponse = await fetch("https://api.firecrawl.dev/v1/extract", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
				},
				body: JSON.stringify({
					url: args.url,
					schema: {
						type: "object",
						properties: {
							name: {
								type: "string",
								description: "Venue name",
							},
							description: {
								type: "string",
								description: "Venue description",
							},
							address: {
								type: "string",
								description: "Full address including street, city, state, zip",
							},
							city: {
								type: "string",
								description: "City name",
							},
							region: {
								type: "string",
								description: "State or region",
							},
							country: {
								type: "string",
								description: "Country name",
							},
							phone: {
								type: "string",
								description: "Phone number",
							},
							email: {
								type: "string",
								description: "Email address",
							},
							website: {
								type: "string",
								description: "Website URL",
							},
							operatingHours: {
								type: "string",
								description: "Operating hours or opening times",
							},
							socialLinks: {
								type: "array",
								items: {
									type: "object",
									properties: {
										platform: { type: "string" },
										url: { type: "string" },
									},
								},
								description: "Social media links (Facebook, Instagram, Twitter, etc.)",
							},
							numberOfTables: {
								type: "number",
								description: "Number of pool tables",
							},
						},
					},
				}),
			});

			if (!extractResponse.ok) {
				throw new Error(`Firecrawl Extract API error: ${extractResponse.statusText}`);
			}

			const extractData = await extractResponse.json();
			
			if (!extractData.success || !extractData.data) {
				throw new Error("Failed to extract venue data");
			}

			const extracted = extractData.data;

			return {
				success: true,
				data: {
					name: extracted.name || null,
					description: extracted.description || null,
					address: extracted.address || null,
					city: extracted.city || null,
					region: extracted.region || null,
					country: extracted.country || null,
					phone: extracted.phone || null,
					email: extracted.email || null,
					website: extracted.website || args.url, // Fallback to input URL
					operatingHours: extracted.operatingHours || null,
					socialLinks: extracted.socialLinks || [],
					numberOfTables: extracted.numberOfTables || null,
				},
			};
		} catch (error) {
			console.error("Firecrawl venue extraction error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	},
});

/**
 * Search for tournaments using Firecrawl Search API
 */
export const searchTournaments = action({
	args: {
		query: v.string(),
		location: v.optional(v.string()),
		numResults: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		if (!FIRECRAWL_API_KEY) {
			throw new Error("FIRECRAWL_API_KEY not configured");
		}

		try {
			const searchQuery = args.location 
				? `${args.query} pool tournament ${args.location}`
				: `${args.query} pool tournament`;

			const response = await fetch("https://api.firecrawl.dev/v1/search", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
				},
				body: JSON.stringify({
					query: searchQuery,
					numResults: args.numResults || 10,
					scrapeOptions: {
						formats: ["markdown"],
					},
				}),
			});

			if (!response.ok) {
				throw new Error(`Firecrawl Search API error: ${response.statusText}`);
			}

			const data = await response.json();
			
			if (!data.success) {
				throw new Error("Search failed");
			}

			return {
				success: true,
				data: data.data || [],
			};
		} catch (error) {
			console.error("Firecrawl search error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
				data: [],
			};
		}
	},
});

/**
 * Map a venue website to discover tournament pages
 */
export const discoverTournamentsFromVenue = action({
	args: {
		venueUrl: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		if (!FIRECRAWL_API_KEY) {
			throw new Error("FIRECRAWL_API_KEY not configured");
		}

		try {
			// First, map the website to get all links
			const mapResponse = await fetch("https://api.firecrawl.dev/v1/map", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${FIRECRAWL_API_KEY}`,
				},
				body: JSON.stringify({
					url: args.venueUrl,
					limit: args.limit || 50,
				}),
			});

			if (!mapResponse.ok) {
				throw new Error(`Firecrawl Map API error: ${mapResponse.statusText}`);
			}

			const mapData = await mapResponse.json();
			
			if (!mapData.success || !mapData.data) {
				throw new Error("Failed to map venue website");
			}

			// Filter links that might be tournament pages
			const tournamentKeywords = ["tournament", "event", "tour", "championship", "competition", "registration"];
			const potentialTournamentPages = mapData.data.links?.filter((link: string) => {
				const linkLower = link.toLowerCase();
				return tournamentKeywords.some(keyword => linkLower.includes(keyword));
			}) || [];

			return {
				success: true,
				data: {
					venueUrl: args.venueUrl,
					totalPages: mapData.data.links?.length || 0,
					tournamentPages: potentialTournamentPages.slice(0, 20), // Limit to top 20
				},
			};
		} catch (error) {
			console.error("Firecrawl venue mapping error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	},
});

