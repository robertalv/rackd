import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { TournamentDashboard } from "@/components/tournaments/tournament-dashboard";
import { TablesPlayersView } from "@/components/tournaments/tables-players-view";
import { TablesManagement } from "@/components/tournaments/tables-management";
import { PlayerRegistration } from "@/components/tournaments/player-registration";
import { PayoutCalculation } from "@/components/tournaments/payout-calculation";
import { AddManagerDialog } from "@/components/tournaments/add-manager-dialog";
import { TournamentSettings } from "@/components/tournaments/tournament-settings";
import { TournamentBracket } from "@/components/tournaments/tournament-bracket";
import { MatchesTable } from "@/components/tournaments/matches-table";
import { ResultsTable } from "@/components/tournaments/results-table";
import { PlayerStats } from "@/components/tournaments/player-stats";
import { Button } from "@rackd/ui/components/button";
import { NavigationButton } from "@/components/navigation-button";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rackd/ui/components/table";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { 
  LayoutDashboard, 
  Network, 
  Table as TableIcon, 
  Users, 
  Gamepad2, 
  Trophy, 
  BarChart3, 
  DollarSign, 
  Settings,
  MapPin,
  Play,
  ChevronRight,
  Plus,
  X,
  RefreshCw
} from "lucide-react";

type ViewMode = "dashboard" | "bracket" | "tables" | "players" | "matches" | "results" | "stats" | "payouts" | "settings";
type LeftPanelMode = "overview" | "players" | "status";

export const Route = createFileRoute("/_authenticated/tournaments/$id")({
  component: TournamentDetailPage,
});

function TournamentDetailPage() {
  const { id } = Route.useParams();
  const tournamentId = id as Id<"tournaments">;
  const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
  const [leftPanelMode, setLeftPanelMode] = useState<LeftPanelMode>("overview");
  const [showAddManagerDialog, setShowAddManagerDialog] = useState(false);
  const currentUser = useCurrentUser();

  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const venue = useQuery(
    api.venues.getById, 
    tournament?.venueId ? { id: tournament.venueId } : "skip"
  );
  const managers = useQuery(api.tournaments.getManagers, { tournamentId });
  const generateBracket = useMutation(api.matches.generateBracket);
  const regenerateBracket = useMutation(api.matches.regenerateBracket);
  const removeManager = useMutation(api.tournaments.removeManager);
  const updateTournament = useMutation(api.tournaments.update);

  const currentUserId = currentUser?.convexUser?._id as unknown as Id<"users"> | undefined;
  
  // Calculate completion percentage (before early return)
  // TBD vs TBD matches are considered complete if status is "completed" (even without winnerId)
  const allMatches = matches || [];
  const completedMatches = allMatches.filter(m => {
    if (m.status !== "completed") return false;
    // TBD vs TBD matches (no players) are complete if status is completed
    if (!m.player1Id && !m.player2Id) return true;
    // Regular matches need a winnerId
    return !!m.winnerId;
  }).length;
  const totalMatches = allMatches.length;
  const completionPercentage = totalMatches > 0 
    ? Math.round((completedMatches / totalMatches) * 100) 
    : 0;

  // Automatically mark tournament as completed when all matches are done
  // This hook MUST be called before any early returns
  useEffect(() => {
    if (
      tournament &&
      tournament.status === "active" &&
      totalMatches > 0 &&
      completionPercentage === 100 &&
      completedMatches === totalMatches
    ) {
      // All matches are completed, update tournament status
      updateTournament({
        tournamentId,
        status: "completed",
      }).catch((error) => {
        console.error("Failed to auto-complete tournament:", error);
      });
    }
  }, [tournament, totalMatches, completedMatches, completionPercentage, tournamentId, updateTournament]);

  // Early return AFTER all hooks are called
  if (!tournament) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const isOrganizer = tournament && currentUserId && tournament.organizerId === currentUserId as Id<"users">;

  const handleStartTournament = async () => {
    try {
      await generateBracket({ tournamentId });
      // Optionally update tournament status to active
    } catch (error) {
      console.error("Error starting tournament:", error);
      alert("Failed to start tournament. Make sure at least 2 players are checked in.");
    }
  };

  const handleRegenerateBracket = async () => {
    if (!confirm("Regenerate bracket? This will preserve completed matches but recreate the bracket structure. Continue?")) {
      return;
    }

    try {
      await regenerateBracket({ tournamentId });
      alert("Bracket regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating bracket:", error);
      alert(`Failed to regenerate bracket: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleRemoveManager = async (userId: Id<"users">) => {
    if (!confirm("Are you sure you want to remove this manager?")) {
      return;
    }

    try {
      await removeManager({ tournamentId, userId });
    } catch (error) {
      console.error("Failed to remove manager:", error);
      alert(
        error instanceof Error ? error.message : "Failed to remove manager"
      );
    }
  };

  const actionButtons: { mode: ViewMode; label: string; icon: typeof LayoutDashboard }[] = [
    { mode: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { mode: "bracket", label: "Bracket", icon: Network },
    { mode: "tables", label: "Tables", icon: TableIcon },
    { mode: "players", label: "Players", icon: Users },
    { mode: "matches", label: "Matches", icon: Gamepad2 },
    { mode: "results", label: "Results", icon: Trophy },
    { mode: "stats", label: "Stats", icon: BarChart3 },
    { mode: "payouts", label: "Payouts", icon: DollarSign },
    { mode: "settings", label: "Settings", icon: Settings },
  ];

  // Left Panel Content
  const leftPanelContent = (
    <div className="flex h-full flex-col border-r">
      {/* Left Action Bar */}
      <div className="border-b px-4 py-3.5">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Button 
            variant={leftPanelMode === "overview" ? "secondary" : "ghost"} 
            size="sm" 
            className="flex-shrink-0"
            onClick={() => setLeftPanelMode("overview")}
          >
            Overview
          </Button>
          <Button 
            variant={leftPanelMode === "players" ? "secondary" : "ghost"} 
            size="sm" 
            className="flex-shrink-0"
            onClick={() => setLeftPanelMode("players")}
          >
            Player List
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        {leftPanelMode === "players" ? (
          <TablesPlayersView tournamentId={tournamentId} onManagePlayers={() => setViewMode("players")} />
        ) : (
          <div className="p-4 space-y-6">
          {/* Completion Percentage */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tournament Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{completionPercentage}%</div>
                  <div className="text-sm text-muted-foreground">
                    {completedMatches} of {totalMatches} matches completed
                  </div>
                </div>
                {tournament.status === "active" && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <div className="h-2 w-2 bg-green-600 rounded-full animate-pulse"></div>
                    LIVE
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Start Tournament Button */}
          {tournament.status === "upcoming" && completionPercentage < 100 && (
            <Button 
              onClick={handleStartTournament}
              className="w-full"
              size="lg"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Tournament
            </Button>
          )}

          {/* Venue Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">VENUE</CardTitle>
            </CardHeader>
            <CardContent>
              {venue ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{venue.name}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {venue.address}
                        {venue.city && `, ${venue.city}`}
                        {venue.region && `, ${venue.region}`}
                        {venue.country && ` ${venue.country}`}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ) : tournament.venue ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{tournament.venue}</div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No venue assigned</div>
              )}
            </CardContent>
          </Card>

          {/* Managers Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">MANAGERS</CardTitle>
                {isOrganizer && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddManagerDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Manager
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Accepted</TableHead>
                    {isOrganizer && <TableHead>Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {managers === undefined ? (
                    <TableRow>
                      <TableCell colSpan={isOrganizer ? 4 : 3} className="text-center text-muted-foreground py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : managers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isOrganizer ? 4 : 3} className="text-center text-muted-foreground py-4">
                        No managers yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    managers.map((manager) => (
                      <TableRow key={manager._id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={manager.user?.image} />
                              <AvatarFallback>
                                {manager.user?.displayName?.charAt(0).toUpperCase() || 
                                 manager.user?.name?.charAt(0).toUpperCase() || 
                                 "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {manager.user?.displayName || manager.user?.name || "Unknown"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                @{manager.user?.username || "unknown"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{manager.role}</span>
                        </TableCell>
                        <TableCell>
                          {manager.accepted ? (
                            <span className="text-sm text-green-600">Yes</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">Pending</span>
                          )}
                        </TableCell>
                        {isOrganizer && (
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveManager(manager.userId)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        )}
      </ScrollArea>
    </div>
  );

  // Right Panel Content
  const renderContent = () => {
    switch (viewMode) {
      case "dashboard":
        return <TournamentDashboard tournamentId={tournamentId} />;
      case "bracket":
        return (
          <div className="h-full flex flex-col">
            {/* Bracket Header with Regenerate Button */}
            {matches && matches.length > 0 && isOrganizer && (
              <div className="border-b px-4 py-2 flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Tournament Bracket</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateBracket}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Regenerate Bracket
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <TournamentBracket 
                matches={matches} 
                tournamentType={tournament.type}
                tournamentId={tournamentId}
              />
            </div>
          </div>
        );
      case "tables":
        return <TablesManagement tournamentId={tournamentId} />;
      case "players":
        return (
          <div className="h-full overflow-auto">
            <PlayerRegistration tournamentId={tournamentId} />
          </div>
        );
      case "matches":
        return (
          <div className="h-full overflow-hidden">
            <MatchesTable tournamentId={tournamentId} matches={matches} />
          </div>
        );
      case "results":
        return (
          <div className="h-full overflow-hidden">
            <ResultsTable tournamentId={tournamentId} matches={matches} />
          </div>
        );
      case "stats":
        return (
          <div className="h-full overflow-hidden">
            <PlayerStats tournamentId={tournamentId} matches={matches} />
          </div>
        );
      case "payouts":
        return (
          <div className="h-full overflow-auto p-6">
            <PayoutCalculation tournamentId={tournamentId} />
          </div>
        );
      case "settings":
        return <TournamentSettings tournamentId={tournamentId} />;
      default:
        return <TournamentDashboard tournamentId={tournamentId} />;
    }
  };

  const rightPanelContent = (
    <div className="flex h-full flex-col">
      {/* Action Bar */}
      <div className="border-b px-4 py-3.5">
        <div className="flex items-center gap-2 overflow-x-auto justify-end">
          {actionButtons.map(({ mode, label, icon: Icon }) => (
            <NavigationButton
              key={mode}
              icon={Icon}
              ariaLabel={label}
              tooltip={label}
              variant={viewMode === mode ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                setViewMode(mode);
              }}
              className="flex-shrink-0"
              badgePosition="bottom-right"
            />
          ))}
        </div>
      </div>
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );

  return (
    <>
      <div className="flex h-full flex-col">
        <ResizableLayout
          leftPanel={{
            content: leftPanelContent,
            label: "Tournament Info",
            icon: LayoutDashboard,
            defaultSize: 30,
            minSize: 20,
            maxSize: 40,
            minWidth: "20rem",
          }}
          rightPanel={{
            content: rightPanelContent,
            label: "Content",
            icon: LayoutDashboard,
            defaultSize: 70,
          }}
          defaultTab="right"
          className="flex-1"
        />
      </div>
      <AddManagerDialog
        open={showAddManagerDialog}
        onOpenChange={setShowAddManagerDialog}
        tournamentId={tournamentId}
      />
    </>
  );
}
