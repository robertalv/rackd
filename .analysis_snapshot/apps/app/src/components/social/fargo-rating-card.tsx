"use client";

import { Link } from "@tanstack/react-router";
import { Button } from "@rackd/ui/components/button";
import { ExpandableSection } from "@/components/layout/expandable-section";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface FargoRatingCardProps {
  player?: {
    _id: Id<"players">;
    name?: string;
    fargoRating?: number;
    fargoRobustness?: number;
    fargoReadableId?: string;
  } | null;
}

export function FargoRatingCard({ player }: FargoRatingCardProps) {
  if (!player) {
    return null;
  }

  return (
    <ExpandableSection
      title=""
      expanded={true}
      icon={
        <img
          src="/images/fr.png"
          alt="FargoRate"
          width={150}
          height={40}
          className="object-contain"
        />
      }
    >
      <div className="space-y-3">
        {player.fargoReadableId && (
          <p className="text-xs text-muted-foreground">ID: {player.fargoReadableId}</p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-sm text-muted-foreground mb-1">Rating</div>
            <div className="text-2xl font-bold text-blue-400">
              {player.fargoRating || "N/A"}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-background/50">
            <div className="text-sm text-muted-foreground mb-1">Robustness</div>
            <div className="text-2xl font-bold text-green-400">
              {player.fargoRobustness || "0"}
            </div>
          </div>
        </div>
        {player._id && (
          <Link to="/players/$id" params={{ id: player._id }} className="w-full block">
            <Button variant="outline" className="w-full" size="sm">
              View Player Profile
            </Button>
          </Link>
        )}
      </div>
    </ExpandableSection>
  );
}

