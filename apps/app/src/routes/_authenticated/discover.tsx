"use client";

import { createFileRoute } from '@tanstack/react-router';
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { DiscoverPlayersTable } from "@/components/discover/discover-players-table";
import { DiscoverTournamentsTable } from "@/components/discover/discover-tournaments-table";
import { ActivityFeed } from "@/components/feed/activity-feed";
import { Input } from "@rackd/ui/components/input";
import { Button } from "@rackd/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { Search, Filter, MapPin, DollarSign, Calendar, Users } from "lucide-react";
import { FargoRatingSelect } from "@/components/discover/fargo-rating-select";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { FeedProvider } from "@/context/feed-context";

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
    category: "all"
  });

  const renderPlayerFilters = () => (
    <div className="space-y-3">
      <ExpandableSection title="Location" icon={<MapPin className="h-4 w-4" />} expanded>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">City</label>
            <Input 
              placeholder="Enter city" 
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Country</label>
            <Input 
              placeholder="Enter country" 
              value={filters.country}
              onChange={(e) => setFilters({...filters, country: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">State/Region</label>
            <Input 
              placeholder="Enter state/region" 
              value={filters.region}
              onChange={(e) => setFilters({...filters, region: e.target.value})}
            />
          </div>
        </div>
      </ExpandableSection>
      <ExpandableSection title="Skill Level" icon={<Users className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Fargo Rating</label>
          <FargoRatingSelect
            value={filters.fargoRating}
            onValueChange={(value) => setFilters({...filters, fargoRating: value})}
          />
        </div>
      </ExpandableSection>
    </div>
  );

  const renderTournamentFilters = () => (
    <div className="space-y-3">
      <ExpandableSection title="Location" icon={<MapPin className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Location</label>
          <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
            <SelectTrigger>
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              <SelectItem value="local">Local</SelectItem>
              <SelectItem value="regional">Regional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </ExpandableSection>
      <ExpandableSection title="Status" icon={<Calendar className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Status</label>
          <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
            <SelectTrigger>
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
      <ExpandableSection title="Entry Fee" icon={<DollarSign className="h-4 w-4" />}>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Entry Fee</label>
          <Select value={filters.followers} onValueChange={(value) => setFilters({...filters, followers: value})}>
            <SelectTrigger>
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
    <div className="space-y-3">
      <ExpandableSection title="Category" icon={<Filter className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Category</label>
          <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
            <SelectTrigger>
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
      <ExpandableSection title="Sort" icon={<Filter className="h-4 w-4" />} expanded>
        <div>
          <label className="text-xs text-muted-foreground mb-1.5 block">Sort by</label>
          <Select value={filters.age} onValueChange={(value) => setFilters({...filters, age: value})}>
            <SelectTrigger>
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

  // Left panel: Tabs and Filters
  const leftPanelContent = (
    <div className="flex h-full flex-col">
      {/* Tab Navigation */}
      <div className="border-b px-4 py-3">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent p-0">
            <TabsTrigger
              value="players"
              className="flex-1 data-[state=active]:bg-accent"
            >
              Players
            </TabsTrigger>
            <TabsTrigger
              value="tournaments"
              className="flex-1 data-[state=active]:bg-accent"
            >
              Tournaments
            </TabsTrigger>
            <TabsTrigger
              value="posts"
              className="flex-1 data-[state=active]:bg-accent"
            >
              Posts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <ScrollArea className="flex-1 px-4 py-4">
        {activeTab === "players" && renderPlayerFilters()}
        {activeTab === "tournaments" && renderTournamentFilters()}
        {activeTab === "posts" && renderPostFilters()}
      </ScrollArea>
    </div>
  );

  // Right panel: Results
  const rightPanelContent = (
    <div className="flex h-full flex-col overflow-y-auto">
      {activeTab === "players" && (
        <DiscoverPlayersTable 
          searchQuery={searchQuery} 
          filters={{
            ...filters,
            engagement: ""
          }} 
        />
      )}
      
      {activeTab === "tournaments" && (
        <DiscoverTournamentsTable 
          searchQuery={searchQuery} 
          filters={{
            ...filters,
            engagement: ""
          }} 
        />
      )}
      
      {activeTab === "posts" && (
        <div className="p-4">
          <ActivityFeed feedType="global" />
        </div>
      )}
    </div>
  );

  return (
    <FeedProvider>
      <div className="flex h-full flex-col">
        {/* Action Bar */}
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
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
            icon: Filter,
            defaultSize: 30,
            minSize: 20,
            maxSize: 40,
            minWidth: "20rem",
          }}
          rightPanel={{
            content: rightPanelContent,
            label: "Results",
            icon: Search,
            defaultSize: 70,
          }}
          defaultTab="right"
          className="flex-1"
        />
      </div>
    </FeedProvider>
  );
}

