import { jsx, jsxs } from "react/jsx-runtime";
import { useState, createContext } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { c as cn } from "./router-CozkPsbM.js";
const SectionContext = createContext(void 0);
function ExpandableSection({
  title,
  children,
  expanded = false,
  className,
  icon,
  onToggle
}) {
  const [isExpanded, setIsExpanded] = useState(expanded);
  const handleToggle = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    onToggle?.(newState);
  };
  return /* @__PURE__ */ jsx(
    SectionContext.Provider,
    {
      value: {
        isExpanded,
        setIsExpanded: (expanded2) => {
          setIsExpanded(expanded2);
          onToggle?.(expanded2);
        },
        toggleExpanded: handleToggle
      },
      children: /* @__PURE__ */ jsxs("div", { className: cn("overflow-hidden rounded-lg border"), children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "bg-background hover:bg-muted flex cursor-pointer items-center justify-between p-3 transition-colors",
            onClick: handleToggle,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                icon && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0", children: icon }),
                /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium", children: title })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "text-muted-foreground hover:text-foreground transition-colors",
                  "aria-label": isExpanded ? "Collapse section" : "Expand section",
                  children: isExpanded ? /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" }) : /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "overflow-hidden transition-all duration-200",
              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            ),
            children: /* @__PURE__ */ jsx("div", { className: cn("bg-background border-t p-3", className), children })
          }
        )
      ] })
    }
  );
}
export {
  ExpandableSection as E
};
