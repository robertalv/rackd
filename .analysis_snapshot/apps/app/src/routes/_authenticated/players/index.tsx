"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { Card } from "@rackd/ui/components/card";
import { PageHeader } from "@/components/layout/page-header";
import { AppPlayersRankingsTable } from "@/components/players/app-players-rankings-table";
import { FargoWorldRankingsTable } from "@/components/players/fargo-world-rankings-table";
import { PlayerFilters } from "@/components/players/player-filters";
import { fetchFargoRatePlayersServer } from "@/lib/fargorate-api";
import type { FargoRatePlayer } from "@rackd/types";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@rackd/ui/components/sheet";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Button } from "@rackd/ui/components/button";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Icon, ChampionIcon, FilterIcon, Location03Icon, AnalysisTextLinkIcon } from "@rackd/ui/icons";

export const Route = createFileRoute("/_authenticated/players/")({
  component: PlayersPage,
});

function PlayersPage() {
  const [activeTab, setActiveTab] = useState("local");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [fargoProPlayers, setFargoProPlayers] = useState<FargoRatePlayer[]>([]);
  const [isLoadingFargo, setIsLoadingFargo] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    region: "",
    fargoRating: [200, 900] as [number, number],
  });

  // Fetch FargoRate top players when world tab is selected
  useEffect(() => {
    const fetchFargoPlayers = async () => {
      if (activeTab === "world" && fargoProPlayers.length === 0) {
        setIsLoadingFargo(true);
        try {
          const players = await fetchFargoRatePlayersServer("World");
          setFargoProPlayers(players);
        } catch (error) {
          console.error("Error fetching FargoRate players:", error);
        } finally {
          setIsLoadingFargo(false);
        }
      }
    };
    fetchFargoPlayers();
  }, [activeTab, fargoProPlayers.length]);

  // Get top 100 app players (sorted by Fargo rating)
  const appPlayers = useQuery(
    api.users.getPlayersForDiscovery,
    { 
      limit: 100,
      minFargoRating: filters.fargoRating[0] !== 200 ? filters.fargoRating[0] : undefined,
      maxFargoRating: filters.fargoRating[1] !== 900 ? filters.fargoRating[1] : undefined,
    }
  );

  // Get all players for stats
  const allPlayersData = useQuery(api.users.getPlayersForDiscovery, { limit: 100 });
  const activePlayersCount = allPlayersData?.length || 0;
  const playersWithRating = allPlayersData?.filter((p: any) => p.fargoRating) || [];
  const avgRating = playersWithRating.length > 0
    ? Math.round(playersWithRating.reduce((sum: number, p: any) => sum + (p.fargoRating || 0), 0) / playersWithRating.length)
    : 0;

  const clearFilters = () => {
    setFilters({
      city: "",
      country: "",
      region: "",
      fargoRating: [200, 900] as [number, number],
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="Top Players"
        description="Discover top-ranked players from the app and worldwide"
        searchPlaceholder="Search players by name or username..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
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
                    <PlayerFilters
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClearFilters={clearFilters}
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
          {/* Sidebar Filters */}
          <div className="space-y-6 hidden lg:block">
            <PlayerFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* Quick Stats */}
            <Card className="bg-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon icon={AnalysisTextLinkIcon} className="w-5 h-5 text-primary" />
                  <HeaderLabel size="lg">Quick Stats</HeaderLabel>
                </div>
              </div>
              <div className="space-y-2 text-sm mt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Players</span>
                  <span className="font-medium text-foreground">{activePlayersCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg. Rating</span>
                  <span className="font-medium text-foreground">{avgRating || "N/A"}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
                <TabsTrigger 
                  value="local"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={Location03Icon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">App</HeaderLabel>
                </TabsTrigger>
                <TabsTrigger 
                  value="world"
                  className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                >
                  <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                  <HeaderLabel size="sm">World</HeaderLabel>
                </TabsTrigger>
              </TabsList>

              {/* App Players Tab - Top 100 players from the app */}
              <TabsContent value="local">
                {appPlayers === undefined ? (
                  <Card>
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Icon icon={Location03Icon} className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                        <p className="text-muted-foreground">Loading app players...</p>
                      </div>
                    </div>
                  </Card>
                ) : appPlayers && appPlayers.length > 0 ? (
                  <div className="p-6">
                    <AppPlayersRankingsTable 
                      players={appPlayers}
                      searchQuery={searchQuery}
                    />
                  </div>
                ) : (
                  <Card>
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Icon icon={Location03Icon} className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No players found</p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>

              {/* World Players Tab */}
              <TabsContent value="world">
                {isLoadingFargo ? (
                  <Card>
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Icon icon={ChampionIcon} className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                        <p className="text-muted-foreground">Loading world rankings from FargoRate...</p>
                      </div>
                    </div>
                  </Card>
                ) : fargoProPlayers.length > 0 ? (
                  <div className="p-6">
                    <FargoWorldRankingsTable 
                      players={fargoProPlayers}
                      searchQuery={searchQuery}
                    />
                  </div>
                ) : (
                  <Card>
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Icon icon={ChampionIcon} className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Unable to load world rankings</p>
                      </div>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
