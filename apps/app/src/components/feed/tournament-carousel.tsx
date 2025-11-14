"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Card } from "@rackd/ui/components/card";
import { Link } from "@tanstack/react-router";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Icon, Calendar02Icon, ChampionIcon, UserGroupIcon, StoreLocation02Icon, ArrowLeft01Icon, ArrowRight01Icon } from "@rackd/ui/icons";
import { formatDate } from "@/lib/utils";

export function TournamentCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const tournaments = useQuery(api.tournaments.list, { status: "upcoming" });
  
  if (!tournaments || tournaments.length === 0) {
    return null;
  }

  const sortedTournaments = [...tournaments]
    .sort((a, b) => a.date - b.date)
    .slice(0, 4);

  if (sortedTournaments.length === 0) {
    return null;
  }

  const next = () => setCurrentIndex((i) => (i + 1) % sortedTournaments.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + sortedTournaments.length) % sortedTournaments.length);
  const current = sortedTournaments[currentIndex];

  const formatPrizePool = (entryFee: number | null | undefined, maxPlayers: number | null | undefined) => {
    if (!entryFee || !maxPlayers) return "TBD";
    const total = entryFee * maxPlayers;
    return `$${total.toLocaleString()}`;
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <HeaderLabel size="lg">Upcoming Tournaments</HeaderLabel>
        <Button variant="outline" size="sm" asChild>
          <Link to="/tournaments">View All</Link>
        </Button>
      </div>
      <div className="relative">
        <Card className="overflow-hidden bg-card p-0">
          <div className="relative h-80 bg-muted">
            {current.flyerUrl ? (
              <div className="w-full h-full relative">
                <img
                  src={current.flyerUrl}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
                {/* Always overlay on the image */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center relative">
                <Icon icon={ChampionIcon} className="h-16 w-16 text-primary/30" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              </div>
            )}
            
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 text-white bg-gradient-to-t from-black/80 via-black/30 to-transparent">
              <HeaderLabel size="4xl">{current.name}</HeaderLabel>
              <div className="flex items-end justify-between gap-4 mt-2">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Icon icon={Calendar02Icon} className="w-4 h-4" />
                      <span className="text-sm truncate">{formatDate(current.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon={ChampionIcon} className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {formatPrizePool(current.entryFee, current.maxPlayers)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon icon={UserGroupIcon} className="w-4 h-4" />
                      <span className="text-sm">{current.registeredCount} / {current.maxPlayers || "∞"} players</span>
                    </div>
                  </div>
                  {current.venue && current.venueId && (
                    <Link 
                      to="/venues/$id" 
                      params={{ id: current.venueId }}
                      className="flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors !cursor-pointer"
                    >
                      <Icon icon={StoreLocation02Icon} className="w-4 h-4" />
                      {current.venue.name}
                    </Link>
                  )}
                </div>
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground shrink-0"
                  asChild
                >
                  <Link to="/tournaments/$id" params={{ id: current._id }}>Register</Link>
                </Button>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Carousel Controls */}
        {sortedTournaments.length > 1 && (
          <>
            <Button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary/50 hover:bg-primary text-primary-foreground rounded-lg p-2 w-10 h-10"
              size="icon"
              variant="ghost"
            >
              <Icon icon={ArrowLeft01Icon} className="w-6 h-6" />
            </Button>
            <Button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary/50 hover:bg-primary text-primary-foreground rounded-lg p-2 w-10 h-10"
              size="icon"
              variant="ghost"
            >
              <Icon icon={ArrowRight01Icon} className="w-6 h-6" />
            </Button>
            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {sortedTournaments.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

