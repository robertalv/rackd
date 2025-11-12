"use client";

import { useState } from "react";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { Button } from "@rackd/ui/components/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@rackd/ui/components/hover-card";
import { Dialog, DialogContent } from "@rackd/ui/components/dialog";
import { Calendar, MapPin, DollarSign, Users, Trophy } from "lucide-react";
import { getGameTypeImage, getGameTypeLabel, formatDate, getStatusBadgeProps, type TournamentStatus } from "@/lib/tournament-utils";

interface TournamentGridCardProps {
  tournament: {
    _id: string;
    name: string;
    date: number;
    gameType: string;
    type: string;
    status: string;
    flyerUrl?: string | null;
    venue?: {
      name: string;
      city?: string;
      region?: string;
      country?: string;
    } | null;
    entryFee?: number | null;
    organizerName: string;
  };
  onView: (tournamentId: string) => void;
}

export function TournamentGridCard({ tournament, onView }: TournamentGridCardProps) {
  const [selectedFlyerUrl, setSelectedFlyerUrl] = useState<string | null>(null);

  const handleFlyerClick = (flyerUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFlyerUrl(flyerUrl);
  };

  return (
    <>
      <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onView(tournament._id)}>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Flyer Image */}
            {tournament.flyerUrl && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <button
                    type="button"
                    onClick={(e) => handleFlyerClick(tournament.flyerUrl!, e)}
                    className="w-full relative group cursor-pointer"
                  >
                    <img
                      src={tournament.flyerUrl}
                      alt={`${tournament.name} flyer`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors"
                    />
                  </button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-0" side="top" align="center">
                  <img
                    src={tournament.flyerUrl}
                    alt={`${tournament.name} flyer preview`}
                    className="w-full h-auto rounded"
                  />
                </HoverCardContent>
              </HoverCard>
            )}

            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <img
                  src={getGameTypeImage(tournament.gameType).imageSrc}
                  alt={getGameTypeImage(tournament.gameType).alt}
                  width={40}
                  height={40}
                  className="rounded-full flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg line-clamp-2">{tournament.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    by {tournament.organizerName}
                  </p>
                </div>
              </div>
              <Badge variant={getStatusBadgeProps(tournament.status as TournamentStatus).variant}>
                {getStatusBadgeProps(tournament.status as TournamentStatus).text}
              </Badge>
            </div>

          {/* Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(tournament.date)}</span>
            </div>
            {tournament.venue?.name && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="line-clamp-1">{tournament.venue.name}</span>
              </div>
            )}
            {tournament.entryFee !== undefined && tournament.entryFee !== null && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${tournament.entryFee}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <span>{getGameTypeLabel(tournament.gameType)} • {tournament.type.replace("_", " ")}</span>
            </div>
          </div>

          {/* Action */}
          <Button
            className="w-full"
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onView(tournament._id);
            }}
          >
            <Users className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>

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

