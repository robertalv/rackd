"use client";

import { TournamentCarousel } from "./tournament-carousel";
import { FeedSection } from "./feed-section";
import { SidebarContent } from "./sidebar-content";
import { PostComposer } from "./post-composer";

export function FeedDashboard() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <PostComposer />
            <TournamentCarousel />
            <FeedSection />
          </div>
          
          <aside className="hidden lg:block">
            <SidebarContent />
          </aside>
        </div>
      </main>
    </div>
  );
}
