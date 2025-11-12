export interface PlayerSearchResult {
  id: string;
  readableId: string;
  firstName: string;
  lastName: string;
  location?: string;
  effectiveRating: string;
  provisionalRating: string;
  robustness: string;
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

