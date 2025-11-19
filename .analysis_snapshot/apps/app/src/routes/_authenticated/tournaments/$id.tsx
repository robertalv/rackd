import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { callConvexQuery } from "@/lib/convex-server";
import type { RouterAppContext } from "@/routes/__root";
import Loader from "@/components/loader";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { TournamentDashboard } from "@/components/tournaments/tournament-dashboard";
import { TablesPlayersView } from "@/components/tournaments/tables-players-view";
import { TournamentStats } from "@/components/tournaments/tournament-stats";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@rackd/ui/components/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTheme } from "@/providers/ThemeProvider";
import {
  Icon,
  type IconProps,
  Layout01Icon,
  FlowSquareIcon,
  TableIcon,
  UserGroupIcon,
  Billiard01Icon,
  ChampionIcon,
  WaterfallDown01Icon,
  Dollar01Icon,
  Settings01Icon,
  Location03Icon,
  PlayIcon,
  ArrowRight01Icon,
  Add01Icon,
  Cancel01Icon,
  RefreshIcon
} from "@rackd/ui/icons";

type ViewMode = "dashboard" | "bracket" | "tables" | "players" | "matches" | "results" | "stats" | "payouts" | "settings";
type LeftPanelMode = "overview" | "players" | "stats";

export const Route = createFileRoute("/_authenticated/tournaments/$id")({
  // Loader for SSR data fetching
  loader: async ({ context, params }) => {
    const { queryClient, convexQueryClient } = context as RouterAppContext;
    const tournamentId = params.id as Id<"tournaments">;
    
    // Fetch initial tournament data server-side
    const tournament = await callConvexQuery(
      queryClient,
      convexQueryClient,
      api.tournaments.getById,
      { id: tournamentId }
    );
    
    // Prefetch related data in parallel
    const [matches, venue, managers] = await Promise.all([
      callConvexQuery(
        queryClient,
        convexQueryClient,
        api.matches.getByTournament,
        { tournamentId }
      ).catch(() => []), // Handle errors gracefully
      tournament?.venueId
        ? callConvexQuery(
            queryClient,
            convexQueryClient,
            api.venues.getById,
            { id: tournament.venueId }
          ).catch(() => null)
        : Promise.resolve(null),
      callConvexQuery(
        queryClient,
        convexQueryClient,
        api.tournaments.getManagers,
        { tournamentId }
      ).catch(() => []), // Handle errors gracefully
    ]);
    
    return {
      initialTournament: tournament,
      initialMatches: matches,
      initialVenue: venue,
      initialManagers: managers,
    };
  },
  component: TournamentDetailPage,
  pendingComponent: () => <Loader />,
});

type TournamentStorage = {
  left: LeftPanelMode;
  right: ViewMode;
  zoom?: number;
  resize: {
    left: number;
    right: number;
  };
};

function TournamentDetailPage() {
  const { id } = Route.useParams();
  const tournamentId = id as Id<"tournaments">;
  
  // Single storage key for this tournament
  const storageKey = `tournament-${tournamentId}`;
  
  // Load saved state from localStorage
  const getSavedState = (): Partial<TournamentStorage> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate structure
        const state: Partial<TournamentStorage> = {};
        if (parsed.left && ["overview", "players", "stats"].includes(parsed.left)) {
          state.left = parsed.left as LeftPanelMode;
        }
        if (parsed.right && [
          "dashboard", "bracket", "tables", "players", "matches", 
          "results", "stats", "payouts", "settings"
        ].includes(parsed.right)) {
          state.right = parsed.right as ViewMode;
        }
        if (parsed.resize && typeof parsed.resize.left === "number" && typeof parsed.resize.right === "number") {
          state.resize = parsed.resize;
        }
        if (typeof parsed.zoom === "number" && parsed.zoom >= 25 && parsed.zoom <= 200) {
          state.zoom = parsed.zoom;
        }
        return state;
      }
    } catch (error) {
      console.error("Failed to load saved tournament state:", error);
    }
    return {};
  };
  
  const savedState = getSavedState();
  
  const [viewMode, setViewMode] = useState<ViewMode>(savedState.right || "dashboard");
  const [leftPanelMode, setLeftPanelMode] = useState<LeftPanelMode>(savedState.left || "overview");
  const [zoom, setZoom] = useState<number>(savedState.zoom ?? 80);
  const [showAddManagerDialog, setShowAddManagerDialog] = useState(false);
  const currentUser = useCurrentUser();
  const { resolvedTheme } = useTheme();
  
  // Save state to localStorage whenever it changes
  const saveState = useCallback((updates: Partial<TournamentStorage>) => {
    if (typeof window === "undefined") return;
    try {
      // Get current state from localStorage
      let current: Partial<TournamentStorage> = {};
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.left && ["overview", "players", "stats"].includes(parsed.left)) {
            current.left = parsed.left as LeftPanelMode;
          }
          if (parsed.right && [
            "dashboard", "bracket", "tables", "players", "matches", 
            "results", "stats", "payouts", "settings"
          ].includes(parsed.right)) {
            current.right = parsed.right as ViewMode;
          }
          if (parsed.resize && typeof parsed.resize.left === "number" && typeof parsed.resize.right === "number") {
            current.resize = parsed.resize;
          }
          if (typeof parsed.zoom === "number" && parsed.zoom >= 25 && parsed.zoom <= 200) {
            current.zoom = parsed.zoom;
          }
        }
      } catch {
        // Ignore parse errors, use defaults
      }
      
      const newState: TournamentStorage = {
        left: updates.left ?? current.left ?? "overview",
        right: updates.right ?? current.right ?? "dashboard",
        zoom: updates.zoom ?? current.zoom ?? 80,
        resize: updates.resize ?? current.resize ?? { left: 30, right: 70 },
      };
      localStorage.setItem(storageKey, JSON.stringify(newState));
    } catch (error) {
      console.error("Failed to save tournament state:", error);
    }
  }, [storageKey]);
  
  // Save left panel mode
  useEffect(() => {
    saveState({ left: leftPanelMode });
  }, [leftPanelMode, saveState]);
  
  // Save view mode
  useEffect(() => {
    saveState({ right: viewMode });
  }, [viewMode, saveState]);
  
  // Save zoom level
  useEffect(() => {
    saveState({ zoom });
  }, [zoom, saveState]);
  
  // Handle resize changes
  const handleResizeChange = useCallback((sizes: number[]) => {
    if (sizes.length >= 2) {
      saveState({ resize: { left: sizes[0], right: sizes[1] } });
    }
  }, [saveState]);

  // Upgrade to real-time Convex subscriptions for live updates
  // The queryClient will use the prefetched data initially, then upgrade to real-time
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
  // Use Suspense for better loading UX
  if (!tournament) {
    return (
      <Suspense fallback={<Loader />}>
        <div className="flex items-center justify-center h-full">Loading...</div>
      </Suspense>
    );
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

  const actionButtons: { mode: ViewMode; label: string; icon: IconProps["icon"] }[] = [
    { mode: "dashboard", label: "Dashboard", icon: Layout01Icon },
    { mode: "bracket", label: "Bracket", icon: FlowSquareIcon },
    { mode: "tables", label: "Tables", icon: TableIcon },
    { mode: "players", label: "Players", icon: UserGroupIcon },
    { mode: "matches", label: "Matches", icon: Billiard01Icon },
    { mode: "results", label: "Results", icon: ChampionIcon },
    { mode: "stats", label: "Stats", icon: WaterfallDown01Icon },
    { mode: "payouts", label: "Payouts", icon: Dollar01Icon },
    { mode: "settings", label: "Settings", icon: Settings01Icon },
  ];

  // Left Panel Content
  const leftPanelContent = (
    <div className="flex h-full flex-col border-r bg-muted/50">
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
          <Button 
            variant={leftPanelMode === "stats" ? "secondary" : "ghost"} 
            size="sm" 
            className="flex-shrink-0"
            onClick={() => setLeftPanelMode("stats")}
          >
            Stats
          </Button>
        </div>
      </div>
      {leftPanelMode === "players" ? (
        <div className="flex-1 min-h-0">
          <TablesPlayersView tournamentId={tournamentId} onManagePlayers={() => setViewMode("players")} />
        </div>
      ) : leftPanelMode === "stats" ? (
        <div className="flex-1 min-h-0">
          <TournamentStats tournamentId={tournamentId} />
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
          {/* Completion Percentage */}
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
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
          {(tournament.status === "upcoming" || tournament.status === "active") && completionPercentage < 100 && (
            <Button 
              onClick={handleStartTournament}
              className="w-full"
              size="lg"
            >
              <Icon icon={PlayIcon} className="h-4 w-4 mr-2" />
              Start Tournament
            </Button>
          )}

          {/* Venue Section */}
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Venue</CardTitle>
            </CardHeader>
            <CardContent>
              {venue ? (
                <div className="space-y-3">
                  {/* Venue Image */}
                  {venue && venue.imageUrl && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="w-full relative group cursor-pointer rounded-lg overflow-hidden border border-border hover:border-primary/50 transition-colors">
                          <div className="aspect-video w-full bg-muted relative">
                            <img
                              src={venue.imageUrl}
                              alt={venue.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute bottom-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium">
                              View Details
                            </div>
                          </div>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-80 p-0">
                        <div className="space-y-2">
                          {/* Map Preview */}
                          <div className="w-full h-48 rounded-t-lg overflow-hidden border-b">
                            <iframe
                              width="100%"
                              height="100%"
                              style={{ 
                                border: 0,
                                filter: resolvedTheme === "dark" ? "invert(0.92) hue-rotate(180deg) brightness(0.85) contrast(1.1)" : "none"
                              }}
                              loading="lazy"
                              allowFullScreen
                              referrerPolicy="no-referrer-when-downgrade"
                              src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCMATXv8JTcYrllKHglpuvYdiwrR0o99eE&q=${encodeURIComponent(
                                venue.coordinates 
                                  ? `${venue.coordinates.lat},${venue.coordinates.lng}`
                                  : venue.address 
                                    ? `${venue.address}, ${[venue.city, venue.region, venue.country].filter(Boolean).join(", ")}`
                                    : [venue.address, venue.city, venue.region, venue.country].filter(Boolean).join(", ") || ''
                              )}`}
                            />
                          </div>
                          {/* View Venue Button */}
                          <div className="p-3">
                            <Link
                              to="/venues/$id"
                              params={{ id: venue._id }}
                              className="block"
                            >
                              <Button className="w-full" size="sm">
                                View Venue
                                <Icon icon={ArrowRight01Icon} className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  {/* Venue Info */}
                  <Link
                    to="/venues/$id"
                    params={{ id: venue._id }}
                    className="block"
                  >
                    <div className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="flex items-start gap-2">
                        <Icon icon={Location03Icon} className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{venue.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {venue.address}
                            {venue.city && `, ${venue.city}`}
                            {venue.region && `, ${venue.region}`}
                            {venue.country && ` ${venue.country}`}
                          </div>
                        </div>
                        <Icon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </div>
              ) : tournament.venueId ? (
                <div className="space-y-3">
                  {/* Venue Info - venue query may still be loading */}
                  <Link
                    to="/venues/$id"
                    params={{ id: tournament.venueId }}
                    className="block"
                  >
                    <div className="space-y-2 cursor-pointer hover:opacity-80 transition-opacity">
                      <div className="flex items-start gap-2">
                        <Icon icon={Location03Icon} className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{tournament.venue || "Venue"}</div>
                        </div>
                        <Icon icon={ArrowRight01Icon} className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      </div>
                    </div>
                  </Link>
                </div>
              ) : tournament.venue ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Icon icon={Location03Icon} className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{tournament.venue}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">No venue assigned</div>
              )}
            </CardContent>
          </Card>

          {/* Managers Section */}
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">MANAGERS</CardTitle>
                {isOrganizer && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddManagerDialog(true)}
                  >
                    <Icon icon={Add01Icon} className="h-4 w-4 mr-1" />
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
                              <Icon icon={Cancel01Icon} className="h-4 w-4" />
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
        </ScrollArea>
      )}
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
                  <Icon icon={RefreshIcon} className="h-4 w-4" />
                  Regenerate Bracket
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <TournamentBracket 
                matches={matches} 
                tournamentType={tournament.type}
                tournamentId={tournamentId}
                tournamentName={tournament.name}
                zoom={zoom}
                onZoomChange={setZoom}
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
              tooltipPosition="bottom"
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
            icon: Layout01Icon,
            defaultSize: savedState.resize?.left ?? 30,
            minSize: 20,
            maxSize: 40,
            minWidth: "20rem",
          }}
          rightPanel={{
            content: rightPanelContent,
            label: "Content",
            icon: Layout01Icon,
            defaultSize: savedState.resize?.right ?? 70,
          }}
          defaultTab="right"
          className="flex-1"
          storageKey={storageKey}
          onResizeChange={handleResizeChange}
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
