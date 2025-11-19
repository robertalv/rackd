"use client";

import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
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
import { ProfileAvatar } from "@/components/profile-avatar";
import { Icon, Location03Icon, ChampionIcon, ArrowLeft01Icon, ArrowRight01Icon } from "@rackd/ui/icons";
import { cn } from "@rackd/ui/lib/utils";

interface AppPlayer {
  _id: string;
  name: string;
  username?: string | null;
  city?: string | null;
  country?: string | null;
  fargoRating?: number | null;
  fargoRobustness?: number | null;
  fargoReadableId?: string | null;
  userImageUrl?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
}

interface AppPlayersRankingsTableProps {
  players: AppPlayer[];
  searchQuery?: string;
}

export function AppPlayersRankingsTable({ players, searchQuery = "" }: AppPlayersRankingsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter players by search query and only show players with Fargo rating
  const filteredPlayers = useMemo(() => {
    // First filter to only include players with a Fargo rating
    const playersWithRating = players.filter((player) => player.fargoRating != null && player.fargoRating > 0);
    
    if (!searchQuery) return playersWithRating;
    const query = searchQuery.toLowerCase();
    
    return playersWithRating.filter((player) => {
      const name = (player.name || "").toLowerCase();
      const username = (player.username || "").toLowerCase();
      const city = (player.city || "").toLowerCase();
      const country = (player.country || "").toLowerCase();
      const fargoId = (player.fargoReadableId || "").toLowerCase();
      
      return (
        name.includes(query) ||
        username.includes(query) ||
        city.includes(query) ||
        country.includes(query) ||
        fargoId.includes(query)
      );
    });
  }, [players, searchQuery]);

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  const getRatingColor = (rating: number | null | undefined) => {
    if (!rating) return "text-muted-foreground";
    if (rating >= 800) return "text-yellow-500";
    if (rating >= 700) return "text-orange-500";
    if (rating >= 600) return "text-blue-500";
    return "text-primary";
  };

  const getRatingBadge = (rating: number | null | undefined) => {
    if (!rating) return { label: "Unrated", variant: "outline" as const };
    if (rating >= 800) return { label: "Elite", variant: "default" as const };
    if (rating >= 700) return { label: "Master", variant: "secondary" as const };
    if (rating >= 600) return { label: "Pro", variant: "outline" as const };
    return { label: "Advanced", variant: "outline" as const };
  };

  if (filteredPlayers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon icon={Location03Icon} className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {searchQuery.length > 0 
                ? "Try a different search term"
                : "No players available"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
            <Icon icon={ChampionIcon} className="h-6 w-6 text-yellow-500" />
            App Top Players
          </h2>
          <p className="text-sm text-muted-foreground">
            Top {filteredPlayers.length} players from the app by FargoRate
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Fargo ID</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Robustness</TableHead>
            <TableHead className="text-center">Tier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPlayers.map((player, index) => {
            const globalRank = startIndex + index + 1;
            const rating = player.fargoRating;
            const ratingBadge = getRatingBadge(rating);
            const robustness = player.fargoRobustness || 0;
            const location = [player.city, player.country].filter(Boolean).join(", ") || "—";
            const username = player.username && player.username.trim() ? `@${player.username.trim()}` : null;
            const fargoId = player.fargoReadableId || "—";

            return (
              <TableRow key={player._id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center justify-center">
                    <span className="font-bold text-lg">
                      {globalRank <= 3 ? (
                        <span className={
                          globalRank === 1 ? "text-yellow-500" :
                          globalRank === 2 ? "text-gray-400" :
                          "text-orange-500"
                        }>
                          #{globalRank}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">#{globalRank}</span>
                      )}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Link
                    to="/players/$id"
                    params={{ id: player._id }}
                    className="flex items-center space-x-3 hover:text-primary"
                  >
                    <ProfileAvatar 
                      user={{
                        displayName: player.name,
                        image: player.userImageUrl || player.avatarUrl || undefined,
                        country: player.country || undefined,
                      }} 
                      size="sm" 
                    />
                    <div>
                      <p className="font-medium">
                        {player.name}
                        {player.isVerified && (
                          <span className="ml-1.5 text-primary">✓</span>
                        )}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {location !== "—" ? location : <span className="text-muted-foreground">—</span>}
                  </span>
                </TableCell>
                <TableCell>
                  {username && (
                    <span className="text-sm text-muted-foreground">
                      {username}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {fargoId !== "—" ? fargoId : <span className="text-muted-foreground">—</span>}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    {rating ? (
                      <span className={cn("font-bold text-lg", getRatingColor(rating))}>
                        {rating.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {robustness > 0 ? (
                    <span className="text-sm text-muted-foreground">
                      {robustness.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={ratingBadge.variant}>
                    {ratingBadge.label}
                  </Badge>
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
              <Icon icon={ArrowLeft01Icon} className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page = i + 1;
                
                // Show pages around current page if we're past page 5
                if (totalPages > 5 && currentPage > 3) {
                  page = currentPage - 2 + i;
                  if (page > totalPages - 2) {
                    page = totalPages - 4 + i;
                  }
                }
                
                if (page > totalPages) return null;
                
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
              
              {totalPages > 5 && currentPage < totalPages - 2 && (
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
              <Icon icon={ArrowRight01Icon} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

