"use client";

import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { MapPin, ExternalLink } from "lucide-react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface NearbyVenuesProps {
  userId?: Id<"users">;
  limit?: number;
}

export function NearbyVenues({ userId, limit = 5 }: NearbyVenuesProps) {
  // Note: getNearby uses current user's location, not userId parameter
  // TODO: Create a query that accepts userId to get venues near a specific user
  const venues = useQuery(api.venues.getNearby, { limit }) ?? [];

  if (!venues || venues.length === 0) {
    return null;
  }

  return (
    <ExpandableSection
      title="Nearby Venues"
      expanded={true}
      icon={
        <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-orange-500" />
        </div>
      }
    >
      <div className="space-y-3">
        {venues.map((venue: any) => (
          <Card key={venue._id} className="hover:bg-muted/50 transition-colors border-muted">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{venue.name}</h4>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {venue.type?.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  
                  {(venue.city || venue.region) && (
                    <div className="flex items-start gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3 shrink-0 mt-0.5" />
                      <span className="truncate">
                        {[venue.city, venue.region].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  )}
                  
                  {venue.address && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {venue.address}
                    </p>
                  )}
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 px-2 shrink-0"
                  onClick={() => {
                    // TODO: Navigate to venue detail page when route is created
                    console.log("Navigate to venue:", venue._id);
                  }}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full" 
          size="sm"
          onClick={() => {
            // TODO: Navigate to venues page when route is created
            console.log("Navigate to venues page");
          }}
        >
          <MapPin className="h-4 w-4 mr-2" />
          Browse All Venues
        </Button>
      </div>
    </ExpandableSection>
  );
}

