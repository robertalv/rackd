"use client";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@rackd/ui/components/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { useIsMobile } from "@rackd/ui/hooks/use-mobile";
import type { LucideIcon } from "lucide-react";
import React from "react";

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
  icon?: LucideIcon;
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
}: ResizableLayoutProps) {
  const autoDetectedMobile = useIsMobile();
  const isMobile = disableAutoMobileDetection 
    ? (isMobileProp ?? false) 
    : (isMobileProp ?? autoDetectedMobile);
  
  const leftSize = leftPanel.defaultSize ?? 50;
  const rightSize = rightPanel.defaultSize ?? (100 - leftSize);

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
                {LeftIcon && <LeftIcon className="mr-2 h-4 w-4" />}
                {leftPanel.label || "Left"}
              </TabsTrigger>
              <TabsTrigger value="right" className="flex-1">
                {RightIcon && <RightIcon className="mr-2 h-4 w-4" />}
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
        <ResizablePanelGroup direction={direction} className="isolate">
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

