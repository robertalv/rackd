"use client";

import { useState, useMemo, Suspense } from "react";
import { createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { callConvexQuery } from "@/lib/convex-server";
import type { RouterAppContext } from "@/routes/__root";
import Loader from "@/components/loader";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { Icon, ChampionIcon, Location03Icon, Share02Icon, Message01Icon, ZapIcon, Chart01Icon, Calendar01Icon } from "@rackd/ui/icons";
import { formatDistanceToNow } from "date-fns";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@rackd/ui/components/empty";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Link } from "@tanstack/react-router";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getGameTypeLabel } from "@/lib/tournament-utils";
import { HeaderLabel } from "@rackd/ui/components/label";
import { PageHeader } from "@/components/layout/page-header";

export const Route = createFileRoute("/_authenticated/players/$id")({
  loader: async ({ context, params }) => {
    const { queryClient, convexQueryClient } = context as RouterAppContext;
    const playerId = params.id as Id<"players"> | Id<"users">;
    
    const player = await callConvexQuery(
      queryClient,
      convexQueryClient,
      api.players.getByIdOrUserId,
      { id: playerId }
    );
    
    if (!player) {
      return { initialPlayer: null };
    }
    
    const resolvedPlayerId = player._id as Id<"players">;
    
    const [organizedTournaments, managedTournaments, playedTournaments, matches, userData] = await Promise.all([
      callConvexQuery(
        queryClient,
        convexQueryClient,
        api.players.getOrganizedTournaments,
        { playerId: resolvedPlayerId }
      ).catch(() => []),
      callConvexQuery(
        queryClient,
        convexQueryClient,
        api.players.getManagedTournaments,
        { playerId: resolvedPlayerId }
      ).catch(() => []),
      callConvexQuery(
        queryClient,
        convexQueryClient,
        api.players.getPlayedTournaments,
        { playerId: resolvedPlayerId }
      ).catch(() => []),
      callConvexQuery(
        queryClient,
        convexQueryClient,
        api.matches.getByPlayerId,
        { playerId: resolvedPlayerId, limit: 100 }
      ).catch(() => []),
      player.userId
        ? callConvexQuery(
            queryClient,
            convexQueryClient,
            api.users.getProfile,
            { userId: player.userId as Id<"users"> }
          ).catch(() => null)
        : Promise.resolve(null),
    ]);
    
    return {
      initialPlayer: player,
      initialOrganizedTournaments: organizedTournaments,
      initialManagedTournaments: managedTournaments,
      initialPlayedTournaments: playedTournaments,
      initialMatches: matches,
      initialUserData: userData,
    };
  },
  component: PlayerDetailPage,
  pendingComponent: () => <Loader />,
});

function PlayerDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"matches" | "tournaments" | "stats">("matches");
  const [tournamentRole, setTournamentRole] = useState<"organizer" | "manager" | "player">("player");
  const [isFollowing, setIsFollowing] = useState(false);

  const player = useQuery(api.players.getByIdOrUserId, { id: id as Id<"players"> | Id<"users"> });
  
  const resolvedPlayerId = useMemo((): Id<"players"> | undefined => {
    if (!player || !player._id) return undefined;
    return player._id as Id<"players">;
  }, [player]);
  
  const hasUserId = player?.userId ? true : false;
  const userId = player?.userId as Id<"users"> | undefined;
  const userData = useQuery(
    api.users.getProfile,
    hasUserId && userId ? { userId } : "skip"
  );

  const playerIdForQueries: Id<"players"> | undefined = resolvedPlayerId;
  const organizedTournaments = useQuery(
    api.players.getOrganizedTournaments,
    playerIdForQueries ? { playerId: playerIdForQueries } : "skip"
  );
  const managedTournaments = useQuery(
    api.players.getManagedTournaments,
    playerIdForQueries ? { playerId: playerIdForQueries } : "skip"
  );
  const playedTournaments = useQuery(
    api.players.getPlayedTournaments,
    playerIdForQueries ? { playerId: playerIdForQueries } : "skip"
  );
  
  const matches = useQuery(
    api.matches.getByPlayerId,
    playerIdForQueries ? { playerId: playerIdForQueries, limit: 100 } : "skip"
  );

  const getPlayerCategory = (rating?: number | null) => {
    if (!rating) return { label: "No Rating", bg: "bg-gray-900/20", text: "text-gray-700", accentBg: "bg-gradient-to-br from-gray-600 to-gray-700" };
    if (rating >= 600) return { label: "Pro Player", bg: "bg-amber-900/20", text: "text-amber-700", accentBg: "bg-gradient-to-br from-amber-600 to-amber-700" };
    if (rating >= 500) return { label: "Advanced Player", bg: "bg-blue-900/20", text: "text-blue-700", accentBg: "bg-gradient-to-br from-blue-600 to-blue-700" };
    if (rating >= 400) return { label: "Intermediate Player", bg: "bg-purple-900/20", text: "text-purple-700", accentBg: "bg-gradient-to-br from-purple-600 to-purple-700" };
    return { label: "Beginner Player", bg: "bg-gray-900/20", text: "text-gray-700", accentBg: "bg-gradient-to-br from-gray-600 to-gray-700" };
  };

  const totalMatches = useMemo(() => matches?.length || 0, [matches]);
  const wins = useMemo(() => matches?.filter(match => match.winnerId === resolvedPlayerId).length || 0, [matches, resolvedPlayerId]);
  const losses = useMemo(() => totalMatches - wins, [totalMatches, wins]);
  const winRate = useMemo(() => totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0", [totalMatches, wins]);

  const achievements = useMemo(() => {
    if (!matches || !player) return [];
    const ach = [];
    const total = matches.length;
    const winsCount = matches.filter(m => m.winnerId === resolvedPlayerId).length;
    const winRateValue = total > 0 ? ((winsCount / total) * 100).toFixed(1) : "0";
    
    if (total > 0 && parseFloat(winRateValue) === 100) {
      ach.push({ icon: "🏆", title: "Perfect Win Rate", description: `Achieved ${winsCount} wins with zero losses` });
    }
    
    if (winsCount >= 10) {
      const streak = matches.slice(-10).filter(m => m.winnerId === resolvedPlayerId).length;
      if (streak >= 10) {
        ach.push({ icon: "⭐", title: "Hot Streak", description: `Won ${streak} matches in a row` });
      }
    }
    
    const playedCount = playedTournaments?.length || 0;
    if (playedCount >= 8) {
      ach.push({ icon: "🎯", title: "Tournament Master", description: `Participated in ${playedCount}+ tournaments` });
    }
    
    return ach;
  }, [matches, resolvedPlayerId, playedTournaments, player]);

  const recentMatches = useMemo(() => {
    if (!matches) return [];
    return matches.slice(0, 10).map(match => {
      const isPlayer1 = match.player1Id === resolvedPlayerId;
      const opponentName = isPlayer1 ? match.player2Name : match.player1Name;
      const selfScore = isPlayer1 ? match.player1Score : match.player2Score;
      const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
      const isWin = match.winnerId === resolvedPlayerId;
      
      return {
        id: match._id,
        opponent: opponentName || "Unknown",
        score: { self: selfScore || 0, opponent: opponentScore || 0 },
        tournament: match.tournamentName || "Unknown Tournament",
        date: formatDistanceToNow(new Date(match.playedAt || Date.now()), { addSuffix: true }),
        type: match.tournament?.gameType ? getGameTypeLabel(match.tournament.gameType) : "Unknown",
        result: isWin ? "Win" : "Loss",
        tournamentId: match.tournament?._id,
      };
    });
  }, [matches, resolvedPlayerId]);

  if (player === undefined || organizedTournaments === undefined || managedTournaments === undefined || playedTournaments === undefined || matches === undefined) {
    return (
      <Suspense fallback={<Loader />}>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading player data...</div>
        </div>
      </Suspense>
    );
  }

  if (!player) {
    throw notFound();
  }

  const isOwnProfile = currentUser?.user?.playerId === resolvedPlayerId;

  const category = getPlayerCategory(player.fargoRating ?? undefined);
  const config = category;

  const location = [player.city].filter(Boolean).join(", ") || "Location not set";

  const username = userData?.username ? `@${userData.username}` : undefined;

  const currentTournaments = 
    tournamentRole === "organizer" ? (organizedTournaments || []) :
    tournamentRole === "manager" ? (managedTournaments || []) :
    (playedTournaments || []);

  const actionButton = !isOwnProfile ? (
    <div className="flex gap-2">
      <Button
        onClick={() => setIsFollowing(!isFollowing)}
        variant={isFollowing ? "default" : "outline"}
      >
        {isFollowing ? 'Following' : 'Follow'}
      </Button>
      <Button variant="outline">
        <Icon icon={Message01Icon} className="h-4 w-4 mr-2" />
        Message
      </Button>
      <Button variant="outline">
        <Icon icon={Share02Icon} className="h-4 w-4" />
      </Button>
    </div>
  ) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={player.name}
        description={username || location}
        actionButton={actionButton}
        sticky={false}
        onBack={() => navigate({ to: "/players" })}
        backLabel="Back to Players"
        showSearch={false}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <Badge className={`${config.bg} ${config.text}`}>
            {category.label}
          </Badge>
          {player.fargoRating && (
            <Badge variant="outline">
              <Icon icon={ChampionIcon} className="h-3 w-3 mr-1" />
              {player.fargoRating} Rating
            </Badge>
          )}
          {location !== "Location not set" && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon icon={Location03Icon} className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="aspect-[21/9] w-full rounded-lg overflow-hidden bg-muted mb-8 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-background border-4 border-border flex items-center justify-center overflow-hidden">
                {player.avatarUrl ? (
                  <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <ProfileAvatar
                    user={{
                      displayName: player.name,
                      image: player.avatarUrl || undefined,
                    }}
                    size="xl"
                  />
                )}
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
                <TabsTrigger 
                  value="matches"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={ZapIcon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">Matches</HeaderLabel>
                </TabsTrigger>
                <TabsTrigger 
                  value="tournaments"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">Tournaments</HeaderLabel>
                </TabsTrigger>
                <TabsTrigger 
                  value="stats"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={Chart01Icon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">Statistics</HeaderLabel>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-6">
                {recentMatches.length > 0 ? (
                  <div className="space-y-3">
                    {recentMatches.map((match) => (
                      <Card key={match.id} className="p-6 bg-card border-border/50 hover:border-accent/50 transition-all">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-foreground">{match.opponent}</span>
                                <span className="text-muted-foreground">vs</span>
                                <span className="font-bold text-foreground">{player.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{match.tournament}</span>
                              <Badge variant="outline" className="text-xs">{match.type}</Badge>
                              <span className="flex items-center gap-1">
                                <Icon icon={Calendar01Icon} className="w-3 h-3" />
                                {match.date}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold mb-2">
                              <span className={match.result === 'Win' ? 'text-green-600' : 'text-red-600'}>
                                {match.score.opponent}
                              </span>
                              <span className="text-muted-foreground mx-2">-</span>
                              <span className={match.result === 'Win' ? 'text-green-600' : 'text-red-600'}>
                                {match.score.self}
                              </span>
                            </div>
                            <Badge className={match.result === 'Win' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {match.result}
                            </Badge>
                          </div>
                          {match.tournamentId && (
                            <Button variant="ghost" className="text-accent hover:bg-accent/10" asChild>
                              <Link to="/tournaments/$id" params={{ id: match.tournamentId }}>
                                View Details →
                              </Link>
                            </Button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Icon icon={ZapIcon} className="h-12 w-12" />
                      </EmptyMedia>
                      <EmptyTitle>No matches played yet</EmptyTitle>
                      <EmptyDescription>
                        This player hasn't played any matches yet
                      </EmptyDescription>
                    </EmptyHeader>
                    {isOwnProfile && (
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/tournaments">
                          <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                          Find Tournaments to Play
                        </Link>
                      </Button>
                    )}
                  </Empty>
                )}
              </TabsContent>

              <TabsContent value="tournaments" className="space-y-6">
                <div className="space-y-4">
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
                          <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                          Find Tournaments
                        </Link>
                      </Button>
                    )}
                  </div>

                  {currentTournaments.length > 0 ? (
                    <div className="space-y-3">
                      {currentTournaments.map((tournament) => (
                        <Card key={tournament._id} className="p-6 bg-card border-border/50 hover:border-accent/50 transition-all">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-foreground mb-2">{tournament.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                {tournament.venue && (
                                  <span>{tournament.venue.name}{tournament.venue.city && `, ${tournament.venue.city}`}</span>
                                )}
                                <Badge variant="outline" className="text-xs">{tournamentRole}</Badge>
                                <span className="flex items-center gap-1">
                                  <Icon icon={Calendar01Icon} className="w-3 h-3" />
                                  {formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-accent/20 text-accent border-0 mb-2 block">
                                Status: {tournament.status}
                              </Badge>
                              {tournament.entryFee && (
                                <p className="text-sm font-semibold text-foreground">Entry: ${tournament.entryFee}</p>
                              )}
                            </div>
                            <Button variant="ghost" className="text-accent hover:bg-accent/10" asChild>
                              <Link to="/tournaments/$id" params={{ id: tournament._id }}>
                                View Details →
                              </Link>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Empty>
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Icon icon={ChampionIcon} className="h-12 w-12" />
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
                            <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                            Browse Tournaments
                          </Link>
                        </Button>
                      )}
                    </Empty>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-center mb-8">
                      <div>
                        <p className="text-4xl font-bold text-accent mb-2">{wins}</p>
                        <p className="text-sm text-muted-foreground">Total Wins</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-foreground mb-2">{winRate}%</p>
                        <p className="text-sm text-muted-foreground">Win Rate</p>
                      </div>
                      <div>
                        <p className="text-4xl font-bold text-primary mb-2">
                          {totalMatches > 0 ? (wins / (wins + losses)).toFixed(1) : "0.0"}
                        </p>
                        <p className="text-sm text-muted-foreground">K/D Ratio</p>
                      </div>
                    </div>

                    {/* Performance Breakdown */}
                    <div className="space-y-4 pt-8 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Recent Form (Last 10 matches)</span>
                        <div className="flex gap-1">
                          {(matches || []).slice(-10).map((match, index) => (
                            <div
                              key={match._id || index}
                              className={`w-3 h-3 rounded-full ${
                                match.winnerId === resolvedPlayerId ? "bg-green-500" : "bg-red-500"
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
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-semibold text-foreground">{winRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Matches</span>
                    <span className="font-semibold text-foreground">{totalMatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Wins</span>
                    <span className="font-semibold text-foreground">{wins}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Losses</span>
                    <span className="font-semibold text-foreground">{losses}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tournaments</span>
                    <span className="font-semibold text-foreground">{(playedTournaments || []).length}</span>
                  </div>
                  {userData && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Followers</span>
                        <span className="font-semibold text-foreground">{userData.followerCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Following</span>
                        <span className="font-semibold text-foreground">{userData.followingCount || 0}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {player.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">{player.bio}</p>
                  </CardContent>
                </Card>
              )}

              {achievements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {achievements.map((achievement, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                        <p className="text-2xl">{achievement.icon}</p>
                        <div>
                          <h3 className="font-semibold text-sm text-foreground mb-1">{achievement.title}</h3>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {location !== "Location not set" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-2">
                      <Icon icon={Location03Icon} className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-muted-foreground">{location}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
