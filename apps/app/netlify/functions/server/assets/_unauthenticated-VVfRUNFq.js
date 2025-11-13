import { jsx } from "react/jsx-runtime";
import { Outlet } from "@tanstack/react-router";
const SplitComponent = () => /* @__PURE__ */ jsx("div", { className: "bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10", children: /* @__PURE__ */ jsx("div", { className: "flex w-full max-w-sm flex-col gap-6", children: /* @__PURE__ */ jsx(Outlet, {}) }) });
export {
  SplitComponent as component
};
