import { useMemo } from "react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rackd/ui/components/table";
import { Badge } from "@rackd/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Trophy, TrendingUp, Target, Award, BarChart3 } from "lucide-react";

type Match = {
  _id: Id<"matches">;
  tournamentId: Id<"tournaments">;
  round: number;
  bracketPosition: number;
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

type PlayerStatsProps = {
  tournamentId: Id<"tournaments">;
  matches: Match[] | undefined;
};

type PlayerStat = {
  playerId: Id<"players">;
  playerName: string;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  totalPointsScored: number;
  totalPointsAllowed: number;
  averageScore: number;
  averageAllowed: number;
  pointDifferential: number;
  finalRound: number;
  isChampion: boolean;
  highestScore: number;
  largestMargin: number;
  matchesByRound: Record<number, { wins: number; losses: number }>;
};

export function PlayerStats({ matches }: PlayerStatsProps) {
  const playerStats = useMemo(() => {
    if (!matches) return [];

    const statsMap = new Map<Id<"players">, PlayerStat>();

    // Process all completed matches
    matches.filter(m => m.status === "completed").forEach(match => {
      // Process player 1
      if (match.player1Id) {
        const existing = statsMap.get(match.player1Id) || {
          playerId: match.player1Id,
          playerName: match.player1?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          totalPointsScored: 0,
          totalPointsAllowed: 0,
          averageScore: 0,
          averageAllowed: 0,
          pointDifferential: 0,
          finalRound: 0,
          isChampion: false,
          highestScore: 0,
          largestMargin: 0,
          matchesByRound: {},
        };

        existing.totalMatches++;
        existing.totalPointsScored += match.player1Score;
        existing.totalPointsAllowed += match.player2Score;
        existing.highestScore = Math.max(existing.highestScore, match.player1Score);
        
        const margin = Math.abs(match.player1Score - match.player2Score);
        existing.largestMargin = Math.max(existing.largestMargin, margin);

        if (match.winnerId === match.player1Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }

        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 
          ? Math.round((existing.wins / existing.totalMatches) * 100) 
          : 0;
        existing.averageScore = existing.totalMatches > 0
          ? Math.round((existing.totalPointsScored / existing.totalMatches) * 10) / 10
          : 0;
        existing.averageAllowed = existing.totalMatches > 0
          ? Math.round((existing.totalPointsAllowed / existing.totalMatches) * 10) / 10
          : 0;
        existing.pointDifferential = existing.totalPointsScored - existing.totalPointsAllowed;

        // Track matches by round
        if (!existing.matchesByRound[match.round]) {
          existing.matchesByRound[match.round] = { wins: 0, losses: 0 };
        }
        if (match.winnerId === match.player1Id) {
          existing.matchesByRound[match.round].wins++;
        } else {
          existing.matchesByRound[match.round].losses++;
        }

        statsMap.set(match.player1Id, existing);
      }

      // Process player 2
      if (match.player2Id) {
        const existing = statsMap.get(match.player2Id) || {
          playerId: match.player2Id,
          playerName: match.player2?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          totalPointsScored: 0,
          totalPointsAllowed: 0,
          averageScore: 0,
          averageAllowed: 0,
          pointDifferential: 0,
          finalRound: 0,
          isChampion: false,
          highestScore: 0,
          largestMargin: 0,
          matchesByRound: {},
        };

        existing.totalMatches++;
        existing.totalPointsScored += match.player2Score;
        existing.totalPointsAllowed += match.player1Score;
        existing.highestScore = Math.max(existing.highestScore, match.player2Score);
        
        const margin = Math.abs(match.player2Score - match.player1Score);
        existing.largestMargin = Math.max(existing.largestMargin, margin);

        if (match.winnerId === match.player2Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }

        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 
          ? Math.round((existing.wins / existing.totalMatches) * 100) 
          : 0;
        existing.averageScore = existing.totalMatches > 0
          ? Math.round((existing.totalPointsScored / existing.totalMatches) * 10) / 10
          : 0;
        existing.averageAllowed = existing.totalMatches > 0
          ? Math.round((existing.totalPointsAllowed / existing.totalMatches) * 10) / 10
          : 0;
        existing.pointDifferential = existing.totalPointsScored - existing.totalPointsAllowed;

        // Track matches by round
        if (!existing.matchesByRound[match.round]) {
          existing.matchesByRound[match.round] = { wins: 0, losses: 0 };
        }
        if (match.winnerId === match.player2Id) {
          existing.matchesByRound[match.round].wins++;
        } else {
          existing.matchesByRound[match.round].losses++;
        }

        statsMap.set(match.player2Id, existing);
      }
    });

    // Find champion
    const maxRound = Math.max(...Array.from(statsMap.values()).map(r => r.finalRound), 0);
    const finalRoundMatches = matches.filter(m => 
      m.status === "completed" && m.round === maxRound
    );

    finalRoundMatches.forEach(match => {
      if (match.winnerId) {
        const stat = statsMap.get(match.winnerId);
        if (stat) {
          stat.isChampion = true;
        }
      }
    });

    // Sort by: champion first, then by win rate, then by point differential
    return Array.from(statsMap.values()).sort((a, b) => {
      if (a.isChampion && !b.isChampion) return -1;
      if (!a.isChampion && b.isChampion) return 1;
      if (a.winRate !== b.winRate) return b.winRate - a.winRate;
      return b.pointDifferential - a.pointDifferential;
    });
  }, [matches]);

  const topPerformers = useMemo(() => {
    if (playerStats.length === 0) return null;

    const topWinRate = [...playerStats].sort((a, b) => b.winRate - a.winRate)[0];
    const topScorer = [...playerStats].sort((a, b) => b.averageScore - a.averageScore)[0];
    const topDefense = [...playerStats].sort((a, b) => a.averageAllowed - b.averageAllowed)[0];
    const topMargin = [...playerStats].sort((a, b) => b.largestMargin - a.largestMargin)[0];

    return { topWinRate, topScorer, topDefense, topMargin };
  }, [playerStats]);

  if (!matches) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading stats...
      </div>
    );
  }

  if (playerStats.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No stats available yet. Complete some matches to see statistics.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 space-y-6">
      {/* Top Performers Cards */}
      {topPerformers && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Best Win Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers.topWinRate.playerName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {topPerformers.topWinRate.winRate}% ({topPerformers.topWinRate.wins}-{topPerformers.topWinRate.losses})
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Top Scorer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers.topScorer.playerName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {topPerformers.topScorer.averageScore} avg points
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-green-500" />
                Best Defense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers.topDefense.playerName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {topPerformers.topDefense.averageAllowed} avg allowed
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                Largest Margin
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{topPerformers.topMargin.playerName}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Won by {topPerformers.topMargin.largestMargin} points
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Player Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">Avg Score</TableHead>
                  <TableHead className="text-right">Avg Allowed</TableHead>
                  <TableHead className="text-right">Point Diff</TableHead>
                  <TableHead className="text-right">High Score</TableHead>
                  <TableHead className="text-right">Largest Margin</TableHead>
                  <TableHead className="text-right">Final Round</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerStats.map((stat) => (
                  <TableRow key={stat.playerId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={stat.isChampion ? "font-bold text-yellow-500" : "font-medium"}>
                          {stat.playerName}
                        </span>
                        {stat.isChampion && (
                          <Badge variant="outline" className="text-xs">Champion</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{stat.wins}</TableCell>
                    <TableCell className="text-right">{stat.losses}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={stat.winRate >= 50 ? "default" : "secondary"}>
                        {stat.winRate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{stat.averageScore}</TableCell>
                    <TableCell className="text-right">{stat.averageAllowed}</TableCell>
                    <TableCell className="text-right">
                      <span className={stat.pointDifferential >= 0 ? "text-green-600 font-medium" : "text-red-600"}>
                        {stat.pointDifferential >= 0 ? "+" : ""}{stat.pointDifferential}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{stat.highestScore}</TableCell>
                    <TableCell className="text-right">{stat.largestMargin}</TableCell>
                    <TableCell className="text-right">R{stat.finalRound}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}






