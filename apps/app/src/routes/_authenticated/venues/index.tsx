"use client";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { MapPin, Plus, Edit, Phone, Mail, Globe, Clock, Search, ListFilter } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/venues/")({
  component: VenuesPage,
});

function VenuesPage() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  
  const myVenues = useQuery(api.venues.getMyVenues);
  const allVenues = useQuery(api.venues.list, {});

  const venueTypes = [
    { value: "all", label: "All Types" },
    { value: "pool_hall", label: "Pool Hall" },
    { value: "bar", label: "Bar" },
    { value: "sports_facility", label: "Sports Facility" },
    { value: "business", label: "Business" },
    { value: "residence", label: "Residence" },
    { value: "other", label: "Other" },
  ];

  // Filter venues based on search and type
  const filteredVenues = allVenues?.filter((venue) => {
    const matchesSearch = !searchQuery || 
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || venue.type === typeFilter;
    
    return matchesSearch && matchesType;
  }) || [];

  // Left panel: Filters
  const leftPanelContent = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3.5">
        <h3 className="font-semibold mb-3">Filter by Type</h3>
        <div className="space-y-2">
          {venueTypes.map((type) => (
            <Button
              key={type.value}
              variant={typeFilter === type.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type.value)}
              className="w-full justify-start"
            >
              {type.label}
            </Button>
          ))}
        </div>
      </div>
      
      {currentUser && myVenues && myVenues.length > 0 && (
        <ScrollArea className="flex-1 px-4 py-4">
          <div className="space-y-2">
            <h3 className="font-semibold mb-2">My Venues</h3>
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
        </ScrollArea>
      )}
    </div>
  );

  // Right panel: Venue List
  const rightPanelContent = (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {filteredVenues.length} {filteredVenues.length === 1 ? "Venue" : "Venues"}
          </h2>
          {currentUser && (
            <Button onClick={() => navigate({ to: "/venues/new" })}>
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {filteredVenues.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all" 
                  ? "No venues match your filters" 
                  : "No venues found"}
              </p>
              {currentUser && (
                <Button onClick={() => navigate({ to: "/venues/new" })}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Venue
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVenues.map((venue) => (
                <VenueCard 
                  key={venue._id} 
                  venue={venue} 
                  canEdit={venue.organizerId === currentUser?._id} 
                />
              ))}
            </div>
          )}
        </div>
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
              placeholder="Search venues..."
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
          icon: ListFilter,
          defaultSize: 25,
          minSize: 20,
          maxSize: 40,
          minWidth: "18rem",
        }}
        rightPanel={{
          content: rightPanelContent,
          label: "Venues",
          icon: MapPin,
          defaultSize: 75,
        }}
        defaultTab="right"
        className="flex-1"
      />
    </div>
  );
}

function VenueCard({ venue, canEdit }: { venue: any; canEdit: boolean }) {
  const getTypeDisplay = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getAccessColor = (access: string) => {
    switch (access) {
      case 'public': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'private': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'membership_needed': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <Link to="/venues/$id" params={{ id: venue._id }}>
      <Card className="hover:shadow-md transition-shadow overflow-hidden h-full cursor-pointer">
        {venue.imageUrl && (
          <div className="aspect-video relative overflow-hidden">
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            {canEdit && (
              <div className="absolute top-2 right-2">
                <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{venue.name}</CardTitle>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {getTypeDisplay(venue.type)}
                </Badge>
                <Badge className={`text-xs ${getAccessColor(venue.access)}`}>
                  {venue.access.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            {canEdit && !venue.imageUrl && (
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {venue.address && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground line-clamp-2">{venue.address}</span>
            </div>
          )}
          {venue.operatingHours && (
            <div className="flex items-start gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground line-clamp-1">{venue.operatingHours}</span>
            </div>
          )}
          {venue.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {venue.description}
            </p>
          )}
          <div className="flex items-center gap-4 pt-2">
            {venue.phone && (
              <a
                href={`tel:${venue.phone}`}
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-4 w-4" />
              </a>
            )}
            {venue.email && (
              <a
                href={`mailto:${venue.email}`}
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <Mail className="h-4 w-4" />
              </a>
            )}
            {venue.website && (
              <a
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                <Globe className="h-4 w-4" />
              </a>
            )}
          </div>
          {venue.socialLinks && venue.socialLinks.length > 0 && (
            <div className="flex items-center gap-2 pt-1">
              {venue.socialLinks.map((link: any, index: number) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  title={link.platform}
                  onClick={(e) => e.stopPropagation()}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

