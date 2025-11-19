import { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useThemeColor } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { opacity, withOpacity } from "@/lib/opacity";
import { MatchDetailModal } from "./match-detail-modal";
import { Pressable } from "react-native";
import Svg, { G, Line, Text as SvgText, Rect } from "react-native-svg";

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
  tournamentId: Id<"tournaments">;
};

type MatchData = {
  id: string;
  round: number;
  position: number;
  player1?: { name: string; id: string; score: number; isWinner: boolean } | null;
  player2?: { name: string; id: string; score: number; isWinner: boolean } | null;
  status: "pending" | "in_progress" | "completed";
  nextMatchId?: string | null;
  bracketType?: "winner" | "loser" | "grand_final" | null;
  x?: number;
  y?: number;
};

export function TournamentBracket({ matches, tournamentType, tournamentId }: TournamentBracketProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const themeColorForeground = useThemeColor("foreground") || "#000000";
  const themeColorBackground = useThemeColor("background") || "#FFFFFF";
  const accentColor = useThemeColor("accent") || "#007AFF";
  const mutedColor = useThemeColor("muted") || "#F5F5F5";
  const primaryColor = accentColor;

  const playerCount = useQuery(
    api.tournaments.getPlayerCount,
    { tournamentId }
  );

  const selectedMatch = useMemo(() => {
    if (!selectedMatchId || !matches) return null;
    return matches.find(m => m._id === selectedMatchId);
  }, [selectedMatchId, matches]);

  const bracketData = useMemo(() => {
    if (!matches || matches.length === 0) {
      return null;
    }

    // Calculate bracket size
    const playersInMatches = new Set(
      matches.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean))
    );
    const numPlayers = playerCount?.checkedIn || playersInMatches.size || 0;
    const bracketSize = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(numPlayers, 2)))));
    const maxFirstRoundMatches = bracketSize / 2;

    const matchIdMap = new Map<string, BackendMatch>();
    matches.forEach(m => matchIdMap.set(m._id, m));

    const transformMatch = (match: BackendMatch): MatchData => {
      const player1 = match.player1 ? {
        name: match.player1.name || "",
        id: match.player1._id,
        score: match.player1Score,
        isWinner: match.winnerId === match.player1Id && match.status === "completed"
      } : null;

      const player2 = match.player2 ? {
        name: match.player2.name || "",
        id: match.player2._id,
        score: match.player2Score,
        isWinner: match.winnerId === match.player2Id && match.status === "completed"
      } : null;

      return {
        id: match._id,
        round: match.round,
        position: match.bracketPosition,
        player1,
        player2,
        status: match.status,
        nextMatchId: match.nextMatchId || null,
        bracketType: match.bracketType || null,
      };
    };

    if (tournamentType === "single") {
      let filteredMatches = matches.filter(m => !m.bracketType || m.bracketType === "winner");
      
      const round1Matches = filteredMatches.filter(m => m.round === 1);
      const otherRoundMatches = filteredMatches.filter(m => m.round !== 1);
      
      let filteredRound1Matches = round1Matches.filter(m => m.bracketPosition < maxFirstRoundMatches);
      filteredRound1Matches.sort((a, b) => a.bracketPosition - b.bracketPosition);
      
      const expectedMatchesPerRound: Record<number, number> = {};
      let currentRoundMatches = maxFirstRoundMatches;
      let round = 2;
      while (currentRoundMatches > 1) {
        const matchesInRound = Math.floor(currentRoundMatches / 2);
        expectedMatchesPerRound[round] = matchesInRound;
        currentRoundMatches = matchesInRound;
        round++;
      }
      
      const filteredOtherRounds = otherRoundMatches.filter(match => {
        const expectedCount = expectedMatchesPerRound[match.round];
        if (expectedCount !== undefined) {
          return match.bracketPosition < expectedCount;
        }
        return true;
      });
      
      filteredMatches = [...filteredRound1Matches, ...filteredOtherRounds];
      
      const maxRound = Math.max(...filteredMatches.map(m => m.round));
      
      const matchesWithFixedLinks = filteredMatches.map(match => {
        if (!match.nextMatchId && match.round < maxRound) {
          const nextRound = match.round + 1;
          const nextRoundMatches = filteredMatches.filter(m => m.round === nextRound);
          
          if (nextRoundMatches.length === 0) {
            return match;
          }
          
          const nextPosition = Math.floor(match.bracketPosition / 2);
          let nextMatch = nextRoundMatches.find(m => m.bracketPosition === nextPosition);
          
          if (!nextMatch && nextRoundMatches.length > 0) {
            const sortedNextMatches = [...nextRoundMatches].sort((a, b) => a.bracketPosition - b.bracketPosition);
            
            if (nextPosition >= sortedNextMatches.length) {
              nextMatch = sortedNextMatches[sortedNextMatches.length - 1];
            } else {
              nextMatch = sortedNextMatches.find(m => m.bracketPosition >= nextPosition) || sortedNextMatches[sortedNextMatches.length - 1];
            }
          }
          
          if (nextMatch) {
            return { ...match, nextMatchId: nextMatch._id };
          }
        }
        return match;
      });
      
      const bracketMatches = matchesWithFixedLinks.map(transformMatch);
      
      // Calculate positions for bracket layout
      const matchWidth = 200;
      const matchHeight = 80;
      const roundSpacing = 250;
      const matchSpacing = 100;
      
      const rounds: Record<number, MatchData[]> = {};
      bracketMatches.forEach(match => {
        if (!rounds[match.round]) {
          rounds[match.round] = [];
        }
        rounds[match.round].push(match);
      });
      
      // Calculate x, y positions
      Object.keys(rounds).forEach(roundKey => {
        const round = parseInt(roundKey);
        const roundMatches = rounds[round];
        const maxMatchesInRound = Math.max(...Object.values(rounds).map(r => r.length));
        const totalHeight = maxMatchesInRound * matchSpacing;
        
        roundMatches.forEach((match, index) => {
          const x = (round - 1) * roundSpacing + 50;
          const y = (index * matchSpacing) + (totalHeight - roundMatches.length * matchSpacing) / 2 + 50;
          match.x = x;
          match.y = y;
        });
      });
      
      return { type: "single" as const, matches: bracketMatches, rounds };
    } else if (tournamentType === "double") {
      const upperMatches = matches
        .filter(m => m.bracketType === "winner")
        .map(transformMatch)
        .sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.position - b.position;
        });

      const lowerMatches = matches
        .filter(m => m.bracketType === "loser")
        .map(transformMatch)
        .sort((a, b) => {
          if (a.round !== b.round) return a.round - b.round;
          return a.position - b.position;
        });

      const grandFinalMatches = matches
        .filter(m => m.bracketType === "grand_final")
        .map(transformMatch);

      const allLowerMatches = [...lowerMatches, ...grandFinalMatches];
      
      // Group by round
      const upperRounds: Record<number, MatchData[]> = {};
      upperMatches.forEach(match => {
        if (!upperRounds[match.round]) {
          upperRounds[match.round] = [];
        }
        upperRounds[match.round].push(match);
      });

      const lowerRounds: Record<number, MatchData[]> = {};
      allLowerMatches.forEach(match => {
        if (!lowerRounds[match.round]) {
          lowerRounds[match.round] = [];
        }
        lowerRounds[match.round].push(match);
      });

      return { type: "double" as const, upperRounds, lowerRounds };
    }

    return null;
  }, [matches, tournamentType, playerCount]);

  const handleMatchPress = (matchId: string) => {
    setSelectedMatchId(matchId);
    setShowMatchModal(true);
  };

  const renderMatch = (match: MatchData, isHovered = false) => {
    const isLive = match.status === "in_progress";
    const isSelected = selectedMatchId === match.id;
    
    return (
      <Pressable
        key={match.id}
        onPress={() => handleMatchPress(match.id)}
        style={[
          styles.matchContainer,
          {
            backgroundColor: isSelected 
              ? withOpacity(primaryColor, opacity.OPACITY_10)
              : isHovered
              ? withOpacity(primaryColor, opacity.OPACITY_10)
              : themeColorBackground,
            borderColor: isSelected
              ? primaryColor
              : isHovered
              ? withOpacity(primaryColor, opacity.OPACITY_40)
              : withOpacity(themeColorForeground, opacity.OPACITY_20),
            borderWidth: isSelected ? 2 : 1,
          }
        ]}
      >
        {isLive && (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        )}
        <View style={styles.playersContainer}>
          <View style={[
            styles.playerRow,
            match.player1?.isWinner && { backgroundColor: withOpacity("#10b981", opacity.OPACITY_20) }
          ]}>
            <Text style={[
              styles.playerName,
              { color: themeColorForeground },
              match.player1?.isWinner && { fontWeight: "bold", color: "#10b981" }
            ]}>
              {match.player1?.name || "TBD"}
            </Text>
            {match.player1 && match.status !== "pending" && (
              <Text style={[
                styles.playerScore,
                { color: themeColorForeground },
                match.player1.isWinner && { fontWeight: "bold", color: "#10b981" }
              ]}>
                {match.player1.score}
              </Text>
            )}
          </View>
          <View style={[
            styles.playerRow,
            match.player2?.isWinner && { backgroundColor: withOpacity("#10b981", opacity.OPACITY_20) }
          ]}>
            <Text style={[
              styles.playerName,
              { color: themeColorForeground },
              match.player2?.isWinner && { fontWeight: "bold", color: "#10b981" }
            ]}>
              {match.player2?.name || "TBD"}
            </Text>
            {match.player2 && match.status !== "pending" && (
              <Text style={[
                styles.playerScore,
                { color: themeColorForeground },
                match.player2.isWinner && { fontWeight: "bold", color: "#10b981" }
              ]}>
                {match.player2.score}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    );
  };

  const renderRound = (roundNumber: number, roundMatches: MatchData[], title: string) => {
    return (
      <View key={roundNumber} style={styles.roundContainer}>
        <Text style={[styles.roundTitle, { color: themeColorForeground }]}>
          {title} - Round {roundNumber}
        </Text>
        <View style={styles.matchesContainer}>
          {roundMatches.map(match => renderMatch(match))}
        </View>
      </View>
    );
  };

  if (!bracketData) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: themeColorBackground }]}>
        <Ionicons name="git-network-outline" size={48} color={withOpacity(themeColorForeground, opacity.OPACITY_40)} />
        <Text style={[styles.emptyText, { color: withOpacity(themeColorForeground, opacity.OPACITY_60) }]}>
          No bracket data available. Start the tournament to generate the bracket.
        </Text>
      </View>
    );
  }

  if (bracketData.type === "single") {
    const roundNumbers = Object.keys(bracketData.rounds).map(Number).sort((a, b) => a - b);
    
    return (
      <>
        <ScrollView 
          style={{ flex: 1, backgroundColor: themeColorBackground }}
          contentContainerStyle={styles.scrollContent}
          horizontal
          showsHorizontalScrollIndicator={true}
        >
          {roundNumbers.map(roundNum => 
            renderRound(roundNum, bracketData.rounds[roundNum], "Winner")
          )}
        </ScrollView>
        {selectedMatch && (
          <MatchDetailModal
            visible={showMatchModal}
            onClose={() => setShowMatchModal(false)}
            match={selectedMatch}
            tournamentId={tournamentId}
          />
        )}
      </>
    );
  }

  if (bracketData.type === "double") {
    const upperRoundNumbers = Object.keys(bracketData.upperRounds).map(Number).sort((a, b) => a - b);
    const lowerRoundNumbers = Object.keys(bracketData.lowerRounds).map(Number).sort((a, b) => a - b);
    
    return (
      <>
        <ScrollView 
          style={{ flex: 1, backgroundColor: themeColorBackground }}
          contentContainerStyle={styles.scrollContent}
          horizontal
          showsHorizontalScrollIndicator={true}
        >
          {/* Upper Bracket */}
          <View style={styles.bracketSection}>
            <Text style={[styles.sectionTitle, { color: themeColorForeground }]}>Upper Bracket</Text>
            {upperRoundNumbers.map(roundNum => 
              renderRound(roundNum, bracketData.upperRounds[roundNum], "Upper")
            )}
          </View>
          
          {/* Lower Bracket */}
          <View style={styles.bracketSection}>
            <Text style={[styles.sectionTitle, { color: themeColorForeground }]}>Lower Bracket</Text>
            {lowerRoundNumbers.map(roundNum => 
              renderRound(roundNum, bracketData.lowerRounds[roundNum], "Lower")
            )}
          </View>
        </ScrollView>
        {selectedMatch && (
          <MatchDetailModal
            visible={showMatchModal}
            onClose={() => setShowMatchModal(false)}
            match={selectedMatch}
            tournamentId={tournamentId}
          />
        )}
      </>
    );
  }

  return (
    <View style={[styles.emptyContainer, { backgroundColor: themeColorBackground }]}>
      <Text style={[styles.emptyText, { color: withOpacity(themeColorForeground, opacity.OPACITY_60) }]}>
        Bracket view not available for this tournament type.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 14,
  },
  bracketSection: {
    marginRight: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    marginTop: 8,
  },
  roundContainer: {
    marginRight: 24,
    minWidth: 200,
  },
  roundTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  matchesContainer: {
    gap: 12,
  },
  matchContainer: {
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    position: "relative",
    minWidth: 180,
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ef4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
  },
  matchLabel: {
    fontSize: 11,
    marginBottom: 8,
  },
  playersContainer: {
    gap: 6,
  },
  playerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  playerName: {
    fontSize: 14,
    flex: 1,
  },
  playerScore: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
