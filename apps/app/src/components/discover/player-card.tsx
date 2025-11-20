"use client";

import { Link } from "@tanstack/react-router";
import { Card } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { MapPin, Trophy } from "lucide-react";
import { ProfileAvatar } from "../profile-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";

interface PlayerCardProps {
  player: {
    _id: string;
    name: string;
    username?: string;
    city?: string;
    country?: string;
    fargoRating?: number;
    fargoRobustness?: number;
    userImageUrl?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
}

const getCategoryFromRating = (rating?: number): { label: string; className: string } => {
  if (!rating) {
    return { label: "Unrated", className: "bg-muted text-muted-foreground" };
  }
  if (rating >= 600) {
    return { label: "Pro Player", className: "bg-amber-900 text-amber-50" };
  }
  if (rating >= 500) {
    return { label: "Advanced Player", className: "bg-primary/80 text-primary-foreground" };
  }
  if (rating >= 400) {
    return { label: "Intermediate Player", className: "bg-secondary/80 text-secondary-foreground" };
  }
  return { label: "Beginner", className: "bg-muted text-muted-foreground" };
};

export function PlayerCard({ player }: PlayerCardProps) {
  const { user: currentUser } = useCurrentUser();
  const category = getCategoryFromRating(player.fargoRating);
  const location = [player.city, player.country].filter(Boolean).join(", ") || "Unknown";
  const isCurrentUser = currentUser?._id === player._id;

  return (
    <Link 
      to="/players/$id" 
      params={{ id: player._id }}
      className="block group"
    >
      <Card className="p-5 bg-card border-border hover:border-primary/20 transition-all hover:shadow-md h-full flex flex-col">
        <div className="flex flex-col items-center text-center mb-4">
          {/* Avatar */}
          <div className="mb-3">
            <ProfileAvatar
              user={{
                displayName: player.name,
                image: isCurrentUser ? undefined : (player.userImageUrl || player.avatarUrl),
                country: player.country,
              }}
              size="lg"
            />
          </div>

          {/* Name & Username */}
          <div className="mb-2">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {player.name}
              </h4>
              {player.isVerified && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0">✓</Badge>
              )}
            </div>
            {!isCurrentUser && player.username && player.username.trim() && (
              <p className="text-sm text-muted-foreground">@{player.username}</p>
            )}
          </div>
        </div>

        {/* Location & Rating */}
        <div className="flex flex-col gap-2 mb-4 flex-1">
          {location !== "Unknown" && (
            <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          )}
          {player.fargoRating && (
            <div className="flex items-center justify-center gap-1.5">
              <Trophy className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground text-base">{player.fargoRating}</span>
              {player.fargoRobustness && (
                <span className="text-xs text-muted-foreground">({player.fargoRobustness})</span>
              )}
            </div>
          )}
        </div>

        {/* Category Badge & Action */}
        <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
          <Badge className={`text-xs py-1 px-2 w-fit mx-auto ${category.className}`}>
            {category.label}
          </Badge>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full border-border group-hover:border-primary/50 group-hover:text-primary transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            View Profile
          </Button>
        </div>
      </Card>
    </Link>
  );
}

