import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link, useNavigate, Outlet } from "@tanstack/react-router";
import { B as Button, c as cn } from "./router-CozkPsbM.js";
import { P as ProfileAvatar } from "./profile-avatar--lu5GzhZ.js";
import { ChevronRight, Bell, Trophy, Hash, MessageCircle, Heart, UserPlus, Moon, Sun, XIcon, User, Tag, Settings, Shield, Link2, CreditCard, KeyRound, CheckCircle2, Mail, Trash2, X, Plus, Upload, Camera, Globe, Smartphone, Tablet, Monitor, LogOut, Loader2, Unlink, Search, Chrome, Apple, Github, Link as Link$1, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, T as Tooltip, c as TooltipTrigger, d as TooltipContent, e as DropdownMenuLabel, f as DropdownMenuSeparator, g as DropdownMenuItem } from "./tooltip-DeKNATFQ.js";
import * as React from "react";
import { useState, useEffect } from "react";
import { B as Badge } from "./badge-yPJu83x5.js";
import { b as api, u as useSettingsState, d as useTheme, a as authClient } from "./globals-Bsfdm3JA.js";
import { useQuery, useMutation, useAction } from "convex/react";
import { toast } from "sonner";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPSwp-0A.js";
import { formatDistanceToNow } from "date-fns";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-B5vlBfAE.js";
import { N as NavigationButton } from "./navigation-button-DrYMr2Yp.js";
import { IconX, IconMenu2, IconAlignJustified, IconSportBillard } from "@tabler/icons-react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { D as Dialog, a as DialogContent, b as DialogTitle, c as DialogDescription, d as DialogHeader } from "./dialog-C0i-cdoB.js";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { u as useIsMobile } from "./use-mobile-BsFue-bT.js";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-J_mAUxEW.js";
import { useForm, FormProvider, Controller, useFormContext, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { z as z$1 } from "zod";
import "clsx";
import { T as Textarea } from "./textarea-CRbQQyBj.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import { u as useImageUpload } from "./use-image-upload-BDsUfsQO.js";
import { countries } from "countries-list";
import * as flags from "country-flag-icons/react/3x2";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-CNeVhZxM.js";
import { S as Separator } from "./separator-DLNU66HB.js";
import "@tanstack/react-query";
import "@tanstack/react-router-with-query";
import "@convex-dev/react-query";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router-devtools";
import "@convex-dev/better-auth/react";
import "@convex-dev/better-auth/react-start";
import "tailwind-merge";
import "country-flag-icons";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
import "@radix-ui/react-tabs";
import "@radix-ui/react-avatar";
import "@radix-ui/react-label";
import "@radix-ui/react-alert-dialog";
import "@radix-ui/react-select";
import "@radix-ui/react-separator";
function calculateProfileCompletion(user) {
  if (!user) return 0;
  const profileFields = [
    // Essential fields (higher weight)
    { field: user.email || user.workos?.email, weight: 15, required: true },
    { field: user.displayName, weight: 30, required: true },
    // Important fields (medium weight)
    { field: user.imageUrl || user.coverImage || user.workos?.profilePictureUrl, weight: 10, required: false },
    { field: user.country, weight: 10, required: false },
    { field: user.city, weight: 8, required: false },
    // Optional but valuable fields (lower weight)
    { field: user.region, weight: 5, required: false },
    { field: user.bio, weight: 10, required: false }
  ];
  let totalWeight = 0;
  let completedWeight = 0;
  profileFields.forEach(({ field, weight, required }) => {
    totalWeight += weight;
    const isCompleted = field && (typeof field === "string" ? field.trim() !== "" : true);
    if (isCompleted) {
      completedWeight += weight;
    }
  });
  const percentage = totalWeight > 0 ? completedWeight / totalWeight * 100 : 0;
  return Math.round(percentage);
}
function getProfileCompletionDetails(user) {
  if (!user) return { percentage: 0, missingFields: [], suggestions: [], totalFields: 0, completedFields: 0 };
  const profileFields = [
    { key: "email", field: user.email || user.workos?.email, weight: 15, required: true, label: "Email Address" },
    { key: "displayName", field: user.displayName, weight: 30, required: true, label: "Display Name" },
    { key: "image", field: user.imageUrl || user.coverImage || user.workos?.profilePictureUrl, weight: 10, required: false, label: "Profile Picture" },
    { key: "country", field: user.country, weight: 10, required: false, label: "Country" },
    { key: "city", field: user.city, weight: 8, required: false, label: "City" },
    { key: "region", field: user.region, weight: 5, required: false, label: "State/Region" },
    { key: "bio", field: user.bio, weight: 10, required: false, label: "Bio" }
  ];
  let totalWeight = 0;
  let completedWeight = 0;
  const missingFields = [];
  profileFields.forEach(({ key, field, weight, required, label }) => {
    totalWeight += weight;
    const isCompleted = field && (typeof field === "string" ? field.trim() !== "" : true);
    if (isCompleted) {
      completedWeight += weight;
    } else {
      missingFields.push({ key, label, weight, required });
    }
  });
  missingFields.sort((a, b) => b.weight - a.weight);
  const suggestions = missingFields.slice(0, 3).map((field) => field.label);
  const percentage = totalWeight > 0 ? Math.round(completedWeight / totalWeight * 100) : 0;
  return {
    percentage,
    missingFields,
    suggestions,
    totalFields: profileFields.length,
    completedFields: profileFields.length - missingFields.length
  };
}
function hexToRgba(hexColor, alpha) {
  const hex = hexColor.replace("#", "");
  if (hex.length === 3) {
    const [r, g, b] = hex.split("").map((c) => parseInt(c + c, 16));
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexColor;
}
const AnimatedBadge = ({
  text = "Introducing Eldoraui",
  color = "#22d3ee",
  href,
  LinkComponent,
  onClick
}) => {
  const content = /* @__PURE__ */ jsxs(
    motion.div,
    {
      initial: false,
      whileInView: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)"
      },
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: "easeInOut"
      },
      viewport: { once: true },
      className: `group relative flex max-w-fit items-center justify-center gap-3 px-4 py-1 transition-colors hover:bg-accent/50 border border-transparent hover:border ${onClick ? "cursor-pointer" : ""}`,
      onClick,
      children: [
        /* @__PURE__ */ jsx("div", { className: "pointer-events-none absolute inset-x-0 bottom-full h-20 w-[165px]", children: /* @__PURE__ */ jsxs(
          "svg",
          {
            className: "h-full w-full",
            width: "100%",
            height: "100%",
            viewBox: "0 0 50 50",
            fill: "none",
            children: [
              /* @__PURE__ */ jsx("g", { mask: "url(#ml-mask-1)", children: /* @__PURE__ */ jsx(
                "circle",
                {
                  className: "multiline ml-light-1",
                  cx: "0",
                  cy: "0",
                  r: "20",
                  fill: "url(#ml-white-grad)"
                }
              ) }),
              /* @__PURE__ */ jsxs("defs", { children: [
                /* @__PURE__ */ jsx("mask", { id: "ml-mask-1", children: /* @__PURE__ */ jsx(
                  "path",
                  {
                    d: "M 69 49.8 h -30 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -23 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -30",
                    strokeWidth: "0.6",
                    stroke: "white"
                  }
                ) }),
                /* @__PURE__ */ jsxs("radialGradient", { id: "ml-white-grad", fx: "1", children: [
                  /* @__PURE__ */ jsx("stop", { offset: "0%", stopColor: color }),
                  /* @__PURE__ */ jsx("stop", { offset: "20%", stopColor: color }),
                  /* @__PURE__ */ jsx("stop", { offset: "100%", stopColor: "transparent" })
                ] })
              ] })
            ]
          }
        ) }),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "relative flex h-1 w-1 items-center justify-center rounded-full",
            style: { backgroundColor: hexToRgba(color, 0.4) },
            children: [
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "flex h-2 w-2 animate-ping items-center justify-center rounded-full",
                  style: { backgroundColor: color },
                  children: /* @__PURE__ */ jsx(
                    "div",
                    {
                      className: "flex h-2 w-2 animate-ping items-center justify-center rounded-full",
                      style: { backgroundColor: color }
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: "absolute top-1/2 left-1/2 flex h-1 w-1 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full",
                  style: { backgroundColor: hexToRgba(color, 0.8) }
                }
              )
            ]
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mx-2 h-4 w-px bg-neutral-300 dark:bg-neutral-600/80" }),
        /* @__PURE__ */ jsx("span", { className: "bg-clip-text text-xs font-medium", children: text }),
        /* @__PURE__ */ jsx(ChevronRight, { className: "ml-1 h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-neutral-500" })
      ]
    }
  );
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    href && LinkComponent ? /* @__PURE__ */ jsx(LinkComponent, { href, className: "inline-block", children: content }) : href ? /* @__PURE__ */ jsx("a", { href, className: "inline-block", children: content }) : content,
    /* @__PURE__ */ jsx("style", { children: `    
.multiline {
  offset-anchor: 10px 0px;
  animation: multiline-animation-path;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  animation-duration: 3s;
}

.ml-light-1 {
  offset-path: path(
    "M 69 49.8 h -30 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -23 q -3 0 -3 -3 v -13 q 0 -3 -3 -3 h -50"
  );
}

@keyframes multiline-animation-path {
  0% {
    offset-distance: 0%;
  }
  50% {
    offset-distance: 100%;
  }
  100% {
    offset-distance: 100%;
  }
}` })
  ] });
};
const notificationConfigs = {
  follow: {
    icon: /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-blue-500",
    getMessage: (notification) => `${notification.actor?.displayName || notification.actor?.name || "Someone"} started following you`,
    getLink: (notification) => `/${notification.actor?.username}`
  },
  like: {
    icon: /* @__PURE__ */ jsx(Heart, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-red-500",
    getMessage: (notification) => `${notification.actor?.displayName || notification.actor?.name || "Someone"} liked your post`,
    getLink: (notification) => `/post/${notification.postId}`
  },
  comment: {
    icon: /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-green-500",
    getMessage: (notification) => `${notification.actor?.displayName || notification.actor?.name || "Someone"} commented on your post`,
    getLink: (notification) => `/post/${notification.postId}`
  },
  mention: {
    icon: /* @__PURE__ */ jsx(Hash, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-purple-500",
    getMessage: (notification) => `${notification.actor?.displayName || notification.actor?.name || "Someone"} mentioned you`,
    getLink: (notification) => `/post/${notification.postId}`
  },
  tournament_invite: {
    icon: /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-yellow-500",
    getMessage: (notification) => `You've been invited to ${notification.tournament?.name || "a tournament"}`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}`
  },
  tournament_start: {
    icon: /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-orange-500",
    getMessage: (notification) => `${notification.tournament?.name || "Tournament"} is starting soon`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}`
  },
  match_ready: {
    icon: /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-indigo-500",
    getMessage: (notification) => `Your match is ready to begin`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}/matches/${notification.matchId}`
  },
  match_result: {
    icon: /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-white" }),
    bgColor: "bg-emerald-500",
    getMessage: (notification) => `Match result has been posted`,
    getLink: (notification) => `/tournaments/${notification.tournamentId}/matches/${notification.matchId}`
  }
};
const NotificationIcon = ({ type }) => {
  const config = notificationConfigs[type];
  if (!config) return null;
  return /* @__PURE__ */ jsx("div", { className: cn("w-8 h-8 rounded-full flex items-center justify-center", config.bgColor), children: config.icon });
};
const NotificationContent = ({
  notification,
  handlers
}) => {
  const config = notificationConfigs[notification.type];
  if (!config) return null;
  const message = config.getMessage(notification);
  const link = config.getLink?.(notification);
  const handleClick = async () => {
    if (!notification.read) {
      await handlers.handleMarkAsRead(notification._id);
    }
  };
  const content = /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-1", children: [
      /* @__PURE__ */ jsx("div", { className: "space-y-1 flex-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        notification.actor && /* @__PURE__ */ jsxs(Avatar, { className: "h-6 w-6", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: notification.actor?.image }),
          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: notification.actor?.displayName?.charAt(0).toUpperCase() || notification.actor?.name?.charAt(0).toUpperCase() || "U" })
        ] }),
        /* @__PURE__ */ jsx("p", { className: cn(
          "text-sm",
          !notification.read ? "font-medium" : "font-normal"
        ), children: message })
      ] }) }),
      /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground ml-4 flex-shrink-0", children: formatDistanceToNow(new Date(notification._creationTime), { addSuffix: true }) })
    ] }),
    !notification.read && /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full absolute right-2 top-1/2 -translate-y-1/2" })
  ] });
  if (link) {
    return /* @__PURE__ */ jsx(Link, { to: link, onClick: handleClick, className: "block", children: content });
  }
  return /* @__PURE__ */ jsx("div", { onClick: handleClick, className: "cursor-pointer", children: content });
};
function NotificationsDropdown() {
  const notifications = useQuery(api.notifications.getByUser, { limit: 20 });
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead({ notificationId });
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({});
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };
  const notificationHandlers = {
    handleMarkAsRead
  };
  const unreadNotifications = notifications?.filter((n) => !n.read) || [];
  notifications?.filter((n) => n.read) || [];
  const renderNotification = (notification) => /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 relative",
        !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
      ),
      children: [
        /* @__PURE__ */ jsx(NotificationIcon, { type: notification.type }),
        /* @__PURE__ */ jsx(
          NotificationContent,
          {
            notification,
            handlers: notificationHandlers
          }
        )
      ]
    },
    notification._id
  );
  return /* @__PURE__ */ jsxs(DropdownMenu, { children: [
    /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
      NavigationButton,
      {
        icon: Bell,
        count: unreadCount || 0,
        ariaLabel: "Notifications",
        badgePosition: "top-right",
        tooltip: unreadCount && unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "No new notifications"
      }
    ) }),
    /* @__PURE__ */ jsxs(
      DropdownMenuContent,
      {
        className: "w-[450px] h-[500px] relative top-2 left-2.5",
        align: "end",
        side: "bottom",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between p-4 border-b", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Notifications" }),
            unreadNotifications.length > 0 && /* @__PURE__ */ jsx(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: handleMarkAllAsRead,
                className: "text-xs",
                children: "Mark all as read"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Tabs, { defaultValue: "unread", className: "w-full", children: [
            /* @__PURE__ */ jsx("div", { className: "px-4 pt-2", children: /* @__PURE__ */ jsxs(TabsList, { className: "w-full justify-start", children: [
              /* @__PURE__ */ jsxs(TabsTrigger, { value: "unread", className: "text-xs", children: [
                "Unread",
                unreadNotifications.length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "ml-1 text-xs", children: unreadNotifications.length })
              ] }),
              /* @__PURE__ */ jsxs(TabsTrigger, { value: "all", className: "text-xs", children: [
                "All",
                notifications && notifications.length > 0 && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "ml-1 text-xs", children: notifications.length })
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "overflow-y-auto max-h-[380px]", children: [
              /* @__PURE__ */ jsx(TabsContent, { value: "unread", className: "space-y-1 p-2 mt-2", children: unreadNotifications.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No new notifications" })
              ] }) : unreadNotifications.map(renderNotification) }),
              /* @__PURE__ */ jsx(TabsContent, { value: "all", className: "space-y-1 p-2 mt-2", children: !notifications || notifications.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
                /* @__PURE__ */ jsx(Bell, { className: "h-8 w-8 mx-auto mb-2 opacity-50" }),
                /* @__PURE__ */ jsx("p", { className: "text-sm", children: "No notifications yet" })
              ] }) : notifications.map(renderNotification) })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-0 right-0 p-4 border-t", children: /* @__PURE__ */ jsx(Button, { variant: "outline", asChild: true, className: "w-full", children: /* @__PURE__ */ jsx(Link, { to: "/notifications", children: "View All Notifications" }) }) })
        ]
      }
    )
  ] });
}
function TooltipWrapper({
  label,
  command,
  className,
  children,
  ...props
}) {
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { className: cn(className), ...props, children }),
    /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-[1ch]", children: [
      label,
      command && /* @__PURE__ */ jsx("kbd", { className: "bg-muted text-muted-foreground flex items-center gap-[0.5ch] rounded px-1.5 py-0.5 font-mono text-xs [&>svg]:size-3", children: command })
    ] }) })
  ] }, label);
}
function ThemeToggle({ useTheme: useTheme2 }) {
  const { resolvedTheme, toggleTheme } = useTheme2();
  const handleThemeToggle = (event) => {
    const { clientX: x, clientY: y } = event;
    toggleTheme({ x, y });
  };
  const isDark = resolvedTheme === "dark";
  return /* @__PURE__ */ jsx("div", { className: "px-2", children: /* @__PURE__ */ jsx(TooltipWrapper, { label: "Toggle light/dark mode", asChild: true, children: /* @__PURE__ */ jsx(
    SwitchPrimitives.Root,
    {
      checked: isDark,
      onClick: handleThemeToggle,
      className: cn(
        "peer focus-visible:ring-ring focus-visible:ring-offset-background inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
        isDark ? "bg-primary" : "bg-input"
      ),
      children: /* @__PURE__ */ jsx(
        SwitchPrimitives.Thumb,
        {
          className: cn(
            "bg-background pointer-events-none flex size-5 items-center justify-center rounded-full shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
          ),
          children: isDark ? /* @__PURE__ */ jsx(Moon, { className: "size-3" }) : /* @__PURE__ */ jsx(Sun, { className: "size-3" })
        }
      )
    }
  ) }) });
}
function Sheet({ ...props }) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { "data-slot": "sheet", ...props });
}
function SheetPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Portal, { "data-slot": "sheet-portal", ...props });
}
function SheetOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Overlay,
    {
      "data-slot": "sheet-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function SheetContent({
  className,
  children,
  side = "right",
  ...props
}) {
  return /* @__PURE__ */ jsxs(SheetPortal, { children: [
    /* @__PURE__ */ jsx(SheetOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        "data-slot": "sheet-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" && "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" && "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className
        ),
        ...props,
        children: [
          children,
          /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none", children: [
            /* @__PURE__ */ jsx(XIcon, { className: "size-4" }),
            /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
          ] })
        ]
      }
    )
  ] });
}
function SheetHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sheet-header",
      className: cn("flex flex-col gap-1.5 p-4", className),
      ...props
    }
  );
}
function SheetTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Title,
    {
      "data-slot": "sheet-title",
      className: cn("text-foreground font-semibold", className),
      ...props
    }
  );
}
function SheetDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Description,
    {
      "data-slot": "sheet-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
const SIDEBAR_COOKIE_NAME = "phx_sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}
function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  React.useEffect(() => {
    if (typeof window !== "undefined" && !openProp) {
      const cookie = document.cookie.split("; ").find((row) => row.startsWith(SIDEBAR_COOKIE_NAME));
      if (cookie) {
        const cookieValue = cookie.split("=")[1] === "true";
        if (cookieValue !== _open) {
          _setOpen(cookieValue);
        }
      }
    }
  }, [_open]);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp, open]
  );
  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open2) => !open2) : setOpen((open2) => !open2);
  }, [isMobile, setOpen, setOpenMobile]);
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleSidebar]);
  const state = open ? "expanded" : "collapsed";
  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );
  return /* @__PURE__ */ jsx(SidebarContext.Provider, { value: contextValue, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-wrapper",
      style: {
        "--sidebar-width": SIDEBAR_WIDTH,
        "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
        ...style
      },
      className: cn(
        "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full overflow-hidden",
        className
      ),
      ...props,
      children
    }
  ) });
}
function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  ...props
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  if (collapsible === "none") {
    return /* @__PURE__ */ jsx(
      "div",
      {
        "data-slot": "sidebar",
        className: cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        ),
        ...props,
        children
      }
    );
  }
  if (isMobile) {
    return /* @__PURE__ */ jsx(Sheet, { open: openMobile, onOpenChange: setOpenMobile, ...props, children: /* @__PURE__ */ jsxs(
      SheetContent,
      {
        "data-sidebar": "sidebar",
        "data-slot": "sidebar",
        "data-mobile": "true",
        className: "bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden",
        style: {
          "--sidebar-width": SIDEBAR_WIDTH_MOBILE
        },
        side,
        children: [
          /* @__PURE__ */ jsxs(SheetHeader, { className: "sr-only", children: [
            /* @__PURE__ */ jsx(SheetTitle, { children: "Sidebar" }),
            /* @__PURE__ */ jsx(SheetDescription, { children: "Displays the mobile sidebar." })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex h-full w-full flex-col", children })
        ]
      }
    ) });
  }
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: "group peer text-sidebar-foreground hidden md:block",
      "data-state": state,
      "data-collapsible": state === "collapsed" ? collapsible : "",
      "data-variant": variant,
      "data-side": side,
      "data-slot": "sidebar",
      children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-gap",
            className: cn(
              "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
              "group-data-[collapsible=offcanvas]:w-0",
              "group-data-[side=right]:rotate-180",
              variant === "floating" || variant === "inset" ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
            )
          }
        ),
        /* @__PURE__ */ jsx(
          "div",
          {
            "data-slot": "sidebar-container",
            className: cn(
              "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex",
              side === "left" ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]" : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
              // Adjust the padding for floating and inset variants.
              variant === "floating" || variant === "inset" ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]" : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
              className
            ),
            ...props,
            children: /* @__PURE__ */ jsx(
              "div",
              {
                "data-sidebar": "sidebar",
                "data-slot": "sidebar-inner",
                className: "bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm",
                children
              }
            )
          }
        )
      ]
    }
  );
}
function SidebarContent({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-content",
      "data-sidebar": "content",
      className: cn(
        "flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden",
        className
      ),
      ...props
    }
  );
}
function SidebarGroup({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-group",
      "data-sidebar": "group",
      className: cn("relative flex w-full min-w-0 flex-col p-1", className),
      ...props
    }
  );
}
function SidebarGroupContent({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "sidebar-group-content",
      "data-sidebar": "group-content",
      className: cn("w-full text-sm", className),
      ...props
    }
  );
}
function SidebarMenu({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "ul",
    {
      "data-slot": "sidebar-menu",
      "data-sidebar": "menu",
      className: cn("flex w-full min-w-0 flex-col gap-1", className),
      ...props
    }
  );
}
function SidebarMenuItem({ className, disabled = false, ...props }) {
  return /* @__PURE__ */ jsx(
    "li",
    {
      "data-slot": "sidebar-menu-item",
      "data-sidebar": "menu-item",
      className: cn("group/menu-item relative", className),
      ...props
    }
  );
}
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]"
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "sidebar-menu-button",
      "data-sidebar": "menu-button",
      "data-size": size,
      "data-active": isActive,
      className: cn(sidebarMenuButtonVariants({ variant, size }), className, "cursor-pointer"),
      ...props
    }
  );
  if (!tooltip) {
    return button;
  }
  if (typeof tooltip === "string") {
    tooltip = {
      children: tooltip
    };
  }
  return /* @__PURE__ */ jsxs(Tooltip, { children: [
    /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: button }),
    /* @__PURE__ */ jsx(
      TooltipContent,
      {
        side: "right",
        align: "center",
        hidden: state !== "collapsed" || isMobile,
        ...tooltip
      }
    )
  ] });
}
function SettingsDialog({ open, onOpenChange, user, profileSettings, dangerZone, sessionsManager, interestsManager, connectedAccounts, initialTab: initialTabProp }) {
  const [activeTab, setActiveTab] = React.useState(initialTabProp || "account");
  React.useEffect(() => {
    if (initialTabProp && open) {
      setActiveTab(initialTabProp);
    }
  }, [initialTabProp, open]);
  const navItems = [
    {
      name: "Account",
      icon: User,
      tab: "account"
    },
    {
      name: "Interests",
      icon: Tag,
      tab: "interests"
    },
    {
      name: "Preferences",
      icon: Settings,
      tab: "preferences"
    },
    {
      name: "Sessions",
      icon: Shield,
      tab: "sessions"
    },
    {
      name: "Connected Accounts",
      icon: Link2,
      tab: "accounts"
    },
    {
      name: "Usage & Billing",
      icon: CreditCard,
      tab: "billing"
    }
  ];
  const getInitials = (name) => {
    return name.split(" ").map((word) => word.charAt(0)).join("").toUpperCase().slice(0, 2);
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]", children: [
    /* @__PURE__ */ jsx(DialogTitle, { className: "sr-only", children: "Settings" }),
    /* @__PURE__ */ jsx(DialogDescription, { className: "sr-only", children: "Customize your settings here." }),
    /* @__PURE__ */ jsxs(SidebarProvider, { className: "items-start", children: [
      /* @__PURE__ */ jsx(Sidebar, { collapsible: "none", className: "hidden md:flex", children: /* @__PURE__ */ jsx(SidebarContent, { children: /* @__PURE__ */ jsx(SidebarGroup, { children: /* @__PURE__ */ jsx(SidebarGroupContent, { children: /* @__PURE__ */ jsx(SidebarMenu, { children: navItems.map((item) => {
        const Icon = item.icon;
        return /* @__PURE__ */ jsx(SidebarMenuItem, { children: /* @__PURE__ */ jsx(
          SidebarMenuButton,
          {
            asChild: true,
            isActive: activeTab === item.tab,
            children: /* @__PURE__ */ jsxs(
              "button",
              {
                type: "button",
                onClick: () => setActiveTab(item.tab),
                className: "w-full",
                children: [
                  /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }),
                  /* @__PURE__ */ jsx("span", { children: item.name })
                ]
              }
            )
          }
        ) }, item.name);
      }) }) }) }) }) }),
      /* @__PURE__ */ jsx("main", { className: "flex h-[700px] flex-1 flex-col overflow-hidden", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-4 overflow-y-auto p-4", children: [
        activeTab === "account" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          profileSettings ? profileSettings : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Profile" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Your personal information." })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-16 w-16", children: [
                user.imageUrl && /* @__PURE__ */ jsx(AvatarImage, { src: user.imageUrl, alt: user.displayName }),
                /* @__PURE__ */ jsx(AvatarFallback, { children: getInitials(user.displayName) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: user.displayName }),
                user.email && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: user.email })
              ] })
            ] }) })
          ] }),
          dangerZone && /* @__PURE__ */ jsx("div", { className: "mt-6", children: dangerZone })
        ] }),
        activeTab === "interests" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Interests" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Add interests to help others discover your profile and connect with like-minded players." })
          ] }),
          interestsManager || /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Interests management coming soon..." })
        ] }),
        activeTab === "preferences" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Preferences" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your preferences and settings." })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Coming soon..." })
        ] }),
        activeTab === "sessions" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Sessions" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your active sessions and security settings." })
          ] }),
          sessionsManager || /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sessions management coming soon..." })
        ] }),
        activeTab === "accounts" && /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-6", children: connectedAccounts || /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Connected accounts management coming soon..." }) }),
        activeTab === "billing" && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Usage & Billing" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your subscription and billing." })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Coming soon..." })
        ] })
      ] }) })
    ] })
  ] }) });
}
const changePasswordSchema = z$1.object({
  currentPassword: z$1.string().min(1, "Current password is required"),
  newPassword: z$1.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z$1.string().min(8, "Password must be at least 8 characters")
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
const createPasswordSchema = z$1.object({
  password: z$1.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z$1.string().min(8, "Password must be at least 8 characters")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});
function DangerZone({ user }) {
  const [deleteConfirmation, setDeleteConfirmation] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [passwordResetSent, setPasswordResetSent] = React.useState(false);
  const [isSendingReset, setIsSendingReset] = React.useState(false);
  const createPasswordReset = useAction(api.workos.createPasswordReset);
  const updatePassword = useAction(api.workos.updatePassword);
  const checkPasswordExists = useAction(api.workos.checkPasswordExists);
  const [hasPassword, setHasPassword] = React.useState(null);
  const [isCheckingPassword, setIsCheckingPassword] = React.useState(true);
  React.useEffect(() => {
    const checkPassword = async () => {
      if (!user?.workos?.id) {
        setIsCheckingPassword(false);
        return;
      }
      try {
        const result = await checkPasswordExists({ userId: user.workos.id });
        setHasPassword(result.hasPassword);
      } catch (error) {
        console.error("Failed to check password:", error);
        setHasPassword(false);
      } finally {
        setIsCheckingPassword(false);
      }
    };
    checkPassword();
  }, [user?.workos?.id, checkPasswordExists]);
  const likelyHasPassword = React.useMemo(() => {
    if (hasPassword !== null) {
      return hasPassword;
    }
    const hasOAuthProfile = user?.workos?.profilePictureUrl || user?.coverImage;
    return !hasOAuthProfile;
  }, [hasPassword, user]);
  const changePasswordForm = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });
  const createPasswordForm = useForm({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  });
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeleting(true);
    console.log("Deleting account...");
    setIsDeleting(false);
  };
  const handleChangePassword = async (data) => {
    if (!user?.workos?.id) {
      toast.error("User information not available");
      return;
    }
    setIsSendingReset(true);
    try {
      await updatePassword({
        userId: user.workos.id,
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      setPasswordResetSent(true);
      changePasswordForm.reset();
      toast.success("Password verified", {
        description: "Check your email for instructions to set your new password"
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password", {
        description: error.message || "Please check your current password and try again"
      });
    } finally {
      setIsSendingReset(false);
    }
  };
  const handleCreatePassword = async () => {
    if (!user?.workos?.id) {
      toast.error("User information not available");
      return;
    }
    setIsSendingReset(true);
    try {
      const baseUrl = window.location.origin;
      await createPasswordReset({
        userId: user.workos.id
        // Note: We don't pass passwordResetUrl here because:
        // 1. We're sending custom emails via the password_reset.created webhook
        // 2. passwordResetUrl is for redirects after password reset, not the email link
        // 3. The webhook handler constructs the email URL with the actual token
      });
      setPasswordResetSent(true);
      toast.success("Password setup email sent", {
        description: likelyHasPassword ? "Check your email for instructions to change your password" : "Check your email for instructions to create your password"
      });
    } catch (error) {
      console.error("Failed to create password reset:", error);
      toast.error("Failed to send password email", {
        description: error.message || "Please try again later"
      });
    } finally {
      setIsSendingReset(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Password" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: likelyHasPassword ? "Change your password to keep your account secure." : "Create a password for your account to enable email and password sign-in. You'll receive an email with instructions." })
      ] }),
      isCheckingPassword ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-muted rounded-md", children: [
        /* @__PURE__ */ jsx(KeyRound, { className: "h-4 w-4 animate-spin text-muted-foreground shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Checking password status..." })
      ] }) : passwordResetSent ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-md", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-green-600 dark:text-green-400 shrink-0" }),
        /* @__PURE__ */ jsxs("span", { className: "text-sm text-green-800 dark:text-green-200", children: [
          "Password ",
          likelyHasPassword ? "reset" : "setup",
          " email sent to ",
          user?.workos?.email || user?.email
        ] })
      ] }) : likelyHasPassword ? (
        // Show password change form if user likely has a password
        /* @__PURE__ */ jsxs("form", { onSubmit: changePasswordForm.handleSubmit(handleChangePassword), className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "currentPassword", children: "Current Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "currentPassword",
                type: "password",
                placeholder: "Enter your current password",
                ...changePasswordForm.register("currentPassword"),
                disabled: isSendingReset
              }
            ),
            changePasswordForm.formState.errors.currentPassword && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: changePasswordForm.formState.errors.currentPassword.message })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "newPassword", children: "New Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "newPassword",
                type: "password",
                placeholder: "Enter your new password",
                ...changePasswordForm.register("newPassword"),
                disabled: isSendingReset
              }
            ),
            changePasswordForm.formState.errors.newPassword && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: changePasswordForm.formState.errors.newPassword.message })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "confirmPassword", children: "Confirm New Password" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "confirmPassword",
                type: "password",
                placeholder: "Confirm your new password",
                ...changePasswordForm.register("confirmPassword"),
                disabled: isSendingReset
              }
            ),
            changePasswordForm.formState.errors.confirmPassword && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: changePasswordForm.formState.errors.confirmPassword.message })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              variant: "default",
              size: "sm",
              disabled: isSendingReset,
              children: isSendingReset ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(KeyRound, { className: "mr-2 h-4 w-4 animate-spin" }),
                "Changing..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(KeyRound, { className: "mr-2 h-4 w-4" }),
                "Change Password"
              ] })
            }
          ) })
        ] })
      ) : (
        // Show email-based flow if user doesn't have a password
        /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted rounded-md", children: [
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "WorkOS uses a secure email-based flow for password management. This works for:" }),
            /* @__PURE__ */ jsxs("ul", { className: "text-xs text-muted-foreground list-disc list-inside space-y-1", children: [
              /* @__PURE__ */ jsx("li", { children: "Creating your first password (if you signed up via OAuth)" }),
              /* @__PURE__ */ jsx("li", { children: "Changing your existing password" })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "default",
              size: "sm",
              onClick: handleCreatePassword,
              disabled: isSendingReset,
              children: isSendingReset ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Mail, { className: "mr-2 h-4 w-4 animate-spin" }),
                "Sending..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(KeyRound, { className: "mr-2 h-4 w-4" }),
                "Create Password"
              ] })
            }
          ) })
        ] })
      ),
      passwordResetSent && /* @__PURE__ */ jsx("div", { className: "flex justify-end gap-2", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => {
            setPasswordResetSent(false);
            changePasswordForm.reset();
            createPasswordForm.reset();
          },
          children: "Send Another Email"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex flex-col gap-2 border-destructive border p-4 rounded-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Danger Zone" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Delete your account and all your data" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsx("p", { className: "text-xs text-destructive", children: "Permanently remove your personal account and all of its contents from the rankd platform. This action is not reversible, so please continue with caution." }) }),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxs(AlertDialog, { children: [
        /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "destructive", size: "sm", children: [
          /* @__PURE__ */ jsx(Trash2, { className: "mr-2 h-4 w-4" }),
          "Delete My Account"
        ] }) }),
        /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
          /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
            /* @__PURE__ */ jsx(AlertDialogTitle, { className: "flex items-center gap-2 text-destructive", children: "Are you absolutely sure?" }),
            /* @__PURE__ */ jsxs(AlertDialogDescription, { className: "space-y-6", children: [
              /* @__PURE__ */ jsx("p", { className: "text-xs", children: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers." }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground font-medium", children: "This will delete:" }),
                /* @__PURE__ */ jsxs("ul", { className: "list-disc list-inside text-xs space-y-1 ml-4", children: [
                  /* @__PURE__ */ jsx("li", { children: "Your profile and personal information" }),
                  /* @__PURE__ */ jsx("li", { children: "All tournaments you've created" }),
                  /* @__PURE__ */ jsx("li", { children: "Player records and statistics" }),
                  /* @__PURE__ */ jsx("li", { children: "Venue information" }),
                  /* @__PURE__ */ jsx("li", { children: "All associated data" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "space-y-2 text-xs", children: [
                /* @__PURE__ */ jsxs(Label, { htmlFor: "delete-confirmation", className: "text-xs", children: [
                  "Please type ",
                  /* @__PURE__ */ jsx("strong", { children: "DELETE" }),
                  " to confirm:"
                ] }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "delete-confirmation",
                    value: deleteConfirmation,
                    onChange: (e) => setDeleteConfirmation(e.target.value),
                    placeholder: "Type DELETE here"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
            /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
            /* @__PURE__ */ jsx(
              AlertDialogAction,
              {
                onClick: handleDeleteAccount,
                disabled: deleteConfirmation !== "DELETE" || isDeleting,
                className: "bg-destructive hover:bg-destructive/90",
                children: isDeleting ? "Deleting..." : "Delete Account"
              }
            )
          ] })
        ] })
      ] }) })
    ] })
  ] });
}
const Form = FormProvider;
const FormFieldContext = React.createContext(
  {}
);
const FormField = ({
  ...props
}) => {
  return /* @__PURE__ */ jsx(FormFieldContext.Provider, { value: { name: props.name }, children: /* @__PURE__ */ jsx(Controller, { ...props }) });
};
const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);
  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }
  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState
  };
};
const FormItemContext = React.createContext(
  {}
);
function FormItem({ className, ...props }) {
  const id = React.useId();
  return /* @__PURE__ */ jsx(FormItemContext.Provider, { value: { id }, children: /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "form-item",
      className: cn("grid gap-2", className),
      ...props
    }
  ) });
}
function FormLabel({
  className,
  ...props
}) {
  const { error, formItemId } = useFormField();
  return /* @__PURE__ */ jsx(
    Label,
    {
      "data-slot": "form-label",
      "data-error": !!error,
      className: cn("text-xs data-[error=true]:text-destructive", className),
      htmlFor: formItemId,
      ...props
    }
  );
}
function FormControl({ ...props }) {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
  return /* @__PURE__ */ jsx(
    Slot,
    {
      "data-slot": "form-control",
      id: formItemId,
      "aria-describedby": !error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`,
      "aria-invalid": !!error,
      ...props
    }
  );
}
function FormDescription({ className, ...props }) {
  const { formDescriptionId } = useFormField();
  return /* @__PURE__ */ jsx(
    "p",
    {
      "data-slot": "form-description",
      id: formDescriptionId,
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function FormMessage({ className, ...props }) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : props.children;
  if (!body) {
    return null;
  }
  return /* @__PURE__ */ jsx(
    "p",
    {
      "data-slot": "form-message",
      id: formMessageId,
      className: cn("text-destructive text-sm", className),
      ...props,
      children: body
    }
  );
}
function InterestTagsManager({
  interests = [],
  onInterestsChange,
  maxTags = 15,
  placeholder = "Add an interest..."
}) {
  const [inputValue, setInputValue] = useState("");
  const [localInterests, setLocalInterests] = useState(interests);
  const updateUserInterests = useAction(api.users.updateInterests);
  useEffect(() => {
    setLocalInterests(interests);
  }, [interests]);
  const handleAddInterest = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) return;
    if (localInterests.length >= maxTags) {
      toast.error(`Maximum ${maxTags} interests allowed`);
      return;
    }
    if (localInterests.some(
      (interest) => interest.toLowerCase() === trimmedInput.toLowerCase()
    )) {
      toast.error("Interest already exists");
      return;
    }
    const newInterests = [...localInterests, trimmedInput];
    setLocalInterests(newInterests);
    setInputValue("");
    onInterestsChange?.(newInterests);
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest added successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to add interest");
      setLocalInterests(localInterests);
      onInterestsChange?.(localInterests);
    }
  };
  const handleRemoveInterest = async (interestToRemove) => {
    const newInterests = localInterests.filter((interest) => interest !== interestToRemove);
    setLocalInterests(newInterests);
    onInterestsChange?.(newInterests);
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest removed successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to remove interest");
      setLocalInterests(localInterests);
      onInterestsChange?.(localInterests);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    }
  };
  const handleInputChange = (value) => {
    if (value.length <= 30) {
      setInputValue(value);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    localInterests.length > 0 ? /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 min-h-10 p-2 rounded-md border bg-muted/30", children: localInterests.map((interest, index) => /* @__PURE__ */ jsxs(
      Badge,
      {
        variant: "secondary",
        className: "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium cursor-default hover:bg-secondary/80 transition-colors",
        children: [
          /* @__PURE__ */ jsx("span", { children: interest }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "icon",
              variant: "ghost",
              className: "h-4 w-4 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full",
              onClick: () => handleRemoveInterest(interest),
              "aria-label": `Remove ${interest}`,
              children: /* @__PURE__ */ jsx(X, { size: 10 })
            }
          )
        ]
      },
      index
    )) }) : /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center min-h-10 p-4 rounded-md border border-dashed bg-muted/20", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No interests added yet" }) }),
    localInterests.length < maxTags && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "interest-input", className: "text-sm font-medium", children: "Add Interest" }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "interest-input",
            value: inputValue,
            onChange: (e) => handleInputChange(e.target.value),
            onKeyPress: handleKeyPress,
            placeholder,
            className: "flex-1",
            maxLength: 30
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            onClick: handleAddInterest,
            disabled: !inputValue.trim(),
            size: "default",
            variant: "default",
            children: [
              /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
              "Add"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground pt-2 border-t", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        localInterests.length,
        " of ",
        maxTags,
        " interests added"
      ] }),
      localInterests.length >= maxTags && /* @__PURE__ */ jsx("span", { className: "text-amber-600 dark:text-amber-500", children: "Maximum reached" })
    ] })
  ] });
}
const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional()
});
function ProfileSettings({ user }) {
  calculateProfileCompletion(user);
  getProfileCompletionDetails(user);
  const updateProfile = useAction(api.users.updateProfile);
  const getFileUrlAction = useAction(api.files.getFileUrlAction);
  const [profileImage, setProfileImage] = React.useState(user?.imageUrl || user?.coverImage || "");
  React.useEffect(() => {
    if (user?.imageUrl || user?.coverImage) {
      setProfileImage(user.imageUrl || user.coverImage || "");
    }
  }, [user?.imageUrl, user?.coverImage]);
  const { uploadImage, isUploading } = useImageUpload({
    category: "player_avatar",
    relatedId: user?._id,
    relatedType: "user",
    onSuccess: async (imageUrl, storageId) => {
      try {
        const fileUrl = await getFileUrlAction({ storageId });
        if (fileUrl) {
          await updateProfile({ coverImage: fileUrl });
          setProfileImage(fileUrl);
          toast.success("Profile image updated successfully!");
        }
      } catch (error) {
        console.error("Failed to get image URL:", error);
        toast.error("Failed to update profile image. Please try again.");
      }
    }
  });
  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || user?.workos?.email || "",
      bio: user?.bio || "",
      city: user?.city || "",
      region: user?.region || "",
      country: user?.country || ""
    }
  });
  React.useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        email: user.email || user.workos?.email || "",
        bio: user.bio || "",
        city: user.city || "",
        region: user.region || "",
        country: user.country || ""
      });
    }
  }, [user, form]);
  async function onSubmit(data) {
    try {
      await updateProfile({
        displayName: data.displayName,
        bio: data.bio,
        city: data.city,
        region: data.region,
        country: data.country
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    }
  }
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadImage(file);
    event.target.value = "";
  };
  const handleRemoveImage = async () => {
    try {
      setProfileImage("");
      await updateProfile({ coverImage: "" });
      toast.success("Profile image removed successfully!");
    } catch (error) {
      console.error("Failed to remove image:", error);
      toast.error("Failed to remove profile image. Please try again.");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2 flex flex-col gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Profile Information" }),
        /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "Update your personal information and profile details" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsx(
            ProfileAvatar,
            {
              user: {
                displayName: user?.displayName || "",
                image: user?.imageUrl || user?.coverImage || user?.workos?.profilePictureUrl || "",
                country: user?.country || ""
              },
              size: "xl"
            }
          ),
          isUploading && /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-black/50 rounded-full", children: /* @__PURE__ */ jsx(Upload, { className: "h-6 w-6 animate-pulse" }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "input",
              {
                type: "file",
                accept: "image/*",
                onChange: handleImageUpload,
                className: "hidden",
                id: "avatar-upload",
                disabled: isUploading
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "avatar-upload", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, disabled: isUploading, children: /* @__PURE__ */ jsxs("span", { className: "cursor-pointer", children: [
              /* @__PURE__ */ jsx(Camera, { className: "mr-2 h-4 w-4" }),
              isUploading ? "Uploading..." : "Change Photo"
            ] }) }) }),
            (profileImage || user?.image) && /* @__PURE__ */ jsxs(
              Button,
              {
                variant: "ghost",
                size: "sm",
                onClick: handleRemoveImage,
                disabled: isUploading,
                children: [
                  /* @__PURE__ */ jsx(X, { className: "mr-2 h-4 w-4" }),
                  "Remove"
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "JPG, PNG, GIF or WebP. Max size 5MB." })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Form, { ...form, children: /* @__PURE__ */ jsxs("form", { onSubmit: form.handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "displayName",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Display Name *" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Enter display name", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Username" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              value: user?.username || "",
              disabled: true,
              className: "bg-muted"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "email",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { children: "Email Address *" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "your@email.com", ...field, disabled: true }) }),
            /* @__PURE__ */ jsx(FormDescription, { className: "text-[10px] text-muted-foreground", children: "Contact support to change your email address" }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "city",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "City" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Enter city", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "country",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "Country" }),
              /* @__PURE__ */ jsxs(Select, { onValueChange: field.onChange, defaultValue: field.value, children: [
                /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(SelectTrigger, { className: "w-full", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select country", children: field.value && (() => {
                  const countryInfo = countries[field.value];
                  const FlagComponent = flags[field.value];
                  return countryInfo ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    FlagComponent && /* @__PURE__ */ jsx(FlagComponent, { className: "w-5 h-3" }),
                    /* @__PURE__ */ jsx("span", { children: countryInfo.name })
                  ] }) : field.value;
                })() }) }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: Object.entries(countries).map(([code, country]) => {
                  const FlagComponent = flags[code];
                  return /* @__PURE__ */ jsx(SelectItem, { value: code, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                    FlagComponent && /* @__PURE__ */ jsx(FlagComponent, { className: "w-5 h-3" }),
                    /* @__PURE__ */ jsx("span", { children: country.name })
                  ] }) }, code);
                }) })
              ] }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        ),
        /* @__PURE__ */ jsx(
          FormField,
          {
            control: form.control,
            name: "region",
            render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
              /* @__PURE__ */ jsx(FormLabel, { children: "State/Region" }),
              /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(Input, { placeholder: "Enter state/region", ...field }) }),
              /* @__PURE__ */ jsx(FormMessage, {})
            ] })
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        FormField,
        {
          control: form.control,
          name: "bio",
          render: ({ field }) => /* @__PURE__ */ jsxs(FormItem, { children: [
            /* @__PURE__ */ jsx(FormLabel, { children: "Bio" }),
            /* @__PURE__ */ jsx(FormControl, { children: /* @__PURE__ */ jsx(
              Textarea,
              {
                placeholder: "Tell us about yourself and your pool playing experience...",
                className: "min-h-[100px]",
                ...field
              }
            ) }),
            /* @__PURE__ */ jsxs(FormDescription, { className: "text-[10px] text-muted-foreground", children: [
              field.value?.length || 0,
              "/500 characters"
            ] }),
            /* @__PURE__ */ jsx(FormMessage, {})
          ] })
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { type: "submit", children: "Update Profile" }) })
    ] }) })
  ] });
}
function SessionDetailDialog({
  open,
  onOpenChange,
  session,
  onRevoke
}) {
  if (!session) return null;
  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown";
    try {
      const date = typeof dateValue === "number" ? new Date(dateValue) : new Date(dateValue);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return String(dateValue);
    }
  };
  const getDeviceIcon = () => {
    if (!session.deviceName) return /* @__PURE__ */ jsx(Globe, { className: "h-12 w-12 text-muted-foreground" });
    const lower = session.deviceName.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
      return /* @__PURE__ */ jsx(Smartphone, { className: "h-12 w-12 text-muted-foreground" });
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return /* @__PURE__ */ jsx(Tablet, { className: "h-12 w-12 text-muted-foreground" });
    }
    return /* @__PURE__ */ jsx(Monitor, { className: "h-12 w-12 text-muted-foreground" });
  };
  const getStatusBadge = () => {
    if (session.status === "active" || !session.endedAt) {
      return /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "gap-1.5", children: [
        /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-green-500" }),
        "Active"
      ] });
    }
    return /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "gap-1.5", children: [
      /* @__PURE__ */ jsx("span", { className: "h-2 w-2 rounded-full bg-gray-400" }),
      "Ended"
    ] });
  };
  const getAuthMethodDisplay = (authMethod) => {
    if (!authMethod) return "Unknown";
    const method = authMethod.toLowerCase();
    if (method === "oauth" || method.includes("oauth")) {
      if (session.userAgent?.toLowerCase().includes("google")) {
        return "Google OAuth";
      }
      return "OAuth";
    }
    if (method === "password") return "Password";
    if (method === "magic_link") return "Magic Link";
    if (method === "passkey") return "Passkey";
    return authMethod.charAt(0).toUpperCase() + authMethod.slice(1);
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-[500px]", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "User session" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Session details and device information" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Status" }),
        getStatusBadge()
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Issued" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-right", children: formatDate(session.createdAt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Expires" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-right", children: formatDate(session.expiresAt) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "IP address" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-right font-mono", children: session.ipAddress || "Not available" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "User agent" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-right max-w-[60%] break-all", children: session.userAgent || "Not available" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Method" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-right", children: getAuthMethodDisplay(session.authMethod) })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Separator, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
          session.browserAndOS && /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: session.browserAndOS }),
            session.deviceName && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: session.deviceName })
          ] }),
          !session.browserAndOS && session.deviceName && /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: session.deviceName }),
          !session.browserAndOS && !session.deviceName && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Unknown device" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center w-20 h-20 rounded-lg bg-muted", children: getDeviceIcon() })
      ] }),
      session.status === "active" && !session.endedAt && onRevoke && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-3", children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Done" }),
          /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: onRevoke, children: "Revoke" })
        ] })
      ] }),
      (!session.status || session.status !== "active" || session.endedAt) && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Separator, {}),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Done" }) })
      ] })
    ] })
  ] }) });
}
function SessionsManager() {
  const [selectedSession, setSelectedSession] = React.useState(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const sessions = useQuery(api.sessions.getMySessions) ?? [];
  const revokeSession = useMutation(api.sessions.revokeSession);
  const revokeAllOtherSessions = useMutation(api.sessions.revokeAllOtherSessions);
  const isLoading = sessions === void 0;
  const handleRevokeSession = async (sessionId) => {
    try {
      await revokeSession({ sessionId });
      toast.success("Session revoked successfully");
      setIsDetailDialogOpen(false);
      setSelectedSession(null);
    } catch (error) {
      console.error("Failed to revoke session:", error);
      toast.error("Failed to revoke session");
    }
  };
  const handleViewSession = (session) => {
    setSelectedSession(session);
    setIsDetailDialogOpen(true);
  };
  const handleRevokeFromDetail = () => {
    if (selectedSession?.id) {
      handleRevokeSession(selectedSession.id);
    }
  };
  const handleRevokeAllOther = async () => {
    try {
      await revokeAllOtherSessions({});
      toast.success("All other sessions revoked successfully");
    } catch (error) {
      console.error("Failed to revoke sessions:", error);
      toast.error("Failed to revoke sessions");
    }
  };
  const getDeviceIcon = (deviceName) => {
    if (!deviceName) return /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" });
    const lower = deviceName.toLowerCase();
    if (lower.includes("iphone") || lower.includes("android") || lower.includes("mobile")) {
      return /* @__PURE__ */ jsx(Smartphone, { className: "h-4 w-4" });
    }
    if (lower.includes("ipad") || lower.includes("tablet")) {
      return /* @__PURE__ */ jsx(Tablet, { className: "h-4 w-4" });
    }
    return /* @__PURE__ */ jsx(Monitor, { className: "h-4 w-4" });
  };
  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown";
    try {
      const date = typeof dateValue === "number" ? new Date(dateValue) : new Date(dateValue);
      return date.toLocaleString();
    } catch {
      return String(dateValue);
    }
  };
  const isActiveSession = (session) => !session.endedAt;
  const activeSessions = sessions.filter(isActiveSession);
  const inactiveSessions = sessions.filter((s) => !isActiveSession(s));
  if (isLoading) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardHeader, { children: [
      /* @__PURE__ */ jsx(CardTitle, { children: "Active Sessions" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Loading sessions..." })
    ] }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx("div", { className: "space-y-2", children: activeSessions.length > 1 && /* @__PURE__ */ jsxs(AlertDialog, { children: [
      /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", children: [
        /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
        "Revoke All Others"
      ] }) }),
      /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
        /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
          /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Revoke all other sessions?" }),
          /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This will sign you out from all other devices. You will remain signed in on this device." })
        ] }),
        /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
          /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
          /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleRevokeAllOther, children: "Revoke All Others" })
        ] })
      ] })
    ] }) }),
    activeSessions.length === 0 ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No active sessions" }) }) }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: activeSessions.map((session) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4 flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "mt-1", children: getDeviceIcon(session.deviceName) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: () => handleViewSession(session),
                className: "text-sm font-medium hover:underline text-left",
                children: session.browserAndOS || session.deviceName || "Unknown Device"
              }
            ),
            /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Active" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground space-y-0.5", children: [
            session.browserName && /* @__PURE__ */ jsxs("p", { children: [
              "Browser: ",
              session.browserName
            ] }),
            session.ipAddress && /* @__PURE__ */ jsxs("p", { children: [
              "IP Address: ",
              session.ipAddress
            ] }),
            session.lastAccessedAt && /* @__PURE__ */ jsxs("p", { children: [
              "Last accessed: ",
              formatDate(session.lastAccessedAt)
            ] }),
            session.createdAt && /* @__PURE__ */ jsxs("p", { children: [
              "Created: ",
              formatDate(session.createdAt)
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => handleViewSession(session),
            children: "View Details"
          }
        ),
        /* @__PURE__ */ jsxs(AlertDialog, { children: [
          /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }) }) }),
          /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
            /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
              /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Revoke this session?" }),
              /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This will sign you out from this device. You'll need to sign in again to access your account." })
            ] }),
            /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
              /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
              /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => handleRevokeSession(session.id), children: "Revoke Session" })
            ] })
          ] })
        ] })
      ] })
    ] }) }) }, session.id)) }),
    inactiveSessions.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium", children: "Recent Sessions" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: inactiveSessions.slice(0, 5).map((session) => /* @__PURE__ */ jsx(Card, { className: "opacity-60", children: /* @__PURE__ */ jsx(CardContent, { className: "pt-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          getDeviceIcon(session.deviceName),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: session.deviceName || "Unknown Device" }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              "Ended: ",
              formatDate(session.endedAt)
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Ended" })
      ] }) }) }, session.id)) })
    ] }),
    /* @__PURE__ */ jsx(
      SessionDetailDialog,
      {
        open: isDetailDialogOpen,
        onOpenChange: setIsDetailDialogOpen,
        session: selectedSession,
        onRevoke: handleRevokeFromDetail
      }
    )
  ] });
}
function ConnectedAccounts() {
  const authMethods = useQuery(api.accounts.getMyAccounts) ?? [];
  const fargoRateAccount = useQuery(api.accounts.getFargoRateAccount);
  const apaAccount = useQuery(api.accounts.getAPAAccount);
  const disconnectAccount = useMutation(api.accounts.disconnectAccount);
  const linkFargoRateAccount = useMutation(api.accounts.linkFargoRateAccount);
  const unlinkFargoRateAccount = useMutation(api.accounts.unlinkFargoRateAccount);
  const searchFargoRatePlayersAction = useAction(api.accounts.searchFargoRatePlayers);
  const linkAPAAccount = useMutation(api.accounts.linkAPAAccount);
  const unlinkAPAAccount = useMutation(api.accounts.unlinkAPAAccount);
  const searchAPAMembersAction = useAction(api.accounts.searchAPAMembers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedPlayer, setSelectedPlayer] = React.useState(null);
  const [searchResults, setSearchResults] = React.useState([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [apaSearchQuery, setApaSearchQuery] = React.useState("");
  const [selectedAPAMember, setSelectedAPAMember] = React.useState(null);
  const [apaSearchResults, setApaSearchResults] = React.useState([]);
  const [isSearchingAPA, setIsSearchingAPA] = React.useState(false);
  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchFargoRatePlayersAction({ query: searchQuery });
        setSearchResults(results || []);
      } catch (error) {
        console.error("Failed to search FargoRate players:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFargoRatePlayersAction]);
  React.useEffect(() => {
    if (apaSearchQuery.length < 2) {
      setApaSearchResults([]);
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearchingAPA(true);
      try {
        const results = await searchAPAMembersAction({ query: apaSearchQuery });
        setApaSearchResults(results || []);
      } catch (error) {
        console.error("Failed to search APA members:", error);
        setApaSearchResults([]);
      } finally {
        setIsSearchingAPA(false);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [apaSearchQuery, searchAPAMembersAction]);
  const isLoading = authMethods === void 0 || fargoRateAccount === void 0 || apaAccount === void 0;
  const getProviderIcon = (method) => {
    const provider = getProviderName(method);
    const providerLower = provider.toLowerCase();
    if (providerLower.includes("google")) return /* @__PURE__ */ jsx(Chrome, { className: "h-5 w-5" });
    if (providerLower.includes("apple")) return /* @__PURE__ */ jsx(Apple, { className: "h-5 w-5" });
    if (providerLower.includes("github")) return /* @__PURE__ */ jsx(Github, { className: "h-5 w-5" });
    if (providerLower.includes("email") || providerLower.includes("password")) {
      return /* @__PURE__ */ jsx(Mail, { className: "h-5 w-5" });
    }
    return /* @__PURE__ */ jsx(Link$1, { className: "h-5 w-5" });
  };
  const getProviderName = (method) => {
    return method.method || method.provider || "Unknown";
  };
  const getProviderBadgeVariant = (method) => {
    const provider = getProviderName(method).toLowerCase();
    if (provider.includes("email") || provider.includes("password")) {
      return "default";
    }
    return "secondary";
  };
  const handleDisconnect = async (method) => {
    try {
      await disconnectAccount({ accountId: method.id });
      toast.success(`${getProviderName(method)} disconnected successfully`);
    } catch (error) {
      console.error("Failed to disconnect account:", error);
      toast.error(error.message || "Failed to disconnect account");
    }
  };
  const handleLinkFargoRate = async () => {
    if (!selectedPlayer) return;
    try {
      await linkFargoRateAccount({
        fargoId: selectedPlayer.id,
        fargoReadableId: selectedPlayer.readableId,
        name: selectedPlayer.name,
        fargoRating: parseInt(selectedPlayer.effectiveRating) || parseInt(selectedPlayer.provisionalRating) || 0,
        fargoRobustness: parseInt(selectedPlayer.robustness) || void 0,
        city: selectedPlayer.location || void 0
      });
      toast.success("FargoRate account linked successfully");
      setSearchQuery("");
      setSelectedPlayer(null);
    } catch (error) {
      console.error("Failed to link FargoRate account:", error);
      toast.error(error.message || "Failed to link FargoRate account");
    }
  };
  const handleUnlinkFargoRate = async () => {
    try {
      await unlinkFargoRateAccount({});
      toast.success("FargoRate account unlinked successfully");
    } catch (error) {
      console.error("Failed to unlink FargoRate account:", error);
      toast.error(error.message || "Failed to unlink FargoRate account");
    }
  };
  const handleLinkAPA = async () => {
    if (!selectedAPAMember) return;
    try {
      await linkAPAAccount({
        apaId: String(selectedAPAMember.memberId),
        name: selectedAPAMember.name,
        apaSkillLevel: selectedAPAMember.skillLevel || void 0
      });
      toast.success("APA account linked successfully");
      setApaSearchQuery("");
      setSelectedAPAMember(null);
    } catch (error) {
      console.error("Failed to link APA account:", error);
      toast.error(error.message || "Failed to link APA account");
    }
  };
  const handleUnlinkAPA = async () => {
    try {
      await unlinkAPAAccount({});
      toast.success("APA account unlinked successfully");
    } catch (error) {
      console.error("Failed to unlink APA account:", error);
      toast.error(error.message || "Failed to unlink APA account");
    }
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Connected Accounts" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Loading connected accounts..." })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) })
    ] });
  }
  if (authMethods.length === 0) {
    return /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsx(CardTitle, { children: "Connected Accounts" }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Manage your connected authentication methods" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "No connected accounts found. You can connect accounts when you sign in." }) })
    ] });
  }
  const passwordMethods = authMethods.filter((m) => m.type === "password");
  const oauthMethods = authMethods.filter((m) => m.type === "oauth");
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Connected Accounts" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Manage your connected authentication methods and social accounts" })
    ] }),
    passwordMethods.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Password Authentication" }),
      passwordMethods.map((method, index) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: getProviderIcon(method) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: getProviderName(method) }),
            /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Primary authentication method" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: getProviderBadgeVariant(method), children: "Connected" })
      ] }) }) }, index))
    ] }),
    oauthMethods.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Social Accounts" }),
      oauthMethods.map((method, index) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: getProviderIcon(method) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: getProviderName(method) }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
              getProviderName(method),
              " OAuth"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { variant: getProviderBadgeVariant(method), children: "Connected" }),
          /* @__PURE__ */ jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Unlink, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsxs(AlertDialogTitle, { children: [
                  "Disconnect ",
                  getProviderName(method),
                  "?"
                ] }),
                /* @__PURE__ */ jsx(AlertDialogDescription, { children: "You'll need to use another authentication method to sign in after disconnecting this account." })
              ] }),
              /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
                /* @__PURE__ */ jsx(AlertDialogAction, { onClick: () => handleDisconnect(method), children: "Disconnect" })
              ] })
            ] })
          ] })
        ] })
      ] }) }) }, index))
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "FargoRate Account" }),
      fargoRateAccount ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: fargoRateAccount.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              fargoRateAccount.fargoRating && /* @__PURE__ */ jsxs("span", { children: [
                "Rating: ",
                fargoRateAccount.fargoRating.toLocaleString()
              ] }),
              fargoRateAccount.city && /* @__PURE__ */ jsxs("span", { children: [
                "• ",
                fargoRateAccount.city
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Connected" }),
          /* @__PURE__ */ jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Unlink, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Unlink FargoRate Account?" }),
                /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This will remove your FargoRate account link. You can link it again later." })
              ] }),
              /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
                /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleUnlinkFargoRate, children: "Unlink" })
              ] })
            ] })
          ] })
        ] })
      ] }) }) }) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Link your FargoRate account" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Connect your FargoRate player profile to track your ratings and statistics" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Search for your FargoRate profile...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"
              }
            )
          ] }),
          searchQuery.length >= 2 && /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto rounded-md border", children: isSearching ? /* @__PURE__ */ jsxs("div", { className: "p-4 text-center text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mx-auto mb-2" }),
            "Searching..."
          ] }) : searchResults.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-sm text-muted-foreground", children: "No players found" }) : /* @__PURE__ */ jsx("div", { className: "divide-y", children: searchResults.map((player) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedPlayer(player),
              className: `w-full p-3 text-left hover:bg-muted ${selectedPlayer?.id === player.id ? "bg-muted" : ""}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: player.name }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
                    player.location && /* @__PURE__ */ jsx("span", { children: player.location }),
                    player.effectiveRating && /* @__PURE__ */ jsxs("span", { children: [
                      "• Rating: ",
                      parseInt(player.effectiveRating).toLocaleString()
                    ] })
                  ] })
                ] }),
                selectedPlayer?.id === player.id && /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Selected" })
              ] })
            },
            player.id
          )) }) }),
          selectedPlayer && /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleLinkFargoRate,
              className: "w-full",
              disabled: !selectedPlayer,
              children: "Link FargoRate Account"
            }
          )
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "APA Account" }),
      apaAccount ? /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-muted", children: /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5" }) }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: apaAccount.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
              apaAccount.apaId && /* @__PURE__ */ jsxs("span", { children: [
                "Member ID: ",
                apaAccount.apaId
              ] }),
              apaAccount.apaSkillLevel && /* @__PURE__ */ jsxs("span", { children: [
                "• Skill Level: ",
                apaAccount.apaSkillLevel
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Connected" }),
          /* @__PURE__ */ jsxs(AlertDialog, { children: [
            /* @__PURE__ */ jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(Unlink, { className: "h-4 w-4" }) }) }),
            /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
              /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
                /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Unlink APA Account?" }),
                /* @__PURE__ */ jsx(AlertDialogDescription, { children: "This will remove your APA account link. You can link it again later." })
              ] }),
              /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
                /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
                /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleUnlinkAPA, children: "Unlink" })
              ] })
            ] })
          ] })
        ] })
      ] }) }) }) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "opacity-50", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Link your APA account (coming soon)" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Connect your APA member profile to track your skill level and statistics" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                disabled: true,
                placeholder: "Search by name or member ID...",
                value: apaSearchQuery,
                onChange: (e) => setApaSearchQuery(e.target.value),
                className: "pl-9"
              }
            )
          ] }),
          apaSearchQuery.length >= 2 && /* @__PURE__ */ jsx("div", { className: "max-h-60 overflow-y-auto rounded-md border", children: isSearchingAPA ? /* @__PURE__ */ jsxs("div", { className: "p-4 text-center text-sm text-muted-foreground", children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin mx-auto mb-2" }),
            "Searching..."
          ] }) : apaSearchResults.length === 0 ? /* @__PURE__ */ jsx("div", { className: "p-4 text-center text-sm text-muted-foreground", children: "No members found. Try searching by name or member ID." }) : /* @__PURE__ */ jsx("div", { className: "divide-y", children: apaSearchResults.map((member) => /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => setSelectedAPAMember(member),
              className: `w-full p-3 text-left hover:bg-muted ${selectedAPAMember?.memberId === member.memberId ? "bg-muted" : ""}`,
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: member.name }),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-muted-foreground", children: [
                    member.memberId && /* @__PURE__ */ jsxs("span", { children: [
                      "Member ID: ",
                      member.memberId
                    ] }),
                    member.email && /* @__PURE__ */ jsxs("span", { children: [
                      "• ",
                      member.email
                    ] })
                  ] })
                ] }),
                selectedAPAMember?.memberId === member.memberId && /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Selected" })
              ] })
            },
            member.memberId
          )) }) }),
          selectedAPAMember && /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleLinkAPA,
              className: "w-full",
              disabled: !selectedAPAMember,
              children: "Link APA Account"
            }
          )
        ] })
      ] }) }) })
    ] })
  ] });
}
function Header() {
  const navigate = useNavigate();
  const { user: currentUser } = useCurrentUser();
  const profileCompletion = currentUser ? calculateProfileCompletion(currentUser) : 0;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { open: settingsDialogOpen, setOpen: setSettingsDialogOpen, initialTab } = useSettingsState();
  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/login" });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("header", { className: "border-b", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 items-center gap-2 p-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 justify-start", children: /* @__PURE__ */ jsxs(Tooltip, { children: [
        /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            size: "icon",
            onClick: () => setSidebarOpen(!sidebarOpen),
            "aria-label": sidebarOpen ? "Close menu" : "Open menu",
            children: /* @__PURE__ */ jsx(
              motion.div,
              {
                initial: false,
                animate: { rotate: sidebarOpen ? 90 : 0 },
                transition: { duration: 0.2, ease: "easeInOut" },
                children: sidebarOpen ? /* @__PURE__ */ jsx(IconX, { className: "stroke-1" }) : /* @__PURE__ */ jsx(IconMenu2, { className: "stroke-1" })
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(TooltipContent, { children: /* @__PURE__ */ jsx("p", { children: sidebarOpen ? "Close menu" : "Open menu" }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsxs(Link, { to: "/", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: "/logo.png",
            alt: "Rackd logo",
            className: "h-8 w-8"
          }
        ),
        /* @__PURE__ */ jsx("span", { className: "hidden font-bold lowercase tracking-tighter md:block text-xl", children: "rackd" })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 justify-end", children: [
        /* @__PURE__ */ jsx(
          NavigationButton,
          {
            icon: IconAlignJustified,
            ariaLabel: "Feed",
            tooltip: "Feed",
            navigate: () => navigate({ to: "/feed" })
          }
        ),
        /* @__PURE__ */ jsx(NotificationsDropdown, {}),
        /* @__PURE__ */ jsx(ThemeToggle, { useTheme }),
        currentUser && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
          profileCompletion !== 100 && /* @__PURE__ */ jsx(
            AnimatedBadge,
            {
              text: `Complete Profile ${profileCompletion}%`,
              color: profileCompletion >= 80 ? "#22c55e" : profileCompletion >= 60 ? "#eab308" : "#ef4444",
              onClick: () => setSettingsDialogOpen(true)
            }
          ),
          /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { children: /* @__PURE__ */ jsx(
              ProfileAvatar,
              {
                showShimmer: true,
                user: {
                  displayName: currentUser.displayName,
                  image: currentUser.imageUrl ?? void 0,
                  country: currentUser.locale
                },
                size: "xs"
              }
            ) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { className: "w-56", align: "end", children: [
              /* @__PURE__ */ jsx(DropdownMenuLabel, { className: "font-normal", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col space-y-1", children: [
                /* @__PURE__ */ jsx("p", { className: "text-sm font-medium leading-none truncate", children: currentUser.displayName }),
                /* @__PURE__ */ jsx("p", { className: "text-xs leading-none text-muted-foreground truncate", children: currentUser.email })
              ] }) }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => navigate({ to: `/${currentUser.username}` }), children: [
                /* @__PURE__ */ jsx(User, { className: "mr-2 h-4 w-4" }),
                "Profile"
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => navigate({ to: `/players/${currentUser.id}` }), children: [
                /* @__PURE__ */ jsx(IconSportBillard, { className: "mr-2 h-4 w-4" }),
                "Player Profile"
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setSettingsDialogOpen(true), children: [
                /* @__PURE__ */ jsx(Settings, { className: "mr-2 h-4 w-4" }),
                "Settings"
              ] }),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => setSettingsDialogOpen(true), children: [
                /* @__PURE__ */ jsx(CreditCard, { className: "mr-2 h-4 w-4" }),
                "Billing"
              ] }),
              /* @__PURE__ */ jsx(DropdownMenuSeparator, {}),
              /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: handleSignOut, children: [
                /* @__PURE__ */ jsx(LogOut, { className: "mr-2 h-4 w-4" }),
                "Logout"
              ] })
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      motion.div,
      {
        initial: false,
        animate: {
          x: sidebarOpen ? 0 : -20,
          opacity: sidebarOpen ? 1 : 0
        },
        transition: { duration: 0.2, ease: "easeOut" },
        className: "fixed left-2 top-[56px] z-50 w-[300px] rounded-lg border bg-sidebar shadow-lg",
        style: {
          pointerEvents: sidebarOpen ? "auto" : "none"
        },
        children: /* @__PURE__ */ jsx("div", { className: "p-2", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: /* @__PURE__ */ jsxs("nav", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: "/feed",
              className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors",
              onClick: () => setSidebarOpen(false),
              children: [
                /* @__PURE__ */ jsx(IconAlignJustified, { className: "h-4 w-4 stroke-1" }),
                "Feed"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              onClick: () => {
                navigate({ to: "/discover" });
                setSidebarOpen(false);
              },
              className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
                "Discover"
              ]
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer", onClick: () => {
            navigate({ to: "/tournaments" });
            setSidebarOpen(false);
          }, children: [
            /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4" }),
            "Tournaments"
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors cursor-pointer",
              onClick: () => {
                navigate({ to: "/players" });
                setSidebarOpen(false);
              },
              children: [
                /* @__PURE__ */ jsx(User, { className: "h-4 w-4" }),
                "Players"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors cursor-pointer",
              onClick: () => {
                navigate({ to: "/venues" });
                setSidebarOpen(false);
              },
              children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
                "Venues"
              ]
            }
          )
        ] }) }) })
      }
    ),
    currentUser && /* @__PURE__ */ jsx(
      SettingsDialog,
      {
        open: settingsDialogOpen,
        onOpenChange: setSettingsDialogOpen,
        user: {
          displayName: currentUser.displayName,
          email: currentUser.email,
          imageUrl: currentUser.imageUrl ?? void 0,
          country: currentUser.locale
        },
        profileSettings: /* @__PURE__ */ jsx(ProfileSettings, { user: currentUser }),
        dangerZone: /* @__PURE__ */ jsx(DangerZone, { user: currentUser }),
        sessionsManager: /* @__PURE__ */ jsx(SessionsManager, {}),
        interestsManager: /* @__PURE__ */ jsx(InterestTagsManager, { interests: currentUser?.interests || [], maxTags: 15, placeholder: "e.g., 8-ball, 9-ball, tournaments..." }),
        connectedAccounts: /* @__PURE__ */ jsx(ConnectedAccounts, {}),
        initialTab
      }
    )
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxs("div", { className: "flex h-screen flex-col overflow-hidden", children: [
  /* @__PURE__ */ jsx(Header, {}),
  /* @__PURE__ */ jsx("main", { className: "flex flex-1 flex-col overflow-auto", children: /* @__PURE__ */ jsx(Outlet, {}) })
] });
export {
  SplitComponent as component
};
