import { HugeiconsIcon as HugeiconsIconBase } from "@hugeicons/react";
import type { HugeiconsIconProps } from "@hugeicons/react";
import { cn } from "@rackd/ui/lib/utils";

export interface IconProps extends HugeiconsIconProps {
  className?: string;
}

export function Icon({
  icon,
  className,
  size = 24,
  color = "currentColor",
  strokeWidth = 1.5,
  ...props
}: IconProps) {
  return (
    <HugeiconsIconBase
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn(className)}
      {...props}
    />
  );
}