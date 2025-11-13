import { jsxs, jsx } from "react/jsx-runtime";
import * as React from "react";
import { B as Button, c as cn } from "./router-CozkPsbM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { T as Tooltip, c as TooltipTrigger, d as TooltipContent } from "./tooltip-DeKNATFQ.js";
const NavigationButton = React.forwardRef(
  ({
    icon: Icon,
    count,
    iconClassName = "stroke-1",
    badgeVariant = "destructive",
    showZeroBadge = false,
    badgePosition = "top-right",
    ariaLabel,
    tooltip,
    className,
    variant = "outline",
    size = "icon",
    navigate,
    ...props
  }, ref) => {
    const shouldShowBadge = count !== void 0 && (count > 0 || showZeroBadge);
    const displayCount = count && count > 99 ? "99+" : count;
    const button = /* @__PURE__ */ jsxs(
      Button,
      {
        ref,
        variant,
        size,
        className: cn("relative", className),
        "aria-label": ariaLabel,
        onClick: () => navigate && navigate(),
        ...props,
        children: [
          /* @__PURE__ */ jsx(Icon, { className: iconClassName }),
          shouldShowBadge && badgePosition === "top-right" && /* @__PURE__ */ jsx(
            Badge,
            {
              variant: badgeVariant,
              className: "absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center px-1 text-xs",
              children: displayCount
            }
          ),
          shouldShowBadge && badgePosition === "inline" && /* @__PURE__ */ jsx(Badge, { variant: badgeVariant, className: "ml-auto", children: displayCount })
        ]
      }
    );
    if (tooltip) {
      return /* @__PURE__ */ jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
        /* @__PURE__ */ jsx(TooltipContent, { children: typeof tooltip === "string" ? /* @__PURE__ */ jsx("p", { children: tooltip }) : tooltip })
      ] });
    }
    return button;
  }
);
NavigationButton.displayName = "NavigationButton";
export {
  NavigationButton as N
};
