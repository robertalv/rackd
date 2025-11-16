"use client";

import { TournamentCarousel } from "./tournament-carousel";
import { FeedSection } from "./feed-section";
import { SidebarContent } from "./sidebar-content";
import { PostComposer } from "./post-composer";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface FeedDashboardProps {
  highlightPostId?: Id<"posts">;
}

export function FeedDashboard({ highlightPostId }: FeedDashboardProps) {
  return (
    <div className="bg-background min-h-full">
      <main className="mx-auto max-w-7xl px-4 pt-0 pb-4 sm:px-6 sm:pt-4 sm:pb-6 lg:px-8 lg:pt-8 lg:pb-8">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            <PostComposer />
            <TournamentCarousel />
            <FeedSection highlightPostId={highlightPostId} />
          </div>
          
          <aside className="hidden lg:block">
            <SidebarContent />
          </aside>
        </div>
      </main>
    </div>
  );
}