import * as React from "react";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rackd/ui/components/tooltip";
import { cn } from "@rackd/ui/lib/utils";
import { Icon, type IconProps } from "@rackd/ui/icons";

type LucideIcon = React.ComponentType<{ className?: string; size?: number | string }>;
type TablerIcon = React.ComponentType<{ className?: string; size?: number | string }>;
type IconType = IconProps["icon"] | LucideIcon | TablerIcon;

interface NavigationButtonProps extends Omit<React.ComponentProps<typeof Button>, "variant"> {
  icon: IconType;
  count?: number;
  iconClassName?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  showZeroBadge?: boolean;
  badgePosition?: "top-right" | "inline" | "bottom-right" | "bottom-left";
  ariaLabel?: string;
  tooltip?: string | React.ReactNode;
  /** Tooltip position. Defaults to "right". */
  tooltipPosition?: "top" | "right" | "bottom" | "left";
  navigate?: () => void;
  /** Whether to show a border. Defaults to true. */
  bordered?: boolean;
  /** Whether the link is active. When active, border is shown regardless of bordered prop. */
  active?: boolean;
  /** Button variant. Only used if bordered is true or active is true. */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "auth";
}

export const NavigationButton = React.forwardRef<HTMLButtonElement, NavigationButtonProps>(
  (
    {
      icon,
      count,
      iconClassName = "stroke-1",
      badgeVariant = "default",
      showZeroBadge = false,
      badgePosition = "top-right",
      ariaLabel,
      tooltip,
      tooltipPosition = "right",
      className,
      variant = "outline",
      size = "icon",
      navigate,
      bordered = true,
      active = false,
      ...props
    },
    ref
  ) => {
    const shouldShowBadge = count !== undefined && (count > 0 || showZeroBadge);
    const displayCount = count && count > 99 ? "99+" : count;

    if (!icon) {
      return null;
    }

    const isHugeiconsIcon = Array.isArray(icon);
    const isReactComponent = typeof icon === "function";
    
    let iconElement: React.ReactNode;
    if (isHugeiconsIcon) {
      iconElement = <Icon icon={icon as IconProps["icon"]} className={iconClassName} />;
    } else if (isReactComponent) {
      const IconComponent = icon as React.ComponentType<{ className?: string; size?: number | string }>;
      iconElement = <IconComponent className={iconClassName} />;
    } else {
      console.warn("Unknown icon type passed to NavigationButton. Expected function (React component) or array (hugeicons icon), got:", typeof icon, icon);
      try {
        const IconComponent = icon as unknown as React.ComponentType<{ className?: string }>;
        iconElement = <IconComponent className={iconClassName} />;
      } catch (e) {
        console.error("Failed to render icon:", e);
        return null;
      }
    }

    // Show border if active or if bordered is true
    const shouldShowBorder = active || bordered;
    
    const button = (
      <Button
        ref={ref}
        variant={shouldShowBorder ? variant : "ghost"}
        size={size}
        className={cn("relative overflow-visible", className)}
        aria-label={ariaLabel}
        onClick={() => navigate && navigate()}
        {...props}
      >
        {iconElement}
        {shouldShowBadge && badgePosition === "top-right" && (
          <Badge
            variant={badgeVariant}
            className="absolute -top-2 -right-2 h-5 min-w-5 flex items-center justify-center px-1 text-xs z-10 pointer-events-none rounded-full"
          >
            {displayCount}
          </Badge>
        )}
        {shouldShowBadge && badgePosition === "inline" && (
          <Badge variant={badgeVariant} className="ml-auto">
            {displayCount}
          </Badge>
        )}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent side={tooltipPosition}>
            {typeof tooltip === 'string' ? <p>{tooltip}</p> : tooltip}
          </TooltipContent>
        </Tooltip>
      );
    }

    return button;
  }
);

NavigationButton.displayName = "NavigationButton";