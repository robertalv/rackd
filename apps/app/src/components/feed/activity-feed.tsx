"use client";

import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "@rackd/backend/convex/_generated/api";
import { PostCard } from "@/components/feed/post-card";
import { PostComposer } from "@/components/feed/post-composer";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Loader2, Pin } from "lucide-react";
import { useFeedRefresh } from "@/context/feed-context";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface ActivityFeedProps {
  userId?: Id<"users">;
  showComposer?: boolean;
  feedType?: "user" | "global" | "following";
}

export function ActivityFeed({ 
  userId, 
  showComposer = false, 
  feedType = "following" 
}: ActivityFeedProps) {
  const { refreshKey } = useFeedRefresh();
  const [queryKey, setQueryKey] = useState(0);
  
  useEffect(() => {
    setQueryKey(refreshKey);
  }, [refreshKey]);
  
  const followingPosts = useQuery(
    api.posts.getFeed,
    feedType === "following" ? { limit: 50 } : "skip"
  );
  
  const globalPosts = useQuery(
    api.posts.getDiscoverFeed,
    feedType === "global" ? { limit: 50 } : "skip"
  );
  
  const userPosts = useQuery(
    api.posts.getByUser,
    feedType === "user" && userId ? { userId, limit: 50 } : "skip"
  );
  
  const posts = feedType === "user" ? userPosts : feedType === "global" ? globalPosts : followingPosts;

  if (posts === undefined) {
    return (
      <div className="space-y-6">
        {showComposer && <PostComposer />}
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading posts...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(post => post.isPinned);
  const regularPosts = posts.filter(post => !post.isPinned);

  return (
    <div className="space-y-6">
      {showComposer && <PostComposer />}
      
      {posts.length === 0 ? (
        <Card className="border-none">
          <CardContent className="text-center py-12">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">
                {feedType === "user" 
                  ? "This user hasn't posted anything yet."
                  : feedType === "global"
                  ? "Be the first to share something with the community!"
                  : "Follow some players to see their posts in your feed."
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pinned Posts Section */}
          {pinnedPosts.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center space-x-1 text-sm font-medium text-muted-foreground">
                <Pin className="h-3 w-3" />
                <span className="text-xs">Pinned Posts</span>
              </div>
              <div className="space-y-4">
                {pinnedPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts Section */}
          {regularPosts.length > 0 && (
            <div className="space-y-4">
              {pinnedPosts.length > 0 && (
                <div className="flex items-center space-x-1 text-xs font-medium text-muted-foreground">
                  <span className="text-xs">Recent Posts</span>
                </div>
              )}
              <div className="space-y-4">
                {regularPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}