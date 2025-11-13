import { jsx, jsxs } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { B as Button, c as cn } from "./router-CozkPsbM.js";
import { E as ExpandableSection } from "./expandable-section-DasINGSb.js";
import { cva } from "class-variance-authority";
function FargoRatingCard({ player }) {
  if (!player) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    ExpandableSection,
    {
      title: "",
      expanded: true,
      icon: /* @__PURE__ */ jsx(
        "img",
        {
          src: "/images/fr.png",
          alt: "FargoRate",
          width: 150,
          height: 40,
          className: "object-contain"
        }
      ),
      children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        player.fargoReadableId && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "ID: ",
          player.fargoReadableId
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center p-3 rounded-lg bg-background/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Rating" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-400", children: player.fargoRating || "N/A" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center p-3 rounded-lg bg-background/50", children: [
            /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mb-1", children: "Robustness" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-400", children: player.fargoRobustness || "0" })
          ] })
        ] }),
        player._id && /* @__PURE__ */ jsx(Link, { to: "/players/$id", params: { id: player._id }, className: "w-full block", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", size: "sm", children: "View Player Profile" }) })
      ] })
    }
  );
}
function Empty({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty",
      className: cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 rounded-lg border-dashed p-6 text-center text-balance md:p-12",
        className
      ),
      ...props
    }
  );
}
function EmptyHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-header",
      className: cn(
        "flex max-w-sm flex-col items-center gap-2 text-center",
        className
      ),
      ...props
    }
  );
}
const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function EmptyMedia({
  className,
  variant = "default",
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-icon",
      "data-variant": variant,
      className: cn(emptyMediaVariants({ variant, className })),
      ...props
    }
  );
}
function EmptyTitle({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-title",
      className: cn("text-lg font-medium tracking-tight", className),
      ...props
    }
  );
}
function EmptyDescription({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-description",
      className: cn(
        "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
        className
      ),
      ...props
    }
  );
}
function EmptyContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "empty-content",
      className: cn(
        "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
        className
      ),
      ...props
    }
  );
}
export {
  Empty as E,
  FargoRatingCard as F,
  EmptyHeader as a,
  EmptyMedia as b,
  EmptyTitle as c,
  EmptyDescription as d,
  EmptyContent as e
};
