"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { MapPin, Plus } from "lucide-react";
import { AddVenueModal } from "./add-venue-modal";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface VenueSearchProps {
  value?: string;
  onChange: (venueId: string | undefined) => void;
  placeholder?: string;
}

export function VenueSearch({ value, onChange, placeholder = "Search venues..." }: VenueSearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const venues = useQuery(api.venues.search, { query: searchTerm });
  const selectedVenue = useQuery(api.venues.getById, value ? { id: value as Id<"venues"> } : "skip");

  const handleSelect = (venueId: string, venueName: string) => {
    onChange(venueId);
    setSearchTerm(venueName);
    setShowResults(false);
  };

  const handleClear = () => {
    onChange(undefined);
    setSearchTerm("");
    setShowResults(false);
  };

  const handleVenueAdded = (venueId: string) => {
    onChange(venueId);
    setShowAddModal(false);
    setSearchTerm("");
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={selectedVenue ? selectedVenue.name : searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
              if (!e.target.value) {
                onChange(undefined);
              }
            }}
            onFocus={() => setShowResults(true)}
            placeholder={placeholder}
            className="pr-8"
          />
          <MapPin className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />

          {(selectedVenue || searchTerm) && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddModal(true)}
          className="px-3"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {/* Search Results Dropdown */}
      {showResults && searchTerm && venues && venues.length > 0 && (
        <div className="absolute z-10 w-full mt-1 border rounded-xl shadow-lg bg-card max-h-60 overflow-y-auto">
          {venues.map((venue) => (
            <button
              key={venue._id}
              type="button"
              onClick={() => handleSelect(venue._id, venue.name)}
              className="w-full px-3 py-2 text-left hover:bg-accent/50 border-b last:border-b-0"
            >
              <div className="font-medium">{venue.name}</div>
              <div className="text-sm text-gray-500">
                {venue.type.replace('_', ' ')} • {venue.access.replace('_', ' ')}
                {venue.address && ` • ${venue.address}`}
              </div>
            </button>
          ))}
        </div>
      )}
      {/* No Results */}
      {showResults && searchTerm && venues && venues.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-sidebar border rounded-xl shadow-lg">
          <div className="px-3 py-2 text-muted-foreground text-sm">
            No venues found.
            <Button
              type="button"
              variant="link"
              onClick={() => setShowAddModal(true)}
            >
              Add a new venue?
            </Button>
          </div>
        </div>
      )}
      {/* Click outside to close */}
      {showResults && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setShowResults(false)}
        />
      )}
      <AddVenueModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onVenueAdded={handleVenueAdded}
      />
    </div>
  );
}


