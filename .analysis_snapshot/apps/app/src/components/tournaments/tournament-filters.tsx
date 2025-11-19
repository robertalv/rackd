"use client";

import { Card } from "@rackd/ui/components/card";
import { Badge } from "@rackd/ui/components/badge";
import { HeaderLabel } from "@rackd/ui/components/label";
import { ExpandableSection } from "@/components/layout/expandable-section";
import { Icon, Calendar02Icon, Billiard01Icon, ChampionIcon, Money03Icon, StarIcon, Cancel01Icon, FilterIcon } from "@rackd/ui/icons";

type GameType = "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool" | "all";
type TournamentType = "single" | "double" | "scotch_double" | "teams" | "round_robin" | "all";
type EntryFeeFilter = "all" | "free" | "paid";

interface TournamentFiltersProps {
  selectedStatus: "all" | "upcoming" | "active" | "completed" | "draft";
  onStatusChange: (status: "all" | "upcoming" | "active" | "completed" | "draft") => void;
  selectedGameType?: GameType;
  onGameTypeChange?: (gameType: GameType) => void;
  selectedTournamentType?: TournamentType;
  onTournamentTypeChange?: (type: TournamentType) => void;
  selectedEntryFee?: EntryFeeFilter;
  onEntryFeeChange?: (entryFee: EntryFeeFilter) => void;
  showFeatured?: boolean;
  onFeaturedChange?: (featured: boolean) => void;
  statusCounts?: {
    all: number;
    upcoming: number;
    active: number;
    completed: number;
    draft?: number;
  };
  onClearFilters?: () => void;
}

const statusOptions: Array<{
  value: "all" | "upcoming" | "active" | "completed" | "draft";
  label: string;
}> = [
  { value: "all", label: "All Tournaments" },
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "draft", label: "Draft" },
];

const gameTypeOptions: Array<{ value: GameType; label: string }> = [
  { value: "all", label: "All Games" },
  { value: "eight_ball", label: "8-Ball" },
  { value: "nine_ball", label: "9-Ball" },
  { value: "ten_ball", label: "10-Ball" },
  { value: "one_pocket", label: "One Pocket" },
  { value: "bank_pool", label: "Bank Pool" },
];

const tournamentTypeOptions: Array<{ value: TournamentType; label: string }> = [
  { value: "all", label: "All Types" },
  { value: "single", label: "Single Elimination" },
  { value: "double", label: "Double Elimination" },
  { value: "scotch_double", label: "Scotch Double" },
  { value: "teams", label: "Teams" },
  { value: "round_robin", label: "Round Robin" },
];

const entryFeeOptions: Array<{ value: EntryFeeFilter; label: string }> = [
  { value: "all", label: "All Entry Fees" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

export function TournamentFilters({
  selectedStatus,
  onStatusChange,
  selectedGameType = "all",
  onGameTypeChange,
  selectedTournamentType = "all",
  onTournamentTypeChange,
  selectedEntryFee = "all",
  onEntryFeeChange,
  showFeatured = false,
  onFeaturedChange,
  statusCounts,
  onClearFilters,
}: TournamentFiltersProps) {
  const hasActiveFilters = 
    selectedStatus !== "all" ||
    selectedGameType !== "all" ||
    selectedTournamentType !== "all" ||
    selectedEntryFee !== "all" ||
    showFeatured;

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
        {/* Status Filter */}
        <ExpandableSection title="Tournament Status" icon={<Icon icon={Calendar02Icon} className="h-4 w-4" />} expanded>
          <div className="flex flex-col gap-1">
            {statusOptions.map((option) => {
              const count = statusCounts?.[option.value];
              const isSelected = selectedStatus === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onStatusChange(option.value)}
                  className={`
                    w-full px-3 py-2 rounded-lg flex items-center justify-between
                    transition-colors group
                    border border-transparent hover:border-primary/10
                    ${isSelected 
                      ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                      : "hover:bg-muted"
                    }
                  `}
                >
                  <span className={`text-sm ${isSelected ? "font-semibold text-foreground" : "font-medium text-foreground group-hover:text-primary"}`}>
                    {option.label}
                  </span>
                  {count !== undefined && (
                    <Badge
                      variant={isSelected ? "default" : "secondary"}
                      className="text-xs font-semibold px-1.5 shrink-0"
                    >
                      {count}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </ExpandableSection>

        {/* Game Type Filter */}
        {onGameTypeChange && (
          <ExpandableSection title="Game Type" icon={<Icon icon={Billiard01Icon} className="h-4 w-4" />} expanded>
            <div className="flex flex-col gap-1">
              {gameTypeOptions.map((option) => {
                const isSelected = selectedGameType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onGameTypeChange(option.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg flex items-center justify-between
                      transition-colors group
                      border border-transparent hover:border-primary/10
                      ${isSelected 
                        ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                        : "hover:bg-muted"
                      }
                    `}
                  >
                    <span className={`text-sm ${isSelected ? "font-semibold text-foreground" : "font-medium text-foreground group-hover:text-primary"}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </ExpandableSection>
        )}

        {/* Tournament Type Filter */}
        {onTournamentTypeChange && (
          <ExpandableSection title="Tournament Type" icon={<Icon icon={ChampionIcon} className="h-4 w-4" />} expanded>
            <div className="flex flex-col gap-1">
              {tournamentTypeOptions.map((option) => {
                const isSelected = selectedTournamentType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onTournamentTypeChange(option.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg flex items-center justify-between
                      transition-colors group
                      border border-transparent hover:border-primary/10
                      ${isSelected 
                        ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                        : "hover:bg-muted"
                      }
                    `}
                  >
                    <span className={`text-sm ${isSelected ? "font-semibold text-foreground" : "font-medium text-foreground group-hover:text-primary"}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </ExpandableSection>
        )}

        {/* Entry Fee Filter */}
        {onEntryFeeChange && (
          <ExpandableSection title="Entry Fee" icon={<Icon icon={Money03Icon} className="h-4 w-4" />}>
            <div className="flex flex-col gap-1">
              {entryFeeOptions.map((option) => {
                const isSelected = selectedEntryFee === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onEntryFeeChange(option.value)}
                    className={`
                      w-full px-3 py-2 rounded-lg flex items-center justify-between
                      transition-colors group
                      border border-transparent hover:border-primary/10
                      ${isSelected 
                        ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                        : "hover:bg-muted"
                      }
                    `}
                  >
                    <span className={`text-sm ${isSelected ? "font-semibold text-foreground" : "font-medium text-foreground group-hover:text-primary"}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </ExpandableSection>
        )}

        {/* Featured Filter */}
        {onFeaturedChange && (
          <ExpandableSection title="Options" icon={<Icon icon={StarIcon} className="h-4 w-4" />}>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => onFeaturedChange(!showFeatured)}
                className={`
                  w-full px-3 py-2 rounded-lg flex items-center justify-between
                  transition-colors group
                  border border-transparent hover:border-primary/10
                  ${showFeatured 
                    ? "bg-primary/10 hover:bg-primary/20 border-primary/20" 
                    : "hover:bg-muted"
                  }
                `}
              >
                <span className={`text-sm ${showFeatured ? "font-semibold text-foreground" : "font-medium text-foreground group-hover:text-primary"}`}>
                  Featured Only
                </span>
              </button>
            </div>
          </ExpandableSection>
        )}
      </div>
    </Card>
  );
}

