const CACHE_DURATION = 5 * 60 * 1e3;
const cache = /* @__PURE__ */ new Map();
async function fetchFargoRatePlayersServer(rankingType, gender) {
  const cacheKey = `${rankingType}-${"all"}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  try {
    let apiUrl = `https://dashboard.fargorate.com/api/TopListsForWeb?rankingType=${rankingType}`;
    if (gender) ;
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Billiards-Analytics-App/1.0"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error("Error fetching FargoRate data:", error);
    throw new Error("Failed to fetch player rankings");
  }
}
async function searchFargoRatePlayers(query) {
  const cacheKey = `search-${query}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  try {
    const encodedQuery = encodeURIComponent(query);
    const apiUrl = `https://dashboard.fargorate.com/api/indexsearch?q=${encodedQuery}`;
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Billiards-Analytics-App/1.0"
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    console.error("Error searching FargoRate players:", error);
    throw new Error("Failed to search players");
  }
}
function getCountryName(countryCode) {
  const countryNames = {
    "USA": "United States",
    "DEU": "Germany",
    "IRQ": "Iraq",
    "TWN": "Taiwan",
    "ESP": "Spain",
    "PHL": "Philippines",
    "SGP": "Singapore",
    "SCT": "Scotland",
    "ALB": "Albania",
    "AUT": "Austria",
    "POL": "Poland",
    "GRC": "Greece",
    "JPN": "Japan",
    "CHN": "China",
    "NLD": "Netherlands",
    "CAN": "Canada",
    "HKG": "Hong Kong",
    "HUN": "Hungary",
    "VNM": "Vietnam",
    "BIH": "Bosnia and Herzegovina",
    "FIN": "Finland",
    "GBR": "United Kingdom",
    "RUS": "Russia",
    "UKR": "Ukraine",
    "DNK": "Denmark",
    "SYR": "Syria",
    "PER": "Peru",
    "IDN": "Indonesia"
  };
  return countryNames[countryCode] || countryCode;
}
function formatFargoRating(rating) {
  return parseInt(rating).toLocaleString();
}
function formatRobustness(robustness) {
  return parseInt(robustness).toLocaleString();
}
export {
  formatFargoRating as a,
  formatRobustness as b,
  fetchFargoRatePlayersServer as f,
  getCountryName as g,
  searchFargoRatePlayers as s
};
