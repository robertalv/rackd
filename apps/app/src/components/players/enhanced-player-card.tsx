"use client";

import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardFooter } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { MoreVertical, Trophy, MapPin } from "lucide-react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface EnhancedPlayerCardProps {
  player: {
    _id: Id<"players">;
    name: string;
    fargoId?: string;
    fargoRating?: number;
    fargoRobustness?: number;
    city?: string;
    country?: string;
    avatarUrl?: string;
    isVerified?: boolean;
    league?: string;
    bio?: string;
  };
  isOwnProfile?: boolean;
}

// Simple country flag mapping
const countryFlags: Record<string, string> = {
  "US": "🇺🇸",
  "USA": "🇺🇸",
  "CA": "🇨🇦",
  "Canada": "🇨🇦",
  "UK": "🇬🇧",
  "GB": "🇬🇧",
  "DE": "🇩🇪",
  "Germany": "🇩🇪",
  "FR": "🇫🇷",
  "France": "🇫🇷",
  "ES": "🇪🇸",
  "Spain": "🇪🇸",
  "IT": "🇮🇹",
  "Italy": "🇮🇹",
  "AU": "🇦🇺",
  "Australia": "🇦🇺",
  "JP": "🇯🇵",
  "Japan": "🇯🇵",
  "MX": "🇲🇽",
  "Mexico": "🇲🇽",
  // Add more as needed
};

export function EnhancedPlayerCard({ player, isOwnProfile = false }: EnhancedPlayerCardProps) {
  const getCountryFlag = (country?: string) => {
    if (!country) return "🌍";
    return countryFlags[country.toUpperCase()] || countryFlags[country] || "🌍";
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4">
      {/* Main Player Card */}
      <Card className="bg-accent/50 overflow-hidden p-0">
        <CardContent className="p-0">
          {/* Cover Area */}
          <div className="relative h-30 bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            {/* Menu Button */}
            <Button size="icon" variant="ghost" className="absolute top-3 right-3 transition-colors">
              <MoreVertical size={20} />
            </Button>
            
            {/* Player ID Badge */}
            {player.fargoId && (
              <div className="absolute top-3 left-3">
                <Badge variant="secondary" className="bg-black/40 text-white backdrop-blur-sm">
                  ID: {player.fargoId}
                </Badge>
              </div>
            )}
          </div>

          {/* Content with proper spacing */}
          <div className="px-6 pt-0 relative -top-12">
            {/* Profile Image - Overlapping the cover */}
            <div className="flex justify-center relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 overflow-hidden border-4 border-gray-700 shadow-2xl">
                <Avatar className="w-full h-full">
                  <AvatarImage src={player.avatarUrl} className="object-cover" />
                  <AvatarFallback className="text-6xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center w-full h-full">
                    {getCountryFlag(player.country)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Player Stats */}
            <div className="flex justify-center gap-8 mb-6 mt-4">
              <div className="text-center">
                <div className="text-xl font-semibold text-blue-400">
                  {player.fargoRating || "N/A"}
                </div>
                <div className="text-gray-400 text-xs">Fargo Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold text-green-400">
                  {player.fargoRobustness || "0"}
                </div>
                <div className="text-gray-400 text-xs">Robustness</div>
              </div>
            </div>

            {/* Player Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                {player.name}
                {player.isVerified && (
                  <Badge variant="secondary" className="text-xs bg-blue-600 text-white">
                    ✓
                  </Badge>
                )}
              </h1>
              
              {player.city && (
                <div className="flex items-center justify-center gap-1 mt-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-400 text-sm">{player.city}</p>
                  <span className="text-lg">{getCountryFlag(player.country)}</span>
                </div>
              )}
              
              {player.league && (
                <Badge variant="outline" className="mt-2">
                  {player.league}
                </Badge>
              )}
              
              {player.bio && (
                <p className="text-accent-foreground leading-relaxed px-2 mt-4 text-sm">
                  {player.bio}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center items-center p-3 border-t-1 bg-accent/50 gap-2">
          {isOwnProfile ? (
            <>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/players/$id/edit" params={{ id: player._id }}>
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/tournaments">
                  <Trophy className="h-4 w-4 mr-2" />
                  Find Tournaments
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" className="rounded-full" asChild>
                <Link to="/players/$id" params={{ id: player._id }}>
                  View Profile
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full">
                Message
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

