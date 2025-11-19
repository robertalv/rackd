"use client";

import { Link } from "@tanstack/react-router";
import { Card } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { format } from "date-fns";
import { Icon, Calendar02Icon, Location03Icon, UserGroup02Icon, Money03Icon } from "@rackd/ui/icons";

interface TournamentCardProps {
  tournament: {
    _id: string;
    name: string;
    date: number;
    venue?: {
      name: string;
      city?: string;
      region?: string;
      country?: string;
    } | null;
    entryFee?: number | null;
    registeredCount?: number;
    maxPlayers?: number | null;
    status?: string;
  };
}

const getStatusColor = (status?: string) => {
  switch (status) {
    case "upcoming": return "bg-green-100 text-green-800 border-green-200";
    case "active": return "bg-blue-100 text-blue-800 border-blue-200";
    case "completed": return "bg-gray-100 text-gray-800 border-gray-200";
    default: return "bg-muted text-muted-foreground";
  }
};

const getStatusLabel = (status?: string) => {
  switch (status) {
    case "upcoming": return "Upcoming";
    case "active": return "In Progress";
    case "completed": return "Completed";
    default: return status || "Upcoming";
  }
};

export function TournamentCard({ tournament }: TournamentCardProps) {
  const location = tournament.venue
    ? [tournament.venue.city, tournament.venue.region, tournament.venue.country].filter(Boolean).join(", ")
    : "TBD";
  
  const formattedDate = format(new Date(tournament.date), "MMM d, yyyy");
  const entrants = tournament.registeredCount || 0;
  const maxEntrants = tournament.maxPlayers || "∞";
  const prize = tournament.entryFee && tournament.maxPlayers
    ? `$${(tournament.entryFee * tournament.maxPlayers).toLocaleString()}`
    : tournament.entryFee
    ? `$${tournament.entryFee} entry`
    : "Free";

  return (
    <Link 
      to="/tournaments/$id" 
      params={{ id: tournament._id }}
      className="block group"
    >
      <Card className="p-4 bg-card border-border hover:border-primary/20 transition-all hover:shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
                {tournament.name}
              </h3>
              {tournament.status && (
                <Badge className={`${getStatusColor(tournament.status)} shrink-0 text-xs`}>
                  {getStatusLabel(tournament.status)}
                </Badge>
              )}
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
                <span className="font-medium text-foreground">{prize}</span>
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

