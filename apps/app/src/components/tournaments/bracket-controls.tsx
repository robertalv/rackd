import { useState, useRef, useEffect, useMemo } from "react";
import { NavigationButton } from "../navigation-button";
import { toPng } from "html-to-image";

// Import icons - using common hugeicons names
// Note: Adjust icon names if they don't match exactly in hugeicons
import {
  ArrowExpandIcon,
  Download01Icon,
  FileIcon,
  ZoomInAreaIcon,
  ZoomOutAreaIcon,
} from "@rackd/ui/icons";

type BracketControlsProps = {
  bracketContainerRef: React.RefObject<HTMLDivElement | null>;
  tournamentName?: string;
  zoom?: number; // Zoom level from parent (0-200)
  onZoomChange?: (zoom: number) => void; // Callback when zoom changes
};

export function BracketControls({ bracketContainerRef, tournamentName = "Tournament Bracket", zoom: zoomProp = 80, onZoomChange }: BracketControlsProps) {
  // Use zoom from props if provided, otherwise use internal state
  const [internalZoom, setInternalZoom] = useState(80);
  const zoom = zoomProp ?? internalZoom;
  const setZoom = onZoomChange ?? setInternalZoom;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Handle zoom change
  const handleZoomIn = () => {
    const newZoom = Math.min(zoom + 10, 200);
    setZoom(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom - 10, 25);
    setZoom(newZoom);
  };

  // Apply zoom transform to bracket container
  useEffect(() => {
    if (bracketContainerRef.current) {
      const container = bracketContainerRef.current;
      // Find the scrollable content inside (usually the bracket wrapper)
      const bracketContent = container.querySelector('[data-bracket-content]') as HTMLElement;
      const targetElement = bracketContent || container;
      
      targetElement.style.transform = `scale(${zoom / 100})`;
      targetElement.style.transformOrigin = "top left";
      targetElement.style.transition = "transform 0.2s ease";
    }
  }, [zoom, bracketContainerRef]);

  // Handle fullscreen
  const toggleFullscreen = async () => {
    if (!bracketContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await bracketContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Download as PNG
  const handleDownloadPNG = async () => {
    if (!bracketContainerRef.current) return;

    try {
      // Find the bracket content element
      const bracketContent = bracketContainerRef.current.querySelector('[data-bracket-content]') as HTMLElement;
      const targetElement = bracketContent || bracketContainerRef.current;

      // Temporarily remove transform to capture at original size
      const originalTransform = targetElement.style.transform;
      const originalTransformOrigin = targetElement.style.transformOrigin;
      
      targetElement.style.transform = "scale(1)";
      targetElement.style.transformOrigin = "top left";

      // Wait for transform to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(targetElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#ffffff",
      });

      // Restore transform
      targetElement.style.transform = originalTransform;
      targetElement.style.transformOrigin = originalTransformOrigin;

      // Create download link
      const link = document.createElement("a");
      link.download = `${tournamentName.replace(/[^a-z0-9]/gi, "_")}_bracket.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };

  // Download as PDF
  const handleDownloadPDF = async () => {
    if (!bracketContainerRef.current) return;

    try {
      // Dynamically import jsPDF only when needed (client-side only)
      const { default: jsPDF } = await import("jspdf");

      // Find the bracket content element
      const bracketContent = bracketContainerRef.current.querySelector('[data-bracket-content]') as HTMLElement;
      const targetElement = bracketContent || bracketContainerRef.current;

      // Temporarily remove transform to capture at original size
      const originalTransform = targetElement.style.transform;
      const originalTransformOrigin = targetElement.style.transformOrigin;
      
      targetElement.style.transform = "scale(1)";
      targetElement.style.transformOrigin = "top left";

      // Wait for transform to apply
      await new Promise((resolve) => setTimeout(resolve, 100));

      const dataUrl = await toPng(targetElement, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#ffffff",
      });

      // Restore transform
      targetElement.style.transform = originalTransform;
      targetElement.style.transformOrigin = originalTransformOrigin;

      // Create PDF
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const img = new Image();
      img.src = dataUrl;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imgHeight = (img.height * imgWidth) / img.width;
      const pdf = new jsPDF("p", "mm", "a4");
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${tournamentName.replace(/[^a-z0-9]/gi, "_")}_bracket.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const buttons = useMemo(
    () => [
      {
        icon: ArrowExpandIcon,
        tooltip: isFullscreen ? "Exit Fullscreen" : "Go Fullscreen",
        navigate: toggleFullscreen,
        active: isFullscreen,
        className: `h-10 w-10 rounded-md hover:bg-muted ${
          isFullscreen ? "bg-primary/10 border border-primary/30" : ""
        }`,
      },
      {
        icon: Download01Icon,
        tooltip: "Download PNG",
        navigate: handleDownloadPNG,
      },
      {
        icon: FileIcon,
        tooltip: "Download PDF",
        navigate: handleDownloadPDF,
      },
      {
        icon: ZoomInAreaIcon,
        tooltip: "Zoom In",
        navigate: handleZoomIn,
        disabled: zoom >= 200,
      },
      {
        icon: ZoomOutAreaIcon,
        tooltip: "Zoom Out",
        navigate: handleZoomOut,
        disabled: zoom <= 25,
      },
    ],
    [isFullscreen, zoom, toggleFullscreen, handleDownloadPNG, handleDownloadPDF, handleZoomIn, handleZoomOut]
  );

  return (
    <div
      ref={controlsRef}
      className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2 rounded-lg bg-card border border-border shadow-lg !p-1 !px-0"
    >
      {buttons.map((button, index) => (
        <NavigationButton
          key={index}
          icon={button.icon}
          variant="ghost"
          size="icon"
          className={button.className || "h-10 w-10 rounded-md hover:bg-muted"}
          tooltip={button.tooltip}
          tooltipPosition="left"
          navigate={button.navigate}
          bordered={false}
          active={button.active}
          disabled={button.disabled}
        />
      ))}

      {/* Zoom percentage display */}
      <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
        {zoom}%
      </div>
    </div>
  );
}

