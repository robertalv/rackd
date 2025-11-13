"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rackd/ui/components/table";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Card, CardContent } from "@rackd/ui/components/card";
import { ChevronLeft, ChevronRight, MapPin, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { ProfileAvatar } from "../profile-avatar";

interface DiscoverPlayersTableProps {
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
}

export function DiscoverPlayersTable({ searchQuery, filters }: DiscoverPlayersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Parse Fargo rating filter
  const fargoRatingFilters = {
    minFargoRating: filters.fargoRating[0] !== 200 ? filters.fargoRating[0] : undefined,
    maxFargoRating: filters.fargoRating[1] !== 900 ? filters.fargoRating[1] : undefined,
  };

  const queryParams = { 
    query: searchQuery.length > 0 ? searchQuery : undefined, 
    limit: 50,
    city: filters.city || undefined,
    country: filters.country || undefined,
    region: filters.region || undefined,
    ...fargoRatingFilters
  };

  console.log("Frontend query params:", queryParams);
  console.log("Frontend filters:", filters);

  const playersData = useQuery(
    api.users.getPlayersForDiscovery,
    queryParams
  );

  if (playersData === undefined) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p>Loading players...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!playersData || playersData.length === 0) {
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

  // Filters are now applied on the backend
  const filteredPlayers = playersData;
  
  // Only show username if player has a unique username and userId
  // Check if multiple players share the same userId (data integrity issue)
  const userIdCounts = new Map<string, number>();
  filteredPlayers.forEach((player: any) => {
    if (player.userId) {
      userIdCounts.set(player.userId, (userIdCounts.get(player.userId) || 0) + 1);
    }
  });
  
  // Only show username if this player has a username and their userId is unique
  const shouldShowUsername = (player: any) => {
    if (!player.username || !player.userId) return false;
    // Only show if this userId is unique (not shared with other players)
    return userIdCounts.get(player.userId) === 1;
  };
  
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  const getPlayerCategories = (player: any) => {
    const categories = [];
    
    // Add categories based on real data
    if (player.fargoRating) {
      if (player.fargoRating >= 600) {
        categories.push("Pro Player");
      } else if (player.fargoRating >= 500) {
        categories.push("Advanced Player");
      } else if (player.fargoRating >= 400) {
        categories.push("Intermediate Player");
      } else {
        categories.push("Beginner Player");
      }
    }
    
    if (player.isVerified) {
      categories.push("Verified Player");
    }
    
    if (player.postCount > 10) {
      categories.push("Content Creator");
    }
    
    if (player.followerCount > 100) {
      categories.push("Popular Player");
    }
    
    return categories.slice(0, 3);
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Fargo Rating</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPlayers.map((player: any) => {
            const categories = getPlayerCategories(player);
            return (
              <TableRow 
                key={player._id} 
                className="hover:bg-muted/50"
              >
                <TableCell>
                  <Link
                    to="/players/$id"
                    params={{ id: player._id }}
                    className="flex items-center space-x-3 hover:text-primary"
                  >
                    <ProfileAvatar 
                      user={{
                        displayName: player.displayName || player.name || "",
                        image: player.userImageUrl || player.avatarUrl || player.image,
                        country: player.country,
                      }} 
                      size="xs" 
                    />
                    <div>
                      <p className="font-medium">{player.name}</p>
                      {shouldShowUsername(player) && (
                        <p className="text-sm text-muted-foreground">@{player.username}</p>
                      )}
                      {player.isVerified && (
                        <Badge variant="secondary" className="text-xs mt-1">Verified</Badge>
                      )}
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to="/players/$id"
                    params={{ id: player._id }}
                    className="flex items-center space-x-1 text-sm"
                  >
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>
                      {[player.city, player.region, player.country].filter(Boolean).join(', ') || "Unknown"}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to="/players/$id"
                    params={{ id: player._id }}
                    className="flex items-center space-x-2"
                  >
                    {player.fargoRating ? (
                      <>
                        <span className="font-bold text-lg text-primary">{player.fargoRating}</span>
                        {player.fargoRobustness && (
                          <span className="text-xs text-muted-foreground">
                            R: {player.fargoRobustness}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">No rating</span>
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    to="/players/$id"
                    params={{ id: player._id }}
                    className="flex flex-wrap gap-1"
                  >
                    {categories.slice(0, 2).map((category, index) => (
                      <Badge key={index} variant="category" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                    {categories.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{categories.length - 2}
                      </Badge>
                    )}
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/players/$id"
                      params={{ id: player._id }}
                    >
                      View Profile
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredPlayers.length)} of {filteredPlayers.length} players
          </p>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="w-8 h-8 p-0"
                  >
                    {page}
                  </Button>
                );
              })}
              
              {totalPages > 5 && (
                <>
                  <span className="px-2">...</span>
                  <Button
                    variant={currentPage === totalPages ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    className="w-8 h-8 p-0"
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
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

