export interface APAMember {
  memberId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface APATournament {
  tournamentId: number;
  name?: string;
  leagueId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface APAMatch {
  matchId: number;
  teamId?: number;
  scheduleId?: number;
  divisionId?: number;
  [key: string]: any;
}

export interface APAEvent {
  otherEventId: number;
  name?: string;
  leagueId?: number;
  startDate?: string;
  endDate?: string;
  [key: string]: any;
}

export interface APALeague {
  leagueId: number;
  name?: string;
  leaguePath?: string;
  [key: string]: any;
}

export interface APAMemberStats {
  memberAliasId: number;
  wins?: number;
  losses?: number;
  winPercentage?: number;
  [key: string]: any;
}

