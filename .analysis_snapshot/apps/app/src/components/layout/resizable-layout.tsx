"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@rackd/ui/components/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { useIsMobile } from "@rackd/ui/hooks/use-mobile";
import { Icon, type IconProps } from "@rackd/ui/icons";
import React, { useState, useEffect, useCallback } from "react";

export interface PanelConfig {
  /**
   * The content to render in this panel
   */
  content: React.ReactNode;
  /**
   * Label for the tab (mobile only)
   */
  label?: string;
  /**
   * Icon for the tab (mobile only)
   */
  icon?: IconProps["icon"];
  /**
   * Default size percentage for desktop (0-100)
   * @default 50
   */
  defaultSize?: number;
  /**
   * Minimum size percentage for desktop (0-100)
   * @default 20
   */
  minSize?: number;
  /**
   * Maximum size percentage for desktop (0-100)
   * @default 80
   */
  maxSize?: number;
  /**
   * Minimum width in CSS units (e.g., "22rem", "300px")
   */
  minWidth?: string;
  /**
   * Additional class names for the panel container
   */
  className?: string;
}

export interface ResizableLayoutProps {
  /**
   * Configuration for the left/first panel
   */
  leftPanel: PanelConfig;
  /**
   * Configuration for the right/second panel
   */
  rightPanel: PanelConfig;
  /**
   * Default tab to show on mobile
   * @default "left"
   */
  defaultTab?: "left" | "right";
  /**
   * Whether to show the resize handle on desktop
   * @default true
   */
  showHandle?: boolean;
  /**
   * Direction of the panels
   * @default "horizontal"
   */
  direction?: "horizontal" | "vertical";
  /**
   * Custom class name for the root container
   */
  className?: string;
  /**
   * Whether to use mobile layout
   * If not provided, will use the useIsMobile hook for automatic detection
   */
  isMobile?: boolean;
  /**
   * Whether to disable automatic mobile detection
   * @default false
   */
  disableAutoMobileDetection?: boolean;
  /**
   * Storage key for persisting panel sizes in localStorage
   * If not provided, sizes will not be persisted
   */
  storageKey?: string;
  /**
   * Optional callback for resize changes
   * If provided, this will be called instead of directly saving to localStorage
   */
  onResizeChange?: (sizes: number[]) => void;
}

/**
 * A reusable layout component that provides:
 * - Desktop: Resizable panels with a draggable handle
 * - Mobile: Tabs to switch between panels
 */
export function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultTab = "left",
  showHandle = true,
  direction = "horizontal",
  className = "",
  isMobile: isMobileProp,
  disableAutoMobileDetection = false,
  storageKey,
  onResizeChange,
}: ResizableLayoutProps) {
  const autoDetectedMobile = useIsMobile();
  const isMobile = disableAutoMobileDetection 
    ? (isMobileProp ?? false) 
    : (isMobileProp ?? autoDetectedMobile);
  
  // Load saved sizes from localStorage synchronously on initial render
  const getSavedSizes = (): { left: number; right: number } | null => {
    if (storageKey && typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Support both direct { left, right } and nested { resize: { left, right } } structures
          if (parsed.resize && typeof parsed.resize.left === "number" && typeof parsed.resize.right === "number") {
            return parsed.resize;
          } else if (typeof parsed.left === "number" && typeof parsed.right === "number") {
            return { left: parsed.left, right: parsed.right };
          }
        }
      } catch (error) {
        console.error("Failed to load saved panel sizes:", error);
      }
    }
    return null;
  };
  
  const [savedSizes, setSavedSizes] = useState<{ left: number; right: number } | null>(getSavedSizes);
  
  const defaultLeftSize = leftPanel.defaultSize ?? 50;
  const defaultRightSize = rightPanel.defaultSize ?? (100 - defaultLeftSize);
  
  const leftSize = savedSizes?.left ?? defaultLeftSize;
  const rightSize = savedSizes?.right ?? defaultRightSize;
  
  // Save sizes to localStorage when they change
  const handleLayoutChange = useCallback((sizes: number[]) => {
    if (sizes.length >= 2) {
      // If callback is provided, use it instead of direct localStorage access
      if (onResizeChange) {
        onResizeChange(sizes);
        return;
      }
      
      // Otherwise, save directly to localStorage (backward compatibility)
      if (storageKey && typeof window !== "undefined") {
        try {
          const newSizes = {
            left: sizes[0],
            right: sizes[1],
          };
          localStorage.setItem(storageKey, JSON.stringify(newSizes));
          setSavedSizes(newSizes);
        } catch (error) {
          console.error("Failed to save panel sizes:", error);
        }
      }
    }
  }, [storageKey, onResizeChange]);

  // Mobile layout
  if (isMobile) {
    const LeftIcon = leftPanel.icon;
    const RightIcon = rightPanel.icon;

    return (
      <div className={`relative isolate flex flex-1 overflow-hidden ${className}`}>
        <div className="size-full flex-1 overflow-hidden">
          <Tabs defaultValue={defaultTab} className="h-full">
            <TabsList className="w-full rounded-none">
              <TabsTrigger value="left" className="flex-1">
                {LeftIcon && <Icon icon={LeftIcon} className="mr-2 h-4 w-4" />}
                {leftPanel.label || "Left"}
              </TabsTrigger>
              <TabsTrigger value="right" className="flex-1">
                {RightIcon && <Icon icon={RightIcon} className="mr-2 h-4 w-4" />}
                {rightPanel.label || "Right"}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="left" className="mt-0 h-[calc(100%-2.5rem)]">
              <div className={`flex h-full flex-col ${leftPanel.className || ""}`}>
                {leftPanel.content}
              </div>
            </TabsContent>
            <TabsContent value="right" className="mt-0 h-[calc(100%-2.5rem)]">
              <div className={`flex h-full flex-col ${rightPanel.className || ""}`}>
                {rightPanel.content}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className={`relative isolate flex flex-1 overflow-hidden ${className}`}>
      <div className="size-full">
        <ResizablePanelGroup 
          direction={direction} 
          className="isolate"
          onLayout={handleLayoutChange}
        >
          <ResizablePanel
            defaultSize={leftSize}
            minSize={leftPanel.minSize ?? 20}
            maxSize={leftPanel.maxSize ?? 80}
            className={`z-1 ${leftPanel.minWidth ? `min-w-[max(${leftPanel.minSize ?? 20}%,${leftPanel.minWidth})]` : ""} ${leftPanel.className || ""}`}
          >
            <div className="relative isolate flex h-full flex-1 flex-col">
              {leftPanel.content}
            </div>
          </ResizablePanel>
          {showHandle && <ResizableHandle />}
          <ResizablePanel
            defaultSize={rightSize}
            minSize={rightPanel.minSize ?? 20}
            maxSize={rightPanel.maxSize ?? 80}
            className={rightPanel.className || ""}
          >
            <div className="flex h-full flex-col">
              {rightPanel.content}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}

