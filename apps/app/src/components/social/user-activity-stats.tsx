"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@rackd/ui/components/empty";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@rackd/ui/components/table";
import { Trophy, TrendingUp, Activity, MapPin, Clock, Target, Medal } from "lucide-react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";

interface UserActivityStatsProps {
  userId: Id<"users">;
  isOwnProfile?: boolean;
}

export function UserActivityStats({ userId, isOwnProfile = false }: UserActivityStatsProps) {
  const [tournamentFilter, setTournamentFilter] = useState<"organizer" | "manager" | "player">("organizer");
  
  // Fetch tournaments based on filter
  const organizerTournaments = useQuery(api.tournaments.getByOrganizer, { userId });
  const playerRegistrations = useQuery(api.tournamentRegistrations.getByUser, { userId });
  
  // Fetch user profile to get playerId
  const userProfile = useQuery(api.users.getProfile, { userId });
  
  // Fetch nearby venues
  const venues = useQuery(api.venues.list, {});
  
  // Fetch user's matches
  const matchesData = useQuery(api.matches.getByUserId, { userId, limit: 100 });
  const matches = matchesData || [];
  
  // Get tournaments based on current filter
  const getTournaments = () => {
    switch (tournamentFilter) {
      case "organizer":
        return organizerTournaments || [];
      case "manager":
        // TODO: Implement manager tournaments query
        return [];
      case "player":
        // Deduplicate tournaments by tournament ID since a user can have multiple registrations per tournament
        const tournamentMap = new Map();
        playerRegistrations?.forEach((r: any) => {
          if (r.tournament && r.tournament._id) {
            tournamentMap.set(r.tournament._id, r.tournament);
          }
        });
        return Array.from(tournamentMap.values());
      default:
        return [];
    }
  };

  const tournaments = getTournaments();
  
  // Calculate unique tournament count for player tab button
  const uniquePlayerTournaments = (() => {
    const tournamentMap = new Map();
    playerRegistrations?.forEach((r: any) => {
      if (r.tournament && r.tournament._id) {
        tournamentMap.set(r.tournament._id, r.tournament);
      }
    });
    return tournamentMap.size;
  })();
  
  // Get user's player IDs - CRITICAL: Only use the user's direct playerId
  // This matches the backend logic in matches.getByUserId which only uses user.playerId
  // We should NOT include player IDs from registrations because those might be other players
  // the user registered (like teammates), not the user themselves
  const userPlayerIds = new Set<Id<"players">>();
  
  // Only add playerId from user profile (the user's actual player)
  if (userProfile?.playerId) {
    userPlayerIds.add(userProfile.playerId);
  }
  
  // NOTE: We're NOT adding player IDs from registrations because:
  // - A user may register multiple players for a tournament (e.g., registering teammates)
  // - We only want to show matches where the USER THEMSELVES is playing
  // - The user's actual player is stored in userProfile.playerId

  // Calculate wins/losses - only count matches where user is a participant
  const completedMatches = matches.filter((m: any) => {
    // Only include completed matches where user is a participant
    if (m.status !== "completed") {
      return false;
    }
    
    // Check if user's player ID is in the match
    const isPlayer1 = m.player1Id ? userPlayerIds.has(m.player1Id) : false;
    const isPlayer2 = m.player2Id ? userPlayerIds.has(m.player2Id) : false;
    const isUserInMatch = isPlayer1 || isPlayer2;
    
    if (!isUserInMatch) {
      return false; // User is not in this match
    }
    
    // Only count matches with a winner (exclude TBD vs TBD auto-completed matches)
    if (!m.winnerId) {
      return false; // No winner, so this doesn't count as win or loss
    }
    
    return true;
  });
  
  const totalMatches = completedMatches.length;
  
  // Wins: matches where the winner is one of the user's player IDs
  const wins = completedMatches.filter((m: any) => {
    return m.winnerId && userPlayerIds.has(m.winnerId);
  }).length;
  
  // Losses: matches where user participated but didn't win (explicitly check)
  const losses = completedMatches.filter((m: any) => {
    // User is in the match (already filtered above)
    // But winner is NOT one of user's player IDs
    return m.winnerId && !userPlayerIds.has(m.winnerId);
  }).length;
  
  const winRate = totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0";

  return (
    <div className="w-full">
      <Tabs defaultValue="tournaments" className="w-full">
        <div className="w-full mb-6">
          <div className="flex justify-start w-full">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
              <TabsTrigger 
                value="tournaments" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <Trophy className="h-4 w-4" />
                Tournaments
              </TabsTrigger>
              <TabsTrigger 
                value="statistics" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger 
                value="matches" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <Activity className="h-4 w-4" />
                Matches
              </TabsTrigger>
              <TabsTrigger 
                value="venues" 
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200 flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                Venues
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={tournamentFilter === "organizer" ? "default" : "outline"}
                onClick={() => setTournamentFilter("organizer")}
              >
                ORGANIZER ({organizerTournaments?.length || 0})
              </Button>
              <Button 
                size="sm" 
                variant={tournamentFilter === "manager" ? "default" : "outline"}
                onClick={() => setTournamentFilter("manager")}
              >
                MANAGER (0)
              </Button>
              <Button 
                size="sm" 
                variant={tournamentFilter === "player" ? "default" : "outline"}
                onClick={() => setTournamentFilter("player")}
              >
                PLAYER ({uniquePlayerTournaments || 0})
              </Button>
            </div>
            {isOwnProfile && (
              <Link to="/tournaments">
                <Button size="sm" variant="outline">
                  <Trophy className="h-4 w-4 mr-2" />
                  Find Tournaments
                </Button>
              </Link>
            )}
          </div>

          {tournaments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  {tournamentFilter === "player" && <TableHead>Position</TableHead>}
                  {tournamentFilter === "player" && <TableHead>Winnings</TableHead>}
                  <TableHead>Entry Fee</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament: any) => {
                  // Get registration data for player tab to show position/winnings
                  const registration = tournamentFilter === "player" 
                    ? playerRegistrations?.find((r: any) => r.tournament?._id === tournament._id)
                    : null;
                  
                  return (
                    <TableRow key={tournament._id}>
                      <TableCell className="font-medium">{tournament.name}</TableCell>
                      <TableCell>
                        {tournament.venue ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{tournament.venue.name}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tournament.status === "completed" ? "default" : "secondary"}>
                          {tournament.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}</span>
                        </div>
                      </TableCell>
                      {tournamentFilter === "player" && (
                        <TableCell>
                          {registration?.position ? (
                            <div className="flex items-center gap-1">
                              <Medal className={`h-4 w-4 ${
                                registration.position === 1 ? "text-yellow-500" :
                                registration.position === 2 ? "text-gray-400" :
                                registration.position === 3 ? "text-orange-600" :
                                "text-muted-foreground"
                              }`} />
                              <span className="text-sm font-medium">
                                {registration.position === 1 ? "1st" :
                                 registration.position === 2 ? "2nd" :
                                 registration.position === 3 ? "3rd" :
                                 `${registration.position}th`}
                              </span>
                            </div>
                          ) : tournament.status === "completed" ? (
                            <span className="text-sm text-muted-foreground">—</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">TBD</span>
                          )}
                        </TableCell>
                      )}
                      {tournamentFilter === "player" && (
                        <TableCell>
                          {registration?.winnings ? (
                            <span className="text-sm font-semibold text-green-500">
                              ${registration.winnings.toLocaleString()}
                            </span>
                          ) : registration?.position && tournament.status === "completed" ? (
                            <span className="text-sm text-muted-foreground">$0</span>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      )}
                      <TableCell>
                        {tournament.entryFee ? (
                          <span className="text-green-500">${tournament.entryFee}</span>
                        ) : (
                          <span className="text-muted-foreground">Free</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to="/tournaments/$id" params={{ id: tournament._id }}>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Trophy />
                </EmptyMedia>
                <EmptyTitle>
                  {tournamentFilter === "organizer" && "No tournaments organized yet"}
                  {tournamentFilter === "manager" && "No tournaments managed yet"}
                  {tournamentFilter === "player" && "No tournaments played yet"}
                </EmptyTitle>
                <EmptyDescription>
                  {isOwnProfile ? (
                    <>
                      {tournamentFilter === "organizer" && "Create your first tournament to get started"}
                      {tournamentFilter === "manager" && "You don't have manager access to any tournaments yet"}
                      {tournamentFilter === "player" && "Register for a tournament to start competing"}
                    </>
                  ) : (
                    <>
                      {tournamentFilter === "organizer" && "This player hasn't organized any tournaments yet"}
                      {tournamentFilter === "manager" && "This player doesn't manage any tournaments yet"}
                      {tournamentFilter === "player" && "This player hasn't played in any tournaments yet"}
                    </>
                  )}
                </EmptyDescription>
              </EmptyHeader>
              {isOwnProfile && (
                <EmptyContent>
                  {tournamentFilter === "organizer" ? (
                    <Link to="/tournaments/new">
                      <Button variant="outline">
                        Create Tournament
                      </Button>
                    </Link>
                  ) : tournamentFilter === "player" ? (
                    <Link to="/tournaments">
                      <Button variant="outline">
                        Browse Tournaments
                      </Button>
                    </Link>
                  ) : null}
                </EmptyContent>
              )}
            </Empty>
          )}
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="statistics" className="space-y-4">
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
                <div className="text-2xl font-bold text-yellow-500">{tournaments.length}</div>
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
                    {completedMatches.length > 0 ? (
                      completedMatches.slice(0, 10).map((match: any, index: number) => {
                        const isWin = match.winnerId && userPlayerIds.has(match.winnerId);
                        return (
                          <div
                            key={match._id || index}
                            className={`w-3 h-3 rounded-full ${
                              isWin ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                        );
                      })
                    ) : (
                      <span className="text-xs text-muted-foreground">No matches yet</span>
                    )}
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
        </TabsContent>

        {/* Match History Tab */}
        <TabsContent value="matches" className="space-y-4">
          <div className="flex items-center justify-end mb-4">
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Filter</Button>
              <Button size="sm" variant="outline">Export</Button>
            </div>
          </div>

          {matches.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Result</TableHead>
                  <TableHead>Opponent</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Game Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches
                  .filter((match: any) => {
                    // CRITICAL: Strictly filter by player ID - user's player must be player1 or player2
                    if (!match.player1Id && !match.player2Id) {
                      return false; // No players in match
                    }
                    
                    const isPlayer1 = match.player1Id ? userPlayerIds.has(match.player1Id) : false;
                    const isPlayer2 = match.player2Id ? userPlayerIds.has(match.player2Id) : false;
                    const isUserInMatch = isPlayer1 || isPlayer2;
                    
                    // Only show completed matches where user's player ID is actually in the match
                    if (!isUserInMatch) {
                      return false; // User's player is not in this match
                    }
                    
                    if (match.status !== "completed") {
                      return false; // Only show completed matches
                    }
                    
                    return true;
                  })
                  .slice(0, 50)
                  .map((match: any) => {
                  // Determine if user is player1 or player2 (already filtered, but need to know which side)
                  const isPlayer1 = match.player1Id && userPlayerIds.has(match.player1Id);
                  
                  // Get opponent info - make sure we're getting the OTHER player, not the user
                  const opponentPlayerId = isPlayer1 ? match.player2Id : match.player1Id;
                  const opponentPlayer = isPlayer1 ? match.player2 : match.player1;
                  const opponentUser = isPlayer1 ? match.player2User : match.player1User;
                  
                  // Verify this is actually the opponent (not the user)
                  const isOpponentUser = opponentUser && opponentUser._id !== userId;
                  const isOpponentPlayer = opponentPlayerId && !userPlayerIds.has(opponentPlayerId);
                  
                  // Determine opponent name with proper fallback
                  let opponentName = "Unknown";
                  
                  // Only use opponentUser if it's actually a different user
                  if (isOpponentUser && opponentUser) {
                    opponentName = opponentUser.displayName || opponentUser.name || opponentUser.username || "Unknown";
                  } else if (isOpponentPlayer && opponentPlayer) {
                    // Use player name if it's a different player
                    opponentName = opponentPlayer.name || "Unknown Player";
                  } else if (opponentPlayer) {
                    // Fallback to player name even if user check failed
                    opponentName = opponentPlayer.name || "Opponent";
                  }
                  
                  // Final safety check: if opponent name matches current user, use player name or generic
                  const currentUserName = userProfile?.displayName || userProfile?.name || userProfile?.username;
                  if (opponentName === currentUserName || opponentUser?._id === userId) {
                    opponentName = opponentPlayer?.name || `Player ${opponentPlayerId ? opponentPlayerId.slice(-4) : ""}` || "Opponent";
                  }
                  
                  // Get user's score and opponent's score
                  const userScore = isPlayer1 ? match.player1Score : match.player2Score;
                  const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
                  
                  // Check if user won
                  const userWon = match.winnerId && userPlayerIds.has(match.winnerId);
                  
                  // Get game type label
                  const gameTypeLabel = match.tournament?.gameType 
                    ? match.tournament.gameType.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
                    : null;
                  
                  return (
                    <TableRow key={match._id}>
                      <TableCell>
                        {match.status === "completed" && match.winnerId ? (
                          <Medal className={`h-4 w-4 ${
                            userWon ? "text-yellow-500" : "text-gray-400"
                          }`} />
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            {match.status === "in_progress" ? "Live" : "Pending"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{opponentName}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={userWon ? "default" : "outline"} 
                            className={`text-xs ${userWon ? "bg-green-500" : ""}`}
                          >
                            {userScore || 0}
                          </Badge>
                          <span className="text-muted-foreground">-</span>
                          <Badge 
                            variant={!userWon && match.status === "completed" ? "default" : "outline"} 
                            className={`text-xs ${!userWon && match.status === "completed" ? "bg-red-500" : ""}`}
                          >
                            {opponentScore || 0}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {match.tournament ? (
                          <Link 
                            to="/tournaments/$id" 
                            params={{ id: match.tournament._id }}
                            className="text-sm text-primary hover:underline"
                          >
                            {match.tournament.name}
                          </Link>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {gameTypeLabel ? (
                          <Badge variant="secondary" className="text-xs">
                            {gameTypeLabel}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {match.completedAt ? (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{formatDistanceToNow(new Date(match.completedAt), { addSuffix: true })}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link to="/tournaments/$id" params={{ id: match.tournamentId }}>
                          <Button size="sm" variant="ghost">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No matches played yet</p>
                {isOwnProfile && (
                  <Link to="/tournaments">
                    <Button variant="outline" size="sm">
                      Find Tournaments to Play
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Nearby Venues Tab */}
        <TabsContent value="venues" className="space-y-4">
          {venues && venues.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.slice(0, 10).map((venue: any) => {
                  const fullAddress = [venue.address, venue.city, venue.state, venue.country]
                    .filter(Boolean)
                    .join(", ");
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
                  
                  return (
                    <TableRow key={venue._id}>
                      <TableCell className="font-medium">{venue.name}</TableCell>
                      <TableCell>
                        {venue.address ? (
                          <span className="text-sm">{venue.address}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <a 
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
                        >
                          <MapPin className="h-3 w-3" />
                          Open in Google Maps
                          <span className="text-sm">
                            {[venue.city, venue.state, venue.country].filter(Boolean).join(", ")}
                          </span>
                        </a>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            // TODO: Navigate to venue detail page when route is created
                            console.log("Navigate to venue:", venue._id);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">No venues found nearby</p>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Navigate to venues page when route is created
                      console.log("Navigate to venues page");
                    }}
                  >
                    Browse All Venues
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

