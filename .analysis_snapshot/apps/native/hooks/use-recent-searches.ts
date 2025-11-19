import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_PREFIX = "@rackd:recent_searches:";
const MAX_RECENT_SEARCHES = 10;

type TabType = "players" | "tournaments" | "posts";

export function useRecentSearches(tab: TabType) {
	const [recentSearches, setRecentSearches] = useState<string[]>([]);
	const storageKey = `${STORAGE_KEY_PREFIX}${tab}`;

	useEffect(() => {
		const loadRecentSearches = async () => {
			try {
				const stored = await AsyncStorage.getItem(storageKey);
				if (stored) {
					const parsed = JSON.parse(stored) as string[];
					setRecentSearches(parsed);
				}
			} catch (error: unknown) {
				console.error("Error loading recent searches:", error);
			}
		};

		loadRecentSearches();
	}, [storageKey]);

	// Add a new search to recent searches
	const addSearch = useCallback(
		async (query: string) => {
			if (!query || query.trim().length === 0) {
				return;
			}

			const trimmedQuery = query.trim();
			setRecentSearches((prev) => {
				// Remove duplicate if exists and add to beginning
				const filtered = prev.filter((q) => q.toLowerCase() !== trimmedQuery.toLowerCase());
				const updated = [trimmedQuery, ...filtered].slice(0, MAX_RECENT_SEARCHES);

				// Save to storage
				AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch((error: unknown) => {
					console.error("Error saving recent searches:", error);
				});

				return updated;
			});
		},
		[storageKey]
	);

	// Clear all recent searches
	const clearSearches = useCallback(async () => {
		try {
			await AsyncStorage.removeItem(storageKey);
			setRecentSearches([]);
			} catch (error: unknown) {
				console.error("Error clearing recent searches:", error);
			}
	}, [storageKey]);

	// Remove a specific search
	const removeSearch = useCallback(
		async (query: string) => {
			setRecentSearches((prev) => {
				const updated = prev.filter((q) => q !== query);
				AsyncStorage.setItem(storageKey, JSON.stringify(updated)).catch((error: unknown) => {
					console.error("Error saving recent searches:", error);
				});
				return updated;
			});
		},
		[storageKey]
	);

	return {
		recentSearches,
		addSearch,
		clearSearches,
		removeSearch,
	};
}

