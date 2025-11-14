"use client";

import { Link } from "@tanstack/react-router";
import { Card } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { formatDate, getGameTypeLabel } from "@/lib/tournament-utils";
import { Icon, Calendar02Icon, Location03Icon, UserGroup02Icon, Money03Icon, ChampionIcon } from "@rackd/ui/icons";

interface TournamentPageCardProps {
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
    registeredCount?: number;
    maxPlayers?: number | null;
    organizerName: string;
  };
  viewMode: "grid" | "list";
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  upcoming: { bg: "bg-blue-100", text: "text-blue-800", label: "Upcoming" },
  active: { bg: "bg-green-100", text: "text-green-800", label: "In Progress" },
  completed: { bg: "bg-gray-100", text: "text-gray-800", label: "Completed" },
  draft: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Draft" },
};

export function TournamentPageCard({ tournament, viewMode }: TournamentPageCardProps) {
  const statusBadge = statusConfig[tournament.status] || statusConfig.upcoming;
  const spotsRemaining = tournament.maxPlayers 
    ? tournament.maxPlayers - (tournament.registeredCount || 0)
    : null;
  
  const location = tournament.venue
    ? [tournament.venue.city, tournament.venue.region, tournament.venue.country].filter(Boolean).join(", ")
    : "TBD";

  const formattedDate = formatDate(tournament.date);
  const entrants = tournament.registeredCount || 0;
  const maxEntrants = tournament.maxPlayers || "∞";
  const entryFee = tournament.entryFee ? `$${tournament.entryFee}` : "Free";
  const formatLabel = `${getGameTypeLabel(tournament.gameType)} ${tournament.type.replace("_", " ")}`;

  if (viewMode === "list") {
    return (
      <Link 
        to="/tournaments/$id" 
        params={{ id: tournament._id }}
        className="block group"
      >
        <Card className="p-4 bg-card border-border hover:border-primary/20 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between gap-4">
            {/* Flyer Image */}
            {tournament.flyerUrl ? (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                <img
                  src={tournament.flyerUrl}
                  alt={tournament.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                <Icon icon={ChampionIcon} className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Left Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                  {tournament.name}
                </h3>
                <Badge className={`${statusBadge.bg} ${statusBadge.text} shrink-0 text-xs`}>
                  {statusBadge.label}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Icon icon={Calendar02Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                {location !== "TBD" && (
                  <div className="flex items-center gap-1.5">
                    <Icon icon={Location03Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Icon icon={UserGroup02Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span>
                    <span className="font-medium text-foreground">{entrants}</span>
                    {maxEntrants !== "∞" && ` / ${maxEntrants}`}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon icon={Money03Icon} className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-medium text-foreground">{entryFee}</span>
                </div>
              </div>
            </div>
            
            {/* Action Button */}
            <div className="shrink-0">
              <Button 
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 group-hover:bg-primary group-hover:text-primary-foreground transition-colors whitespace-nowrap"
                onClick={(e) => e.preventDefault()}
              >
                {tournament.status === "upcoming" ? "Register" : "View"}
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
      {/* Flyer Image */}
      <div className="relative h-40 overflow-hidden bg-muted">
        {tournament.flyerUrl ? (
          <>
            <img
              src={tournament.flyerUrl}
              alt={tournament.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
            <Icon icon={ChampionIcon} className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${statusBadge.bg} ${statusBadge.text}`}>
            {statusBadge.label}
          </Badge>
        </div>
        
        {/* Entry Fee Overlay */}
        {tournament.entryFee && (
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm px-3 py-1 rounded-lg flex items-center gap-1">
              <Icon icon={Money03Icon} className="w-4 h-4 text-primary" />
              <span className="font-semibold text-foreground">{tournament.entryFee}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-2">
          {tournament.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{tournament.organizerName}</p>

        {/* Info Grid */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon icon={Calendar02Icon} className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon icon={Location03Icon} className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Icon icon={UserGroup02Icon} className="w-4 h-4 text-primary flex-shrink-0" />
            <span>
              {entrants}/{maxEntrants}
              {spotsRemaining !== null && spotsRemaining > 0 && ` (${spotsRemaining} spots left)`}
            </span>
          </div>
        </div>

        {/* Format Badge */}
        <Badge variant="outline" className="mb-4">
          {formatLabel}
        </Badge>

        {/* Join Button */}
        <Link to="/tournaments/$id" params={{ id: tournament._id }}>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {tournament.status === "upcoming" ? "Join Tournament" : "View Details"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}


