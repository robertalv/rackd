import { useMemo } from "react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rackd/ui/components/table";
import { Badge } from "@rackd/ui/components/badge";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Trophy, Medal, Award } from "lucide-react";
import { formatDate } from "@/lib/tournament-utils";

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

type ResultsTableProps = {
  tournamentId: Id<"tournaments">;
  matches: Match[] | undefined;
};

type PlayerResult = {
  playerId: Id<"players">;
  playerName: string;
  wins: number;
  losses: number;
  totalMatches: number;
  winRate: number;
  finalRound: number;
  isChampion: boolean;
};

export function ResultsTable({ matches }: ResultsTableProps) {

  const completedMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter(m => m.status === "completed").sort((a, b) => {
      // Sort by completion time (most recent first)
      const timeA = a.completedAt || 0;
      const timeB = b.completedAt || 0;
      return timeB - timeA;
    });
  }, [matches]);

  const playerResults = useMemo(() => {
    if (!matches) return [];

    const resultsMap = new Map<Id<"players">, PlayerResult>();

    // Process all completed matches
    matches.filter(m => m.status === "completed").forEach(match => {
      // Process player 1
      if (match.player1Id) {
        const existing = resultsMap.get(match.player1Id) || {
          playerId: match.player1Id,
          playerName: match.player1?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          finalRound: 0,
          isChampion: false,
        };

        existing.totalMatches++;
        if (match.winnerId === match.player1Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }
        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 
          ? Math.round((existing.wins / existing.totalMatches) * 100) 
          : 0;

        resultsMap.set(match.player1Id, existing);
      }

      // Process player 2
      if (match.player2Id) {
        const existing = resultsMap.get(match.player2Id) || {
          playerId: match.player2Id,
          playerName: match.player2?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          finalRound: 0,
          isChampion: false,
        };

        existing.totalMatches++;
        if (match.winnerId === match.player2Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }
        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 
          ? Math.round((existing.wins / existing.totalMatches) * 100) 
          : 0;

        resultsMap.set(match.player2Id, existing);
      }
    });

    // Find champion (player who won the final round)
    const maxRound = Math.max(...Array.from(resultsMap.values()).map(r => r.finalRound), 0);
    const finalRoundMatches = matches.filter(m => 
      m.status === "completed" && m.round === maxRound
    );

    finalRoundMatches.forEach(match => {
      if (match.winnerId) {
        const result = resultsMap.get(match.winnerId);
        if (result) {
          result.isChampion = true;
        }
      }
    });

    // Sort by: champion first, then by final round (desc), then by win rate (desc)
    return Array.from(resultsMap.values()).sort((a, b) => {
      if (a.isChampion && !b.isChampion) return -1;
      if (!a.isChampion && b.isChampion) return 1;
      if (a.finalRound !== b.finalRound) return b.finalRound - a.finalRound;
      if (a.winRate !== b.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
  }, [matches]);

  const getPlaceIcon = (index: number) => {
    if (index === 0) {
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    } else if (index === 1) {
      return <Medal className="h-5 w-5 text-gray-400" />;
    } else if (index === 2) {
      return <Award className="h-5 w-5 text-amber-600" />;
    }
    return null;
  };

  const getPlaceBadge = (index: number) => {
    if (index === 0) return <Badge className="bg-yellow-500">1st</Badge>;
    if (index === 1) return <Badge className="bg-gray-400">2nd</Badge>;
    if (index === 2) return <Badge className="bg-amber-600">3rd</Badge>;
    return <span className="text-muted-foreground">{index + 1}</span>;
  };

  if (!matches) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading results...
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Stats Summary */}
      <div className="border-b p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold">{completedMatches.length}</div>
            <div className="text-sm text-muted-foreground">Matches Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{playerResults.length}</div>
            <div className="text-sm text-muted-foreground">Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {playerResults.filter(p => p.isChampion).length > 0 ? playerResults[0].playerName : "-"}
            </div>
            <div className="text-sm text-muted-foreground">Champion</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {playerResults.length > 0 
                ? Math.round(playerResults.reduce((sum, p) => sum + p.winRate, 0) / playerResults.length)
                : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Avg Win Rate</div>
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 p-4 min-h-0 overflow-hidden">
        {/* Standings */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Standings</h3>
          <ScrollArea className="flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Place</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead className="text-right">W</TableHead>
                  <TableHead className="text-right">L</TableHead>
                  <TableHead className="text-right">Win %</TableHead>
                  <TableHead className="text-right">Round</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playerResults.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No results yet
                    </TableCell>
                  </TableRow>
                ) : (
                  playerResults.map((result, index) => (
                    <TableRow key={result.playerId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPlaceIcon(index)}
                          {getPlaceBadge(index)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={result.isChampion ? "font-bold text-yellow-500" : "font-medium"}>
                            {result.playerName}
                          </span>
                          {result.isChampion && (
                            <Badge variant="outline" className="text-xs">Champion</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{result.wins}</TableCell>
                      <TableCell className="text-right">{result.losses}</TableCell>
                      <TableCell className="text-right">{result.winRate}%</TableCell>
                      <TableCell className="text-right">R{result.finalRound}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        {/* Recent Matches */}
        <div className="flex flex-col min-h-0">
          <h3 className="text-lg font-semibold mb-4 flex-shrink-0">Recent Matches</h3>
          <ScrollArea className="flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Round</TableHead>
                  <TableHead>Match</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedMatches.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No completed matches yet
                    </TableCell>
                  </TableRow>
                ) : (
                  completedMatches.slice(0, 20).map((match) => {
                    const bracketLabel = match.bracketType === "loser" ? "L" : 
                                       match.bracketType === "grand_final" ? "GF" : "W";
                    const matchLabel = bracketLabel 
                      ? `${bracketLabel}${match.round}-${match.bracketPosition + 1}`
                      : `R${match.round}-${match.bracketPosition + 1}`;

                    return (
                      <TableRow key={match._id}>
                        <TableCell>{match.round}</TableCell>
                        <TableCell className="font-medium">{matchLabel}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className={match.winnerId === match.player1Id ? "font-bold text-green-600" : ""}>
                              {match.player1?.name || "TBD"} {match.player1Score}
                            </div>
                            <div className={match.winnerId === match.player2Id ? "font-bold text-green-600" : ""}>
                              {match.player2?.name || "TBD"} {match.player2Score}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {match.completedAt ? formatDate(match.completedAt) : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

