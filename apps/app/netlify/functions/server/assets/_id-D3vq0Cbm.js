import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Link, notFound } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { C as Card, d as CardContent, e as CardFooter, a as CardHeader, b as CardTitle } from "./card-CNeVhZxM.js";
import { B as Button, f as Route } from "./router-CozkPsbM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-B5vlBfAE.js";
import { MoreVertical, MapPin, Trophy, TrendingUp, Activity, Clock, Target, Medal, User } from "lucide-react";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { u as useIsMobile } from "./use-mobile-BsFue-bT.js";
import { F as FargoRatingCard, E as Empty, a as EmptyHeader, b as EmptyMedia, c as EmptyTitle, d as EmptyDescription } from "./empty-C3inkdFj.js";
import { formatDistanceToNow } from "date-fns";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
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
import "@radix-ui/react-avatar";
import "react-resizable-panels";
import "./tabs-BPSwp-0A.js";
import "@radix-ui/react-tabs";
import "./expandable-section-DasINGSb.js";
const countryFlags = {
  "US": "🇺🇸",
  "USA": "🇺🇸",
  "CA": "🇨🇦",
  "Canada": "🇨🇦",
  "UK": "🇬🇧",
  "GB": "🇬🇧",
  "DE": "🇩🇪",
  "Germany": "🇩🇪",
  "FR": "🇫🇷",
  "France": "🇫🇷",
  "ES": "🇪🇸",
  "Spain": "🇪🇸",
  "IT": "🇮🇹",
  "Italy": "🇮🇹",
  "AU": "🇦🇺",
  "Australia": "🇦🇺",
  "JP": "🇯🇵",
  "Japan": "🇯🇵",
  "MX": "🇲🇽",
  "Mexico": "🇲🇽"
  // Add more as needed
};
function EnhancedPlayerCard({ player, isOwnProfile = false }) {
  const getCountryFlag = (country) => {
    if (!country) return "🌍";
    return countryFlags[country.toUpperCase()] || countryFlags[country] || "🌍";
  };
  return /* @__PURE__ */ jsx("div", { className: "w-full max-w-sm mx-auto space-y-4", children: /* @__PURE__ */ jsxs(Card, { className: "bg-accent/50 overflow-hidden p-0", children: [
    /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative h-30 bg-gradient-to-br from-blue-600/20 to-purple-600/20", children: [
        /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "absolute top-3 right-3 transition-colors", children: /* @__PURE__ */ jsx(MoreVertical, { size: 20 }) }),
        player.fargoId && /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "bg-black/40 text-white backdrop-blur-sm", children: [
          "ID: ",
          player.fargoId
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "px-6 pt-0 relative -top-12", children: [
        /* @__PURE__ */ jsx("div", { className: "flex justify-center relative", children: /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 overflow-hidden border-4 border-gray-700 shadow-2xl", children: /* @__PURE__ */ jsxs(Avatar, { className: "w-full h-full", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: player.avatarUrl, className: "object-cover" }),
          /* @__PURE__ */ jsx(AvatarFallback, { className: "text-6xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center w-full h-full", children: getCountryFlag(player.country) })
        ] }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-8 mb-6 mt-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-blue-400", children: player.fargoRating || "N/A" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs", children: "Fargo Rate" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold text-green-400", children: player.fargoRobustness || "0" }),
            /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs", children: "Robustness" })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold flex items-center justify-center gap-2", children: [
            player.name,
            player.isVerified && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs bg-blue-600 text-white", children: "✓" })
          ] }),
          player.city && /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-1 mt-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-gray-400" }),
            /* @__PURE__ */ jsx("p", { className: "text-gray-400 text-sm", children: player.city }),
            /* @__PURE__ */ jsx("span", { className: "text-lg", children: getCountryFlag(player.country) })
          ] }),
          player.league && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "mt-2", children: player.league }),
          player.bio && /* @__PURE__ */ jsx("p", { className: "text-accent-foreground leading-relaxed px-2 mt-4 text-sm", children: player.bio })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(CardFooter, { className: "flex justify-center items-center p-3 border-t-1 bg-accent/50 gap-2", children: isOwnProfile ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-full", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/players/$id/edit", params: { id: player._id }, children: "Edit Profile" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-full", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/tournaments", children: [
        /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
        "Find Tournaments"
      ] }) })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-full", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/players/$id", params: { id: player._id }, children: "View Profile" }) }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", className: "rounded-full", children: "Message" })
    ] }) })
  ] }) });
}
function PlayerDetailPage() {
  const {
    id
  } = Route.useParams();
  const playerId = id;
  console.log("PlayerDetailPage rendered with id:", playerId);
  const player = useQuery(api.players.getById, {
    id: playerId
  });
  console.log("Player query result:", player);
  const currentUser = useCurrentUser();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState("tournaments");
  const [tournamentRole, setTournamentRole] = useState("player");
  const organizedTournaments = useQuery(api.players.getOrganizedTournaments, player ? {
    playerId
  } : "skip");
  const managedTournaments = useQuery(api.players.getManagedTournaments, player ? {
    playerId
  } : "skip");
  const playedTournaments = useQuery(api.players.getPlayedTournaments, player ? {
    playerId
  } : "skip");
  const matches = useQuery(api.matches.getByPlayerId, player ? {
    playerId,
    limit: 100
  } : "skip");
  console.log("Checking loading state - player:", player, "organizedTournaments:", organizedTournaments, "managedTournaments:", managedTournaments, "playedTournaments:", playedTournaments, "matches:", matches);
  if (player === void 0 || organizedTournaments === void 0 || managedTournaments === void 0 || playedTournaments === void 0 || matches === void 0) {
    console.log("Still loading...");
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-64", children: /* @__PURE__ */ jsx("div", { className: "text-lg", children: "Loading player data..." }) });
  }
  if (!player) {
    console.error("Player not found for id:", playerId);
    throw notFound();
  }
  console.log("Player found, rendering page:", player.name);
  const isOwnProfile = currentUser?.user?.playerId === playerId;
  const totalMatches = matches?.length || 0;
  const wins = matches?.filter((match) => match.winnerId === playerId).length || 0;
  const losses = totalMatches - wins;
  const winRate = totalMatches > 0 ? (wins / totalMatches * 100).toFixed(1) : "0";
  const currentTournaments = tournamentRole === "organizer" ? organizedTournaments || [] : tournamentRole === "manager" ? managedTournaments || [] : playedTournaments || [];
  const leftPanelContent = /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsx(EnhancedPlayerCard, { player: {
      _id: player._id,
      name: player.name,
      fargoId: player.fargoId || void 0,
      fargoRating: player.fargoRating ?? void 0,
      fargoRobustness: player.fargoRobustness ?? void 0,
      city: player.city || void 0,
      country: void 0,
      // TODO: Add country field to player schema
      avatarUrl: player.avatarUrl || void 0,
      isVerified: player.isVerified,
      league: player.league || void 0,
      bio: player.bio || void 0
    }, isOwnProfile }),
    /* @__PURE__ */ jsx(FargoRatingCard, { player: {
      _id: player._id,
      name: player.name,
      fargoRating: player.fargoRating ?? void 0,
      fargoRobustness: player.fargoRobustness ?? void 0,
      fargoReadableId: player.fargoId || void 0
    } })
  ] }) });
  const rightPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 flex justify-end items-center gap-2 p-4 pb-4 border-b bg-background", children: [
      /* @__PURE__ */ jsxs(Button, { variant: viewMode === "tournaments" ? "secondary" : "outline", size: "sm", onClick: () => setViewMode("tournaments"), children: [
        /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
        "Tournaments (",
        currentTournaments.length,
        ")"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: viewMode === "statistics" ? "secondary" : "outline", size: "sm", onClick: () => setViewMode("statistics"), children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 mr-2" }),
        "Statistics"
      ] }),
      /* @__PURE__ */ jsxs(Button, { variant: viewMode === "matches" ? "secondary" : "outline", size: "sm", onClick: () => setViewMode("matches"), children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 mr-2" }),
        "Match History (",
        totalMatches,
        ")"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4", children: [
      viewMode === "tournaments" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(Button, { variant: tournamentRole === "organizer" ? "default" : "outline", size: "sm", onClick: () => setTournamentRole("organizer"), children: [
              "ORGANIZER (",
              (organizedTournaments || []).length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: tournamentRole === "manager" ? "default" : "outline", size: "sm", onClick: () => setTournamentRole("manager"), children: [
              "MANAGER (",
              (managedTournaments || []).length,
              ")"
            ] }),
            /* @__PURE__ */ jsxs(Button, { variant: tournamentRole === "player" ? "default" : "outline", size: "sm", onClick: () => setTournamentRole("player"), children: [
              "PLAYER (",
              (playedTournaments || []).length,
              ")"
            ] })
          ] }),
          isOwnProfile && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/tournaments", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
            "Find Tournaments"
          ] }) })
        ] }),
        currentTournaments.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: currentTournaments.map((tournament) => /* @__PURE__ */ jsx(Card, { className: "hover:bg-accent/50 transition-colors", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium", children: tournament.name }),
              tournament.venue && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }),
                /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
                  tournament.venue.name,
                  tournament.venue.city && `, ${tournament.venue.city}`,
                  tournament.venue.state && `, ${tournament.venue.state}`
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: tournament.status === "completed" ? "default" : "secondary", children: tournament.status })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx("span", { children: formatDistanceToNow(new Date(tournament.date), {
                  addSuffix: true
                }) })
              ] }),
              tournament.entryFee && /* @__PURE__ */ jsxs("div", { className: "text-green-400", children: [
                "$",
                tournament.entryFee
              ] })
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/tournaments/$id", params: {
              id: tournament._id
            }, children: "View Details" }) })
          ] })
        ] }) }, tournament._id)) }) : /* @__PURE__ */ jsxs(Empty, { children: [
          /* @__PURE__ */ jsxs(EmptyHeader, { children: [
            /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Trophy, {}) }),
            /* @__PURE__ */ jsxs(EmptyTitle, { children: [
              tournamentRole === "organizer" && "No tournaments organized yet",
              tournamentRole === "manager" && "No tournaments managed yet",
              tournamentRole === "player" && "No tournaments played yet"
            ] }),
            /* @__PURE__ */ jsxs(EmptyDescription, { children: [
              tournamentRole === "organizer" && "This player hasn't organized any tournaments yet",
              tournamentRole === "manager" && "This player hasn't managed any tournaments yet",
              tournamentRole === "player" && "This player hasn't participated in any tournaments yet"
            ] })
          ] }),
          isOwnProfile && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/tournaments", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
            "Browse Tournaments"
          ] }) })
        ] })
      ] }),
      viewMode === "statistics" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6", children: [
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Target, { className: "h-4 w-4 text-green-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Win Rate" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold text-green-500", children: [
              winRate,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              wins,
              " wins, ",
              losses,
              " losses"
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 text-blue-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Total Matches" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-blue-500", children: totalMatches }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "All time" })
          ] }) }),
          /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-yellow-500" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: "Tournaments" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-500", children: (playedTournaments || []).length }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Participated" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Performance Breakdown" }) }),
          /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Recent Form (Last 10 matches)" }),
              /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: (matches || []).slice(-10).map((match, index) => /* @__PURE__ */ jsx("div", { className: `w-3 h-3 rounded-full ${match.winnerId === playerId ? "bg-green-500" : "bg-red-500"}` }, match._id || index)) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Longest Win Streak" }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Coming Soon" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Average Rating Change" }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Coming Soon" })
            ] })
          ] }) })
        ] })
      ] }),
      viewMode === "matches" && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "Recent Matches" }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Filter" }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Export" })
          ] })
        ] }),
        (matches || []).length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3", children: (matches || []).slice(0, 10).map((match) => /* @__PURE__ */ jsx(Card, { className: "hover:bg-accent/50 transition-colors", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: match.player1Name }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: match.player1Score || 0 })
              ] }),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "vs" }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: match.player2Name }),
                /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: match.player2Score || 0 })
              ] }),
              match.winnerId && /* @__PURE__ */ jsx(Medal, { className: `h-4 w-4 ${match.winnerId === playerId ? "text-yellow-500" : "text-gray-400"}` })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm text-muted-foreground", children: [
              /* @__PURE__ */ jsx("span", { children: match.tournamentName }),
              match.tournament?.gameType && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: match.tournament.gameType.replace("_", " ") }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx("span", { children: formatDistanceToNow(new Date(match.playedAt), {
                  addSuffix: true
                }) })
              ] })
            ] })
          ] }),
          match.tournament && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", asChild: true, children: /* @__PURE__ */ jsx(Link, { to: "/tournaments/$id", params: {
            id: match.tournament._id
          }, children: "View Details" }) })
        ] }) }) }, match._id)) }) : /* @__PURE__ */ jsxs(Empty, { children: [
          /* @__PURE__ */ jsxs(EmptyHeader, { children: [
            /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Activity, {}) }),
            /* @__PURE__ */ jsx(EmptyTitle, { children: "No matches played yet" }),
            /* @__PURE__ */ jsx(EmptyDescription, { children: "This player hasn't played any matches yet" })
          ] }),
          isOwnProfile && /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/tournaments", children: [
            /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
            "Find Tournaments to Play"
          ] }) })
        ] })
      ] })
    ] })
  ] });
  return /* @__PURE__ */ jsx(ResizableLayout, { isMobile, defaultTab: "right", leftPanel: {
    content: leftPanelContent,
    label: "Player Card",
    icon: User,
    defaultSize: 25,
    minSize: 10,
    maxSize: 35,
    minWidth: "20rem"
  }, rightPanel: {
    content: rightPanelContent,
    label: "Stats & History",
    icon: TrendingUp,
    defaultSize: 75
  } });
}
export {
  PlayerDetailPage as component
};
