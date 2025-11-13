import { jsx, jsxs } from "react/jsx-runtime";
import { GripVerticalIcon } from "lucide-react";
import * as ResizablePrimitive from "react-resizable-panels";
import { c as cn } from "./router-CozkPsbM.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPSwp-0A.js";
import { u as useIsMobile } from "./use-mobile-BsFue-bT.js";
import "react";
function ResizablePanelGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ResizablePrimitive.PanelGroup,
    {
      "data-slot": "resizable-panel-group",
      className: cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      ),
      ...props
    }
  );
}
function ResizablePanel({
  ...props
}) {
  return /* @__PURE__ */ jsx(ResizablePrimitive.Panel, { "data-slot": "resizable-panel", ...props });
}
function ResizableHandle({
  withHandle,
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    ResizablePrimitive.PanelResizeHandle,
    {
      "data-slot": "resizable-handle",
      className: cn(
        "bg-border focus-visible:ring-ring relative flex w-px items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      ),
      ...props,
      children: withHandle && /* @__PURE__ */ jsx("div", { className: "bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border", children: /* @__PURE__ */ jsx(GripVerticalIcon, { className: "size-2.5" }) })
    }
  );
}
function ResizableLayout({
  leftPanel,
  rightPanel,
  defaultTab = "left",
  showHandle = true,
  direction = "horizontal",
  className = "",
  isMobile: isMobileProp,
  disableAutoMobileDetection = false
}) {
  const autoDetectedMobile = useIsMobile();
  const isMobile = disableAutoMobileDetection ? isMobileProp ?? false : isMobileProp ?? autoDetectedMobile;
  const leftSize = leftPanel.defaultSize ?? 50;
  const rightSize = rightPanel.defaultSize ?? 100 - leftSize;
  if (isMobile) {
    const LeftIcon = leftPanel.icon;
    const RightIcon = rightPanel.icon;
    return /* @__PURE__ */ jsx("div", { className: `relative isolate flex flex-1 overflow-hidden ${className}`, children: /* @__PURE__ */ jsx("div", { className: "size-full flex-1 overflow-hidden", children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: defaultTab, className: "h-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "w-full rounded-none", children: [
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "left", className: "flex-1", children: [
          LeftIcon && /* @__PURE__ */ jsx(LeftIcon, { className: "mr-2 h-4 w-4" }),
          leftPanel.label || "Left"
        ] }),
        /* @__PURE__ */ jsxs(TabsTrigger, { value: "right", className: "flex-1", children: [
          RightIcon && /* @__PURE__ */ jsx(RightIcon, { className: "mr-2 h-4 w-4" }),
          rightPanel.label || "Right"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "left", className: "mt-0 h-[calc(100%-2.5rem)]", children: /* @__PURE__ */ jsx("div", { className: `flex h-full flex-col ${leftPanel.className || ""}`, children: leftPanel.content }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "right", className: "mt-0 h-[calc(100%-2.5rem)]", children: /* @__PURE__ */ jsx("div", { className: `flex h-full flex-col ${rightPanel.className || ""}`, children: rightPanel.content }) })
    ] }) }) });
  }
  return /* @__PURE__ */ jsx("div", { className: `relative isolate flex flex-1 overflow-hidden ${className}`, children: /* @__PURE__ */ jsx("div", { className: "size-full", children: /* @__PURE__ */ jsxs(ResizablePanelGroup, { direction, className: "isolate", children: [
    /* @__PURE__ */ jsx(
      ResizablePanel,
      {
        defaultSize: leftSize,
        minSize: leftPanel.minSize ?? 20,
        maxSize: leftPanel.maxSize ?? 80,
        className: `z-1 ${leftPanel.minWidth ? `min-w-[max(${leftPanel.minSize ?? 20}%,${leftPanel.minWidth})]` : ""} ${leftPanel.className || ""}`,
        children: /* @__PURE__ */ jsx("div", { className: "relative isolate flex h-full flex-1 flex-col", children: leftPanel.content })
      }
    ),
    showHandle && /* @__PURE__ */ jsx(ResizableHandle, {}),
    /* @__PURE__ */ jsx(
      ResizablePanel,
      {
        defaultSize: rightSize,
        minSize: rightPanel.minSize ?? 20,
        maxSize: rightPanel.maxSize ?? 80,
        className: rightPanel.className || "",
        children: /* @__PURE__ */ jsx("div", { className: "flex h-full flex-col", children: rightPanel.content })
      }
    )
  ] }) }) });
}
export {
  ResizableLayout as R
};
