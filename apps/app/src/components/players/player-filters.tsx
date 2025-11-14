"use client";

import { Card } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { FargoRatingSelect } from "@/components/discover/fargo-rating-select";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Icon, FilterIcon, Location03Icon, ChartScatterIcon, Cancel01Icon } from "@rackd/ui/icons";

interface PlayerFiltersProps {
  filters: {
    city: string;
    country: string;
    region: string;
    fargoRating: [number, number];
  };
  onFiltersChange: (filters: {
    city: string;
    country: string;
    region: string;
    fargoRating: [number, number];
  }) => void;
  onClearFilters?: () => void;
}

export function PlayerFilters({
  filters,
  onFiltersChange,
  onClearFilters,
}: PlayerFiltersProps) {
  const hasActiveFilters = 
    filters.city !== "" ||
    filters.country !== "" ||
    filters.region !== "" ||
    filters.fargoRating[0] !== 200 ||
    filters.fargoRating[1] !== 900;

  return (
    <Card className="bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon icon={FilterIcon} className="w-5 h-5 text-primary" />
          <HeaderLabel size="lg">Filters</HeaderLabel>
        </div>
        {hasActiveFilters && onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Icon icon={Cancel01Icon} className="h-3 w-3" />
            Reset
          </button>
        )}
      </div>

      <div className="space-y-4">
        <ExpandableSection title="Location" icon={<Icon icon={Location03Icon} className="h-4 w-4" />} expanded>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">City</label>
              <Input 
                placeholder="Enter city" 
                value={filters.city}
                onChange={(e) => onFiltersChange({...filters, city: e.target.value})}
                className="h-9"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Country</label>
              <Input 
                placeholder="Enter country" 
                value={filters.country}
                onChange={(e) => onFiltersChange({...filters, country: e.target.value})}
                className="h-9"
              />
            </div>
            
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">State/Region</label>
              <Input 
                placeholder="Enter state/region" 
                value={filters.region}
                onChange={(e) => onFiltersChange({...filters, region: e.target.value})}
                className="h-9"
              />
            </div>
          </div>
        </ExpandableSection>
        
        <ExpandableSection title="Skill Level" icon={<Icon icon={ChartScatterIcon} className="h-4 w-4" />} expanded>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Fargo Rating</label>
            <FargoRatingSelect
              value={filters.fargoRating}
              onValueChange={(value) => onFiltersChange({...filters, fargoRating: value})}
            />
          </div>
        </ExpandableSection>
      </div>

      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6">
        Apply Filters
      </Button>
    </Card>
  );
}


