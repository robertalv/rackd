export interface PlayerSearchResult {
	id: string;
	readableId: string;
	membershipId: string;
	firstName: string;
	lastName: string;
	location: string;
	rating: string;
	robustness: string;
	provisionalRating: string;
	effectiveRating: string;
	membershipNumber: string | null;
	imageUrl: string | null;
	lmsId: string | null;
	shareMatches: string | null;
	statsOverall: string | null;
	statsByRating: string | null;
	ratingHistory: string | null;
}

export interface PlayerSearchResponse {
	value: PlayerSearchResult[];
}

export interface FargoRatePlayer {
	id: string;
	readableId: string;
	firstName: string;
	lastName: string;
	location?: string;
	rating: string;
	effectiveRating: string;
	provisionalRating: string;
	robustness: string;
	country?: string;
	gender?: string;
	membershipId?: string;
	membershipNumber?: string | null;
	imageUrl?: string | null;
	lmsId?: string | null;
}

export interface RaceCalculationResponse {
	hot: number;
	medium: number;
	mild: number;
}

export interface MatchOddsResponse {
	playerOneWinProbability: number;
	playerTwoWinProbability: number;
	[key: string]: any; // Allow for additional fields from API
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: PlayerSearchResponse; timestamp: number }>();

export async function searchFargoRatePlayers(query: string): Promise<PlayerSearchResponse> {
	const cacheKey = `search-${query}`;
	const cached = cache.get(cacheKey);

	// Return cached data if it's still valid
	if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
		return cached.data;
	}

	try {
		const encodedQuery = encodeURIComponent(query);
		const apiUrl = `https://dashboard.fargorate.com/api/indexsearch?q=${encodedQuery}`;

		const response = await fetch(apiUrl, {
			headers: {
				Accept: "application/json",
				"User-Agent": "Billiards-Analytics-App/1.0",
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		const data: PlayerSearchResponse = await response.json();

		// Cache the data
		cache.set(cacheKey, {
			data,
			timestamp: Date.now(),
		});

		return data;
	} catch (error) {
		console.error("Error searching FargoRate players:", error);
		throw new Error("Failed to search players");
	}
}

export function formatFargoRating(rating: string): string {
	return parseInt(rating).toLocaleString();
}

export function formatRobustness(robustness: string): string {
	return parseInt(robustness).toLocaleString();
}

