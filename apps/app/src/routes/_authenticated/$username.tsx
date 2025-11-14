"use client";

import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { UserProfileClient } from "@/components/social/user-profile-client";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Icon, UserGroupIcon } from "@rackd/ui/icons";

export const Route = createFileRoute("/_authenticated/$username")({
  component: UserProfilePage,
});

function UserProfilePage() {
  const { username } = Route.useParams();
  const currentUser = useCurrentUser();
  
  const user = useQuery(api.users.getByUsername, { username });
  const userProfile = useQuery(
    api.users.getProfile,
    user?._id ? { userId: user._id } : "skip"
  );

  if (user === undefined || userProfile === undefined) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Icon icon={UserGroupIcon} className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    throw notFound();
  }

  const isOwnProfile = currentUser?.convexUser?._id === user._id;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfileClient 
          user={{
            _id: user._id,
            username: user.username,
            displayName: user.displayName,
            bio: user.bio,
            image: userProfile?.imageUrl,
            followerCount: user.followerCount,
            followingCount: user.followingCount,
            interests: user.interests,
            playerId: user.playerId,
            player: userProfile?.player ? {
              _id: userProfile.player._id,
              name: userProfile.player.name || undefined,
              fargoRating: userProfile.player.fargoRating ?? undefined,
              fargoRobustness: userProfile.player.fargoRobustness ?? undefined,
              fargoReadableId: userProfile.player.fargoReadableId || undefined,
            } : null
          }}
          isOwnProfile={isOwnProfile}
        />
      </div>
    </div>
  );
}

