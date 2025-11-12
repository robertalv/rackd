import type { FargoRatePlayer, PlayerSearchResponse, RaceCalculationResponse, MatchOddsResponse } from './types'

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const cache = new Map<string, { data: FargoRatePlayer[] | PlayerSearchResponse | RaceCalculationResponse | MatchOddsResponse, timestamp: number }>()

export async function fetchFargoRatePlayers(apiUrl: string): Promise<FargoRatePlayer[]> {
  const cacheKey = apiUrl
  const cached = cache.get(cacheKey)
  
  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as FargoRatePlayer[]
  }

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FargoRatePlayer[] = await response.json()
    
    // Cache the data
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error('Error fetching FargoRate data:', error)
    throw new Error('Failed to fetch player rankings')
  }
}

export async function fetchFargoRatePlayersServer(rankingType: string, gender?: string): Promise<FargoRatePlayer[]> {
  const cacheKey = `${rankingType}-${gender || 'all'}`
  const cached = cache.get(cacheKey)
  
  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as FargoRatePlayer[]
  }

  try {
    // Build the external FargoRate API URL
    let apiUrl = `https://dashboard.fargorate.com/api/TopListsForWeb?rankingType=${rankingType}`
    if (gender) {
      apiUrl += `&gender=${gender}`
    }

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Billiards-Analytics-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: FargoRatePlayer[] = await response.json()
    
    // Cache the data
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error('Error fetching FargoRate data:', error)
    throw new Error('Failed to fetch player rankings')
  }
}

export async function searchFargoRatePlayers(query: string): Promise<PlayerSearchResponse> {
  const cacheKey = `search-${query}`
  const cached = cache.get(cacheKey)
  
  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as PlayerSearchResponse
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    const apiUrl = `https://dashboard.fargorate.com/api/indexsearch?q=${encodedQuery}`

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Billiards-Analytics-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: PlayerSearchResponse = await response.json()
    
    // Cache the data
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error('Error searching FargoRate players:', error)
    throw new Error('Failed to search players')
  }
}

export function getCountryName(countryCode: string): string {
  const countryNames: Record<string, string> = {
    'USA': 'United States',
    'DEU': 'Germany',
    'IRQ': 'Iraq',
    'TWN': 'Taiwan',
    'ESP': 'Spain',
    'PHL': 'Philippines',
    'SGP': 'Singapore',
    'SCT': 'Scotland',
    'ALB': 'Albania',
    'AUT': 'Austria',
    'POL': 'Poland',
    'GRC': 'Greece',
    'JPN': 'Japan',
    'CHN': 'China',
    'NLD': 'Netherlands',
    'CAN': 'Canada',
    'HKG': 'Hong Kong',
    'HUN': 'Hungary',
    'VNM': 'Vietnam',
    'BIH': 'Bosnia and Herzegovina',
    'FIN': 'Finland',
    'GBR': 'United Kingdom',
    'RUS': 'Russia',
    'UKR': 'Ukraine',
    'DNK': 'Denmark',
    'SYR': 'Syria',
    'PER': 'Peru',
    'IDN': 'Indonesia'
  }
  
  return countryNames[countryCode] || countryCode
}

export function getCountryFlag(countryCode: string): string {
  // Convert ISO 3-letter country codes to ISO 2-letter codes for flag emojis
  const countryCodeMap: Record<string, string> = {
    'USA': 'US',
    'DEU': 'DE',
    'IRQ': 'IQ',
    'TWN': 'TW',
    'ESP': 'ES',
    'PHL': 'PH',
    'SGP': 'SG',
    'SCT': 'GB', // Scotland uses UK flag
    'ALB': 'AL',
    'AUT': 'AT',
    'POL': 'PL',
    'GRC': 'GR',
    'JPN': 'JP',
    'CHN': 'CN',
    'NLD': 'NL',
    'CAN': 'CA',
    'HKG': 'HK',
    'HUN': 'HU',
    'VNM': 'VN',
    'BIH': 'BA',
    'FIN': 'FI',
    'GBR': 'GB',
    'RUS': 'RU',
    'UKR': 'UA',
    'DNK': 'DK',
    'SYR': 'SY',
    'PER': 'PE',
    'IDN': 'ID'
  }
  
  const twoLetterCode = countryCodeMap[countryCode] || countryCode
  return getFlagEmoji(twoLetterCode)
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function formatFargoRating(rating: string): string {
  return parseInt(rating).toLocaleString()
}

export function formatRobustness(robustness: string): string {
  return parseInt(robustness).toLocaleString()
}

export async function calculateRaces(
  ratingOne: number, 
  ratingTwo: number
): Promise<RaceCalculationResponse> {
  const cacheKey = `races-${ratingOne}-${ratingTwo}`
  const cached = cache.get(cacheKey)
  
  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as RaceCalculationResponse
  }

  try {
    // Calculate races for all three types (0=hot, 1=medium, 2=mild)
    const [hotRaces, mediumRaces, mildRaces] = await Promise.all([
      fetch(`https://lms.fargorate.com/api/ratingcalc/racesbytype?type=0&ratingOne=${ratingOne}&ratingTwo=${ratingTwo}`).then(r => r.json()),
      fetch(`https://lms.fargorate.com/api/ratingcalc/racesbytype?type=1&ratingOne=${ratingOne}&ratingTwo=${ratingTwo}`).then(r => r.json()),
      fetch(`https://lms.fargorate.com/api/ratingcalc/racesbytype?type=2&ratingOne=${ratingOne}&ratingTwo=${ratingTwo}`).then(r => r.json())
    ]);

    const result: RaceCalculationResponse = {
      hot: hotRaces,
      medium: mediumRaces,
      mild: mildRaces
    };

    // Cache the data
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });

    return result;
  } catch (error) {
    console.error('Error calculating races:', error);
    throw new Error('Failed to calculate races');
  }
}

export async function calculateMatchOdds(
  ratingOne: number,
  ratingTwo: number,
  raceTo1: number,
  raceTo2: number
): Promise<MatchOddsResponse> {
  const cacheKey = `odds-${ratingOne}-${ratingTwo}-${raceTo1}-${raceTo2}`
  const cached = cache.get(cacheKey)
  
  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as MatchOddsResponse
  }

  try {
    const apiUrl = `https://lms.fargorate.com/api/ratingcalc/odds/${ratingOne}/${ratingTwo}/${raceTo1}/${raceTo2}`
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Billiards-Analytics-App/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data: MatchOddsResponse = await response.json()
    
    // Cache the data
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error('Error calculating match odds:', error)
    throw new Error('Failed to calculate match odds')
  }
} 