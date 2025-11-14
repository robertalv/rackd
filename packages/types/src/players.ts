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
  Id: number;
  FirstName: string;
  LastName: string;
  Nickname?: string;
  City?: string;
  State?: string;
  Country: string;
  FargoRating: string;
  Robustness: string;

  // Legacy lowercase properties for backward compatibility
  id?: string;
  readableId?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
  rating?: string;
  effectiveRating?: string;
  provisionalRating?: string;
  robustness?: string;
  country?: string;
  gender?: string;
  membershipId?: string;
  membershipNumber?: string | null;
  imageUrl?: string | null;
  lmsId?: string | null;
}

