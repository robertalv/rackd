"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@rackd/ui/components/sheet";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { PageHeader } from "@/components/layout/page-header";
import { TournamentPageCard } from "@/components/tournaments/tournament-page-card";
import { TournamentFilters } from "@/components/tournaments/tournament-filters";
import type { TournamentStatus } from "@/lib/tournament-utils";
import { Icon, Add01Icon, FilterIcon, ChampionIcon } from "@rackd/ui/icons";

export const Route = createFileRoute("/_authenticated/tournaments/")({
  component: TournamentsPage,
});

type GameType = "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool" | "all";
type TournamentType = "single" | "double" | "scotch_double" | "teams" | "round_robin" | "all";
type EntryFeeFilter = "all" | "free" | "paid";

function TournamentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TournamentStatus>("all");
  const [gameTypeFilter, setGameTypeFilter] = useState<GameType>("all");
  const [tournamentTypeFilter, setTournamentTypeFilter] = useState<TournamentType>("all");
  const [entryFeeFilter, setEntryFeeFilter] = useState<EntryFeeFilter>("all");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch all tournaments for counts
  const allTournaments = useQuery(api.tournaments.list, {});
  
  // Fetch filtered tournaments
  const tournaments = useQuery(api.tournaments.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  // Calculate status counts from all tournaments
  const statusCounts = useMemo(() => {
    if (!allTournaments) return undefined;
    
    return {
      all: allTournaments.length,
      upcoming: allTournaments.filter((t: any) => t.status === "upcoming").length,
      active: allTournaments.filter((t: any) => t.status === "active").length,
      completed: allTournaments.filter((t: any) => t.status === "completed").length,
      draft: allTournaments.filter((t: any) => t.status === "draft").length,
    };
  }, [allTournaments]);

  // Filter tournaments by all criteria
  const filteredTournaments = useMemo(() => {
    if (!tournaments) return [];
    
    let filtered = tournaments;
    
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter((tournament: any) => {
        const nameMatch = tournament.name?.toLowerCase().includes(searchLower);
        const organizerMatch = tournament.organizerName?.toLowerCase().includes(searchLower);
        const venueMatch = tournament.venue?.name?.toLowerCase().includes(searchLower);
        const cityMatch = tournament.venue?.city?.toLowerCase().includes(searchLower);
        
        return nameMatch || organizerMatch || venueMatch || cityMatch;
      });
    }
    
    // Game type filter
    if (gameTypeFilter !== "all") {
      filtered = filtered.filter((tournament: any) => tournament.gameType === gameTypeFilter);
    }
    
    // Tournament type filter
    if (tournamentTypeFilter !== "all") {
      filtered = filtered.filter((tournament: any) => tournament.type === tournamentTypeFilter);
    }
    
    // Entry fee filter
    if (entryFeeFilter === "free") {
      filtered = filtered.filter((tournament: any) => !tournament.entryFee || tournament.entryFee === 0);
    } else if (entryFeeFilter === "paid") {
      filtered = filtered.filter((tournament: any) => tournament.entryFee && tournament.entryFee > 0);
    }
    
    // Featured filter
    if (showFeaturedOnly) {
      filtered = filtered.filter((tournament: any) => tournament.isFeatured === true);
    }
    
    return filtered;
  }, [tournaments, searchQuery, gameTypeFilter, tournamentTypeFilter, entryFeeFilter, showFeaturedOnly]);

  const clearAllFilters = () => {
    setStatusFilter("all");
    setGameTypeFilter("all");
    setTournamentTypeFilter("all");
    setEntryFeeFilter("all");
    setShowFeaturedOnly(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/95">
      {/* Header Section */}
      <PageHeader
        title="Tournaments"
        description="Discover and join tournaments in your area"
        searchPlaceholder="Search tournaments..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        actionButton={
          <Button 
            className="bg-primary hover:bg-primary/90 text-white"
            onClick={() => navigate({ to: "/tournaments/new" })}
          >
            <Icon icon={Add01Icon} className="h-4 w-4 mr-2" />
            Create Tournament
          </Button>
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        mobileFilterButton={
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Icon icon={FilterIcon} className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Icon icon={FilterIcon} className="h-5 w-5 text-primary" />
                  Filters
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ScrollArea className="h-[calc(100vh-8rem)]">
                  <div className="pr-4">
                    <TournamentFilters
                      selectedStatus={statusFilter}
                      onStatusChange={(status) => {
                        setStatusFilter(status);
                        setMobileFiltersOpen(false);
                      }}
                      selectedGameType={gameTypeFilter}
                      onGameTypeChange={setGameTypeFilter}
                      selectedTournamentType={tournamentTypeFilter}
                      onTournamentTypeChange={setTournamentTypeFilter}
                      selectedEntryFee={entryFeeFilter}
                      onEntryFeeChange={setEntryFeeFilter}
                      showFeatured={showFeaturedOnly}
                      onFeaturedChange={setShowFeaturedOnly}
                      statusCounts={statusCounts}
                      onClearFilters={clearAllFilters}
                    />
                  </div>
                </ScrollArea>
              </div>
            </SheetContent>
          </Sheet>
        }
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="hidden lg:block">
            <TournamentFilters
              selectedStatus={statusFilter}
              onStatusChange={setStatusFilter}
              selectedGameType={gameTypeFilter}
              onGameTypeChange={setGameTypeFilter}
              selectedTournamentType={tournamentTypeFilter}
              onTournamentTypeChange={setTournamentTypeFilter}
              selectedEntryFee={entryFeeFilter}
              onEntryFeeChange={setEntryFeeFilter}
              showFeatured={showFeaturedOnly}
              onFeaturedChange={setShowFeaturedOnly}
              statusCounts={statusCounts}
              onClearFilters={clearAllFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tournament Cards Grid */}
            {tournaments === undefined ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icon icon={ChampionIcon} className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading tournaments...</p>
                </div>
              </div>
            ) : filteredTournaments.length > 0 ? (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredTournaments.map((tournament: any) => (
                  <TournamentPageCard
                    key={tournament._id}
                    tournament={tournament}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon icon={ChampionIcon} className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No tournaments found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {searchQuery 
                    ? "Try adjusting your search terms" 
                    : "Try adjusting your filters"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

