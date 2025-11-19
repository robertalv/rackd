"use client";

import { useState } from "react";
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
import { getCountryName } from "@/lib/fargorate-api";
import { CountryFlag } from "../country-flag";
import type { FargoRatePlayer } from "@rackd/types";
import { Icon, ChampionIcon, ArrowLeft01Icon, ArrowRight01Icon } from "@rackd/ui/icons";

interface FargoWorldRankingsTableProps {
  players: FargoRatePlayer[];
  searchQuery?: string;
}

export function FargoWorldRankingsTable({ players, searchQuery = "" }: FargoWorldRankingsTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Filter players by search query
  const filteredPlayers = players.filter((player) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    // Handle both capitalized and lowercase property names
    const firstName = (player.FirstName || player.firstName || "").toLowerCase();
    const lastName = (player.LastName || player.lastName || "").toLowerCase();
    const nickname = (player.Nickname || "").toLowerCase();
    const city = (player.City || "").toLowerCase();
    const country = getCountryName(player.Country || player.country || "").toLowerCase();
    const id = (player.Id || player.id || "").toString();
    
    const fullName = `${firstName} ${lastName}`;

    return (
      fullName.includes(query) ||
      nickname.includes(query) ||
      city.includes(query) ||
      country.includes(query) ||
      id.includes(query)
    );
  });

  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);

  const getRatingColor = (rating: string) => {
    const ratingNum = parseInt(rating);
    if (ratingNum >= 800) return "text-yellow-500";
    if (ratingNum >= 700) return "text-orange-500";
    if (ratingNum >= 600) return "text-blue-500";
    return "text-primary";
  };

  const getRatingBadge = (rating: string) => {
    const ratingNum = parseInt(rating);
    if (ratingNum >= 800) return { label: "Elite", variant: "default" as const };
    if (ratingNum >= 700) return { label: "Master", variant: "secondary" as const };
    if (ratingNum >= 600) return { label: "Pro", variant: "outline" as const };
    return { label: "Advanced", variant: "outline" as const };
  };

  if (filteredPlayers.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon icon={ChampionIcon} className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No players found</h3>
            <p className="text-muted-foreground">
              {searchQuery.length > 0 
                ? "Try a different search term"
                : "No rankings available"
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
            World Pro Rankings
          </h2>
          <p className="text-sm text-muted-foreground">
            Top {filteredPlayers.length} players worldwide by FargoRate
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Nickname</TableHead>
            <TableHead>Fargo ID</TableHead>
            <TableHead className="text-right">Rating</TableHead>
            <TableHead className="text-right">Robustness</TableHead>
            <TableHead className="text-center">Tier</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentPlayers.map((player, index) => {
            const globalRank = startIndex + index + 1;
            const rating = player.FargoRating || player.rating || player.effectiveRating || "0";
            const ratingBadge = getRatingBadge(rating);
            const robustness = player.Robustness || player.robustness || "0";
            const firstName = player.FirstName || player.firstName || "";
            const lastName = player.LastName || player.lastName || "";
            const nickname = player.Nickname || "";
            const city = player.City || "";
            const state = player.State || "";
            const country = player.Country || player.country || "";
            const id = player.Id || player.id || "";

            return (
              <TableRow key={id || index} className="hover:bg-muted/50">
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
                  <div className="flex items-center space-x-3">
                    <CountryFlag countryCode={country} />
                    <div>
                      <p className="font-medium">
                        {firstName} {lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getCountryName(country)}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {city ? (
                      <>
                        {city}
                        {state && state !== country && (
                          <span className="text-muted-foreground">, {state}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  {nickname ? (
                    <span className="text-sm italic text-muted-foreground">
                      "{nickname}"
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="text-sm font-mono text-muted-foreground">
                    {id}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end">
                    <span className={`font-bold text-lg ${getRatingColor(rating)}`}>
                      {rating}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-sm text-muted-foreground">
                    {parseInt(robustness).toLocaleString()}
                  </span>
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


