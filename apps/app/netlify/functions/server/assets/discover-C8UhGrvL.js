import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect } from "react";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-BPSwp-0A.js";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CvQ4KYcO.js";
import { B as Button, c as cn } from "./router-CozkPsbM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { C as Card, d as CardContent } from "./card-CNeVhZxM.js";
import { Users, MapPin, ChevronLeft, ChevronRight, Trophy, Calendar, DollarSign, ChevronDownIcon, Search, Filter } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { P as ProfileAvatar } from "./profile-avatar--lu5GzhZ.js";
import { A as ActivityFeed, F as FeedProvider } from "./activity-feed-CTh6Zvln.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { P as Popover, a as PopoverContent, b as PopoverTrigger } from "./popover-BvaypCcm.js";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { E as ExpandableSection } from "./expandable-section-DasINGSb.js";
import { S as ScrollArea } from "./scroll-area-DVprZJU7.js";
import "@radix-ui/react-tabs";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
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
import "sonner";
import "@tanstack/react-router-devtools";
import "@convex-dev/better-auth/react";
import "@convex-dev/better-auth/react-start";
import "zod";
import "clsx";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "tailwind-merge";
import "./avatar-B5vlBfAE.js";
import "@radix-ui/react-avatar";
import "country-flag-icons";
import "./tooltip-DeKNATFQ.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "./textarea-CRbQQyBj.js";
import "date-fns";
import "./use-current-user-CdMPB1RC.js";
import "./tournament-utils-BsxWYtEj.js";
import "./use-image-upload-BDsUfsQO.js";
import "@radix-ui/react-select";
import "@radix-ui/react-popover";
import "react-resizable-panels";
import "./use-mobile-BsFue-bT.js";
import "@radix-ui/react-scroll-area";
function DiscoverPlayersTable({ searchQuery, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const fargoRatingFilters = {
    minFargoRating: filters.fargoRating[0] !== 200 ? filters.fargoRating[0] : void 0,
    maxFargoRating: filters.fargoRating[1] !== 900 ? filters.fargoRating[1] : void 0
  };
  const queryParams = {
    query: searchQuery.length > 0 ? searchQuery : void 0,
    limit: 50,
    city: filters.city || void 0,
    country: filters.country || void 0,
    region: filters.region || void 0,
    ...fargoRatingFilters
  };
  const playersData = useQuery(
    api.users.getPlayersForDiscovery,
    queryParams
  );
  if (playersData === void 0) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("p", { children: "Loading players..." })
    ] }) }) });
  }
  if (!playersData || playersData.length === 0) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Users, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "No players found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: searchQuery.length > 0 ? "Try a different search term" : "Start following players to get personalized suggestions" })
    ] }) }) });
  }
  const filteredPlayers = playersData;
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);
  const getPlayerCategories = (player) => {
    const categories = [];
    if (player.fargoRating) {
      if (player.fargoRating >= 600) {
        categories.push("Pro Player");
      } else if (player.fargoRating >= 500) {
        categories.push("Advanced Player");
      } else if (player.fargoRating >= 400) {
        categories.push("Intermediate Player");
      } else {
        categories.push("Beginner Player");
      }
    }
    if (player.isVerified) {
      categories.push("Verified Player");
    }
    return categories.slice(0, 3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Location" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Fargo Rating" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Category" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: currentPlayers.map((player) => {
        const categories = getPlayerCategories(player);
        return /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-muted/50", children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(
              ProfileAvatar,
              {
                user: {
                  displayName: player.name,
                  image: player.userImageUrl || player.avatarUrl,
                  country: player.country
                },
                size: "xs"
              }
            ),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Link, { to: `/${player.username || player.userId}`, children: /* @__PURE__ */ jsx("p", { className: "font-medium hover:text-primary", children: player.name }) }),
              player.username && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                "@",
                player.username
              ] }),
              player.isVerified && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs mt-1", children: "Verified" })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1 text-sm", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }),
            /* @__PURE__ */ jsx("span", { children: player.city || "Unknown" })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-2", children: player.fargoRating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "font-bold text-lg text-primary", children: player.fargoRating }),
            player.fargoRobustness && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
              "R: ",
              player.fargoRobustness
            ] })
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No rating" }) }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1", children: [
            categories.slice(0, 2).map((category, index) => /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: category }, index)),
            categories.length > 2 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
              "+",
              categories.length - 2
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end space-x-2", children: /* @__PURE__ */ jsx(Link, { to: `/${player.username || player.userId}`, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "View Profile" }) }) }) })
        ] }, player._id);
      }) })
    ] }),
    totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        startIndex + 1,
        " to ",
        Math.min(endIndex, filteredPlayers.length),
        " of ",
        filteredPlayers.length,
        " players"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
            disabled: currentPage === 1,
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
              "Previous"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
          Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return /* @__PURE__ */ jsx(
              Button,
              {
                variant: currentPage === page ? "default" : "outline",
                size: "sm",
                onClick: () => setCurrentPage(page),
                className: "w-8 h-8 p-0",
                children: page
              },
              page
            );
          }),
          totalPages > 5 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "px-2", children: "..." }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: currentPage === totalPages ? "default" : "outline",
                size: "sm",
                onClick: () => setCurrentPage(totalPages),
                className: "w-8 h-8 p-0",
                children: totalPages
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
            disabled: currentPage === totalPages,
            children: [
              "Next",
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function DiscoverTournamentsTable({ searchQuery, filters }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const tournaments = useQuery(api.tournaments.getAllTournaments, {});
  if (tournaments === void 0) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("p", { children: "Loading tournaments..." })
    ] }) }) });
  }
  if (!tournaments || tournaments.length === 0) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "No tournaments available" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "Be the first to create a tournament for the community" })
    ] }) }) });
  }
  const filteredTournaments = tournaments.filter((tournament) => {
    if (searchQuery && !tournament.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filters.category && filters.category !== "all" && tournament.status !== filters.category) {
      return false;
    }
    return true;
  });
  const totalPages = Math.ceil(filteredTournaments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTournaments = filteredTournaments.slice(startIndex, endIndex);
  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800 border-green-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "draft":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  const getStatusLabel = (status) => {
    switch (status) {
      case "upcoming":
        return "Upcoming";
      case "active":
        return "In Progress";
      case "completed":
        return "Completed";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };
  const getTypeLabel = (type) => {
    switch (type) {
      case "single":
        return "Single Elimination";
      case "double":
        return "Double Elimination";
      case "scotch_double":
        return "Scotch Double";
      case "teams":
        return "Teams";
      case "round_robin":
        return "Round Robin";
      default:
        return type;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "w-[60px]" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Tournament" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Location" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Players" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Entry Fee" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Action" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: currentTournaments.map((tournament) => /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-muted/50", children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center", children: /* @__PURE__ */ jsx("input", { type: "checkbox", className: "rounded border-gray-300" }) }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsx(Link, { to: `/tournaments/${tournament._id}`, children: /* @__PURE__ */ jsx("p", { className: "font-medium hover:text-primary", children: tournament.name }) }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: getTypeLabel(tournament.type) })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1 text-sm", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { children: new Date(tournament.date).toLocaleDateString() })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { children: tournament.venue?.name || tournament.venue || "TBD" })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
            tournament.registeredCount || 0,
            tournament.maxPlayers && `/${tournament.maxPlayers}`
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { className: "font-medium", children: tournament.entryFee ? `$${tournament.entryFee}` : "Free" })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { className: getStatusColor(tournament.status), children: getStatusLabel(tournament.status) }) }),
        /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
          tournament.status === "upcoming" && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "default", children: "Register" }),
          /* @__PURE__ */ jsx(Link, { to: `/tournaments/${tournament._id}`, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "View" }) })
        ] }) })
      ] }, tournament._id)) })
    ] }) }) }),
    totalPages > 1 && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        startIndex + 1,
        " to ",
        Math.min(endIndex, filteredTournaments.length),
        " of ",
        filteredTournaments.length,
        " tournaments"
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setCurrentPage((prev) => Math.max(prev - 1, 1)),
            disabled: currentPage === 1,
            children: [
              /* @__PURE__ */ jsx(ChevronLeft, { className: "h-4 w-4" }),
              "Previous"
            ]
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
          Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = i + 1;
            return /* @__PURE__ */ jsx(
              Button,
              {
                variant: currentPage === page ? "default" : "outline",
                size: "sm",
                onClick: () => setCurrentPage(page),
                className: "w-8 h-8 p-0",
                children: page
              },
              page
            );
          }),
          totalPages > 5 && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx("span", { className: "px-2", children: "..." }),
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: currentPage === totalPages ? "default" : "outline",
                size: "sm",
                onClick: () => setCurrentPage(totalPages),
                className: "w-8 h-8 p-0",
                children: totalPages
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: () => setCurrentPage((prev) => Math.min(prev + 1, totalPages)),
            disabled: currentPage === totalPages,
            children: [
              "Next",
              /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4" })
            ]
          }
        )
      ] })
    ] })
  ] });
}
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}) {
  const _values = React.useMemo(
    () => Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max],
    [value, defaultValue, min, max]
  );
  return /* @__PURE__ */ jsxs(
    SliderPrimitive.Root,
    {
      "data-slot": "slider",
      defaultValue,
      value,
      min,
      max,
      className: cn(
        "relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        className
      ),
      ...props,
      children: [
        /* @__PURE__ */ jsx(
          SliderPrimitive.Track,
          {
            "data-slot": "slider-track",
            className: cn(
              "bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
            ),
            children: /* @__PURE__ */ jsx(
              SliderPrimitive.Range,
              {
                "data-slot": "slider-range",
                className: cn(
                  "bg-primary absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full"
                )
              }
            )
          }
        ),
        Array.from({ length: _values.length }, (_, index) => /* @__PURE__ */ jsx(
          SliderPrimitive.Thumb,
          {
            "data-slot": "slider-thumb",
            className: "border-primary ring-ring/50 block size-4 shrink-0 rounded-full border bg-white shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
          },
          index
        ))
      ]
    }
  );
}
const FARGO_RANGES = [
  { min: 0, max: 289, label: "Below 290", apa: "2" },
  { min: 0, max: 290, label: "< 290", apa: "2" },
  { min: 291, max: 350, label: "291-350", apa: "3" },
  { min: 351, max: 410, label: "351-410", apa: "4" },
  { min: 411, max: 470, label: "411-470", apa: "5" },
  { min: 471, max: 540, label: "471-540", apa: "6" },
  { min: 541, max: 620, label: "541-620", apa: "7" },
  { min: 621, max: 900, label: "621 +", apa: "Elite" }
];
function FargoRatingSelect({
  value = [200, 900],
  onValueChange,
  className,
  children,
  asChild = false
}) {
  const [sliderValue, setSliderValue] = useState(value);
  useEffect(() => {
    setSliderValue(value);
  }, [value]);
  const handleSliderChange = (newValue) => {
    const updatedValue = [newValue[0] ?? 0, newValue[1] ?? 0];
    setSliderValue(updatedValue);
    onValueChange?.(updatedValue);
  };
  const handleInputChange = (index, inputValue) => {
    const numValue = parseInt(inputValue, 10);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 900) {
      const newValue = [...sliderValue];
      newValue[index] = numValue;
      if (index === 0 && numValue > newValue[1]) {
        newValue[1] = numValue;
      } else if (index === 1 && numValue < newValue[0]) {
        newValue[0] = numValue;
      }
      setSliderValue(newValue);
      onValueChange?.(newValue);
    }
  };
  const getDisplayText = () => {
    if (sliderValue[0] === 200 && sliderValue[1] === 900) {
      return "Any";
    }
    return `${sliderValue[0]} - ${sliderValue[1]}`;
  };
  const renderTrigger = () => {
    if (asChild && children) {
      return /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, className: "w-full", children });
    }
    return /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
      "button",
      {
        className: cn(
          "border-input cursor-pointer data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 h-9",
          className
        ),
        children: [
          /* @__PURE__ */ jsx("span", { children: getDisplayText() }),
          /* @__PURE__ */ jsx(ChevronDownIcon, { className: "size-4 opacity-50" })
        ]
      }
    ) });
  };
  return /* @__PURE__ */ jsxs(Popover, { children: [
    renderTrigger(),
    /* @__PURE__ */ jsx(
      PopoverContent,
      {
        className: "w-80 p-6",
        align: "start",
        sideOffset: 5,
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsx("h4", { className: "font-medium text-center", children: "Fargo Rating" }),
          /* @__PURE__ */ jsx("div", { className: "px-2", children: /* @__PURE__ */ jsx(
            Slider,
            {
              min: 200,
              max: 900,
              step: 10,
              value: sliderValue,
              onValueChange: handleSliderChange,
              className: "w-full"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "From" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  value: sliderValue[0],
                  onChange: (e) => handleInputChange(0, e.target.value),
                  className: "w-20 h-12 text-center text-xl font-bold mt-1",
                  min: 0,
                  max: 900
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: "flex-1 flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Or" }) }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center", children: [
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: "To" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  value: sliderValue[1],
                  onChange: (e) => handleInputChange(1, e.target.value),
                  className: "w-20 h-12 text-center text-xl font-bold mt-1",
                  min: 0,
                  max: 900
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "space-y-2", children: FARGO_RANGES.map((range, index) => {
            const isExactRangeSelected = sliderValue[0] === range.min && sliderValue[1] === range.max;
            const isRangePartiallySelected = sliderValue[0] <= range.max && sliderValue[1] >= range.min;
            return /* @__PURE__ */ jsxs("label", { className: "flex items-center space-x-3 cursor-pointer hover:bg-accent p-2 rounded", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "checkbox",
                  className: "rounded border-gray-300 text-blue-500 focus:ring-blue-500",
                  checked: isExactRangeSelected,
                  onChange: (e) => {
                    if (e.target.checked) {
                      handleSliderChange([range.min, range.max]);
                    } else if (isExactRangeSelected) {
                      handleSliderChange([200, 900]);
                    }
                  }
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex-1 flex justify-between", children: [
                /* @__PURE__ */ jsx("span", { className: `text-sm font-medium ${isRangePartiallySelected && !isExactRangeSelected ? "text-muted-foreground" : ""}`, children: range.label }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-bold", children: range.apa })
              ] })
            ] }, index);
          }) })
        ] })
      }
    )
  ] });
}
function DiscoverPage() {
  const [activeTab, setActiveTab] = useState("players");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    region: "",
    fargoRating: [200, 900],
    location: "all",
    age: "recent",
    followers: "any",
    gender: "any",
    category: "all"
  });
  const renderPlayerFilters = () => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Location", icon: /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }), expanded: true, children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "City" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Enter city", value: filters.city, onChange: (e) => setFilters({
          ...filters,
          city: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Country" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Enter country", value: filters.country, onChange: (e) => setFilters({
          ...filters,
          country: e.target.value
        }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "State/Region" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Enter state/region", value: filters.region, onChange: (e) => setFilters({
          ...filters,
          region: e.target.value
        }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Skill Level", icon: /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }), expanded: true, children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Fargo Rating" }),
      /* @__PURE__ */ jsx(FargoRatingSelect, { value: filters.fargoRating, onValueChange: (value) => setFilters({
        ...filters,
        fargoRating: value
      }) })
    ] }) })
  ] });
  const renderTournamentFilters = () => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Location", icon: /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }), expanded: true, children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Location" }),
      /* @__PURE__ */ jsxs(Select, { value: filters.location, onValueChange: (value) => setFilters({
        ...filters,
        location: value
      }), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All Locations" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Locations" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "local", children: "Local" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "regional", children: "Regional" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Status", icon: /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }), expanded: true, children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Status" }),
      /* @__PURE__ */ jsxs(Select, { value: filters.category, onValueChange: (value) => setFilters({
        ...filters,
        category: value
      }), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All Status" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Status" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "upcoming", children: "Upcoming" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "active", children: "Active" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Entry Fee", icon: /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }), children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Entry Fee" }),
      /* @__PURE__ */ jsxs(Select, { value: filters.followers, onValueChange: (value) => setFilters({
        ...filters,
        followers: value
      }), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Any" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "any", children: "Any" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "free", children: "Free" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "paid", children: "Paid" })
        ] })
      ] })
    ] }) })
  ] });
  const renderPostFilters = () => /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Category", icon: /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }), expanded: true, children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Category" }),
      /* @__PURE__ */ jsxs(Select, { value: filters.category, onValueChange: (value) => setFilters({
        ...filters,
        category: value
      }), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "All Categories" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Categories" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "tips", children: "Tips & Tricks" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "tournaments", children: "Tournament Updates" })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ExpandableSection, { title: "Sort", icon: /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4" }), expanded: true, children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { className: "text-xs text-muted-foreground mb-1.5 block", children: "Sort by" }),
      /* @__PURE__ */ jsxs(Select, { value: filters.age, onValueChange: (value) => setFilters({
        ...filters,
        age: value
      }), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Most Recent" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "recent", children: "Most Recent" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "popular", children: "Most Popular" })
        ] })
      ] })
    ] }) })
  ] });
  const leftPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3", children: /* @__PURE__ */ jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: /* @__PURE__ */ jsxs(TabsList, { className: "w-full bg-transparent p-0", children: [
      /* @__PURE__ */ jsx(TabsTrigger, { value: "players", className: "flex-1 data-[state=active]:bg-accent", children: "Players" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "tournaments", className: "flex-1 data-[state=active]:bg-accent", children: "Tournaments" }),
      /* @__PURE__ */ jsx(TabsTrigger, { value: "posts", className: "flex-1 data-[state=active]:bg-accent", children: "Posts" })
    ] }) }) }),
    /* @__PURE__ */ jsxs(ScrollArea, { className: "flex-1 px-4 py-4", children: [
      activeTab === "players" && renderPlayerFilters(),
      activeTab === "tournaments" && renderTournamentFilters(),
      activeTab === "posts" && renderPostFilters()
    ] })
  ] });
  const rightPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col overflow-y-auto", children: [
    activeTab === "players" && /* @__PURE__ */ jsx(DiscoverPlayersTable, { searchQuery, filters: {
      ...filters,
      engagement: ""
    } }),
    activeTab === "tournaments" && /* @__PURE__ */ jsx(DiscoverTournamentsTable, { searchQuery, filters: {
      ...filters,
      engagement: ""
    } }),
    activeTab === "posts" && /* @__PURE__ */ jsx("div", { className: "p-4", children: /* @__PURE__ */ jsx(ActivityFeed, { feedType: "global" }) })
  ] });
  return /* @__PURE__ */ jsx(FeedProvider, { children: /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsx(Button, { children: "Apply Filters" })
    ] }) }),
    /* @__PURE__ */ jsx(ResizableLayout, { leftPanel: {
      content: leftPanelContent,
      label: "Filters",
      icon: Filter,
      defaultSize: 30,
      minSize: 20,
      maxSize: 40,
      minWidth: "20rem"
    }, rightPanel: {
      content: rightPanelContent,
      label: "Results",
      icon: Search,
      defaultSize: 70
    }, defaultTab: "right", className: "flex-1" })
  ] }) });
}
export {
  DiscoverPage as component
};
