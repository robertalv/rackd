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

// APA API Types
export interface APAMember {
  memberId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface APATournament {
  tournamentId: number;
  name?: string;
  leagueId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface APAMatch {
  matchId: number;
  teamId?: number;
  scheduleId?: number;
  divisionId?: number;
  [key: string]: any; // Allow for additional fields from API
}

export interface APAEvent {
  otherEventId: number;
  name?: string;
  leagueId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface APALeague {
  leagueId: number;
  name?: string;
  leaguePath?: string;
  [key: string]: any; // Allow for additional fields from API
}

export interface APAMemberStats {
  memberAliasId: number;
  wins?: number;
  losses?: number;
  winPercentage?: number;
  [key: string]: any; // Allow for additional fields from API
}

// Notification Types
export type NotificationType = 
  | 'follow'
  | 'like'
  | 'comment'
  | 'mention'
  | 'tournament_invite'
  | 'tournament_start'
  | 'match_ready'
  | 'match_result'
  | 'report';

