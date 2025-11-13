"use client";

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { Input } from "@rackd/ui/components/input";
import { Button } from "@rackd/ui/components/button";
import { Search, Users, Trophy } from "lucide-react";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { DiscoverPlayersTable } from "@/components/social/discover-players-table";
import { FargoWorldRankingsTable } from "@/components/players/fargo-world-rankings-table";
import { fetchFargoRatePlayersServer } from "@/lib/fargorate-api";
import type { FargoRatePlayer } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/players/")({
  component: PlayersPage,
});

function PlayersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fargoProPlayers, setFargoProPlayers] = useState<FargoRatePlayer[]>([]);
  const [isLoadingFargo, setIsLoadingFargo] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    region: "",
    fargoRating: [200, 900] as [number, number],
    location: "",
    followers: "Any",
    engagement: "",
    category: "Any"
  });

  // Fetch FargoRate top players when component mounts or when pro tab is selected
  useEffect(() => {
    const fetchFargoPlayers = async () => {
      if (activeTab === "pro" && fargoProPlayers.length === 0) {
        setIsLoadingFargo(true);
        try {
          const players = await fetchFargoRatePlayersServer("World");
          console.log("FargoRate World Rankings Data:", players);
          console.log("First player details:", players[0]);
          console.log("Total players fetched:", players.length);
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

  // For Pro Rankings tab, we'll filter for high Fargo ratings
  const proFilters = {
    ...filters,
    fargoRating: [600, 900] as [number, number], // Pro level ratings
  };

  // Left panel: Tabs
  const leftPanelContent = (
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="border-b px-4 py-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="flex-1 data-[state=active]:bg-accent"
            >
              <Users className="h-4 w-4 mr-2" />
              All Players
            </TabsTrigger>
            <TabsTrigger
              value="pro"
              className="flex-1 data-[state=active]:bg-accent"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Pro Rankings
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Info/Description */}
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-4">
          {activeTab === "all" && (
            <div className="space-y-2">
              <h3 className="font-semibold">All Players</h3>
              <p className="text-sm text-muted-foreground">
                Browse all players in the Digital Pool community. Use the search above to find specific players by name or username.
              </p>
            </div>
          )}

          {activeTab === "pro" && (
            <div className="space-y-2">
              <h3 className="font-semibold">Pro Rankings</h3>
              <p className="text-sm text-muted-foreground">
                View professional players with Fargo ratings of 600 and above. These are the top-ranked players in the pool community.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Fargo Rating Scale:</strong><br />
                  600+ = Professional<br />
                  500-599 = Advanced<br />
                  400-499 = Intermediate<br />
                  Below 400 = Beginner
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );

  // Right panel: Player List
  const rightPanelContent = (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "all" && (
          <DiscoverPlayersTable 
            searchQuery={searchQuery} 
            filters={filters} 
          />
        )}
        
        {activeTab === "pro" && (
          <div className="space-y-4">
            {isLoadingFargo ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                  <p>Loading world rankings from FargoRate...</p>
                </div>
              </div>
            ) : fargoProPlayers.length > 0 ? (
              <FargoWorldRankingsTable 
                players={fargoProPlayers}
                searchQuery={searchQuery}
              />
            ) : (
              <DiscoverPlayersTable 
                searchQuery={searchQuery} 
                filters={proFilters} 
              />
            )}
          </div>
        )}
      </div>
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
              placeholder="Search players by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Resizable Layout */}
      <ResizableLayout
        leftPanel={{
          content: leftPanelContent,
          label: "Filters",
          icon: Users,
          defaultSize: 30,
          minSize: 20,
          maxSize: 40,
          minWidth: "20rem",
        }}
        rightPanel={{
          content: rightPanelContent,
          label: "Players",
          icon: Search,
          defaultSize: 70,
        }}
        defaultTab="right"
        className="flex-1"
      />
    </div>
  );
}
