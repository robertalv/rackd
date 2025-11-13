"use client";

import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { EnhancedPlayerCard } from "@/components/players/enhanced-player-card";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { useIsMobile } from "@rackd/ui/hooks/use-mobile";
import { User, TrendingUp, Trophy, Activity, Target } from "lucide-react";
import { Button } from "@rackd/ui/components/button";
import { FargoRatingCard } from "@/components/social/fargo-rating-card";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { MapPin, Clock, Medal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@rackd/ui/components/empty";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/players/$id")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { id } = Route.useParams();
  const playerId = id as Id<"players">;
  
  console.log("PlayerDetailPage rendered with id:", playerId);
  
  // All hooks must be called unconditionally and in the same order
  const player = useQuery(api.players.getById, { id: playerId });
  
  console.log("Player query result:", player);
  const currentUser = useCurrentUser();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"tournaments" | "statistics" | "matches">("tournaments");
  const [tournamentRole, setTournamentRole] = useState<"organizer" | "manager" | "player">("player");
  
  // Get tournaments - always call hooks, use skip for conditional execution
  const organizedTournaments = useQuery(
    api.players.getOrganizedTournaments,
    player ? { playerId } : "skip"
  );
  const managedTournaments = useQuery(
    api.players.getManagedTournaments,
    player ? { playerId } : "skip"
  );
  const playedTournaments = useQuery(
    api.players.getPlayedTournaments,
    player ? { playerId } : "skip"
  );
  
  // Get matches - always call hooks, use skip for conditional execution
  const matches = useQuery(
    api.matches.getByPlayerId,
    player ? { playerId, limit: 100 } : "skip"
  );

  // Early returns after all hooks are called
  console.log("Checking loading state - player:", player, "organizedTournaments:", organizedTournaments, "managedTournaments:", managedTournaments, "playedTournaments:", playedTournaments, "matches:", matches);
  
  if (player === undefined || organizedTournaments === undefined || managedTournaments === undefined || playedTournaments === undefined || matches === undefined) {
    console.log("Still loading...");
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading player data...</div>
      </div>
    );
  }

  if (!player) {
    console.error("Player not found for id:", playerId);
    throw notFound();
  }
  
  console.log("Player found, rendering page:", player.name);

  // Determine if this is the current user's own profile
  const isOwnProfile = currentUser?.user?.playerId === playerId;

  // Calculate statistics
  const totalMatches = matches?.length || 0;
  const wins = matches?.filter(match => match.winnerId === playerId).length || 0;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0";

  // Get the current tournament list based on role
  const currentTournaments = 
    tournamentRole === "organizer" ? (organizedTournaments || []) :
    tournamentRole === "manager" ? (managedTournaments || []) :
    (playedTournaments || []);

  // Left Panel Content - Enhanced Player Card + Fargo Rating
  const leftPanelContent = (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        <EnhancedPlayerCard 
          player={{
            _id: player._id,
            name: player.name,
            fargoId: player.fargoId || undefined,
            fargoRating: player.fargoRating ?? undefined,
            fargoRobustness: player.fargoRobustness ?? undefined,
            city: player.city || undefined,
            country: undefined, // TODO: Add country field to player schema
            avatarUrl: player.avatarUrl || undefined,
            isVerified: player.isVerified,
            league: player.league || undefined,
            bio: player.bio || undefined
          }}
          isOwnProfile={isOwnProfile}
        />

        {/* Fargo Rating Card */}
        <FargoRatingCard 
          player={{
            _id: player._id,
            name: player.name,
            fargoRating: player.fargoRating ?? undefined,
            fargoRobustness: player.fargoRobustness ?? undefined,
            fargoReadableId: player.fargoId || undefined,
          }}
        />
      </div>
    </div>
  );

  // Right Panel Content with view mode buttons
  const rightPanelContent = (
    <div className="flex flex-col h-full">
      {/* Action Bar - Fixed at top */}
      <div className="flex-shrink-0 flex justify-end items-center gap-2 p-4 pb-4 border-b bg-background">
        <Button
          variant={viewMode === "tournaments" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setViewMode("tournaments")}
        >
          <Trophy className="h-4 w-4 mr-2" />
          Tournaments ({currentTournaments.length})
        </Button>
        <Button
          variant={viewMode === "statistics" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setViewMode("statistics")}
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          Statistics
        </Button>
        <Button
          variant={viewMode === "matches" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setViewMode("matches")}
        >
          <Activity className="h-4 w-4 mr-2" />
          Match History ({totalMatches})
        </Button>
      </div>

      {/* Content based on view mode - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === "tournaments" && (
          <div className="space-y-4">
            {/* Role Filter Buttons */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex gap-2">
                <Button
                  variant={tournamentRole === "organizer" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTournamentRole("organizer")}
                >
                  ORGANIZER ({(organizedTournaments || []).length})
                </Button>
                <Button
                  variant={tournamentRole === "manager" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTournamentRole("manager")}
                >
                  MANAGER ({(managedTournaments || []).length})
                </Button>
                <Button
                  variant={tournamentRole === "player" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTournamentRole("player")}
                >
                  PLAYER ({(playedTournaments || []).length})
                </Button>
              </div>
              {isOwnProfile && (
                <Button size="sm" variant="outline" asChild>
                  <Link to="/tournaments">
                    <Trophy className="h-4 w-4 mr-2" />
                    Find Tournaments
                  </Link>
                </Button>
              )}
            </div>

            {currentTournaments.length > 0 ? (
              <div className="space-y-3">
                {currentTournaments.map((tournament) => (
                  <Card key={tournament._id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium">{tournament.name}</h4>
                          {tournament.venue && (
                            <div className="flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {tournament.venue.name}
                                {tournament.venue.city && `, ${tournament.venue.city}`}
                                {tournament.venue.state && `, ${tournament.venue.state}`}
                              </span>
                            </div>
                          )}
                        </div>
                        <Badge variant={tournament.status === "completed" ? "default" : "secondary"}>
                          {tournament.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}</span>
                          </div>
                          {tournament.entryFee && (
                            <div className="text-green-400">${tournament.entryFee}</div>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" asChild>
                          <Link to="/tournaments/$id" params={{ id: tournament._id }}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Trophy />
                  </EmptyMedia>
                  <EmptyTitle>
                    {tournamentRole === "organizer" && "No tournaments organized yet"}
                    {tournamentRole === "manager" && "No tournaments managed yet"}
                    {tournamentRole === "player" && "No tournaments played yet"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {tournamentRole === "organizer" && "This player hasn't organized any tournaments yet"}
                    {tournamentRole === "manager" && "This player hasn't managed any tournaments yet"}
                    {tournamentRole === "player" && "This player hasn't participated in any tournaments yet"}
                  </EmptyDescription>
                </EmptyHeader>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tournaments">
                      <Trophy className="h-4 w-4 mr-2" />
                      Browse Tournaments
                    </Link>
                  </Button>
                )}
              </Empty>
            )}
          </div>
        )}

        {viewMode === "statistics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {/* Win Rate Card */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Win Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-green-500">{winRate}%</div>
                  <div className="text-xs text-muted-foreground">
                    {wins} wins, {losses} losses
                  </div>
                </CardContent>
              </Card>

              {/* Total Matches */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Total Matches</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-500">{totalMatches}</div>
                  <div className="text-xs text-muted-foreground">All time</div>
                </CardContent>
              </Card>

              {/* Tournaments Played */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Tournaments</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-500">{(playedTournaments || []).length}</div>
                  <div className="text-xs text-muted-foreground">Participated</div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Recent Form (Last 10 matches)</span>
                    <div className="flex gap-1">
                      {(matches || []).slice(-10).map((match, index) => (
                        <div
                          key={match._id || index}
                          className={`w-3 h-3 rounded-full ${
                            match.winnerId === playerId ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Longest Win Streak</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Rating Change</span>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {viewMode === "matches" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Matches</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Filter</Button>
                <Button size="sm" variant="outline">Export</Button>
              </div>
            </div>
            {(matches || []).length > 0 ? (
              <div className="space-y-3">
                {(matches || []).slice(0, 10).map((match) => (
                  <Card key={match._id} className="hover:bg-accent/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{match.player1Name}</span>
                              <Badge variant="outline" className="text-xs">
                                {match.player1Score || 0}
                              </Badge>
                            </div>
                            <span className="text-muted-foreground">vs</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{match.player2Name}</span>
                              <Badge variant="outline" className="text-xs">
                                {match.player2Score || 0}
                              </Badge>
                            </div>
                            {match.winnerId && (
                              <Medal className={`h-4 w-4 ${
                                match.winnerId === playerId ? "text-yellow-500" : "text-gray-400"
                              }`} />
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{match.tournamentName}</span>
                            {match.tournament?.gameType && (
                              <Badge variant="secondary" className="text-xs">
                                {match.tournament.gameType.replace("_", " ")}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatDistanceToNow(new Date(match.playedAt), { addSuffix: true })}</span>
                            </div>
                          </div>
                        </div>
                        
                        {match.tournament && (
                          <Button size="sm" variant="ghost" asChild>
                            <Link to="/tournaments/$id" params={{ id: match.tournament._id }}>
                              View Details
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Activity />
                  </EmptyMedia>
                  <EmptyTitle>No matches played yet</EmptyTitle>
                  <EmptyDescription>
                    This player hasn't played any matches yet
                  </EmptyDescription>
                </EmptyHeader>
                {isOwnProfile && (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/tournaments">
                      <Trophy className="h-4 w-4 mr-2" />
                      Find Tournaments to Play
                    </Link>
                  </Button>
                )}
              </Empty>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <ResizableLayout
      isMobile={isMobile}
      defaultTab="right"
      leftPanel={{
        content: leftPanelContent,
        label: "Player Card",
        icon: User,
        defaultSize: 25,
        minSize: 10,
        maxSize: 35,
        minWidth: "20rem",
      }}
      rightPanel={{
        content: rightPanelContent,
        label: "Stats & History",
        icon: TrendingUp,
        defaultSize: 75,
      }}
    />
  );
}

