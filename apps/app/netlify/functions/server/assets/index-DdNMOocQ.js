import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { c as cn, B as Button } from "./router-CozkPsbM.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CvQ4KYcO.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { C as Card, d as CardContent } from "./card-CNeVhZxM.js";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import { D as Dialog, a as DialogContent } from "./dialog-C0i-cdoB.js";
import { Calendar, MapPin, DollarSign, Trophy, Users, Search, Info, ListFilter, LayoutList, LayoutGrid, Plus } from "lucide-react";
import { g as getGameTypeImage, a as getStatusBadgeProps, f as formatDate, b as getGameTypeLabel } from "./tournament-utils-BsxWYtEj.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { S as ScrollArea } from "./scroll-area-DVprZJU7.js";
import "react-resizable-panels";
import "./tabs-BPSwp-0A.js";
import "@radix-ui/react-tabs";
import "./use-mobile-BsFue-bT.js";
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
import "@radix-ui/react-dialog";
import "@radix-ui/react-scroll-area";
function HoverCard({
  ...props
}) {
  return /* @__PURE__ */ jsx(HoverCardPrimitive.Root, { "data-slot": "hover-card", ...props });
}
function HoverCardTrigger({
  ...props
}) {
  return /* @__PURE__ */ jsx(HoverCardPrimitive.Trigger, { "data-slot": "hover-card-trigger", ...props });
}
function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}) {
  return /* @__PURE__ */ jsx(HoverCardPrimitive.Portal, { "data-slot": "hover-card-portal", children: /* @__PURE__ */ jsx(
    HoverCardPrimitive.Content,
    {
      "data-slot": "hover-card-content",
      align,
      sideOffset,
      className: cn(
        "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
        className
      ),
      ...props
    }
  ) });
}
function TournamentGridCard({ tournament, onView }) {
  const [selectedFlyerUrl, setSelectedFlyerUrl] = useState(null);
  const handleFlyerClick = (flyerUrl, e) => {
    e.stopPropagation();
    setSelectedFlyerUrl(flyerUrl);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(Card, { className: "hover:bg-muted/50 transition-colors cursor-pointer", onClick: () => onView(tournament._id), children: /* @__PURE__ */ jsx(CardContent, { className: "p-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      tournament.flyerUrl && /* @__PURE__ */ jsxs(HoverCard, { children: [
        /* @__PURE__ */ jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: (e) => handleFlyerClick(tournament.flyerUrl, e),
            className: "w-full relative group cursor-pointer",
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src: tournament.flyerUrl,
                alt: `${tournament.name} flyer`,
                className: "w-full h-48 object-cover rounded-lg border-2 border-border hover:border-primary transition-colors"
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsx(HoverCardContent, { className: "w-80 p-0", side: "top", align: "center", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: tournament.flyerUrl,
            alt: `${tournament.name} flyer preview`,
            className: "w-full h-auto rounded"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: getGameTypeImage(tournament.gameType).imageSrc,
              alt: getGameTypeImage(tournament.gameType).alt,
              width: 40,
              height: 40,
              className: "rounded-full flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg line-clamp-2", children: tournament.name }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
              "by ",
              tournament.organizerName
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { variant: getStatusBadgeProps(tournament.status).variant, children: getStatusBadgeProps(tournament.status).text })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { children: formatDate(tournament.date) })
        ] }),
        tournament.venue?.name && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { className: "line-clamp-1", children: tournament.venue.name })
        ] }),
        tournament.entryFee !== void 0 && tournament.entryFee !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { children: [
            "$",
            tournament.entryFee
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsxs("span", { children: [
            getGameTypeLabel(tournament.gameType),
            " • ",
            tournament.type.replace("_", " ")
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(
        Button,
        {
          className: "w-full",
          size: "sm",
          variant: "outline",
          onClick: (e) => {
            e.stopPropagation();
            onView(tournament._id);
          },
          children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-2" }),
            "View Details"
          ]
        }
      )
    ] }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!selectedFlyerUrl, onOpenChange: (open) => !open && setSelectedFlyerUrl(null), children: /* @__PURE__ */ jsx(DialogContent, { className: "max-w-4xl p-0", showCloseButton: true, children: selectedFlyerUrl && /* @__PURE__ */ jsx(
      "img",
      {
        src: selectedFlyerUrl,
        alt: "Tournament flyer",
        className: "w-full h-auto rounded-lg"
      }
    ) }) })
  ] });
}
function TournamentList({ statusFilter, viewMode = "list", searchQuery = "" }) {
  const navigate = useNavigate();
  const [selectedFlyerUrl, setSelectedFlyerUrl] = useState(null);
  const tournaments = useQuery(api.tournaments.list, {
    status: statusFilter === "all" ? void 0 : statusFilter
  });
  const handleViewTournament = (tournamentId) => {
    navigate({ to: `/tournaments/${tournamentId}` });
  };
  const handleFlyerClick = (flyerUrl, e) => {
    e.stopPropagation();
    setSelectedFlyerUrl(flyerUrl);
  };
  if (tournaments === void 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full p-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4 animate-pulse" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Loading tournaments..." })
    ] }) });
  }
  let filteredTournaments = tournaments || [];
  if (searchQuery) {
    const searchLower = searchQuery.toLowerCase();
    filteredTournaments = filteredTournaments.filter((tournament) => {
      return tournament.name.toLowerCase().includes(searchLower) || tournament.venue?.name?.toLowerCase().includes(searchLower) || tournament.organizerName?.toLowerCase().includes(searchLower);
    });
  }
  if (filteredTournaments.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full p-8", children: /* @__PURE__ */ jsx(Card, { className: "max-w-md w-full", children: /* @__PURE__ */ jsxs(CardContent, { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-12 w-12 mx-auto text-muted-foreground mb-4" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium mb-2", children: "No tournaments found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: statusFilter === "all" ? searchQuery ? "No tournaments match your search." : "No tournaments have been created yet." : `No ${statusFilter} tournaments found.` }),
      /* @__PURE__ */ jsx(Button, { onClick: () => navigate({ to: "/tournaments/new" }), children: "Create Your First Tournament" })
    ] }) }) });
  }
  if (viewMode === "grid") {
    return /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6", children: filteredTournaments.map((tournament) => /* @__PURE__ */ jsx(
      TournamentGridCard,
      {
        tournament,
        onView: handleViewTournament
      },
      tournament._id
    )) });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsx(Card, { className: "p-0", children: /* @__PURE__ */ jsx(CardContent, { className: "p-0", children: /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Tournament" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Format" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Organizer" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: filteredTournaments.map((tournament) => /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-muted/50", children: [
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          tournament.flyerUrl ? /* @__PURE__ */ jsxs(HoverCard, { children: [
            /* @__PURE__ */ jsx(HoverCardTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: (e) => handleFlyerClick(tournament.flyerUrl, e),
                className: "relative group cursor-pointer",
                children: /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: tournament.flyerUrl,
                    alt: `${tournament.name} flyer`,
                    width: 40,
                    height: 40,
                    className: "rounded object-cover border-2 border-border hover:border-primary transition-colors"
                  }
                )
              }
            ) }),
            /* @__PURE__ */ jsx(HoverCardContent, { className: "w-80 p-0", side: "right", align: "start", children: /* @__PURE__ */ jsx(
              "img",
              {
                src: tournament.flyerUrl,
                alt: `${tournament.name} flyer preview`,
                className: "w-full h-auto rounded"
              }
            ) })
          ] }) : null,
          /* @__PURE__ */ jsx(
            "img",
            {
              src: getGameTypeImage(tournament.gameType).imageSrc,
              alt: getGameTypeImage(tournament.gameType).alt,
              width: 24,
              height: 24,
              className: "rounded-full"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: tournament.name }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground mt-1", children: [
              tournament.organizerName && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Users, { className: "h-3 w-3" }),
                tournament.organizerName
              ] }),
              tournament.venue?.name && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                tournament.venue.name
              ] }),
              tournament.entryFee && /* @__PURE__ */ jsxs("span", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(DollarSign, { className: "h-3 w-3" }),
                "$",
                tournament.entryFee
              ] })
            ] })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 text-sm", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" }),
          formatDate(tournament.date)
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: getGameTypeLabel(tournament.gameType) }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: tournament.type.replace("_", " ") })
        ] }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: getStatusBadgeProps(tournament.status).variant, children: getStatusBadgeProps(tournament.status).text }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.organizerName }) }),
        /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
          Button,
          {
            size: "sm",
            variant: "outline",
            onClick: () => handleViewTournament(tournament._id),
            children: [
              /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-1" }),
              "View"
            ]
          }
        ) })
      ] }, tournament._id)) })
    ] }) }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: !!selectedFlyerUrl, onOpenChange: (open) => !open && setSelectedFlyerUrl(null), children: /* @__PURE__ */ jsx(DialogContent, { className: "max-w-4xl p-0", showCloseButton: true, children: selectedFlyerUrl && /* @__PURE__ */ jsx(
      "img",
      {
        src: selectedFlyerUrl,
        alt: "Tournament flyer",
        className: "w-full h-auto rounded-lg"
      }
    ) }) })
  ] });
}
function TournamentsPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const filters = ["all", "upcoming", "active", "completed"];
  const leftPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3.5", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: filters.map((status) => /* @__PURE__ */ jsx(Button, { variant: statusFilter === status ? "default" : "outline", size: "sm", onClick: () => setStatusFilter(status), className: "flex-1", children: status.charAt(0).toUpperCase() + status.slice(1) }, status)) }) }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4 py-4", children: /* @__PURE__ */ jsx("div", { className: "space-y-3" }) })
  ] });
  const rightPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: viewMode === "list" ? "secondary" : "outline", size: "icon", onClick: () => setViewMode("list"), children: /* @__PURE__ */ jsx(LayoutList, { className: "h-4 w-4" }) }),
        /* @__PURE__ */ jsx(Button, { variant: viewMode === "grid" ? "secondary" : "outline", size: "icon", onClick: () => setViewMode("grid"), children: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-4 w-4" }) })
      ] }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => navigate({
        to: "/tournaments/new"
      }), children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Create Tournament"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsx(TournamentList, { statusFilter, viewMode, searchQuery }) })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-6 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Search tournaments...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
      ] }),
      /* @__PURE__ */ jsx(Button, { children: "Apply Filters" })
    ] }) }),
    /* @__PURE__ */ jsx(ResizableLayout, { leftPanel: {
      content: leftPanelContent,
      label: "Filters",
      icon: ListFilter,
      defaultSize: 25,
      minSize: 20,
      maxSize: 40,
      minWidth: "18rem"
    }, rightPanel: {
      content: rightPanelContent,
      label: "Tournaments",
      icon: Info,
      defaultSize: 75
    }, defaultTab: "right", className: "flex-1" })
  ] });
}
export {
  TournamentsPage as component
};
