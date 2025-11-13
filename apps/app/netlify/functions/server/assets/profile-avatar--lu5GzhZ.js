import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-B5vlBfAE.js";
import { c as cn } from "./router-CozkPsbM.js";
import { useState, useEffect } from "react";
import { hasFlag } from "country-flag-icons";
const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl"
};
function ProfileAvatar({ user, size = "md", className, showShimmer = false }) {
  const sizeClass = sizeClasses[size];
  const [FlagComponent, setFlagComponent] = useState(null);
  useEffect(() => {
    if (user.country && hasFlag(user.country.toUpperCase())) {
      import("country-flag-icons/react/3x2").then((flags) => {
        const FlagComp = flags[user.country.toUpperCase()];
        if (FlagComp) {
          setFlagComponent(() => FlagComp);
        }
      }).catch(() => {
        setFlagComponent(null);
      });
    }
  }, [user.country]);
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((word) => word.charAt(0)).join("").toUpperCase().slice(0, 2);
  };
  const renderFallback = () => {
    if (user.image) {
      return null;
    }
    if (FlagComponent) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full overflow-hidden rounded-full", children: /* @__PURE__ */ jsx(FlagComponent, { className: "w-full h-full object-cover scale-150" }) });
    }
    return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted", children: getInitials(user.displayName) });
  };
  return /* @__PURE__ */ jsxs(
    Avatar,
    {
      className: cn(
        sizeClass,
        className,
        showShimmer ? "cursor-pointer transition-opacity relative overflow-hidden group" : "transition-opacity relative overflow-hidden group"
      ),
      style: {
        zIndex: 0
      },
      children: [
        showShimmer && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "span",
            {
              "aria-hidden": "true",
              className: "\n            pointer-events-none\n            absolute inset-0\n            block\n            opacity-0\n            group-hover:opacity-100\n            transition-opacity\n            duration-200\n            z-10\n          ",
              style: {
                background: "linear-gradient(120deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.60) 50%, rgba(255,255,255,0) 60%)",
                animation: "shimmer-slide 1.1s linear infinite",
                // To create the shimmer effect
                backgroundRepeat: "no-repeat"
              }
            }
          ),
          /* @__PURE__ */ jsx("style", { children: `
          @keyframes shimmer-slide {
            0% {
              transform: translateX(-80%);
            }
            100% {
              transform: translateX(120%);
            }
          }
          /* Ensure span overlays properly without eating pointer events */
          .group:hover > span[aria-hidden="true"] {
            opacity: 1;
          }
        ` })
        ] }),
        user.image && /* @__PURE__ */ jsx(AvatarImage, { src: user.image, className: "object-cover" }),
        /* @__PURE__ */ jsx(AvatarFallback, { className: "border-0 p-0 object-cover", children: renderFallback() })
      ]
    }
  );
}
export {
  ProfileAvatar as P
};
