"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Card } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Link } from "@tanstack/react-router";
import { ProfileAvatar } from "@/components/profile-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useNavigate } from "@tanstack/react-router";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Icon, ChampionIcon, TradeUpIcon, ThumbsUpIcon } from "@rackd/ui/icons";

export function SidebarContent() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  
  const topPlayers = useQuery(api.users.getPlayersForDiscovery, { 
    limit: 5 
  });
  
  const trendingHashtags = useQuery(api.posts.getTrendingHashtags, { 
    limit: 5 
  });
  
  const followSuggestions = useQuery(api.follows.getSuggestions, { 
    limit: 3 
  });
  
  const follow = useMutation(api.follows.follow);
  const unfollow = useMutation(api.follows.unfollow);
  
  const handleFollow = async (userId: string) => {
    try {
      await follow({ userId: userId as any });
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const formatHashtagCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className="space-y-6">
      {topPlayers && topPlayers.length > 0 && (
        <Card className="bg-card p-4">
          <div className="flex items-center gap-2">
            <Icon icon={ChampionIcon} className="w-5 h-5 text-primary" />
            <HeaderLabel size="lg">Top Rankings</HeaderLabel>
          </div>
          
          <div className="space-y-1">
            {topPlayers.map((player, index) => {
              const rank = index + 1;
              const rating = player.fargoRating || 0;
              const change: string = "+0";
              
              return (
                <button
                  key={player._id}
                  type="button"
                  onClick={() => {
                    navigate({
                      to: "/players/$id",
                      params: { id: player._id }
                    });
                  }}
                  className="
                    w-full
                    px-3 py-2
                    rounded-lg
                    flex items-center justify-between
                    hover:bg-muted transition-colors group
                    border border-transparent hover:border-primary/10
                    cursor-pointer
                    -mx-3
                  "
                  style={{ textAlign: "left" }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span
                      className={`font-bold rounded-full w-8 h-8 flex items-center justify-center
                        ${
                          rank === 1
                            ? "bg-gradient-to-tr from-[#ffd700] to-[#fffbe6] text-yellow-700 shadow"
                            : rank === 2
                            ? "bg-gradient-to-tr from-[#BFC2C8] to-[#ddd] text-gray-600"
                            : rank === 3
                            ? "bg-gradient-to-tr from-[#cd7f32] to-[#f0e1d2] text-amber-700"
                            : "bg-accent text-accent-foreground"
                        }
                        text-lg transition-all`}
                      style={{ minWidth: 32, minHeight: 32 }}
                    >
                      {rank}
                    </span>
                    <span className="truncate flex-1 text-foreground font-semibold text-sm group-hover:underline transition group-hover:text-primary">
                      {player.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end min-w-[48px]">
                    <span className="text-xs text-muted-foreground whitespace-nowrap pl-2 font-medium">
                      {rating}
                    </span>
                    {change !== "+0" && (
                      <Badge
                        variant={change.startsWith('+') ? 'default' : 'secondary'}
                        className={`text-xs font-semibold px-1.5 mt-1 ${change.startsWith('+') ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-400'}`}
                      >
                        {change}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <Button variant="outline" className="w-full text-primary hover:text-primary" asChild>
            <Link to="/players">View Full Rankings</Link>
          </Button>
        </Card>
      )}

      {/* Trending Hashtags */}
      {trendingHashtags && trendingHashtags.length > 0 && (
        <Card className="bg-card p-4">
          <div className="flex items-center gap-2">
            <Icon icon={TradeUpIcon} className="w-5 h-5 text-primary" />
            <HeaderLabel size="lg">Trending</HeaderLabel>
          </div>
          <div className="flex flex-col gap-1">
            {trendingHashtags.map((hashtag) => (
              <button
                key={hashtag._id}
                onClick={() => navigate({ to: `/hashtag/${hashtag.tag}` })}
                className="
                  w-full
                  px-3 py-2
                  rounded-lg
                  flex items-center justify-between
                  hover:bg-muted transition-colors group
                  border border-transparent hover:border-primary/10
                "
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-base font-semibold text-primary group-hover:underline truncate">
                    #{hashtag.displayTag || hashtag.tag}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap pl-3 font-medium">
                  {formatHashtagCount(hashtag.useCount)} post{hashtag.useCount === 1 ? "" : "s"}
                </span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Recommended Players */}
      {followSuggestions && followSuggestions.length > 0 && (
        <Card className="bg-card p-4">
          <div className="flex items-center gap-2">
            <Icon icon={ThumbsUpIcon} className="w-5 h-5 text-primary" />
            <HeaderLabel size="lg">Recommended to Follow</HeaderLabel>
          </div>
          <div className="flex flex-col gap-1">
            {followSuggestions.map((user) => {
              const mutual = 0;
              
              return (
                <div
                  key={user._id}
                  className="w-full px-3 py-2 rounded-lg flex items-center justify-between hover:bg-muted transition-colors border border-transparent hover:border-primary/10"
                >
                  <div
                    className="flex items-center gap-3 min-w-0 cursor-pointer"
                    onClick={() => navigate({ to: `/${user.username || "user"}` })}
                  >
                    <ProfileAvatar
                      user={{
                        displayName: user.name || user.displayName || user.username || "User",
                        image: user.image ?? undefined,
                        country: user.country ?? undefined
                      }}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                      {mutual > 0 && (
                        <span className="text-xs text-muted-foreground">{mutual} mutual follows</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground ml-2 whitespace-nowrap"
                    onClick={() => handleFollow(user._id)}
                  >
                    Follow
                  </Button>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

