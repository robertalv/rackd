"use client";

import type { ReactNode } from "react";
import { Input } from "@rackd/ui/components/input";
import { Button } from "@rackd/ui/components/button";
import { Icon, Search01Icon, GridViewIcon, ListViewIcon, ArrowLeft01Icon } from "@rackd/ui/icons";

interface PageHeaderProps {
  title: string;
  description?: string;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actionButton?: ReactNode;
  viewMode?: "grid" | "list";
  onViewModeChange?: (mode: "grid" | "list") => void;
  mobileFilterButton?: ReactNode;
  sticky?: boolean;
  className?: string;
  onBack?: () => void;
  backLabel?: string;
  showSearch?: boolean;
}

export function PageHeader({
  title,
  description,
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  actionButton,
  viewMode,
  onViewModeChange,
  mobileFilterButton,
  sticky = true,
  className = "",
  onBack,
  backLabel,
  showSearch = true,
}: PageHeaderProps) {
  return (
    <div
      className={`${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="-ml-2"
              >
                <Icon icon={ArrowLeft01Icon} className="h-8 w-8" />
              </Button>
            )}
            <div>
              <h1 className="text-4xl font-bold text-foreground tracking-tighter">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {actionButton}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Icon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                className="pl-10 bg-background border-border/50"
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                size="xl"
              />
            </div>
            {mobileFilterButton}
            {viewMode && onViewModeChange && (
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onViewModeChange("grid")}
                >
                  <Icon icon={GridViewIcon} className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  onClick={() => onViewModeChange("list")}
                >
                  <Icon icon={ListViewIcon} className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
        {/* View Mode Toggle (when search is hidden) */}
        {!showSearch && viewMode && onViewModeChange && (
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => onViewModeChange("grid")}
            >
              <Icon icon={GridViewIcon} className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => onViewModeChange("list")}
            >
              <Icon icon={ListViewIcon} className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

