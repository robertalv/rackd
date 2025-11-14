"use client";

import { useState, useMemo } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Card } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { MapPin, Trophy, Users, Zap, Award, Target, Share2, MessageSquare, BarChart3, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@rackd/ui/components/empty";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Link } from "@tanstack/react-router";
import { ProfileAvatar } from "@/components/profile-avatar";
import { getGameTypeLabel } from "@/lib/tournament-utils";

export const Route = createFileRoute("/_authenticated/players/$id")({
  component: PlayerDetailPage,
});

function PlayerDetailPage() {
  const { id } = Route.useParams();
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"matches" | "tournaments" | "stats">("matches");
  const [tournamentRole, setTournamentRole] = useState<"organizer" | "manager" | "player">("player");
  const [isFollowing, setIsFollowing] = useState(false);

  // Use the new function that handles both user IDs and player IDs
  const player = useQuery(api.players.getByIdOrUserId, { id: id as Id<"players"> | Id<"users"> });
  
  // Get the resolved player ID from the player object
  // Ensure it's a valid player ID (not undefined and player exists)
  const resolvedPlayerId = useMemo((): Id<"players"> | undefined => {
    if (!player || !player._id) return undefined;
    // The player object from getByIdOrUserId should always have a valid player _id
    // Cast to ensure TypeScript knows it's a player ID
    return player._id as Id<"players">;
  }, [player]);
  
  // Get user data - always call hook unconditionally, use skip if no userId
  // Use a stable check to avoid hook order issues
  const hasUserId = player?.userId ? true : false;
  const userId = player?.userId as Id<"users"> | undefined;
  const userData = useQuery(
    api.users.getProfile,
    hasUserId && userId ? { userId } : "skip"
  );

  // Get tournaments - always call hooks unconditionally
  // Use a stable check to avoid hook order issues
  // Only call when we have a valid player ID - use explicit check to ensure type narrowing
  // Create a stable variable to ensure TypeScript type narrowing works correctly
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
  
  // Get matches - always call hook unconditionally
  const matches = useQuery(
    api.matches.getByPlayerId,
    playerIdForQueries ? { playerId: playerIdForQueries, limit: 100 } : "skip"
  );

  // Helper function - must be defined before hooks
  const getPlayerCategory = (rating?: number | null) => {
    if (!rating) return { label: "No Rating", bg: "bg-gray-900/20", text: "text-gray-700", accentBg: "bg-gradient-to-br from-gray-600 to-gray-700" };
    if (rating >= 600) return { label: "Pro Player", bg: "bg-amber-900/20", text: "text-amber-700", accentBg: "bg-gradient-to-br from-amber-600 to-amber-700" };
    if (rating >= 500) return { label: "Advanced Player", bg: "bg-blue-900/20", text: "text-blue-700", accentBg: "bg-gradient-to-br from-blue-600 to-blue-700" };
    if (rating >= 400) return { label: "Intermediate Player", bg: "bg-purple-900/20", text: "text-purple-700", accentBg: "bg-gradient-to-br from-purple-600 to-purple-700" };
    return { label: "Beginner Player", bg: "bg-gray-900/20", text: "text-gray-700", accentBg: "bg-gradient-to-br from-gray-600 to-gray-700" };
  };

  // Calculate statistics - useMemo hooks MUST be called before early returns
  const totalMatches = useMemo(() => matches?.length || 0, [matches]);
  const wins = useMemo(() => matches?.filter(match => match.winnerId === resolvedPlayerId).length || 0, [matches, resolvedPlayerId]);
  const losses = useMemo(() => totalMatches - wins, [totalMatches, wins]);
  const winRate = useMemo(() => totalMatches > 0 ? ((wins / totalMatches) * 100).toFixed(1) : "0", [totalMatches, wins]);

  // Calculate achievements - MUST be called before early returns
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

  // Get recent matches (last 10) - MUST be called before early returns
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

  // Loading state - check after all hooks are called
  if (player === undefined || organizedTournaments === undefined || managedTournaments === undefined || playedTournaments === undefined || matches === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading player data...</div>
      </div>
    );
  }

  if (!player) {
    throw notFound();
  }

  // Determine if this is the current user's own profile
  const isOwnProfile = currentUser?.user?.playerId === resolvedPlayerId;

  // Get player category based on Fargo rating
  const category = getPlayerCategory(player.fargoRating ?? undefined);
  const config = category;

  // Calculate rating trend (mock for now - would need historical data)
  const ratingTrend = 0; // TODO: Calculate from historical ratings

  // Get location
  const location = [player.city].filter(Boolean).join(", ") || "Location not set";

  // Get username from user data
  const username = userData?.username ? `@${userData.username}` : undefined;

  // Get current tournament list based on role
  const currentTournaments = 
    tournamentRole === "organizer" ? (organizedTournaments || []) :
    tournamentRole === "manager" ? (managedTournaments || []) :
    (playedTournaments || []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className={`${config.accentBg} relative overflow-hidden`}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fillRule=%27evenodd%27%3E%3Cg fill=%27%23ffffff%27 fillOpacity=%270.05%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-5xl font-bold text-white shadow-2xl overflow-hidden">
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
              {ratingTrend !== 0 && (
                <Badge className={`absolute -bottom-2 -right-2 text-sm py-1 px-3 ${ratingTrend >= 0 ? 'bg-green-500' : 'bg-red-500'} text-white border-0`}>
                  {ratingTrend >= 0 ? '📈' : '📉'} {Math.abs(ratingTrend)}
                </Badge>
              )}
    </div>

            {/* Player Info */}
            <div className="flex-1 text-white">
              <div className="mb-4">
                <h1 className="text-5xl font-bold mb-2 text-balance">{player.name}</h1>
                {username && <p className="text-lg text-white/80">{username}</p>}
              </div>
              <div className="flex items-center gap-6 text-white/90 text-sm mb-6 flex-wrap">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {location}
                </div>
                <Badge className={`${config.bg} ${config.text} border-0`}>{category.label}</Badge>
                {player.fargoRating && (
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-yellow-300" />
                    {player.fargoRating} Rating
                  </div>
                )}
              </div>
              {/* Action Buttons */}
              {!isOwnProfile && (
                <div className="flex gap-3">
        <Button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={isFollowing ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-white text-primary hover:bg-white/90'}
        >
                    {isFollowing ? 'Following' : 'Follow'}
        </Button>
                  <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
        </Button>
                  <Button variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10">
                    <Share2 className="w-4 h-4" />
        </Button>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="w-full md:w-auto grid grid-cols-2 md:grid-cols-1 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-xs font-semibold mb-1">WIN RATE</p>
                <p className="text-2xl font-bold text-white">{winRate}%</p>
              </div>
              {userData && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <p className="text-white/70 text-xs font-semibold mb-1">FOLLOWERS</p>
                  <p className="text-2xl font-bold text-white">{((userData.followerCount || 0) / 1000).toFixed(1)}K</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Wins', value: wins, icon: Trophy },
            { label: 'Losses', value: losses, icon: Target },
            { label: 'Tournaments', value: (playedTournaments || []).length, icon: Award },
            { label: 'Following', value: userData?.followingCount || 0, icon: Users },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <Card key={i} className="p-4 text-center bg-card border-border/50 hover:border-accent/50 transition-all">
                <Icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                <p className="text-2xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </Card>
            );
          })}
        </div>

        {/* Bio Section */}
        {player.bio && (
          <Card className="p-6 bg-card border-border/50 mb-12">
            <h2 className="text-lg font-bold text-foreground mb-3">About</h2>
            <p className="text-foreground/80 leading-relaxed">{player.bio}</p>
          </Card>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement, i) => (
                <Card key={i} className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20 text-center hover:border-accent/50 transition-all">
                  <p className="text-4xl mb-3">{achievement.icon}</p>
                  <h3 className="font-bold text-foreground mb-1">{achievement.title}</h3>
                  <p className="text-sm text-muted-foreground">{achievement.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
            <TabsTrigger 
              value="matches"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
            >
              <Zap className="w-4 h-4 mr-2" />
              Recent Matches
            </TabsTrigger>
            <TabsTrigger 
              value="tournaments"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Tournaments
            </TabsTrigger>
            <TabsTrigger 
              value="stats"
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Recent Matches */}
          <TabsContent value="matches">
            {recentMatches.length > 0 ? (
              <div className="space-y-4">
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
                            <Calendar className="w-3 h-3" />
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
                    <Zap />
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
          </TabsContent>

          {/* Tournaments */}
          <TabsContent value="tournaments">
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
                <div className="space-y-4">
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
                            <span>{formatDistanceToNow(new Date(tournament.date), { addSuffix: true })}</span>
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
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats">
            <Card className="p-8 bg-card border-border/50">
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
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
