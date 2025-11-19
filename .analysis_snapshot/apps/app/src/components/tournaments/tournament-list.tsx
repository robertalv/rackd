"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rackd/ui/components/table";
import { Badge } from "@rackd/ui/components/badge";
import { Card, CardContent } from "@rackd/ui/components/card";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@rackd/ui/components/hover-card";
import { Dialog, DialogContent } from "@rackd/ui/components/dialog";
import { Trophy, Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { getGameTypeImage, getGameTypeLabel, formatDate, getStatusBadgeProps, type TournamentStatus } from "@/lib/tournament-utils";
import { TournamentGridCard } from "./tournament-grid-card";

interface TournamentListProps {
  statusFilter: TournamentStatus;
  viewMode?: "list" | "grid";
  searchQuery?: string;
}

export function TournamentList({ statusFilter, viewMode = "list", searchQuery = "" }: TournamentListProps) {
  const navigate = useNavigate();
  const [selectedFlyerUrl, setSelectedFlyerUrl] = useState<string | null>(null);

  const tournaments = useQuery(api.tournaments.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const handleViewTournament = (tournamentId: string) => {
    navigate({ to: `/tournaments/${tournamentId}` });
  };

  const handleFlyerClick = (flyerUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFlyerUrl(flyerUrl);
  };

  if (tournaments === undefined) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  // Filter by search query if provided
  let filteredTournaments = tournaments || [];
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filteredTournaments = filteredTournaments.filter((tournament: any) => {
      return (
        tournament.name.toLowerCase().includes(searchLower) ||
        tournament.venue?.name?.toLowerCase().includes(searchLower) ||
        tournament.organizerName?.toLowerCase().includes(searchLower)
      );
    });
  }

  if (filteredTournaments.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tournaments found</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter === "all"
                ? searchQuery
                  ? "No tournaments match your search."
                  : "No tournaments have been created yet."
                : `No ${statusFilter} tournaments found.`}
            </p>
            <Button onClick={() => navigate({ to: "/tournaments/new" })}>
              Create Your First Tournament
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
        {filteredTournaments.map((tournament: any) => (
          <TournamentGridCard
            key={tournament._id}
            tournament={tournament}
            onView={handleViewTournament}
          />
        ))}
      </div>
    );
  }

  // List View
  return (
    <>
      <div className="w-full">
        <Card className="p-0">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tournament</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Organizer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTournaments.map((tournament: any) => (
                  <TableRow key={tournament._id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {tournament.flyerUrl ? (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => handleFlyerClick(tournament.flyerUrl, e)}
                                className="relative group cursor-pointer"
                              >
                                <img
                                  src={tournament.flyerUrl}
                                  alt={`${tournament.name} flyer`}
                                  width={40}
                                  height={40}
                                  className="rounded object-cover border-2 border-border hover:border-primary transition-colors"
                                />
                              </button>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-80 p-0" side="right" align="start">
                              <img
                                src={tournament.flyerUrl}
                                alt={`${tournament.name} flyer preview`}
                                className="w-full h-auto rounded"
                              />
                            </HoverCardContent>
                          </HoverCard>
                        ) : null}
                        <img
                          src={getGameTypeImage(tournament.gameType).imageSrc}
                          alt={getGameTypeImage(tournament.gameType).alt}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <div>
                          <div className="font-medium">{tournament.name}</div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            {tournament.organizerName && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {tournament.organizerName}
                              </span>
                            )}
                            {tournament.venue?.name && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {tournament.venue.name}
                              </span>
                            )}
                            {tournament.entryFee && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${tournament.entryFee}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {formatDate(tournament.date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{getGameTypeLabel(tournament.gameType)}</span>
                      <span className="text-xs text-muted-foreground">
                        {tournament.type.replace("_", " ")}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeProps(tournament.status as TournamentStatus).variant}>
                      {getStatusBadgeProps(tournament.status as TournamentStatus).text}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{tournament.organizerName}</div>
                  </TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewTournament(tournament._id)}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Full Image Dialog */}
      <Dialog open={!!selectedFlyerUrl} onOpenChange={(open) => !open && setSelectedFlyerUrl(null)}>
        <DialogContent className="max-w-4xl p-0" showCloseButton={true}>
          {selectedFlyerUrl && (
            <img
              src={selectedFlyerUrl}
              alt="Tournament flyer"
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

