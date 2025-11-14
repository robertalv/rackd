"use client";

import { useState } from "react";
import { EnhancedUserCard } from "@/components/feed/enhanced-user-card";
import { FargoRatingCard } from "./fargo-rating-card";
import { NearbyVenues } from "@/components/feed/nearby-venues";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { UserActivityStats } from "./user-activity-stats";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@rackd/ui/components/tabs";
import { Users, Activity } from "lucide-react";
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
  const [viewMode, setViewMode] = useState<"social" | "activity">("social");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar */}
      <div className="space-y-6">
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

      {/* Right Main Content */}
      <div className="lg:col-span-3">
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "social" | "activity")} className="w-full">
          <div className="sticky top-0 z-10 mb-6 bg-background py-2">
            <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
              <TabsTrigger 
                value="social"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
              >
                <Users className="h-4 w-4 mr-2" />
                Social Feed
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
              >
                <Activity className="h-4 w-4 mr-2" />
                Activity & Stats
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="social" className="mt-0">
            <ActivityFeed 
              userId={user._id} 
              feedType="user" 
              showComposer={isOwnProfile}
            />
          </TabsContent>

          <TabsContent value="activity" className="mt-0">
            <UserActivityStats 
              userId={user._id}
              isOwnProfile={isOwnProfile}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}


