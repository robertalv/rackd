"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Users, ChevronLeft, ChevronRight } from "lucide-react";
import { PlayerCard } from "./player-card";
import { useCurrentUser } from "@/hooks/use-current-user";

interface DiscoverPlayersGridProps {
  searchQuery: string;
  filters: {
    city: string;
    country: string;
    region: string;
    fargoRating: [number, number];
    location: string;
    followers: string;
    engagement: string;
    category: string;
  };
  limit?: number;
}

export function DiscoverPlayersGrid({ searchQuery, filters, limit = 50 }: DiscoverPlayersGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const { user: currentUser } = useCurrentUser();

  // Parse Fargo rating filter
  const fargoRatingFilters = {
    minFargoRating: filters.fargoRating[0] !== 200 ? filters.fargoRating[0] : undefined,
    maxFargoRating: filters.fargoRating[1] !== 900 ? filters.fargoRating[1] : undefined,
  };

  const queryParams = { 
    query: searchQuery.length > 0 ? searchQuery : undefined, 
    limit,
    city: filters.city || undefined,
    country: filters.country || undefined,
    region: filters.region || undefined,
    ...fargoRatingFilters
  };

  const playersData = useQuery(
    api.users.getPlayersForDiscovery,
    queryParams
  );

  if (playersData === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
            <p className="text-muted-foreground">Loading players...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Filter out current user from the players list
  const filteredPlayers = playersData?.filter((player: any) => {
    if (!currentUser?._id) return true;
    return player._id !== currentUser._id;
  }) || [];

  if (filteredPlayers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {searchQuery.length > 0 
                ? "Try a different search term"
                : "Start following players to get personalized suggestions"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Players Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentPlayers.map((player: any) => (
          <PlayerCard
            key={player._id}
            player={{
              _id: player._id,
              name: player.name,
              username: player.username,
              city: player.city,
              country: player.country,
              fargoRating: player.fargoRating,
              fargoRobustness: player.fargoRobustness,
              userImageUrl: player.userImageUrl || player.avatarUrl,
              avatarUrl: player.avatarUrl,
              isVerified: player.isVerified,
            }}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm pt-4 border-t">
          <p className="text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPlayers.length)} of {filteredPlayers.length} players
          </p>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-border"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? "bg-accent text-accent-foreground" : "border-border w-8 h-8 p-0"}
                >
                  {page}
                </Button>
              ))}
              
              {totalPages > 5 && (
                <>
                  <span className="px-2 text-muted-foreground">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className={currentPage === totalPages ? "bg-accent text-accent-foreground" : "border-border w-8 h-8 p-0"}
                  >
                    {totalPages}
                  </Button>
                </>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-border"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


