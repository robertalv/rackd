import type { 
  APAMember, 
  APATournament, 
  APAMatch, 
  APAEvent, 
  APALeague, 
  APAMemberStats 
} from './types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { 
  data: APAMember[] | APATournament[] | APAMatch | APAEvent[] | APALeague | APAMemberStats | any, 
  timestamp: number 
}>()

const BASE_URL = 'https://api.poolplayers.com'

/**
 * Generic fetch function with caching and error handling
 */
async function fetchWithCache<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`
  const cached = cache.get(cacheKey)
  
  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'Rackd-App/1.0',
        ...options?.headers,
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: T = await response.json()
    
    // Cache the data
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error(`Error fetching APA API data from ${endpoint}:`, error)
    throw new Error(`Failed to fetch data from ${endpoint}`)
  }
}

/**
 * Get a specific event by ID
 */
export async function getAPAEvent(otherEventId: number): Promise<APAEvent> {
  return fetchWithCache<APAEvent>(`/events/GetEvent/${otherEventId}`)
}

/**
 * Get all events for a league
 */
export async function getAllAPAEvents(leagueId: number): Promise<APAEvent[]> {
  return fetchWithCache<APAEvent[]>(`/events/GetAllEvents/${leagueId}`)
}

/**
 * Get a specific tournament by ID
 */
export async function getAPATournament(tournamentId: number): Promise<APATournament> {
  return fetchWithCache<APATournament>(`/tournaments/GetTournament/${tournamentId}`)
}

/**
 * Get all tournaments for a league
 */
export async function getAllAPATournaments(leagueId: number): Promise<APATournament[]> {
  return fetchWithCache<APATournament[]>(`/tournaments/GetAllTournaments/${leagueId}`)
}

/**
 * Get a specific match by ID
 */
export async function getAPAMatch(matchId: number): Promise<APAMatch> {
  return fetchWithCache<APAMatch>(`/matches/${matchId}`)
}

/**
 * Get division info for a match
 */
export async function getAPAMatchDivisionInfo(matchId: number): Promise<any> {
  return fetchWithCache<any>(`/matches/${matchId}/division-info`)
}

/**
 * Get a member by ID
 */
export async function getAPAMember(memberId: number): Promise<APAMember> {
  return fetchWithCache<APAMember>(`/members/${memberId}`)
}

/**
 * Get all members (with optional pagination)
 */
export async function getAPAMembers(): Promise<APAMember[]> {
  return fetchWithCache<APAMember[]>(`/members`)
}

/**
 * Get teams for a member
 */
export async function getAPAMemberTeams(memberId: number): Promise<any[]> {
  return fetchWithCache<any[]>(`/members/${memberId}/teams`)
}

/**
 * Get matches for a member
 */
export async function getAPAMemberMatches(memberId: number): Promise<APAMatch[]> {
  return fetchWithCache<APAMatch[]>(`/members/${memberId}/matches`)
}

/**
 * Get member stats for a specific period
 * @param memberId - The member ID
 * @param period - The period (e.g., 'current', 'lifetime', 'combined')
 */
export async function getAPAMemberStats(
  memberId: number, 
  period: 'current' | 'lifetime' | 'combined' = 'current'
): Promise<APAMemberStats> {
  const periodMap = {
    'current': 'sessions/current',
    'lifetime': 'sessions/lifetime',
    'combined': 'sessions/combined'
  }
  
  // Note: The API endpoint uses memberAliasId, not memberId
  // This may need adjustment based on actual API structure
  return fetchWithCache<APAMemberStats>(
    `/members/stats/${periodMap[period]}/${memberId}`
  )
}

/**
 * Get a league by path (e.g., 'my-league')
 */
export async function getAPALeagueByPath(leaguePath: string): Promise<APALeague> {
  return fetchWithCache<APALeague>(`/leagues/${leaguePath}`)
}

/**
 * Get a league by ID
 */
export async function getAPALeague(leagueId: number): Promise<APALeague> {
  return fetchWithCache<APALeague>(`/leagues/GetLeague/${leagueId}`)
}

/**
 * Get league detail by path
 */
export async function getAPALeagueDetail(leaguePath: string): Promise<any> {
  return fetchWithCache<any>(`/leagues/${leaguePath}/detail`)
}

/**
 * Get league contacts by path
 */
export async function getAPALeagueContacts(leaguePath: string): Promise<any[]> {
  return fetchWithCache<any[]>(`/leagues/${leaguePath}/contacts`)
}

/**
 * Get sessions for a league
 */
export async function getAPALeagueSessions(leagueId: number): Promise<any[]> {
  return fetchWithCache<any[]>(`/leagues/${leagueId}/sessions`)
}

/**
 * Clear the cache (useful for testing or forced refresh)
 */
export function clearAPACache(): void {
  cache.clear()
}

/**
 * Clear cache for a specific endpoint
 */
export function clearAPACacheForEndpoint(endpoint: string, options?: RequestInit): void {
  const cacheKey = `${endpoint}-${JSON.stringify(options)}`
  cache.delete(cacheKey)
}

