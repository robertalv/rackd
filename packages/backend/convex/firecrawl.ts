import { action } from "./_generated/server";
import { v } from "convex/values";
import { check, track } from "./autumn";

const CONVEX_SITE_URL = process.env.CONVEX_SITE_URL || process.env.EXPO_PUBLIC_CONVEX_SITE_URL || "";

if (!CONVEX_SITE_URL) {
	console.warn("⚠️  CONVEX_SITE_URL not configured. Firecrawl HTTP endpoints may not work.");
}

export const extractTournamentFromUrl = action({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		if (!CONVEX_SITE_URL) {
			throw new Error("CONVEX_SITE_URL not configured");
		}

		try {
			const firecrawlCheck = await check(ctx, {
				featureId: "firecrawl_extraction",
			});

			if (!firecrawlCheck.data?.allowed) {
				throw new Error(
					"Firecrawl extraction is a premium feature. Please upgrade to use this feature."
				);
			}

			const response = await fetch(`${CONVEX_SITE_URL}/firecrawl/extract/tournament`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url: args.url }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: response.statusText }));
				throw new Error(errorData.error || `HTTP error: ${response.status}`);
			}

			const result = await response.json();

			await track(ctx, {
				featureId: "firecrawl_api_call",
				quantity: 1,
			});

			return result;
		} catch (error) {
			console.error("Firecrawl extraction error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	},
});

export const extractVenueFromUrl = action({
	args: {
		url: v.string(),
	},
	handler: async (ctx, args) => {
		if (!CONVEX_SITE_URL) {
			throw new Error("CONVEX_SITE_URL not configured");
		}

		try {
			const firecrawlCheck = await check(ctx, {
				featureId: "firecrawl_extraction",
			});

			if (!firecrawlCheck.data?.allowed) {
				throw new Error(
					"Firecrawl extraction is a premium feature. Please upgrade to use this feature."
				);
			}

			const response = await fetch(`${CONVEX_SITE_URL}/firecrawl/extract/venue`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url: args.url }),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: response.statusText }));
				throw new Error(errorData.error || `HTTP error: ${response.status}`);
			}

			const result = await response.json();

			await track(ctx, {
				featureId: "firecrawl_api_call",
				quantity: 1,
			});

			return result;
		} catch (error) {
			console.error("Firecrawl venue extraction error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	},
});

export const searchTournaments = action({
	args: {
		query: v.string(),
		location: v.optional(v.string()),
		numResults: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		if (!CONVEX_SITE_URL) {
			throw new Error("CONVEX_SITE_URL not configured");
		}

		try {
			const response = await fetch(`${CONVEX_SITE_URL}/firecrawl/search`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					query: args.query,
					location: args.location,
					numResults: args.numResults,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: response.statusText }));
				throw new Error(errorData.error || `HTTP error: ${response.status}`);
			}

			const result = await response.json();
			return result;
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

export const discoverTournamentsFromVenue = action({
	args: {
		venueUrl: v.string(),
		limit: v.optional(v.number()),
	},
	handler: async (ctx, args) => {
		if (!CONVEX_SITE_URL) {
			throw new Error("CONVEX_SITE_URL not configured");
		}

		try {
			const response = await fetch(`${CONVEX_SITE_URL}/firecrawl/map`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					venueUrl: args.venueUrl,
					limit: args.limit,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: response.statusText }));
				throw new Error(errorData.error || `HTTP error: ${response.status}`);
			}

			const result = await response.json();
			return result;
		} catch (error) {
			console.error("Firecrawl venue mapping error:", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error occurred",
			};
		}
	},
});




