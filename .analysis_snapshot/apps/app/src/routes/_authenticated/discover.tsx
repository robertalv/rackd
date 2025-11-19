"use client";

import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@rackd/ui/components/tabs";
import { DiscoverPlayersGrid } from "@/components/discover/discover-players-grid";
import { DiscoverTournamentsGrid } from "@/components/discover/discover-tournaments-grid";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { Input } from "@rackd/ui/components/input";
import { Button } from "@rackd/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { Card } from "@rackd/ui/components/card";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { PageHeader } from "@/components/layout/page-header";
import { FargoRatingSelect } from "@/components/discover/fargo-rating-select";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { FeedProvider } from "@/context/feed-context";
import { HeaderLabel } from "@rackd/ui/components/label";
import { 
  Icon, 
  AnalysisTextLinkIcon, 
  Location03Icon,
  ChartScatterIcon, 
  UserGroupIcon, 
  ChampionIcon, 
  Layers02Icon,
  Calendar02Icon,
  Money03Icon,
  FilterIcon,
  SortByDown01Icon,
  Cancel01Icon
} from "@rackd/ui/icons";

export const Route = createFileRoute('/_authenticated/discover')({
  component: DiscoverPage,
});

function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    region: "",
    fargoRating: [200, 900] as [number, number],
    location: "all",
    age: "recent",
    followers: "any",
    gender: "any",
    category: "all",
    venue: ""
  });

  // Get quick stats
  const playersData = useQuery(api.users.getPlayersForDiscovery, { limit: 100 });
  const tournaments = useQuery(api.tournaments.getAllTournaments, {});
  
  const activePlayersCount = playersData?.length || 0;
  const upcomingTournaments = tournaments?.filter((t: any) => t.status === "upcoming").length || 0;
  const playersWithRating = playersData?.filter((p: any) => p.fargoRating) || [];
  const avgRating = playersWithRating.length > 0
    ? Math.round(playersWithRating.reduce((sum: number, p: any) => sum + (p.fargoRating || 0), 0) / playersWithRating.length)
    : 0;

  const hasActiveFilters = Object.values(filters).some(v => 
    Array.isArray(v) ? (v[0] !== 200 || v[1] !== 900) : v && v !== "all" && v !== "recent" && v !== "any" && v !== ""
  );

  const resetFilters = () => {
    setFilters({
      city: "",
      country: "",
      region: "",
      fargoRating: [200, 900] as [number, number],
      location: "all",
      age: "recent",
      followers: "any",
      gender: "any",
      category: "all",
      venue: ""
    });
  };

  const renderPlayerFilters = () => (
    <div className="space-y-4">
      <ExpandableSection title="Location" icon={<Icon icon={Location03Icon} className="h-4 w-4" />} expanded>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">City</label>
            <Input 
              placeholder="Enter city" 
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="h-9"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Country</label>
            <Input 
              placeholder="Enter country" 
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
              className="h-9"
            />
          </div>
          
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">State/Region</label>
            <Input 
              placeholder="Enter state/region" 
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
              className="h-9"
            />
          </div>
        </div>
      </ExpandableSection>
      <ExpandableSection title="Skill Level" icon={<Icon icon={ChartScatterIcon} className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Fargo Rating</label>
          <FargoRatingSelect
            value={filters.fargoRating}
            onValueChange={(value) => setFilters({...filters, fargoRating: value})}
          />
        </div>
      </ExpandableSection>
    </div>
  );

  const renderTournamentFilters = () => (
    <div className="space-y-4">
      <ExpandableSection title="Location" icon={<Icon icon={Location03Icon} className="h-4 w-4" />} expanded>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Venue</label>
            <Input 
              placeholder="Search venues..." 
              value={filters.venue}
              onChange={(e) => setFilters({...filters, venue: e.target.value})}
              className="h-9"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Location Type</label>
            <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="regional">Regional</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </ExpandableSection>
      <ExpandableSection title="Status" icon={<Icon icon={Calendar02Icon} className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Status</label>
          <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="active">Active</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExpandableSection>
      <ExpandableSection title="Entry Fee" icon={<Icon icon={Money03Icon} className="h-4 w-4" />}>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Entry Fee</label>
          <Select value={filters.followers} onValueChange={(value) => setFilters({...filters, followers: value})}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExpandableSection>
    </div>
  );

  const renderPostFilters = () => (
    <div className="space-y-4">
      <ExpandableSection title="Category" icon={<Icon icon={FilterIcon} className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Category</label>
          <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tips">Tips & Tricks</SelectItem>
              <SelectItem value="tournaments">Tournament Updates</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExpandableSection>
      <ExpandableSection title="Sort" icon={<Icon icon={SortByDown01Icon} className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs font-medium text-foreground mb-1.5 block">Sort by</label>
          <Select value={filters.age} onValueChange={(value) => setFilters({...filters, age: value})}>
            <SelectTrigger className="h-9 w-full">
              <SelectValue placeholder="Most Recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExpandableSection>
    </div>
  );

  return (
    <FeedProvider>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <PageHeader
          title="Discover"
          description="Find players, tournaments, and venues"
          searchPlaceholder="Search players, tournaments, venues..."
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          sticky={true}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="space-y-6">
              <Card className="bg-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon icon={FilterIcon} className="w-5 h-5 text-primary" />
                    <HeaderLabel size="lg">Filters</HeaderLabel>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <Icon icon={Cancel01Icon} className="h-3 w-3" />
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {activeTab === "players" && renderPlayerFilters()}
                  {activeTab === "tournaments" && renderTournamentFilters()}
                  {activeTab === "posts" && renderPostFilters()}
                </div>

                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6">
                  Apply Filters
                </Button>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon icon={AnalysisTextLinkIcon} className="w-5 h-5 text-primary" />
                    <HeaderLabel size="lg">Quick Stats</HeaderLabel>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Players</span>
                    <span className="font-medium text-foreground">{activePlayersCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upcoming Events</span>
                    <span className="font-medium text-foreground">{upcomingTournaments}</span>
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
                <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 h-auto rounded-lg border border-border/50 shadow-sm">
                  <TabsTrigger 
                    value="players"
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                  >
                    <Icon icon={UserGroupIcon} className="h-4 w-4 mr-2" />
                    <HeaderLabel size="sm">Players</HeaderLabel>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tournaments"
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                  >
                    <Icon icon={ChampionIcon} className="h-4 w-4 mr-2" />
                    <HeaderLabel size="sm">Tournaments</HeaderLabel>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="posts"
                    className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm data-[state=active]:font-semibold text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-md transition-all duration-200"
                  >
                    <Icon icon={Layers02Icon} className="h-4 w-4 mr-2" />
                    <HeaderLabel size="sm">Posts</HeaderLabel>
                  </TabsTrigger>
                </TabsList>

                {/* Players Tab */}
                <TabsContent value="players">
                  <DiscoverPlayersGrid 
                    searchQuery={searchQuery} 
                    filters={{
                      ...filters,
                      engagement: ""
                    }} 
                  />
                </TabsContent>

                {/* Tournaments Tab */}
                <TabsContent value="tournaments">
                  <DiscoverTournamentsGrid 
                    searchQuery={searchQuery} 
                    filters={{
                      ...filters,
                      engagement: ""
                    }} 
                  />
                </TabsContent>

                {/* Posts Tab */}
                <TabsContent value="posts">
                  <ActivityFeed feedType="global" />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </FeedProvider>
  );
}

