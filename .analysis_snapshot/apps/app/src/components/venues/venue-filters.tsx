"use client";

import { Card } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Icon, FilterIcon, Cancel01Icon, Location03Icon, LockKeyIcon } from "@rackd/ui/icons";

type VenueType = "all" | "pool_hall" | "bar" | "sports_facility" | "business" | "residence" | "other";
type AccessType = "all" | "public" | "private" | "membership_needed";

interface VenueFiltersProps {
  selectedType: VenueType;
  onTypeChange: (type: VenueType) => void;
  selectedAccess?: AccessType;
  onAccessChange?: (access: AccessType) => void;
  typeCounts?: Record<VenueType, number>;
  onClearFilters?: () => void;
}

const venueTypeOptions: Array<{ value: VenueType; label: string }> = [
  { value: "all", label: "All Types" },
  { value: "pool_hall", label: "Pool Hall" },
  { value: "bar", label: "Bar" },
  { value: "sports_facility", label: "Sports Facility" },
  { value: "business", label: "Business" },
  { value: "residence", label: "Residence" },
  { value: "other", label: "Other" },
];

const accessOptions: Array<{ value: AccessType; label: string }> = [
  { value: "all", label: "All Access" },
  { value: "public", label: "Public" },
  { value: "private", label: "Private" },
  { value: "membership_needed", label: "Membership Required" },
];

export function VenueFilters({
  selectedType,
  onTypeChange,
  selectedAccess = "all",
  onAccessChange,
  typeCounts,
  onClearFilters,
}: VenueFiltersProps) {
  const hasActiveFilters = selectedType !== "all" || selectedAccess !== "all";

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
        {/* Venue Type Filter */}
        <ExpandableSection title="Venue Type" icon={<Icon icon={Location03Icon} className="h-4 w-4" />} expanded>
          <div>
            <label className="text-xs font-medium text-foreground mb-1.5 block">Venue Type</label>
            <Select value={selectedType} onValueChange={(value) => onTypeChange(value as VenueType)}>
              <SelectTrigger className="h-9 w-full">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                {venueTypeOptions.map((option) => {
                  const count = typeCounts?.[option.value];
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                      {count !== undefined && count > 0 && (
                        <span className="ml-2 text-muted-foreground">({count})</span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </ExpandableSection>

        {/* Access Filter */}
        {onAccessChange && (
          <ExpandableSection title="Access" icon={<Icon icon={LockKeyIcon} className="h-4 w-4" />} expanded>
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">Access Type</label>
              <Select value={selectedAccess} onValueChange={(value) => onAccessChange(value as AccessType)}>
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="All Access" />
                </SelectTrigger>
                <SelectContent>
                  {accessOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </ExpandableSection>
        )}
      </div>

      <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 mt-6">
        Apply Filters
      </Button>
    </Card>
  );
}


