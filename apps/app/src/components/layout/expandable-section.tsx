"use client";

import React, { createContext, useState, useContext } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@rackd/ui/lib/utils";

interface SectionContextType {
  /** Whether the parent ExpandableSection is currently expanded */
  isExpanded: boolean;
  /** Set the expanded state explicitly */
  setIsExpanded: (expanded: boolean) => void;
  /** Helper to toggle the expanded state */
  toggleExpanded: () => void;
}

/**
 * Context that allows descendants of an ExpandableSection to query or mutate
 * the expanded / collapsed state of their parent section.
 */
const SectionContext = createContext<SectionContextType | undefined>(undefined);

/**
 * Hook to access the parent ExpandableSection's state
 */
export const useSectionContext = () => {
  const context = useContext(SectionContext);
  if (!context) {
    throw new Error("useSectionContext must be used within an ExpandableSection");
  }
  return context;
};

export interface ExpandableSectionProps {
  title: string;
  children: React.ReactNode;
  expanded?: boolean;
  className?: string;
  /**
   * Custom icon to display before the title
   */
  icon?: React.ReactNode;
  /**
   * Callback when the section is expanded/collapsed
   */
  onToggle?: (expanded: boolean) => void;
}

export function ExpandableSection({
  title,
  children,
  expanded = false,
  className,
  icon,
  onToggle,
}: ExpandableSectionProps) {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };

  return (
    <SectionContext.Provider
      value={{
        isExpanded,
        setIsExpanded: (expanded: boolean) => {
          setIsExpanded(expanded);
          onToggle?.(expanded);
        },
        toggleExpanded: handleToggle,
      }}
    >
      <div className={cn("overflow-hidden rounded-lg border")}>
        <div
          className="bg-background hover:bg-muted flex cursor-pointer items-center justify-between p-3 transition-colors"
          onClick={handleToggle}
        >
          <div className="flex items-center gap-2">
            {icon && <div className="flex-shrink-0">{icon}</div>}
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={isExpanded ? "Collapse section" : "Expand section"}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200",
            isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div className={cn("bg-background border-t p-3", className)}>{children}</div>
        </div>
      </div>
    </SectionContext.Provider>
  );
}

