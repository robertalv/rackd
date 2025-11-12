"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { TournamentList } from "@/components/tournaments/tournament-list";
import type { TournamentStatus } from "@/lib/tournament-utils";
import { ListFilter, Info, Search, Plus, LayoutList, LayoutGrid } from "lucide-react";
import { Input } from "@rackd/ui/components/input";
import { Button } from "@rackd/ui/components/button";
import { ScrollArea } from "@rackd/ui/components/scroll-area";

export const Route = createFileRoute("/_authenticated/tournaments/")({
  component: TournamentsPage,
});

function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState<TournamentStatus>("all");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filters: TournamentStatus[] = ["all", "upcoming", "active", "completed"];

  // Left panel: Status Filters
  const leftPanelContent = (
    <div className="flex h-full flex-col">
      {/* Status Filter Header */}
      <div className="border-b px-4 py-3.5">
        <div className="flex gap-2">
          {filters.map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="flex-1"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Additional Filters Area (empty for now, can be expanded later) */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3">
          {/* Future filters can go here */}
        </div>
      </ScrollArea>
    </div>
  );

  // Right panel: Tournament List with View Options
  const rightPanelContent = (
    <div className="flex h-full flex-col">
      {/* View Options Bar */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "list" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={() => navigate({ to: "/tournaments/new" })}>
            <Plus className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        </div>
      </div>

      {/* Tournament List */}
      <ScrollArea className="flex-1">
        <TournamentList statusFilter={statusFilter} viewMode={viewMode} searchQuery={searchQuery} />
      </ScrollArea>
    </div>
  );

  return (
    <div className="flex h-full flex-col">
      {/* Action Bar */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button>Apply Filters</Button>
        </div>
      </div>

      {/* Resizable Layout */}
      <ResizableLayout
        leftPanel={{
          content: leftPanelContent,
          label: "Filters",
          icon: ListFilter,
          defaultSize: 25,
          minSize: 20,
          maxSize: 40,
          minWidth: "18rem",
        }}
        rightPanel={{
          content: rightPanelContent,
          label: "Tournaments",
          icon: Info,
          defaultSize: 75,
        }}
        defaultTab="right"
        className="flex-1"
      />
    </div>
  );
}

