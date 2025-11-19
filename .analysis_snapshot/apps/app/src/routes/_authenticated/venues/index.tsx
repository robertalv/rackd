"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useMemo } from "react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@rackd/ui/components/button";
import { Card } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { PageHeader } from "@/components/layout/page-header";
import { VenueFilters } from "@/components/venues/venue-filters";
import { HeaderLabel } from "@rackd/ui/components/label";
import { 
  Icon, 
  Add01Icon, 
  CallIcon, 
  Clock01Icon, 
  FilterIcon,
  StoreLocation01Icon,
  AnalysisTextLinkIcon
} from "@rackd/ui/icons";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@rackd/ui/components/sheet";
import { ScrollArea } from "@rackd/ui/components/scroll-area";

export const Route = createFileRoute("/_authenticated/venues/")({
  component: VenuesPage,
});

type VenueType = "all" | "pool_hall" | "bar" | "sports_facility" | "business" | "residence" | "other";

function VenuesPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<VenueType>("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "public" | "private" | "membership_needed">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  const myVenues = useQuery(api.venues.getMyVenues);
  const allVenues = useQuery(api.venues.list, {});

  // Calculate type counts
  const typeCounts = useMemo(() => {
    if (!allVenues) return undefined;
    
    const counts: Record<string, number> = {
      all: allVenues.length,
      pool_hall: 0,
      bar: 0,
      sports_facility: 0,
      business: 0,
      residence: 0,
      other: 0,
    };
    
    allVenues.forEach((venue: any) => {
      if (venue.type && counts[venue.type] !== undefined) {
        counts[venue.type]++;
      }
    });
    
    return counts as Record<VenueType, number>;
  }, [allVenues]);

  // Filter venues based on search, type, and access
  const filteredVenues = useMemo(() => {
    if (!allVenues) return [];
    
    return allVenues.filter((venue: any) => {
      const matchesSearch = !searchQuery || 
        venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || venue.type === typeFilter;
      const matchesAccess = accessFilter === "all" || venue.access === accessFilter;
      
      return matchesSearch && matchesType && matchesAccess;
    });
  }, [allVenues, searchQuery, typeFilter, accessFilter]);

  // Calculate quick stats
  const totalVenues = allVenues?.length || 0;
  const publicVenues = allVenues?.filter((v: any) => v.access === "public").length || 0;
  const poolHalls = allVenues?.filter((v: any) => v.type === "pool_hall").length || 0;

  const clearFilters = () => {
    setTypeFilter("all");
    setAccessFilter("all");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <PageHeader
        title="Venues"
        description="Discover pool halls, bars, and venues in your area"
        searchPlaceholder="Search venues..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        actionButton={
          currentUser ? (
            <Button 
              className="bg-primary hover:bg-primary/90 text-white"
              onClick={() => navigate({ to: "/venues/new" })}
            >
              <Icon icon={Add01Icon} className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          ) : undefined
        }
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        sticky={true}
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
                    <VenueFilters
                      selectedType={typeFilter}
                      onTypeChange={(type) => {
                        setTypeFilter(type);
                        setMobileFiltersOpen(false);
                      }}
                      selectedAccess={accessFilter}
                      onAccessChange={setAccessFilter}
                      typeCounts={typeCounts}
                      onClearFilters={clearFilters}
                    />
                    {currentUser && myVenues && myVenues.length > 0 && (
                      <Card className="p-4 bg-card border-border mt-4">
                        <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">My Venues</h3>
                        <div className="space-y-2">
                          {myVenues.map((venue) => (
                            <Link
                              key={venue._id}
                              to="/venues/$id"
                              params={{ id: venue._id }}
                              className="block p-2 rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="font-medium text-sm">{venue.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {venue.type.replace('_', ' ')}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </Card>
                    )}
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
          <div className="space-y-6">
            <VenueFilters
              selectedType={typeFilter}
              onTypeChange={setTypeFilter}
              selectedAccess={accessFilter}
              onAccessChange={setAccessFilter}
              typeCounts={typeCounts}
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
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Venues</span>
                  <span className="font-medium text-foreground">{totalVenues.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Public Venues</span>
                  <span className="font-medium text-foreground">{publicVenues}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pool Halls</span>
                  <span className="font-medium text-foreground">{poolHalls}</span>
                </div>
              </div>
            </Card>

            {/* My Venues */}
            {currentUser && myVenues && myVenues.length > 0 && (
              <Card className="bg-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon={StoreLocation01Icon} className="w-5 h-5 text-primary" />
                  <HeaderLabel size="lg">My Venues</HeaderLabel>
                </div>
                <div className="space-y-2">
                  {myVenues.map((venue) => (
                    <Link
                      key={venue._id}
                      to="/venues/$id"
                      params={{ id: venue._id }}
                      className="block p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="font-medium text-sm">{venue.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {venue.type.replace('_', ' ')}
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">

            {/* Venue Cards */}
            {allVenues === undefined ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Icon icon={StoreLocation01Icon} className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading venues...</p>
                </div>
              </div>
            ) : filteredVenues.length > 0 ? (
              <div className={viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-3"
              }>
                {filteredVenues.map((venue: any) => (
                  <VenueCard 
                    key={venue._id} 
                    venue={venue}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon icon={StoreLocation01Icon} className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No venues found</p>
                <p className="text-muted-foreground text-sm mt-2">
                  {searchQuery || typeFilter !== "all" || accessFilter !== "all"
                    ? "Try adjusting your search terms or filters"
                    : "Be the first to add a venue"}
                </p>
                {currentUser && (
                  <Button 
                    className="mt-4 bg-primary hover:bg-primary/90 text-white"
                    onClick={() => navigate({ to: "/venues/new" })}
                  >
                    <Icon icon={Add01Icon} className="h-4 w-4 mr-2" />
                    Add First Venue
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function VenueCard({ venue, viewMode }: { venue: any; viewMode: "grid" | "list" }) {
  const getTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return { bg: 'bg-green-100', text: 'text-green-800', label: 'Public' };
      case 'private': return { bg: 'bg-red-100', text: 'text-red-800', label: 'Private' };
      case 'membership_needed': return { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Membership Required' };
      default: return { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Unknown' };
    }
  };

  const accessBadge = getAccessColor(venue.access);
  const location = [venue.city, venue.region, venue.country].filter(Boolean).join(", ");

  if (viewMode === "list") {
    return (
      <Link 
        to="/venues/$id" 
        params={{ id: venue._id }}
        className="block group"
      >
        <Card className="p-4 bg-card border-border hover:border-primary/20 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Venue Image */}
            {venue.imageUrl ? (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <img
                  src={venue.imageUrl}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <Icon icon={StoreLocation01Icon} className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                  {venue.name}
                </h3>
                <Badge className={`${accessBadge.bg} ${accessBadge.text} shrink-0 text-xs`}>
                  {accessBadge.label}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                {location && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon={StoreLocation01Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
                {venue.operatingHours && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon={Clock01Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{venue.operatingHours}</span>
                  </div>
                )}
                {venue.phone && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon={CallIcon} className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{venue.phone}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Button */}
            <div className="shrink-0">
              <Button 
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 group-hover:bg-primary group-hover:text-primary-foreground transition-colors whitespace-nowrap"
                onClick={(e) => e.preventDefault()}
              >
                View
              </Button>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // Grid view
  return (
    <Card className="overflow-hidden bg-card border-border hover:border-primary/50 hover:shadow-xl transition-all group py-0">
      {/* Venue Image */}
      <div className="relative h-40 overflow-hidden bg-muted">
        {venue.imageUrl ? (
          <>
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Icon icon={StoreLocation01Icon} className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Access Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${accessBadge.bg} ${accessBadge.text}`}>
            {accessBadge.label}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-2">
          {venue.name}
        </h3>
        {venue.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{venue.description}</p>
        )}

        {/* Info Grid */}
        <div className="space-y-2 mb-4 text-sm">
          {location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={StoreLocation01Icon} className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {venue.operatingHours && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={Clock01Icon} className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">{venue.operatingHours}</span>
            </div>
          )}
          {venue.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Icon icon={CallIcon} className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="truncate">{venue.phone}</span>
            </div>
          )}
        </div>

        {/* Type Badge */}
        <Badge variant="outline" className="mb-4">
          {getTypeDisplay(venue.type)}
        </Badge>

        {/* View Button */}
        <Link to="/venues/$id" params={{ id: venue._id }}>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            View Venue
          </Button>
        </Link>
      </div>
    </Card>
  );
}

