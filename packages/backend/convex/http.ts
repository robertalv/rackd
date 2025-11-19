import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { authClient, createAuth } from "./auth";
import { firecrawlRequest } from "./lib/firecrawlUtils";

const http = httpRouter();

authClient.registerRoutes(http, createAuth);

const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;

http.route({
	path: "/firecrawl/extract/tournament",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		if (!FIRECRAWL_API_KEY) {
			return new Response(
				JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			const body = await request.json();
			const { url } = body;

			if (!url || typeof url !== "string") {
				return new Response(
					JSON.stringify({ success: false, error: "URL is required" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const extractResponse = await firecrawlRequest(
				"extract",
				{
					method: "POST",
					body: JSON.stringify({
						url,
						schema: {
							type: "object",
							properties: {
								name: { type: "string", description: "Tournament name or title" },
								date: { type: "string", description: "Tournament date in ISO format or readable date" },
								time: { type: "string", description: "Tournament start time" },
								venue: { type: "string", description: "Venue name or location" },
								address: { type: "string", description: "Full address of the venue" },
								entryFee: { type: "number", description: "Entry fee in dollars" },
								gameType: { type: "string", description: "Game type (8-ball, 9-ball, 10-ball, one-pocket, bank-pool)" },
								maxPlayers: { type: "number", description: "Maximum number of players" },
								description: { type: "string", description: "Tournament description or details" },
								registrationUrl: { type: "string", description: "URL for registration if available" },
								contactEmail: { type: "string", description: "Contact email for the tournament" },
								contactPhone: { type: "string", description: "Contact phone number" },
							},
						},
					}),
				},
				FIRECRAWL_API_KEY
			);

			const extractData = await extractResponse.json();

			const scrapeResponse = await firecrawlRequest(
				"scrape",
				{
					method: "POST",
					body: JSON.stringify({
						url,
						formats: ["markdown", "html"],
						screenshot: true,
					}),
				},
				FIRECRAWL_API_KEY
			);

			let screenshot = null;
			const scrapeData = await scrapeResponse.json();
			if (scrapeData.success && scrapeData.data?.screenshot) {
				screenshot = scrapeData.data.screenshot;
			}

			if (!extractData.success || !extractData.data) {
				return new Response(
					JSON.stringify({ success: false, error: "Failed to extract tournament data" }),
					{ status: 500, headers: { "Content-Type": "application/json" } }
				);
			}

			const extracted = extractData.data;

			let dateTimestamp: number | null = null;
			if (extracted.date) {
				try {
					const date = new Date(extracted.date);
					if (!isNaN(date.getTime())) {
						dateTimestamp = date.getTime();
					}
				} catch {
					console.error("Failed to parse date:", extracted.date);
				}
			}

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

			return new Response(
				JSON.stringify({
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
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			console.error("Firecrawl extraction error:", error);
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

http.route({
	path: "/firecrawl/extract/venue",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		if (!FIRECRAWL_API_KEY) {
			return new Response(
				JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			const body = await request.json();
			const { url } = body;

			if (!url || typeof url !== "string") {
				return new Response(
					JSON.stringify({ success: false, error: "URL is required" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const extractResponse = await firecrawlRequest(
				"extract",
				{
					method: "POST",
					body: JSON.stringify({
						url,
						schema: {
							type: "object",
							properties: {
								name: { type: "string", description: "Venue name" },
								description: { type: "string", description: "Venue description" },
								address: { type: "string", description: "Full address including street, city, state, zip" },
								city: { type: "string", description: "City name" },
								region: { type: "string", description: "State or region" },
								country: { type: "string", description: "Country name" },
								phone: { type: "string", description: "Phone number" },
								email: { type: "string", description: "Email address" },
								website: { type: "string", description: "Website URL" },
								operatingHours: { type: "string", description: "Operating hours or opening times" },
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
								numberOfTables: { type: "number", description: "Number of pool tables" },
							},
						},
					}),
				},
				FIRECRAWL_API_KEY
			);

			const extractData = await extractResponse.json();

			if (!extractData.success || !extractData.data) {
				return new Response(
					JSON.stringify({ success: false, error: "Failed to extract venue data" }),
					{ status: 500, headers: { "Content-Type": "application/json" } }
				);
			}

			const extracted = extractData.data;

			return new Response(
				JSON.stringify({
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
						website: extracted.website || url,
						operatingHours: extracted.operatingHours || null,
						socialLinks: extracted.socialLinks || [],
						numberOfTables: extracted.numberOfTables || null,
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			console.error("Firecrawl venue extraction error:", error);
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

http.route({
	path: "/firecrawl/search",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		if (!FIRECRAWL_API_KEY) {
			return new Response(
				JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			const body = await request.json();
			const { query, location, numResults } = body;

			if (!query || typeof query !== "string") {
				return new Response(
					JSON.stringify({ success: false, error: "Query is required" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const searchQuery = location 
				? `${query} pool tournament ${location}`
				: `${query} pool tournament`;

			const response = await firecrawlRequest(
				"search",
				{
					method: "POST",
					body: JSON.stringify({
						query: searchQuery,
						numResults: numResults || 10,
						scrapeOptions: {
							formats: ["markdown"],
						},
					}),
				},
				FIRECRAWL_API_KEY
			);

			const data = await response.json();

			if (!data.success) {
				return new Response(
					JSON.stringify({ success: false, error: "Search failed" }),
					{ status: 500, headers: { "Content-Type": "application/json" } }
				);
			}

			return new Response(
				JSON.stringify({
					success: true,
					data: data.data || [],
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			console.error("Firecrawl search error:", error);
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
					data: [],
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

http.route({
	path: "/firecrawl/map",
	method: "POST",
	handler: httpAction(async (ctx, request) => {
		if (!FIRECRAWL_API_KEY) {
			return new Response(
				JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY not configured" }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		try {
			const body = await request.json();
			const { venueUrl, limit } = body;

			if (!venueUrl || typeof venueUrl !== "string") {
				return new Response(
					JSON.stringify({ success: false, error: "Venue URL is required" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}

			const mapResponse = await firecrawlRequest(
				"map",
				{
					method: "POST",
					body: JSON.stringify({
						url: venueUrl,
						limit: limit || 50,
					}),
				},
				FIRECRAWL_API_KEY
			);

			const mapData = await mapResponse.json();

			if (!mapData.success || !mapData.data) {
				return new Response(
					JSON.stringify({ success: false, error: "Failed to map venue website" }),
					{ status: 500, headers: { "Content-Type": "application/json" } }
				);
			}

			const tournamentKeywords = ["tournament", "event", "tour", "championship", "competition", "registration"];
			const potentialTournamentPages = mapData.data.links?.filter((link: string) => {
				const linkLower = link.toLowerCase();
				return tournamentKeywords.some(keyword => linkLower.includes(keyword));
			}) || [];

			return new Response(
				JSON.stringify({
					success: true,
					data: {
						venueUrl,
						totalPages: mapData.data.links?.length || 0,
						tournamentPages: potentialTournamentPages.slice(0, 20),
					},
				}),
				{ status: 200, headers: { "Content-Type": "application/json" } }
			);
		} catch (error) {
			console.error("Firecrawl venue mapping error:", error);
			return new Response(
				JSON.stringify({
					success: false,
					error: error instanceof Error ? error.message : "Unknown error occurred",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}),
});

export default http;

