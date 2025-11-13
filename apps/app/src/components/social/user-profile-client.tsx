"use client";

import { useState } from "react";
import { useIsMobile } from "@rackd/ui/hooks/use-mobile";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { EnhancedUserCard } from "@/components/feed/enhanced-user-card";
import { FargoRatingCard } from "./fargo-rating-card";
import { NearbyVenues } from "@/components/feed/nearby-venues";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { UserActivityStats } from "./user-activity-stats";
import { Button } from "@rackd/ui/components/button";
import { Users, TrendingUp, Activity } from "lucide-react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface UserProfileClientProps {
  user: {
    _id: Id<"users">;
    username: string;
    displayName: string;
    bio?: string;
    image?: string;
    followerCount: number;
    followingCount: number;
    interests?: string[];
    playerId?: Id<"players">;
    player?: {
      _id: Id<"players">;
      name?: string;
      fargoRating?: number;
      fargoRobustness?: number;
      fargoReadableId?: string;
    } | null;
  };
  isOwnProfile: boolean;
}

export function UserProfileClient({ user, isOwnProfile }: UserProfileClientProps) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"social" | "activity">("social");

  // Left Panel Content
  const leftPanelContent = (
    <div className="h-full overflow-y-auto">
      <div className="space-y-4 p-4">
        {/* Enhanced User Card */}
        <EnhancedUserCard 
          user={{
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            image: user.image,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            interests: user.interests,
            playerId: user.playerId
          }}
          isOwnProfile={isOwnProfile}
        />

        {/* Fargo Rating Card - if user has a linked player */}
        {user.player && (
          <FargoRatingCard player={user.player} />
        )}

        {/* Nearby Venues */}
        <NearbyVenues userId={user._id} limit={5} />
      </div>
    </div>
  );

  // Right Panel Content
  const rightPanelContent = (
    <div className="flex flex-col h-full">
      {/* Action Bar - Fixed at top */}
      <div className="flex-shrink-0 flex justify-end items-center gap-2 p-4 pb-4 border-b bg-background">
        <Button
          variant={viewMode === "social" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setViewMode("social")}
        >
          <Users className="h-4 w-4 mr-2" />
          Social Feed
        </Button>
        <Button
          variant={viewMode === "activity" ? "secondary" : "outline"}
          size="sm"
          onClick={() => setViewMode("activity")}
        >
          <Activity className="h-4 w-4 mr-2" />
          Activity & Stats
        </Button>
      </div>

      {/* Content based on view mode - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        {viewMode === "social" ? (
          <ActivityFeed 
            userId={user._id} 
            feedType="user" 
            showComposer={isOwnProfile}
          />
        ) : (
          <UserActivityStats 
            userId={user._id}
            isOwnProfile={isOwnProfile}
          />
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
        label: "Profile",
        icon: Users,
        defaultSize: 25,
        minSize: 10,
        maxSize: 35,
        minWidth: "20rem",
      }}
      rightPanel={{
        content: rightPanelContent,
        label: "Content",
        icon: TrendingUp,
        defaultSize: 75,
      }}
    />
  );
}

