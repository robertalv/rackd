"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { EnhancedUserCard } from "@/components/feed/enhanced-user-card";
import { NearbyVenues } from "@/components/feed/nearby-venues";
import { FeedProvider } from "@/context/feed-context";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { useIsMobile } from "@rackd/ui/hooks/use-mobile";
import { Users, UserPlus, Hash, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useCurrentUser, useIsCurrentUser } from "@/hooks/use-current-user";
import { NavigationButton } from "../navigation-button";
import { ProfileAvatar } from "../profile-avatar";

export function FeedDashboard() {
  const isMobile = useIsMobile();
  const { user: currentUser } = useCurrentUser();
  const isOwnProfile = useIsCurrentUser(currentUser?._id as unknown as Id<"users">);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [selectedHashtagIndex, setSelectedHashtagIndex] = useState(0);
  const hashtagSuggestionsRef = useRef<HTMLDivElement>(null);
  
  // Get the custom user from our database (not Better Auth's internal table)
  const customUser = useQuery(api.users.currentUser);
  
  const userProfile = useQuery(
    api.users.getProfile,
    customUser ? { userId: customUser._id } : "skip"
  );
  
  const userStats = useQuery(
    api.users.getStats,
    customUser ? { userId: customUser._id } : "skip"
  );
  
  const recentUsers = useQuery(api.users.getRecentUsers, { limit: 3 });
  const trendingHashtags = useQuery(api.posts.getTrendingHashtags, { limit: 5 });
  const hashtagSearchResults = useQuery(
    api.posts.searchHashtags,
    hashtagQuery.length >= 1 ? { query: hashtagQuery, limit: 10 } : "skip"
  );
  const notifications = useQuery(api.notifications.getUnreadCount);

  // Handle hashtag click to show search
  const handleHashtagClick = (hashtag: any) => {
    setHashtagQuery(hashtag.displayTag);
    setShowHashtagSuggestions(true);
    setSelectedHashtagIndex(0);
  };

  // Handle hashtag selection from search results
  const handleHashtagSelect = (hashtag: any) => {
    // Navigate to hashtag page or handle selection
    window.location.href = `/hashtag/${hashtag.tag}`;
    setShowHashtagSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (hashtagSuggestionsRef.current && !hashtagSuggestionsRef.current.contains(event.target as Node)) {
        setShowHashtagSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Left Panel - Profile & Trending Content
  const leftPanelContent = (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* User Profile Card */}
        {customUser && userStats && (
          <EnhancedUserCard 
            user={{
              _id: customUser._id,
              username: customUser.username || "user",
              displayName: customUser.name || "User",
              bio: userProfile?.player?.bio || undefined,
              image: userProfile?.imageUrl || customUser.image || undefined,
              country: undefined, // Add if available in schema
              followerCount: userStats.followerCount,
              followingCount: userStats.followingCount,
              interests: customUser.interests || undefined,
              playerId: customUser.playerId,
            }} 
            isOwnProfile={isOwnProfile}
          />
        )}

        {/* New Members */}
        {recentUsers && recentUsers.length > 0 && (
          <ExpandableSection
            title="New Members"
            expanded={true}
            icon={
              <NavigationButton
                icon={UserPlus}
                ariaLabel="New Members"
              />
            }
          >
            <div className="space-y-3">
                {recentUsers.map((user: any) => {
                  const daysAgo = Math.floor((Date.now() - user._creationTime) / (1000 * 60 * 60 * 24));
                  const timeText = daysAgo === 0 ? "today" : `${daysAgo}d ago`;
                  
                  return (
                    <div 
                      key={user._id}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => window.location.href = `/${user.username || "user"}`}
                    >
                      <ProfileAvatar
                        user={{
                          displayName: currentUser?.displayName || user.username || "User",
                          image: currentUser?.imageUrl ?? undefined,
                          country: undefined
                        }}
                        size="sm"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.displayName || user.name}</p>
                        <p className="text-xs text-muted-foreground">@{user.username}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {timeText}
                      </div>
                    </div>
                  );
                })}
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/discover/players">
                  <Users className="h-4 w-4 mr-2" />
                  Discover More Players
                </a>
              </Button>
            </div>
          </ExpandableSection>
        )}

        {/* Trending Hashtags */}
        {trendingHashtags && trendingHashtags.length > 0 && (
          <ExpandableSection
            title="Trending Hashtags"
            expanded={true}
            icon={
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Hash className="h-5 w-5 text-blue-500" />
              </div>
            }
          >
            <div className="space-y-3 relative">
                {trendingHashtags.map((hashtag: any) => (
                  <div 
                    key={hashtag._id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer"
                    onClick={() => handleHashtagClick(hashtag)}
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">#{hashtag.displayTag}</p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {hashtag.useCount} {hashtag.useCount === 1 ? 'post' : 'posts'}
                    </div>
                  </div>
                ))}
                
                {/* Hashtag suggestions dropdown */}
                {showHashtagSuggestions && hashtagSearchResults && hashtagSearchResults.length > 0 && (
                  <div
                    ref={hashtagSuggestionsRef}
                    className="absolute top-0 left-0 right-0 mt-2 bg-accent border border-accent-foreground/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
                  >
                    <div className="p-2">
                      <p className="text-xs text-muted-foreground mb-2">Similar hashtags:</p>
                      {hashtagSearchResults.map((hashtag: any, index: number) => (
                        <div
                          key={hashtag._id}
                          className={`flex items-center justify-between px-3 py-2 cursor-pointer rounded-md hover:bg-muted ${
                            index === selectedHashtagIndex ? 'bg-muted' : ''
                          }`}
                          onClick={() => handleHashtagSelect(hashtag)}
                        >
                          <div className="flex items-center space-x-2">
                            <Hash className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">#{hashtag.displayTag}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {hashtag.useCount} {hashtag.useCount === 1 ? 'post' : 'posts'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
            
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                <Hash className="h-4 w-4 mr-2" />
                Explore More Tags
              </Button>
            </div>
          </ExpandableSection>
        )}

        {/* Nearby Venues */}
        {currentUser && (
          <NearbyVenues limit={5} />
        )}
      </div>
    </div>
  );

  // Right Panel - Feed & Composer
  const rightPanelContent = (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6 p-4">
        {/* Notifications */}
        {notifications !== undefined && notifications > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Notifications
                <Badge variant="destructive">{notifications}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link to="/feed">
                <Button variant="outline" className="w-full">
                  View All Notifications
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Activity Feed with Composer */}
        <ActivityFeed showComposer={true} feedType="following" />
      </div>
    </div>
  );

  return (
    <FeedProvider>
      <ResizableLayout
        isMobile={isMobile}
        defaultTab="right"
        leftPanel={{
          content: leftPanelContent,
          label: "Profile",
          icon: Users,
          defaultSize: 25,
          minSize: 10,
          maxSize: 35,
          minWidth: "20rem",
        }}
        rightPanel={{
          content: rightPanelContent,
          label: "Feed",
          icon: TrendingUp,
          defaultSize: 75,
        }}
      />
    </FeedProvider>
  );
}