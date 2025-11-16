import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Badge } from "@rackd/ui/components/badge";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Button } from "@rackd/ui/components/button";
import { MatchDetailModal } from "./match-detail-modal";
import { CheckCircle2 } from "lucide-react";
import { HeaderLabel } from "@rackd/ui/components/label";

interface TournamentStatsProps {
  tournamentId: Id<"tournaments">;
}

type MatchTab = "pending" | "onDeck" | "completed";

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
  tableNumber?: number | null;
  completedAt?: number | null;
};

export function TournamentStats({ tournamentId }: TournamentStatsProps) {
  const [activeTab, setActiveTab] = useState<MatchTab>("pending");
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);

  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const tables = useQuery(api.tournaments.getTables, { tournamentId });
  const registrations = useQuery(api.tournaments.getRegistrations, { tournamentId });
  const playerCount = useQuery(api.tournaments.getPlayerCount, { tournamentId });

  if (!tournament) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const allMatches = matches || [];
  
  // Match Statistics
  const completedMatches = allMatches.filter(m => {
    if (m.status !== "completed") return false;
    if (!m.player1Id && !m.player2Id) return true;
    return !!m.winnerId;
  });
  const inProgressMatches = allMatches.filter(m => m.status === "in_progress");
  const pendingMatches = allMatches.filter(m => m.status === "pending");
  const totalMatches = allMatches.length;
  
  // Bracket Type Statistics
  const winnersSideMatches = allMatches.filter(m => m.bracketType === "winner");
  const losersSideMatches = allMatches.filter(m => m.bracketType === "loser");
  
  const completedMatchIds = new Set(completedMatches.map(m => m._id));
  const inProgressMatchIds = new Set(inProgressMatches.map(m => m._id));
  
  const winnersSideCompleted = winnersSideMatches.filter(m => completedMatchIds.has(m._id)).length;
  const losersSideCompleted = losersSideMatches.filter(m => completedMatchIds.has(m._id)).length;
  const winnersSideInProgress = winnersSideMatches.filter(m => inProgressMatchIds.has(m._id)).length;
  const losersSideInProgress = losersSideMatches.filter(m => inProgressMatchIds.has(m._id)).length;
  
  // Table Statistics
  const allTables = tables || [];
  const openTables = allTables.filter(t => t.status === "OPEN").length;
  const closedTables = allTables.filter(t => t.status === "CLOSED").length;
  const tablesInUse = allTables.filter(t => t.status === "IN_USE").length;
  const assignedTables = allTables.filter(t => {
    const tableNum = (t as any).tableNumber ?? (t as any).startNumber;
    return tableNum && inProgressMatches.some(m => m.tableNumber === tableNum);
  }).length;
  
  // Player Statistics
  const totalPlayers = registrations?.length || 0;
  const checkedInPlayers = registrations?.filter(r => r.checkedIn).length || 0;
  const playersInBracket = new Set(
    allMatches.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean))
  ).size;
  
  // Time Statistics
  const completedMatchesWithTime = completedMatches.filter(m => m.completedAt);
  const averageMatchDuration = completedMatchesWithTime.length > 0
    ? completedMatchesWithTime.reduce((acc, m, idx, arr) => {
        if (idx === 0) return 0;
        const prev = arr[idx - 1];
        if (prev.completedAt && m.completedAt) {
          return acc + (m.completedAt - prev.completedAt);
        }
        return acc;
      }, 0) / Math.max(completedMatchesWithTime.length - 1, 1)
    : 0;
  
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  // Filter matches for each tab
  const pendingMatchesList = useMemo(() => {
    return allMatches.filter(m => m.status === "in_progress");
  }, [allMatches]);

  const onDeckMatches = useMemo(() => {
    // Matches that are pending and can be played (all prerequisites are met)
    return allMatches.filter(m => m.status === "pending");
  }, [allMatches]);

  const completedMatchesList = useMemo(() => {
    return allMatches.filter(m => {
      if (m.status !== "completed") return false;
      if (!m.player1Id && !m.player2Id) return true;
      return !!m.winnerId;
    }).sort((a, b) => {
      const timeA = a.completedAt || 0;
      const timeB = b.completedAt || 0;
      return timeB - timeA; // Most recent first
    });
  }, [allMatches]);

  const getMatchName = (match: Match) => {
    const bracketTypeLabel = match.bracketType === "loser" ? "L" : match.bracketType === "grand_final" ? "GF" : "W";
    return `Match ${match.bracketPosition + 1} (${bracketTypeLabel}${match.round}-${match.bracketPosition + 1})`;
  };

  const handleMatchClick = (match: Match) => {
    if (activeTab === "onDeck") {
      setSelectedMatch(match);
      setShowMatchModal(true);
    }
  };

  return (
    <ScrollArea className="flex-1 min-h-0 h-full">
      <div className="p-4 space-y-4">
        {/* Compact Stats - Two Column Layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Matches Column */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <HeaderLabel size="lg">Matches</HeaderLabel>
              <span className="text-sm font-medium">({totalMatches})</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winners Side</span>
                <span className="font-medium">{winnersSideMatches.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Losers Side</span>
                <span className="font-medium">{losersSideMatches.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Progress</span>
                <span className="font-medium">{inProgressMatches.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Not Started</span>
                <span className="font-medium">{pendingMatches.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Scheduled</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span className="font-medium">{completedMatches.length}</span>
              </div>
            </div>
            <div className="pt-2 border-t space-y-1 text-xs">
              <div className="text-muted-foreground mb-1">By Bracket Side</div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Winners Side</span>
                <span className="font-medium">{winnersSideMatches.length}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-2">
                {winnersSideCompleted} completed, {winnersSideInProgress} in progress
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Losers Side</span>
                <span className="font-medium">{losersSideMatches.length}</span>
              </div>
              <div className="text-xs text-muted-foreground pl-2">
                {losersSideCompleted} completed, {losersSideInProgress} in progress
              </div>
            </div>
          </div>

          {/* Tables Column */}
          {allTables.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HeaderLabel size="lg">Tables</HeaderLabel>
                <span className="text-sm font-medium">({allTables.length})</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winners Side</span>
                  <span className="font-medium">{winnersSideMatches.filter(m => m.tableNumber).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Losers Side</span>
                  <span className="font-medium">{losersSideMatches.filter(m => m.tableNumber).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tables In Use</span>
                  <span className="font-medium">{tablesInUse}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Open Tables</span>
                  <span className="font-medium">{openTables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Closed Tables</span>
                  <span className="font-medium">{closedTables}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Assigned Tables</span>
                  <span className="font-medium">{assignedTables}</span>
                </div>
              </div>
              <div className="pt-2 border-t space-y-1 text-xs">
                <div className="text-muted-foreground mb-1">By Bracket Side</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Winners Side</span>
                  <span className="font-medium">{winnersSideMatches.filter(m => m.tableNumber).length}</span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Losers Side</span>
                  <span className="font-medium">{losersSideMatches.filter(m => m.tableNumber).length}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Players Stats */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <HeaderLabel size="lg">Players</HeaderLabel>
            <span className="text-sm font-medium">({totalPlayers})</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Registered</span>
                <span className="font-medium">{totalPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Checked In</span>
                <span className="font-medium">{checkedInPlayers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">In Bracket</span>
                <span className="font-medium">{playersInBracket}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-medium">{totalPlayers - checkedInPlayers}</span>
              </div>
              {playerCount && (
                <div className="flex justify-between pt-1 border-t mt-1">
                  <span className="text-muted-foreground">Bracket Size</span>
                  <span className="font-medium">{playerCount.total}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2">
            <HeaderLabel size="lg">Status</HeaderLabel>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Tournament Status</span>
            <Badge 
              variant={
                tournament.status === "active" ? "default" :
                tournament.status === "completed" ? "secondary" :
                tournament.status === "upcoming" ? "outline" : "secondary"
              }
              className="text-xs"
            >
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </Badge>
          </div>
          {tournament.status === "active" && (
            <div className="flex items-center gap-2 text-xs text-green-600">
              <div className="h-1.5 w-1.5 bg-green-600 rounded-full animate-pulse"></div>
              <span>Tournament is LIVE</span>
            </div>
          )}
          {averageMatchDuration > 0 && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Avg. Match Duration</span>
              <span className="font-medium">{formatDuration(averageMatchDuration)}</span>
            </div>
          )}
        </div>

        {/* Match Tabs */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-0 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("pending")}
              className={`rounded-none border-b-2 px-4 ${
                activeTab === "pending" 
                  ? "border-primary text-primary bg-transparent" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              PENDING ({pendingMatchesList.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("onDeck")}
              className={`rounded-none border-b-2 px-4 ${
                activeTab === "onDeck" 
                  ? "border-primary text-primary bg-transparent" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              ON DECK ({onDeckMatches.length})
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("completed")}
              className={`rounded-none border-b-2 px-4 ${
                activeTab === "completed" 
                  ? "border-primary text-primary bg-transparent" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              DONE ({completedMatchesList.length})
            </Button>
          </div>

          {/* Match List */}
          <div className="space-y-3">
            {activeTab === "pending" && (
              <>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground">Pending Score Approval (0)</div>
                  <div className="text-sm text-muted-foreground py-4">No pending matches.</div>
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground">In Progress ({pendingMatchesList.length})</div>
                  {pendingMatchesList.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4">No matches in progress.</div>
                  ) : (
                    pendingMatchesList.map(match => (
                      <div key={match._id} className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{getMatchName(match)}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {match.player1?.name || "TBD"} vs. {match.player2?.name || "TBD"}
                            </div>
                            <div className="text-xs text-green-600 mt-1">
                              {match.player1Score > 0 ? match.player1Score : "-"} - In Progress ({match.player1Score} - {match.player2Score})
                            </div>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "onDeck" && (
              <>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-muted-foreground">Ready to Assign ({onDeckMatches.filter(m => !m.tableNumber).length})</div>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-xs text-muted-foreground">Scheduled</span>
                    </div>
                  </div>
                  {onDeckMatches.filter(m => !m.tableNumber).length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4">No matches are ready to assign yet.</div>
                  ) : (
                    onDeckMatches.filter(m => !m.tableNumber).map(match => (
                      <div 
                        key={match._id} 
                        className="p-3 bg-muted/50 rounded-lg hover:bg-muted/70 cursor-pointer transition-colors"
                        onClick={() => handleMatchClick(match)}
                      >
                        <div className="font-medium text-sm">{getMatchName(match)}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {match.player1?.name || "TBD"} vs. {match.player2?.name || "TBD"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-3 pt-4 border-t">
                  <div className="text-sm font-medium text-muted-foreground">Up Next ({onDeckMatches.filter(m => m.tableNumber).length})</div>
                  {onDeckMatches.filter(m => m.tableNumber).length === 0 ? (
                    <div className="text-sm text-muted-foreground py-4">No matches up next.</div>
                  ) : (
                    onDeckMatches.filter(m => m.tableNumber).map(match => (
                      <div 
                        key={match._id} 
                        className="p-3 bg-primary/10 rounded-lg hover:bg-primary/20 cursor-pointer transition-colors border border-primary/20"
                        onClick={() => handleMatchClick(match)}
                      >
                        <div className="font-medium text-sm">{getMatchName(match)}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {match.player1?.name || "TBD"} vs. {match.player2?.name || "TBD"}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}

            {activeTab === "completed" && (
              <div className="space-y-3">
                {completedMatchesList.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-4">No completed matches yet.</div>
                ) : (
                  completedMatchesList.map(match => (
                    <div key={match._id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{getMatchName(match)}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {match.player1?.name || "TBD"} {match.player1Score > 0 ? `(${match.player1Score})` : ""} vs. {match.player2?.name || "TBD"}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            - Completed ({match.player1Score} - {match.player2Score})
                          </div>
                          <div className="w-full bg-muted rounded-full h-1 mt-2">
                            <div 
                              className="bg-green-500 h-1 rounded-full"
                              style={{ width: `${match.winnerId === match.player1Id ? (match.player1Score / (match.player1Score + match.player2Score || 1)) * 100 : (match.player2Score / (match.player1Score + match.player2Score || 1)) * 100}%` }}
                            />
                          </div>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Match Detail Modal */}
      {selectedMatch && (
        <MatchDetailModal
          open={showMatchModal}
          onOpenChange={setShowMatchModal}
          match={selectedMatch}
          tournamentId={tournamentId}
        />
      )}
    </ScrollArea>
  );
}

