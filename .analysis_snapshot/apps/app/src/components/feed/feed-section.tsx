"use client";

import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { PostCard } from "@/components/feed/post-card";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Icon, Loading03Icon } from "@rackd/ui/icons";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface FeedSectionProps {
  highlightPostId?: Id<"posts">;
}

export function FeedSection({ highlightPostId }: FeedSectionProps) {
  const posts = useQuery(api.posts.getFeed, { limit: 50 });

  if (posts === undefined) {
    return (
      <section>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Icon icon={Loading03Icon} className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading posts...</span>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section>
        <Card className="border-none">
          <CardContent className="text-center py-12">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">No posts yet</h3>
              <p className="text-muted-foreground">
                Follow some players to see their posts in your feed.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section>
      <div className="space-y-6">
        {posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard 
                key={post._id} 
                post={post} 
                highlight={post._id === highlightPostId}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

