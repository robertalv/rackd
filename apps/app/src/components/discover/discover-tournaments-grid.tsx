"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Trophy } from "lucide-react";
import { TournamentCard } from "./tournament-card";

interface DiscoverTournamentsGridProps {
  searchQuery: string;
  filters: {
    location: string;
    followers: string;
    engagement: string;
    category: string;
    venue?: string;
  };
}

export function DiscoverTournamentsGrid({ searchQuery, filters }: DiscoverTournamentsGridProps) {
  const tournaments = useQuery(api.tournaments.getAllTournaments, {});

  if (tournaments === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading tournaments...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tournaments || tournaments.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No tournaments available</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to create a tournament for the community
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter tournaments based on search and filters
  const filteredTournaments = tournaments.filter((tournament: any) => {
    // Search query filter - check tournament name and venue
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = tournament.name.toLowerCase().includes(searchLower);
      const venueNameMatch = tournament.venue?.name?.toLowerCase().includes(searchLower);
      const venueCityMatch = tournament.venue?.city?.toLowerCase().includes(searchLower);
      
      if (!nameMatch && !venueNameMatch && !venueCityMatch) {
        return false;
      }
    }
    
    // Venue filter
    if (filters.venue && filters.venue.trim()) {
      const venueFilter = filters.venue.toLowerCase();
      const venueNameMatch = tournament.venue?.name?.toLowerCase().includes(venueFilter);
      const venueCityMatch = tournament.venue?.city?.toLowerCase().includes(venueFilter);
      
      if (!venueNameMatch && !venueCityMatch) {
        return false;
      }
    }
    
    // Status filter
    if (filters.category && filters.category !== "all" && tournament.status !== filters.category) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No tournaments found</h3>
          <p className="text-muted-foreground">
            {searchQuery.length > 0 
              ? "Try a different search term"
              : "No tournaments match your filters"
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTournaments.map((tournament: any) => (
            <TournamentCard
              key={tournament._id}
              tournament={{
                _id: tournament._id,
                name: tournament.name,
                date: tournament.date,
                venue: tournament.venue,
                entryFee: tournament.entryFee,
                registeredCount: tournament.registeredCount,
                maxPlayers: tournament.maxPlayers,
                status: tournament.status,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}


