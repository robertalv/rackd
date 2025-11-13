import { useMemo, useState } from "react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rackd/ui/components/table";
import { Badge } from "@rackd/ui/components/badge";
import { Input } from "@rackd/ui/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { MatchDetailModal } from "./match-detail-modal";
import { Search, Filter } from "lucide-react";
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

type MatchesTableProps = {
  tournamentId: Id<"tournaments">;
  matches: Match[] | undefined;
};

export function MatchesTable({ tournamentId, matches }: MatchesTableProps) {
  const [selectedMatchId, setSelectedMatchId] = useState<Id<"matches"> | null>(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [roundFilter, setRoundFilter] = useState<"all" | number>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMatches = useMemo(() => {
    if (!matches) return [];

    let filtered = matches;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Filter by round
    if (roundFilter !== "all") {
      filtered = filtered.filter(m => m.round === roundFilter);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => {
        const player1Name = m.player1?.name?.toLowerCase() || "";
        const player2Name = m.player2?.name?.toLowerCase() || "";
        return player1Name.includes(query) || player2Name.includes(query);
      });
    }

    // Sort by round, then bracket position
    return filtered.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.bracketPosition - b.bracketPosition;
    });
  }, [matches, statusFilter, roundFilter, searchQuery]);

  const rounds = useMemo(() => {
    if (!matches) return [];
    const uniqueRounds = new Set(matches.map(m => m.round));
    return Array.from(uniqueRounds).sort((a, b) => a - b);
  }, [matches]);

  const selectedMatch = useMemo(() => {
    if (!selectedMatchId || !matches) return null;
    return matches.find(m => m._id === selectedMatchId);
  }, [selectedMatchId, matches]);

  const getStatusBadge = (status: Match["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "in_progress":
        return <Badge variant="destructive" className="bg-red-500">LIVE</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500">Completed</Badge>;
    }
  };

  const getBracketTypeLabel = (bracketType: Match["bracketType"]) => {
    switch (bracketType) {
      case "winner":
        return "W";
      case "loser":
        return "L";
      case "grand_final":
        return "GF";
      default:
        return "";
    }
  };

  const handleMatchClick = (matchId: Id<"matches">) => {
    setSelectedMatchId(matchId);
    setShowMatchModal(true);
  };

  if (!matches) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading matches...
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Filters */}
        <div className="border-b p-4 space-y-4">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            {/* Round Filter */}
            <Select 
              value={roundFilter === "all" ? "all" : String(roundFilter)} 
              onValueChange={(value) => setRoundFilter(value === "all" ? "all" : parseInt(value))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by round" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rounds</SelectItem>
                {rounds.map(round => (
                  <SelectItem key={round} value={String(round)}>
                    Round {round}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>Total: {matches.length}</span>
            <span>Pending: {matches.filter(m => m.status === "pending").length}</span>
            <span>In Progress: {matches.filter(m => m.status === "in_progress").length}</span>
            <span>Completed: {matches.filter(m => m.status === "completed").length}</span>
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Round</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Player 1</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Player 2</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No matches found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMatches.map((match) => {
                  const bracketLabel = getBracketTypeLabel(match.bracketType);
                  const matchLabel = bracketLabel 
                    ? `${bracketLabel}${match.round}-${match.bracketPosition + 1}`
                    : `R${match.round}-${match.bracketPosition + 1}`;

                  return (
                    <TableRow 
                      key={match._id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleMatchClick(match._id)}
                    >
                      <TableCell className="font-medium">{match.round}</TableCell>
                      <TableCell className="font-medium">{matchLabel}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={match.winnerId === match.player1Id ? "font-bold text-green-600" : ""}>
                            {match.player1?.name || "TBD"}
                          </span>
                          {match.winnerId === match.player1Id && (
                            <Badge variant="outline" className="text-xs">W</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.status === "pending" ? (
                          <span className="text-muted-foreground">-</span>
                        ) : (
                          <span className="font-medium">
                            {match.player1Score} - {match.player2Score}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={match.winnerId === match.player2Id ? "font-bold text-green-600" : ""}>
                            {match.player2?.name || "TBD"}
                          </span>
                          {match.winnerId === match.player2Id && (
                            <Badge variant="outline" className="text-xs">W</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.tableNumber ? (
                          <Badge variant="secondary">Table {match.tableNumber}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(match.status)}</TableCell>
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

      {selectedMatch && (
        <MatchDetailModal
          open={showMatchModal}
          onOpenChange={setShowMatchModal}
          match={selectedMatch}
          tournamentId={tournamentId}
        />
      )}
    </>
  );
}

