"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@rackd/ui/components/dialog";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Label } from "@rackd/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rackd/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rackd/ui/components/dropdown-menu";
import { X, Clock, Link2, Copy, HelpCircle, CheckSquare2 } from "lucide-react";
import { Badge } from "@rackd/ui/components/badge";

type BackendMatch = {
  _id: Id<"matches">;
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
  tableNumber?: number | null;
  tournamentId: Id<"tournaments">;
  bracketType?: "winner" | "loser" | "grand_final" | null;
};

interface MatchDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  match: BackendMatch | null;
  tournamentId: Id<"tournaments">;
}

export function MatchDetailModal({
  open,
  onOpenChange,
  match,
  tournamentId,
}: MatchDetailModalProps) {
  const [status, setStatus] = useState<"pending" | "in_progress" | "completed">("pending");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1RaceTo, setPlayer1RaceTo] = useState(0);
  const [player2RaceTo, setPlayer2RaceTo] = useState(0);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [matchTime, setMatchTime] = useState<string>("");
  const [winnerId, setWinnerId] = useState<Id<"players"> | null>(null);

  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const tables = useQuery(api.tournaments.getTables, { tournamentId }) || [];
  const updateMatch = useMutation(api.matches.updateMatch);
  const updateStatus = useMutation(api.matches.updateStatus);
  const assignTable = useMutation(api.matches.assignTable);

  // Initialize form when match changes
  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setPlayer1Score(match.player1Score);
      setPlayer2Score(match.player2Score);
      setSelectedTable(match.tableNumber ?? null);
      setWinnerId(match.winnerId ?? null);
      // Set race to from tournament settings
      if (tournament) {
        const isLoserBracket = match.bracketType === "loser";
        const raceTo = isLoserBracket 
          ? tournament.losersRaceTo ?? tournament.winnersRaceTo ?? 0
          : tournament.winnersRaceTo ?? 0;
        setPlayer1RaceTo(raceTo);
        setPlayer2RaceTo(raceTo);
      }
    }
  }, [match, tournament]);

  const handleSave = async () => {
    if (!match) return;

    try {
      // Build update object - only include fields that are being changed
      const updateData: any = {
        id: match._id,
      };

      if (status !== undefined) updateData.status = status;
      if (player1Score !== undefined) updateData.player1Score = player1Score;
      if (player2Score !== undefined) updateData.player2Score = player2Score;
      // Include tableNumber if it's being changed (can be null to remove assignment)
      const currentTable = match.tableNumber ?? null;
      if (selectedTable !== currentTable) {
        updateData.tableNumber = selectedTable;
      }
      // Only include winnerId if it's a valid ID (not null)
      if (winnerId) {
        updateData.winnerId = winnerId;
      }

      await updateMatch(updateData);

      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update match:", error);
      alert("Failed to update match. Please try again.");
    }
  };

  const handleStartMatch = async () => {
    if (!match) return;
    try {
      await updateStatus({ id: match._id, status: "in_progress" });
      setStatus("in_progress");
    } catch (error) {
      console.error("Failed to start match:", error);
      alert("Failed to start match. Please try again.");
    }
  };

  const handleRemoveTable = async () => {
    if (!match) return;
    try {
      await assignTable({ id: match._id, tableNumber: undefined });
      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to remove table:", error);
      alert("Failed to remove table assignment.");
    }
  };

  const getMatchName = () => {
    if (!match) return "";
    const bracketTypeLabel = match.bracketType === "loser" ? "L" : match.bracketType === "grand_final" ? "GF" : "W";
    return `Match ${match.bracketPosition + 1} (${bracketTypeLabel}${match.round}-${match.bracketPosition + 1})`;
  };

  // Filter tables: only show OPEN tables, or the currently selected table (even if IN_USE)
  // Only show tables that are OPEN (do not include IN_USE even if assigned)
  const availableTables = tables.filter(
    (table) => table.status === "OPEN"
  );

  const isLive = status === "in_progress";

  if (!match) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare2 className="h-5 w-5" />
              <DialogTitle>{getMatchName()}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge variant="destructive" className="bg-red-500">
                  LIVE
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Status Selection */}
          <div className="space-y-2">
            <Label>Match Status</Label>
            <Select
              value={status}
              onValueChange={(value: "pending" | "in_progress" | "completed") => {
                setStatus(value);
                if (value === "in_progress" && status === "pending") {
                  handleStartMatch();
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Player Details Table */}
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4 font-medium text-sm border-b pb-2">
              <div>Player</div>
              <div>Race To</div>
              <div>Score</div>
              <div>Actions</div>
            </div>

            {/* Player 1 */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <Input
                value={match.player1?.name || "TBD"}
                disabled
                className="bg-muted"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={player1RaceTo}
                  onChange={(e) => setPlayer1RaceTo(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={player1Score}
                  onChange={(e) => {
                    const score = parseInt(e.target.value) || 0;
                    setPlayer1Score(score);
                    if (score >= player1RaceTo && player1RaceTo > 0) {
                      setWinnerId(match.player1Id ?? null);
                      setStatus("completed");
                    }
                  }}
                  className="w-20"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setWinnerId(match.player1Id ?? null);
                      setStatus("completed");
                    }}
                  >
                    Set as Winner
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setPlayer1Score(player1RaceTo);
                      setWinnerId(match.player1Id ?? null);
                      setStatus("completed");
                    }}
                  >
                    Win by Race To
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Player 2 */}
            <div className="grid grid-cols-4 gap-4 items-center">
              <Input
                value={match.player2?.name || "TBD"}
                disabled
                className="bg-muted"
              />
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={player2RaceTo}
                  onChange={(e) => setPlayer2RaceTo(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  value={player2Score}
                  onChange={(e) => {
                    const score = parseInt(e.target.value) || 0;
                    setPlayer2Score(score);
                    if (score >= player2RaceTo && player2RaceTo > 0) {
                      setWinnerId(match.player2Id ?? null);
                      setStatus("completed");
                    }
                  }}
                  className="w-20"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      setWinnerId(match.player2Id ?? null);
                      setStatus("completed");
                    }}
                  >
                    Set as Winner
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setPlayer2Score(player2RaceTo);
                      setWinnerId(match.player2Id ?? null);
                      setStatus("completed");
                    }}
                  >
                    Win by Race To
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Table Assignment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Assign open table</Label>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <Select
              value={selectedTable?.toString() || ""}
              onValueChange={(value) => {
                if (value) {
                  setSelectedTable(parseInt(value));
                } else {
                  setSelectedTable(null);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent>
                {availableTables.map((table) => {
                  const tableNum = table.tableNumber || table.startNumber;
                  return (
                    <SelectItem key={table._id} value={tableNum.toString()}>
                      {tableNum}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedTable && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveTable}
                className="mt-2 text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Remove table assignment
              </Button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end pt-4 border-t">
            {/* <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Link2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Copy className="h-4 w-4" />
              </Button>
            </div> */}
            <div className="flex items-center gap-2">
              <Button variant="default" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

