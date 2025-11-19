import { useMemo, useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { SingleEliminationBracket, DoubleEliminationBracket } from "@rackd/bracket";
import type { Match, Participant, Theme } from "@rackd/bracket";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { api } from "@rackd/backend/convex/_generated/api";
import { MatchDetailModal } from "./match-detail-modal";
import { Badge } from "@rackd/ui/components/badge";
import { formatDistanceToNow } from "date-fns";
import { Icon, Clock01Icon } from "@rackd/ui/icons";
import { useTheme } from "@/providers/ThemeProvider";
import { BracketControls } from "./bracket-controls";

type BackendMatch = {
  _id: Id<"matches">;
  tournamentId: Id<"tournaments">;
  round: number;
  bracketPosition: number;
  nextMatchId?: Id<"matches"> | null;
  nextLooserMatchId?: Id<"matches"> | null;
  player1Id?: Id<"players"> | null;
  player2Id?: Id<"players"> | null;
  winnerId?: Id<"players"> | null;
  player1?: { name: string; _id: Id<"players"> } | null;
  player2?: { name: string; _id: Id<"players"> } | null;
  winner?: { name: string; _id: Id<"players"> } | null;
  status: "pending" | "in_progress" | "completed";
  player1Score: number;
  player2Score: number;
  bracketType?: "winner" | "loser" | "grand_final" | null;
  completedAt?: number | null;
  tableNumber?: number | null;
};

type TournamentBracketProps = {
  matches: BackendMatch[] | undefined;
  tournamentType: "single" | "double" | "round_robin" | "scotch_double" | "teams";
  tournamentId?: string; // Optional: needed to query player count
  tournamentName?: string; // Optional: tournament name for exports
  zoom?: number; // Zoom level (0-200)
  onZoomChange?: (zoom: number) => void; // Callback when zoom changes
};

// Helper function to get placement label (e.g., "9-12TH", "5-6TH", "3RD")
const getPlacementLabel = (round: number, totalRounds: number, bracketSize: number): string | null => {
  if (round === totalRounds) return null; // Final round
  if (round === totalRounds - 1) return "3RD"; // Third place match
  
  // Calculate placement range based on round
  const playersEliminated = bracketSize / Math.pow(2, round);
  const startPlace = playersEliminated + 1;
  const endPlace = playersEliminated * 2;
  
  if (startPlace === endPlace) {
    const suffix = startPlace === 1 ? "ST" : startPlace === 2 ? "ND" : startPlace === 3 ? "RD" : "TH";
    return `${startPlace}${suffix}`;
  }
  
  const endSuffix = endPlace === 1 ? "ST" : endPlace === 2 ? "ND" : endPlace === 3 ? "RD" : "TH";
  return `${startPlace}-${endPlace}${endSuffix}`;
};

// Helper to get CSS variable value
const getCSSVariable = (varName: string): string => {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
};

// Helper to create theme-aware bracket theme using CSS variables
const createBracketTheme = (isDark: boolean): Theme => {
  // Get CSS variable values
  const background = getCSSVariable("--background");
  const card = getCSSVariable("--card");
  const foreground = getCSSVariable("--foreground");
  const mutedForeground = getCSSVariable("--muted-foreground");
  const border = getCSSVariable("--border");
  const primary = getCSSVariable("--primary");
  const destructive = getCSSVariable("--destructive");
  
  // For dark mode, use slightly darker variants for match backgrounds
  const matchWonBg = isDark 
    ? getCSSVariable("--card") || "oklch(0.2686 0 0)"
    : getCSSVariable("--muted") || "oklch(0.9846 0.0017 247.8389)";
  const matchLostBg = isDark
    ? "oklch(0.1418 0 0)" // Slightly darker than card
    : getCSSVariable("--muted") || "oklch(0.9846 0.0017 247.8389)";
  
  return {
    fontFamily: getCSSVariable("--font-sans") || '"Inter", "Roboto", "Arial", "Helvetica", "sans-serif"',
    transitionTimingFunction: 'cubic-bezier(0, 0.92, 0.77, 0.99)',
    disabledColor: mutedForeground || (isDark ? "oklch(0.7155 0 0)" : "oklch(0.5510 0.0234 264.3637)"),
    canvasBackground: background || (isDark ? "oklch(0.2046 0 0)" : "oklch(1.0000 0 0)"),
    roundHeaders: {
      background: card || (isDark ? "oklch(0.2686 0 0)" : "oklch(1.0000 0 0)"),
    },
    matchBackground: {
      wonColor: matchWonBg,
      lostColor: matchLostBg,
    },
    border: {
      color: border || (isDark ? "oklch(0.3715 0 0)" : "oklch(0.9276 0.0058 264.5313)"),
      highlightedColor: primary || "oklch(0.5000 0.1340 242.7490)",
    },
    textColor: {
      highlighted: foreground || (isDark ? "oklch(0.9219 0 0)" : "oklch(0.3211 0 0)"),
      main: foreground || (isDark ? "oklch(0.9219 0 0)" : "oklch(0.3211 0 0)"),
      dark: mutedForeground || (isDark ? "oklch(0.7155 0 0)" : "oklch(0.5510 0.0234 264.3637)"),
      disabled: mutedForeground || (isDark ? "oklch(0.7155 0 0)" : "oklch(0.5510 0.0234 264.3637)"),
    },
    score: {
      text: {
        highlightedWonColor: primary || "oklch(0.5000 0.1340 242.7490)",
        highlightedLostColor: destructive || "oklch(0.6368 0.2078 25.3313)",
      },
      background: {
        wonColor: matchWonBg,
        lostColor: matchLostBg,
      },
    },
  };
};

export function TournamentBracket({ matches, tournamentType, tournamentId, tournamentName, zoom, onZoomChange }: TournamentBracketProps) {
  // State to track selected match
  const [selectedMatchId, setSelectedMatchId] = useState<string | number | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  
  // Ref for bracket container (for controls)
  const bracketContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  
  // Get theme for dynamic styling
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bracketTheme = useMemo(() => createBracketTheme(isDark), [isDark]);
  
  // Get checked-in players count to calculate bracket size
  const playerCount = useQuery(
    api.tournaments.getPlayerCount,
    tournamentId ? { tournamentId: tournamentId as Id<"tournaments"> } : "skip"
  );
  
  // Get tournament data for name if not provided
  const tournament = useQuery(
    api.tournaments.getById,
    tournamentId && !tournamentName ? { id: tournamentId as Id<"tournaments"> } : "skip"
  );
  
  const displayName = tournamentName || tournament?.name || "Tournament Bracket";
  
  // Find the selected match from backend matches
  const selectedMatch = useMemo(() => {
    if (!selectedMatchId || !matches) return null;
    return matches.find(m => m._id === selectedMatchId);
  }, [selectedMatchId, matches]);
  
  // Handle match click - open modal
  const handleMatchClick = (args: { match: Match; topWon: boolean; bottomWon: boolean }) => {
    // Find the backend match by ID
    const backendMatch = matches?.find(m => m._id === args.match.id);
    if (backendMatch) {
      setSelectedMatchId(args.match.id);
      setShowMatchModal(true);
    }
  };

  const bracketData = useMemo(() => {
    if (!matches || matches.length === 0) {
      return null;
    }

    // Calculate bracket size based on checked-in players
    // Count unique players in matches as fallback if playerCount not available
    const playersInMatches = new Set(
      matches.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean))
    );
    const numPlayers = playerCount?.checkedIn || playersInMatches.size || 0;
    
    // Calculate bracket size: ≤16 → 16 (8 matches), ≤32 → 32 (16 matches), etc.
    // ALWAYS use the next power of 2, minimum 16
    const bracketSize = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(numPlayers, 2)))));
    const maxFirstRoundMatches = bracketSize / 2;
    
    // Debug: Log bracket size calculation
    console.log(`Bracket size calculation: ${numPlayers} players → bracketSize: ${bracketSize}, maxFirstRoundMatches: ${maxFirstRoundMatches}`);

    // Create a map of match IDs for quick lookup
    const matchIdMap = new Map<string, BackendMatch>();
    matches.forEach(m => matchIdMap.set(m._id, m));

    // Transform backend matches to bracket format
    const transformMatch = (match: BackendMatch): Match => {
      const participants: Participant[] = [];
      
      // Detect if this is a bye match (only one player exists and match is completed)
      // A bye occurs when we have exactly one player and the match is already completed
      const hasPlayer1 = !!(match.player1 || match.player1Id);
      const hasPlayer2 = !!(match.player2 || match.player2Id);
      const isBye = match.status === "completed" && 
                    ((hasPlayer1 && !hasPlayer2) || (!hasPlayer1 && hasPlayer2));
      
      // Add player 1
      if (match.player1) {
        const isWinner = match.winnerId === match.player1Id;
        participants.push({
          id: match.player1._id,
          name: match.player1.name || "",
          isWinner: match.status === "completed" ? isWinner : false,
          status: isBye 
            ? "WALKOVER" // Mark bye matches with WALKOVER status
            : match.status === "completed" 
            ? "PLAYED"
            : match.status === "in_progress"
            ? "PLAYED"
            : null,
          resultText: isBye 
            ? null // Byes don't show scores
            : match.status === "completed" && match.player1Score !== undefined
            ? String(match.player1Score)
            : null,
        });
      } else {
        // Empty slot - ensure we always have 2 participants
        participants.push({
          id: `empty-1-${match._id}`,
          name: "",
          isWinner: false,
          status: null,
          resultText: null,
        });
      }

      // Add player 2
      if (match.player2) {
        const isWinner = match.winnerId === match.player2Id;
        participants.push({
          id: match.player2._id,
          name: match.player2.name || "",
          isWinner: match.status === "completed" ? isWinner : false,
          status: isBye
            ? "WALKOVER" // Mark bye matches with WALKOVER status
            : match.status === "completed"
            ? "PLAYED"
            : match.status === "in_progress"
            ? "PLAYED"
            : null,
          resultText: isBye
            ? null // Byes don't show scores
            : match.status === "completed" && match.player2Score !== undefined
            ? String(match.player2Score)
            : null,
        });
      } else {
        // Empty slot - show "BYE" for empty slots in bye matches
        participants.push({
          id: `empty-2-${match._id}`,
          name: isBye ? "BYE" : "", // Show "BYE" text for empty slots in bye matches
          isWinner: false,
          status: isBye ? "NO_PARTY" : null,
          resultText: null,
        });
      }

      // Map status to bracket state
      // Use WALK_OVER state for bye matches instead of SCORE_DONE
      let state: string = "SCHEDULED";
      if (match.status === "completed") {
        state = isBye ? "WALK_OVER" : "SCORE_DONE";
      } else if (match.status === "in_progress") {
        state = "RUNNING";
      }

      // Ensure nextMatchId references are valid (must reference an existing match ID)
      // Note: matchIdMap is built from original matches, but we may have fixed links in matchesWithFixedLinks
      // So we need to check if the nextMatchId exists in the map of transformed matches
      let nextMatchId = match.nextMatchId && matchIdMap.has(match.nextMatchId)
        ? match.nextMatchId
        : null;
      
      const nextLooserMatchId = match.nextLooserMatchId && matchIdMap.has(match.nextLooserMatchId)
        ? match.nextLooserMatchId
        : undefined;

      return {
        id: match._id,
        name: `Round ${match.round} - Match ${match.bracketPosition + 1}`,
        nextMatchId,
        nextLooserMatchId,
        tournamentRoundText: String(match.round),
        startTime: match.completedAt ? new Date(match.completedAt).toISOString().split('T')[0] : "",
        state,
        participants,
      };
    };

    if (tournamentType === "single") {
      // Single elimination - return array of matches
      // Filter to only winner bracket matches (or matches without bracketType set)
      let filteredMatches = matches.filter(m => !m.bracketType || m.bracketType === "winner");
      
      // Separate round 1 matches from other rounds
      const round1Matches = filteredMatches.filter(m => m.round === 1);
      const otherRoundMatches = filteredMatches.filter(m => m.round !== 1);
      
      // ALWAYS show the full bracket size for round 1
      // For <16 players: show 8 matches (positions 0-7)
      // For <32 players: show 16 matches (positions 0-15)
      // etc.
      // Filter to only include round 1 matches within the bracket size (positions 0 to maxFirstRoundMatches-1)
      // CRITICAL: Use <= instead of < to include position maxFirstRoundMatches-1
      let filteredRound1Matches = round1Matches.filter(m => m.bracketPosition < maxFirstRoundMatches);
      
      // Ensure we're not accidentally filtering out matches
      // Log all round 1 matches to debug
      console.log(`All round 1 matches (${round1Matches.length}):`, round1Matches.map(m => ({ pos: m.bracketPosition, id: m._id })));
      console.log(`Filtered round 1 matches (${filteredRound1Matches.length}):`, filteredRound1Matches.map(m => ({ pos: m.bracketPosition, id: m._id })));
      console.log(`Expected: ${maxFirstRoundMatches} matches for bracket size ${bracketSize}`);
      
      // Sort round 1 matches by position to ensure correct order
      filteredRound1Matches.sort((a, b) => a.bracketPosition - b.bracketPosition);
      
      // CRITICAL: Ensure we show ALL matches for the bracket size
      // If backend didn't create all matches, we still need to show what we have
      // But we should ALWAYS show exactly maxFirstRoundMatches matches if they exist
      const expectedPositions = Array.from({ length: maxFirstRoundMatches }, (_, i) => i);
      const existingPositions = new Set(filteredRound1Matches.map(m => m.bracketPosition));
      
      // Log bracket info for debugging
      console.log(`Round 1 matches: Found ${filteredRound1Matches.length} matches, Expected ${maxFirstRoundMatches} matches for ${numPlayers} players (bracket size: ${bracketSize})`);
      console.log(`Round 1 match positions:`, filteredRound1Matches.map(m => m.bracketPosition).sort((a, b) => a - b));
      
      // If we're missing matches, log a warning (backend should create all matches)
      const missingPositions = expectedPositions.filter(pos => !existingPositions.has(pos));
      if (missingPositions.length > 0) {
        console.warn(`⚠️ Missing round 1 matches at positions: ${missingPositions.join(', ')}. Backend should create all ${maxFirstRoundMatches} matches for bracket size ${bracketSize}.`);
      }
      
      // For subsequent rounds, include ALL matches that are part of the bracket structure
      // Round 2 should have maxFirstRoundMatches/2 matches (4 for 8 round 1 matches)
      // Round 3 should have maxFirstRoundMatches/4 matches (2 for 8 round 1 matches)
      // Round 4 should have 1 match (championship)
      // Calculate expected matches per round based on bracket size
      const expectedMatchesPerRound: Record<number, number> = {};
      let currentRoundMatches = maxFirstRoundMatches;
      let round = 2;
      while (currentRoundMatches > 1) {
        const matchesInRound = Math.floor(currentRoundMatches / 2);
        expectedMatchesPerRound[round] = matchesInRound;
        currentRoundMatches = matchesInRound;
        round++;
      }
      
      // Filter subsequent rounds to include all matches within expected bracket structure
      const filteredOtherRounds = otherRoundMatches.filter(match => {
        const expectedCount = expectedMatchesPerRound[match.round];
        if (expectedCount !== undefined) {
          // Include matches within the expected bracket structure
          return match.bracketPosition < expectedCount;
        }
        // Include all other rounds (shouldn't happen in normal brackets)
        return true;
      });
      
      // Rebuild filteredMatches with all valid matches
      filteredMatches = [...filteredRound1Matches, ...filteredOtherRounds];
      
      // Debug: Log rounds structure
      console.log(`Bracket structure: Round 1: ${filteredRound1Matches.length} matches, Expected rounds:`, expectedMatchesPerRound);
      console.log(`Actual rounds:`, filteredMatches.reduce((acc, m) => {
        if (!acc[m.round]) acc[m.round] = 0;
        acc[m.round]++;
        return acc;
      }, {} as Record<number, number>));
      
      // Find the highest round number to identify the final match
      const maxRound = Math.max(...filteredMatches.map(m => m.round));
      
      // Fix nextMatchId links: ensure only the final match (highest round) has nextMatchId: null
      // For matches in lower rounds that have null nextMatchId, we need to find their proper next match
      const matchesWithFixedLinks = filteredMatches.map(match => {
        // If this match has null nextMatchId but isn't in the final round, find its next match
        if (!match.nextMatchId && match.round < maxRound) {
          // Find the match in the next round that this match should point to
          // In single elimination, matches in round N point to matches in round N+1
          const nextRound = match.round + 1;
          const nextRoundMatches = filteredMatches.filter(m => m.round === nextRound);
          
          if (nextRoundMatches.length === 0) {
            // No matches in next round, this must be the final
            return match;
          }
          
          // Find the match in the next round based on bracket position
          // In a bracket, match at position P in round R points to match at position floor(P/2) in round R+1
          const nextPosition = Math.floor(match.bracketPosition / 2);
          
          // Find the match at the calculated position
          let nextMatch = nextRoundMatches.find(m => m.bracketPosition === nextPosition);
          
          // If exact position not found (due to bye matches or incomplete brackets), 
          // find the closest match in the next round
          if (!nextMatch && nextRoundMatches.length > 0) {
            // Sort by position
            const sortedNextMatches = [...nextRoundMatches].sort((a, b) => a.bracketPosition - b.bracketPosition);
            
            // If calculated position is beyond available matches, use the last match
            // Otherwise, find the closest match
            if (nextPosition >= sortedNextMatches.length) {
              nextMatch = sortedNextMatches[sortedNextMatches.length - 1];
            } else {
              // Find the match at the closest position (shouldn't happen in normal brackets, but handle it)
              nextMatch = sortedNextMatches.find(m => m.bracketPosition >= nextPosition) || sortedNextMatches[sortedNextMatches.length - 1];
            }
          }
          
          if (nextMatch) {
            return { ...match, nextMatchId: nextMatch._id };
          }
        }
        return match;
      });
      
      // Debug: Log fixed links before transformation
      console.log("Fixed links - matches with null nextMatchId:", matchesWithFixedLinks.filter(m => !m.nextMatchId).map(m => ({ 
        id: m._id, 
        round: m.round, 
        position: m.bracketPosition, 
        name: `Round ${m.round} - Match ${m.bracketPosition + 1}` 
      })));
      
      // Transform all matches
      const bracketMatches = matchesWithFixedLinks.map(transformMatch);
      
      // Debug: Log matches to see what we're working with
      console.log("Total bracket matches:", bracketMatches.length);
      console.log("Matches by round:", bracketMatches.reduce((acc, m) => {
        const round = m.tournamentRoundText || "unknown";
        if (!acc[round]) acc[round] = [];
        acc[round].push({ id: m.id, name: m.name, nextMatchId: m.nextMatchId });
        return acc;
      }, {} as Record<string, any[]>));
      
      // Find the final match (no nextMatchId) - should now be unique
      const finalMatches = bracketMatches.filter(m => !m.nextMatchId);
      console.log("Final matches found:", finalMatches.length, finalMatches.map(m => ({ id: m.id, name: m.name, round: m.tournamentRoundText })));
      
      return { type: "single" as const, matches: bracketMatches };
    } else if (tournamentType === "double") {
      // Double elimination - separate upper and lower brackets
      const upperMatches = matches
        .filter(m => m.bracketType === "winner")
        .map(transformMatch)
        .sort((a, b) => {
          const roundA = parseInt(a.tournamentRoundText || "0");
          const roundB = parseInt(b.tournamentRoundText || "0");
          return roundA - roundB;
        });
      
      const lowerMatches = matches
        .filter(m => m.bracketType === "loser")
        .map(transformMatch)
        .sort((a, b) => {
          const roundA = parseInt(a.tournamentRoundText || "0");
          const roundB = parseInt(b.tournamentRoundText || "0");
          return roundA - roundB;
        });
      
      const grandFinalMatches = matches
        .filter(m => m.bracketType === "grand_final")
        .map(transformMatch);
      
      // Find the grand final match (should be the first one or the one with highest round)
      const grandFinal = grandFinalMatches.length > 0 
        ? grandFinalMatches.sort((a, b) => {
            const roundA = parseInt(a.tournamentRoundText || "0");
            const roundB = parseInt(b.tournamentRoundText || "0");
            return roundB - roundA; // Highest round first
          })[0]
        : null;
      
      // Ensure winner's bracket final points to grand final
      // Find the upper bracket final (match with no nextMatchId in upper bracket)
      const upperFinal = upperMatches.find(m => {
        // A match is a final if no other upper match has it as nextMatchId
        return !upperMatches.some(other => other.nextMatchId === m.id);
      });
      
      // Ensure loser's bracket final points to grand final
      // Find the lower bracket final (match with no nextMatchId in lower bracket)
      const lowerFinal = lowerMatches.find(m => {
        // A match is a final if no other lower match has it as nextMatchId
        return !lowerMatches.some(other => other.nextMatchId === m.id);
      });
      
      // Link finals to grand final if they exist
      if (grandFinal && upperFinal && !upperFinal.nextMatchId) {
        upperFinal.nextMatchId = grandFinal.id;
      }
      if (grandFinal && lowerFinal && !lowerFinal.nextMatchId) {
        lowerFinal.nextMatchId = grandFinal.id;
      }
      
      // Add grand final to lower bracket if it exists
      const allLowerMatches = [...lowerMatches, ...grandFinalMatches];
      
      return {
        type: "double" as const,
        matches: {
          upper: upperMatches,
          lower: allLowerMatches,
        },
      };
    }

    return null;
  }, [matches, tournamentType, playerCount]);

  // Calculate container width for full-width background
  useEffect(() => {
    if (!bracketContainerRef.current || !bracketData) return;
    
    const updateWidth = () => {
      if (bracketContainerRef.current) {
        // Find the bracket content element that has the transform applied
        const bracketContent = bracketContainerRef.current.querySelector('[data-bracket-content]') as HTMLElement;
        
        if (bracketContent) {
          // Get the actual scrollable width of the bracket content
          // This is the width before any CSS transforms are applied
          const contentScrollWidth = bracketContent.scrollWidth;
          
          // Get container dimensions
          const containerScrollWidth = bracketContainerRef.current.scrollWidth;
          const containerClientWidth = bracketContainerRef.current.clientWidth;
          
          // The header should span the full width of the scrollable content
          // Use the bracket content's scrollWidth as it represents the full bracket width
          // This ensures the header spans correctly even when zoomed
          setContainerWidth(Math.max(contentScrollWidth, containerScrollWidth, containerClientWidth));
        } else {
          // Fallback to container width if bracket content not found
          const scrollWidth = bracketContainerRef.current.scrollWidth;
          const clientWidth = bracketContainerRef.current.clientWidth;
          setContainerWidth(Math.max(scrollWidth, clientWidth));
        }
      }
    };
    
    // Delay to ensure DOM is fully rendered, use requestAnimationFrame for better timing
    const timeoutId = setTimeout(() => {
      requestAnimationFrame(updateWidth);
    }, 0);
    
    const resizeObserver = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure measurements are accurate after resize
      requestAnimationFrame(updateWidth);
    });
    if (bracketContainerRef.current) {
      resizeObserver.observe(bracketContainerRef.current);
      // Also observe the bracket content element if it exists
      const bracketContent = bracketContainerRef.current.querySelector('[data-bracket-content]') as HTMLElement;
      if (bracketContent) {
        resizeObserver.observe(bracketContent);
      }
    }
    
    // Also listen for transition end to update after zoom animation
    const handleTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName === 'transform') {
        // Use requestAnimationFrame to ensure accurate measurements after transform
        requestAnimationFrame(updateWidth);
      }
    };
    
    const bracketContentForTransition = bracketContainerRef.current?.querySelector('[data-bracket-content]') as HTMLElement;
    if (bracketContentForTransition) {
      bracketContentForTransition.addEventListener('transitionend', handleTransitionEnd);
    }
    
    // Also listen for any style changes that might affect width (like transform changes)
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updateWidth);
    });
    
    if (bracketContentForTransition) {
      mutationObserver.observe(bracketContentForTransition, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }
    
    const handleResize = () => {
      requestAnimationFrame(updateWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (bracketContentForTransition) {
        bracketContentForTransition.removeEventListener('transitionend', handleTransitionEnd);
      }
    };
  }, [bracketData]);

  // Calculate bracket size for placement labels
  // MUST be called before any early returns to follow Rules of Hooks
  const bracketSize = useMemo(() => {
    if (!matches || matches.length === 0) return 16;
    const playersInMatches = new Set(
      matches.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean))
    );
    const numPlayers = playerCount?.checkedIn || playersInMatches.size || 0;
    return Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(numPlayers, 2)))));
  }, [matches, playerCount]);

  if (!bracketData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No bracket data available. Start the tournament to generate the bracket.
      </div>
    );
  }


  if (bracketData.type === "single") {
    // Calculate header height for positioning the background overlay
    const headerHeight = 50; // Match the roundHeader.height
    const headerBackgroundColor = getCSSVariable("--muted") || (isDark ? "oklch(0.2686 0 0)" : "oklch(1.0000 0 0)");
    const headerBorderColor = getCSSVariable("--border") || (isDark ? "oklch(0.3715 0 0)" : "oklch(0.9276 0.0058 264.5313)");
    
    return (
      <>
        <div ref={bracketContainerRef} className="h-full overflow-auto bg-background relative">
          <div data-bracket-content className="inline-block min-w-full relative">
            {/* Full-width header background overlay - spans entire container width */}
            {containerWidth && (
              <div
                className={`absolute top-0 left-0 z-10 pointer-events-none w-full`}
                style={{
                  width: `${containerWidth}px`,
                  height: `${headerHeight}px`,
                  backgroundColor: headerBackgroundColor,
                  borderBottom: `1px solid ${headerBorderColor}`,
                }}
              />
            )}
            <div className="relative z-20">
              <SingleEliminationBracket
            matches={bracketData.matches}
            onMatchClick={handleMatchClick}
            theme={bracketTheme}
            options={{
              style: {
                roundHeader: {
                  isShown: true,
                  height: 50,
                  marginBottom: 25,
                  fontSize: 10,
                  fontColor: getCSSVariable("--muted-foreground") || (isDark ? "oklch(0.7155 0 0)" : "oklch(0.5510 0.0234 264.3637)"),
                  backgroundColor: getCSSVariable("--card") || (isDark ? "oklch(0.2686 0 0)" : "oklch(1.0000 0 0)"),
                  fontFamily: getCSSVariable("--font-sans") || '"Inter", "Roboto", "Arial", "Helvetica", "sans-serif"',
                  // roundTextGenerator: (currentRound, roundsTotal) => {
                  //   const roundNum = currentRound;
                  //   const placement = getPlacementLabel(roundNum, roundsTotal, bracketSize);
                  //   const bracketType = tournamentType === "double" ? "WB" : "";
                  //   if (placement) {
                  //     return `${bracketType} ROUND ${roundNum} (${placement})`;
                  //   }
                  //   return `${bracketType} ROUND ${roundNum}`;
                  // },
                },
                connectorColor: getCSSVariable("--border") || (isDark ? "oklch(0.3715 0 0)" : "oklch(0.9276 0.0058 264.5313)"),
                connectorColorHighlight: getCSSVariable("--primary") || "oklch(0.5000 0.1340 242.7490)",
                width: 240,
                boxHeight: 180,
                spaceBetweenColumns: 60,
                spaceBetweenRows: 20,
              },
            }}
            matchComponent={({ match, topParty, bottomParty, topWon, bottomWon, onMatchClick, onMouseEnter, onMouseLeave, topHovered, bottomHovered }) => {
              const isSelected = selectedMatchId === match.id;
              // Find the backend match to check status
              const backendMatch = matches?.find(m => m._id === match.id);
              const isLive = backendMatch?.status === "in_progress";
              const isCompleted = backendMatch?.status === "completed";
              const isHovered = topHovered || bottomHovered;
              
              // Format timestamp
              const formatTimestamp = (timestamp: number | null | undefined) => {
                if (!timestamp) return null;
                try {
                  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
                } catch {
                  return null;
                }
              };
              
              const timestamp = backendMatch?.completedAt 
                ? formatTimestamp(backendMatch.completedAt)
                : null;
              
              // Get loser match label - find the match number from bracket position
              const loserMatchLabel = backendMatch?.nextLooserMatchId
                ? (() => {
                    const loserMatch = matches?.find(m => m._id === backendMatch.nextLooserMatchId);
                    if (loserMatch) {
                      return `L to ${loserMatch.bracketPosition + 1}`;
                    }
                    return null;
                  })()
                : null;
              
              return (
                <div 
                  className={`
                    border border-border rounded-lg p-3 min-w-[240px] cursor-pointer transition-all relative
                    bg-card hover:bg-muted hover:border-primary/30
                    ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-muted" : ""}
                    ${isHovered ? "bg-muted border-primary/50 shadow-lg shadow-primary/10" : ""}
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    onMatchClick?.({ match, topWon, bottomWon, event: e as any });
                  }}
                  onMouseEnter={() => {
                    if (topParty.id) onMouseEnter?.(topParty.id);
                  }}
                  onMouseLeave={onMouseLeave}
                >
                  {isLive && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 font-semibold rounded"
                    >
                      LIVE
                    </Badge>
                  )}
                  {isCompleted && !isLive && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 bg-muted text-muted-foreground text-[10px] px-2 py-0.5 font-semibold rounded"
                    >
                      COMPLETED
                    </Badge>
                  )}
                  
                  <div className={`text-xs mb-2 font-medium transition-colors ${isHovered ? "text-primary" : "text-muted-foreground"}`}>
                    {match.name}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div 
                      className={`
                        flex justify-between items-center px-3 py-2 rounded-md transition-all
                        ${topWon ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" : "bg-muted/50"}
                        ${isSelected ? "bg-muted" : ""}
                        ${topHovered ? "bg-muted border border-primary/50" : ""}
                      `}
                      onMouseEnter={() => onMouseEnter?.(topParty.id)}
                      onMouseLeave={onMouseLeave}
                    >
                      <span className={`text-sm font-medium transition-colors ${
                        topHovered ? "text-primary font-semibold" : topWon ? "text-primary" : "text-foreground"
                      }`}>
                        {topParty.name || "TBD"}
                      </span>
                      {topParty.resultText && (
                        <span className={`text-sm font-bold ${
                          topWon ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {topParty.resultText}
                        </span>
                      )}
                    </div>
                    <div 
                      className={`
                        flex justify-between items-center px-3 py-2 rounded-md transition-all
                        ${bottomWon ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" : "bg-muted/50"}
                        ${isSelected ? "bg-muted" : ""}
                        ${bottomHovered ? "bg-muted border border-primary/50" : ""}
                      `}
                      onMouseEnter={() => onMouseEnter?.(bottomParty.id)}
                      onMouseLeave={onMouseLeave}
                    >
                      <span className={`text-sm font-medium transition-colors ${
                        bottomHovered ? "text-primary font-semibold" : bottomWon ? "text-primary" : "text-foreground"
                      }`}>
                        {bottomParty.name || "TBD"}
                      </span>
                      {bottomParty.resultText && (
                        <span className={`text-sm font-bold ${
                          bottomWon ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {bottomParty.resultText}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {(timestamp || loserMatchLabel) && (
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      {timestamp && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Icon icon={Clock01Icon} className="h-3 w-3" />
                          <span>{timestamp}</span>
                        </div>
                      )}
                      {loserMatchLabel && (
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {loserMatchLabel}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
            </div>
          </div>
          <BracketControls bracketContainerRef={bracketContainerRef} tournamentName={displayName} zoom={zoom} onZoomChange={onZoomChange} />
        </div>
        {tournamentId && (
          <MatchDetailModal
            open={showMatchModal}
            onOpenChange={setShowMatchModal}
            match={selectedMatch || null}
            tournamentId={tournamentId as Id<"tournaments">}
          />
        )}
      </>
    );
  }

  if (bracketData.type === "double") {
    // Calculate header height for positioning the background overlay
    const headerHeight = 50; // Match the roundHeader.height
    const headerBackgroundColor = getCSSVariable("--muted") || (isDark ? "oklch(0.2686 0 0)" : "oklch(1.0000 0 0)");
    const headerBorderColor = getCSSVariable("--border") || (isDark ? "oklch(0.3715 0 0)" : "oklch(0.9276 0.0058 264.5313)");
    
    return (
      <>
        <div ref={bracketContainerRef} className="h-full overflow-auto bg-background relative">
          <div data-bracket-content className="inline-block min-w-full relative">
            {/* Full-width header background overlay - spans entire container width */}
            {containerWidth && (
              <div
                className={`absolute top-0 left-0 z-10 pointer-events-none w-full`}
                style={{
                  width: `${containerWidth}px`,
                  height: `${headerHeight}px`,
                  backgroundColor: headerBackgroundColor,
                  borderBottom: `1px solid ${headerBorderColor}`,
                }}
              />
            )}
            <div className="relative z-20">
              <DoubleEliminationBracket
            matches={bracketData.matches}
            onMatchClick={handleMatchClick}
            theme={bracketTheme}
            options={{
              style: {
                roundHeader: {
                  isShown: true,
                  height: 50,
                  marginBottom: 25,
                  fontSize: 10,
                  fontColor: getCSSVariable("--muted-foreground") || (isDark ? "oklch(0.7155 0 0)" : "oklch(0.5510 0.0234 264.3637)"),
                  backgroundColor: getCSSVariable("--card") || (isDark ? "oklch(0.2686 0 0)" : "oklch(1.0000 0 0)"),
                  fontFamily: getCSSVariable("--font-sans") || '"Inter", "Roboto", "Arial", "Helvetica", "sans-serif"',
                  // roundTextGenerator: (currentRound, roundsTotal) => {
                  //   const roundNum = currentRound;
                  //   const placement = getPlacementLabel(roundNum, roundsTotal, bracketSize);
                  //   const bracketType = tournamentType === "double" ? "WB" : "";
                  //   if (placement) {
                  //     return `${bracketType} ROUND ${roundNum} (${placement})`;
                  //   }
                  //   return `${bracketType} ROUND ${roundNum}`;
                  // },
                },
                connectorColor: getCSSVariable("--border") || (isDark ? "oklch(0.3715 0 0)" : "oklch(0.9276 0.0058 264.5313)"),
                connectorColorHighlight: getCSSVariable("--primary") || "oklch(0.5000 0.1340 242.7490)",
                width: 240,
                boxHeight: 180,
                spaceBetweenColumns: 60,
                spaceBetweenRows: 20,
              },
            }}
            matchComponent={({ match, topParty, bottomParty, topWon, bottomWon, onMatchClick, onMouseEnter, onMouseLeave, topHovered, bottomHovered }) => {
              const isSelected = selectedMatchId === match.id;
              // Find the backend match to check status
              const backendMatch = matches?.find(m => m._id === match.id);
              const isLive = backendMatch?.status === "in_progress";
              const isCompleted = backendMatch?.status === "completed";
              const isHovered = topHovered || bottomHovered;
              
              // Format timestamp
              const formatTimestamp = (timestamp: number | null | undefined) => {
                if (!timestamp) return null;
                try {
                  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
                } catch {
                  return null;
                }
              };
              
              const timestamp = backendMatch?.completedAt 
                ? formatTimestamp(backendMatch.completedAt)
                : null;
              
              // Get loser match label
              const loserMatchLabel = backendMatch?.nextLooserMatchId
                ? (() => {
                    const loserMatch = matches?.find(m => m._id === backendMatch.nextLooserMatchId);
                    if (loserMatch) {
                      return `L to ${loserMatch.bracketPosition + 1}`;
                    }
                    return null;
                  })()
                : null;
              
              return (
                <div 
                  className={`
                    border border-border rounded-lg p-3 min-w-[240px] cursor-pointer transition-all relative
                    bg-card hover:bg-muted hover:border-primary/30
                    ${isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-muted" : ""}
                    ${isHovered ? "bg-muted border-primary/50 shadow-lg shadow-primary/10" : ""}
                  `}
                  onClick={(e) => {
                    e.preventDefault();
                    onMatchClick?.({ match, topWon, bottomWon, event: e as any });
                  }}
                  onMouseEnter={() => {
                    if (topParty.id) onMouseEnter?.(topParty.id);
                  }}
                  onMouseLeave={onMouseLeave}
                >
                  {isLive && (
                    <Badge 
                      variant="destructive" 
                      className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 font-semibold rounded"
                    >
                      LIVE
                    </Badge>
                  )}
                  {isCompleted && !isLive && (
                    <Badge 
                      variant="secondary" 
                      className="absolute top-2 right-2 bg-muted text-muted-foreground text-[10px] px-2 py-0.5 font-semibold rounded"
                    >
                      COMPLETED
                    </Badge>
                  )}
                  
                  <div className={`text-xs mb-2 font-medium transition-colors ${isHovered ? "text-primary" : "text-muted-foreground"}`}>
                    {match.name}
                  </div>
                  
                  <div className="space-y-1.5">
                    <div 
                      className={`
                        flex justify-between items-center px-3 py-2 rounded-md transition-all
                        ${topWon ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" : "bg-muted/50"}
                        ${isSelected ? "bg-muted" : ""}
                        ${topHovered ? "bg-muted border border-primary/50" : ""}
                      `}
                      onMouseEnter={() => onMouseEnter?.(topParty.id)}
                      onMouseLeave={onMouseLeave}
                    >
                      <span className={`text-sm font-medium transition-colors ${
                        topHovered ? "text-primary font-semibold" : topWon ? "text-primary" : "text-foreground"
                      }`}>
                        {topParty.name || "TBD"}
                      </span>
                      {topParty.resultText && (
                        <span className={`text-sm font-bold ${
                          topWon ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {topParty.resultText}
                        </span>
                      )}
                    </div>
                    <div 
                      className={`
                        flex justify-between items-center px-3 py-2 rounded-md transition-all
                        ${bottomWon ? "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" : "bg-muted/50"}
                        ${isSelected ? "bg-muted" : ""}
                        ${bottomHovered ? "bg-muted border border-primary/50" : ""}
                      `}
                      onMouseEnter={() => onMouseEnter?.(bottomParty.id)}
                      onMouseLeave={onMouseLeave}
                    >
                      <span className={`text-sm font-medium transition-colors ${
                        bottomHovered ? "text-primary font-semibold" : bottomWon ? "text-primary" : "text-foreground"
                      }`}>
                        {bottomParty.name || "TBD"}
                      </span>
                      {bottomParty.resultText && (
                        <span className={`text-sm font-bold ${
                          bottomWon ? "text-primary" : "text-muted-foreground"
                        }`}>
                          {bottomParty.resultText}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {(timestamp || loserMatchLabel) && (
                    <div className="mt-2 pt-2 border-t border-border space-y-1">
                      {timestamp && (
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <Icon icon={Clock01Icon} className="h-3 w-3" />
                          <span>{timestamp}</span>
                        </div>
                      )}
                      {loserMatchLabel && (
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {loserMatchLabel}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }}
          />
            </div>
          </div>
          <BracketControls bracketContainerRef={bracketContainerRef} tournamentName={displayName} zoom={zoom} onZoomChange={onZoomChange} />
        </div>
        {tournamentId && (
          <MatchDetailModal
            open={showMatchModal}
            onOpenChange={setShowMatchModal}
            match={selectedMatch || null}
            tournamentId={tournamentId as Id<"tournaments">}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Bracket view not available for this tournament type.
      </div>
      {tournamentId && (
        <MatchDetailModal
          open={showMatchModal}
          onOpenChange={setShowMatchModal}
          match={selectedMatch || null}
          tournamentId={tournamentId as Id<"tournaments">}
        />
      )}
    </>
  );
}


