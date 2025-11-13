import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { Link, notFound } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { useState } from "react";
import { u as useIsMobile } from "./use-mobile-BsFue-bT.js";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { E as EnhancedUserCard, N as NearbyVenues } from "./nearby-venues-BZxt3vGT.js";
import { E as Empty, a as EmptyHeader, b as EmptyMedia, c as EmptyTitle, d as EmptyDescription, e as EmptyContent, F as FargoRatingCard } from "./empty-C3inkdFj.js";
import { A as ActivityFeed } from "./activity-feed-CTh6Zvln.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPSwp-0A.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-CNeVhZxM.js";
import { B as Button, a as Route } from "./router-CozkPsbM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CvQ4KYcO.js";
import { Trophy, TrendingUp, Activity, MapPin, Clock, Medal, Target, Users } from "lucide-react";
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
import "react-resizable-panels";
import "./input-DCxY3WWX.js";
import "./profile-avatar--lu5GzhZ.js";
import "./avatar-B5vlBfAE.js";
import "@radix-ui/react-avatar";
import "country-flag-icons";
import "./expandable-section-DasINGSb.js";
import "sonner";
import "./navigation-button-DrYMr2Yp.js";
import "./tooltip-DeKNATFQ.js";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
import "class-variance-authority";
import "./textarea-CRbQQyBj.js";
import "./tournament-utils-BsxWYtEj.js";
import "./use-image-upload-BDsUfsQO.js";
import "@radix-ui/react-tabs";
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
import "zod";
import "clsx";
import "@radix-ui/react-slot";
import "tailwind-merge";
function UserActivityStats({ userId, isOwnProfile = false }) {
  const [tournamentFilter, setTournamentFilter] = useState("organizer");
  const organizerTournaments = useQuery(api.tournaments.getByOrganizer, { userId });
  const playerRegistrations = useQuery(api.tournamentRegistrations.getByUser, { userId });
  const userProfile = useQuery(api.users.getProfile, { userId });
  const venues = useQuery(api.venues.list, {});
  const matchesData = useQuery(api.matches.getByUserId, { userId, limit: 100 });
  const matches = matchesData || [];
  const getTournaments = () => {
    switch (tournamentFilter) {
      case "organizer":
        return organizerTournaments || [];
      case "manager":
        return [];
      case "player":
        const tournamentMap = /* @__PURE__ */ new Map();
        playerRegistrations?.forEach((r) => {
          if (r.tournament && r.tournament._id) {
            tournamentMap.set(r.tournament._id, r.tournament);
          }
        });
        return Array.from(tournamentMap.values());
      default:
        return [];
    }
  };
  const tournaments = getTournaments();
  const uniquePlayerTournaments = (() => {
    const tournamentMap = /* @__PURE__ */ new Map();
    playerRegistrations?.forEach((r) => {
      if (r.tournament && r.tournament._id) {
        tournamentMap.set(r.tournament._id, r.tournament);
      }
    });
    return tournamentMap.size;
  })();
  const userPlayerIds = /* @__PURE__ */ new Set();
  if (userProfile?.playerId) {
    userPlayerIds.add(userProfile.playerId);
  }
  const completedMatches = matches.filter((m) => {
    if (m.status !== "completed") {
      return false;
    }
    const isPlayer1 = m.player1Id ? userPlayerIds.has(m.player1Id) : false;
    const isPlayer2 = m.player2Id ? userPlayerIds.has(m.player2Id) : false;
    const isUserInMatch = isPlayer1 || isPlayer2;
    if (!isUserInMatch) {
      return false;
    }
    if (!m.winnerId) {
      return false;
    }
    return true;
  });
  const totalMatches = completedMatches.length;
  const wins = completedMatches.filter((m) => {
    return m.winnerId && userPlayerIds.has(m.winnerId);
  }).length;
  const losses = completedMatches.filter((m) => {
    return m.winnerId && !userPlayerIds.has(m.winnerId);
  }).length;
  const winRate = totalMatches > 0 ? (wins / totalMatches * 100).toFixed(1) : "0";
  return /* @__PURE__ */ jsx("div", { className: "w-full", children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "tournaments", className: "w-full", children: [
    /* @__PURE__ */ jsx("div", { className: "w-full mb-6 border-b pb-4", children: /* @__PURE__ */ jsx("div", { className: "flex justify-end w-full", children: /* @__PURE__ */ jsxs(TabsList, { className: "flex gap-2 bg-transparent", children: [
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "tournaments", className: "flex items-center gap-2 h-10", children: [
        /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4" }),
        "Tournaments"
      ] }),
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "statistics", className: "flex items-center gap-2 h-10", children: [
        /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4" }),
        "Statistics"
      ] }),
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "matches", className: "flex items-center gap-2 h-10", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4" }),
        "Matches"
      ] }),
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "venues", className: "flex items-center gap-2 h-10", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
        "Venues"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsxs(TabsContent, { value: "tournaments", className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: tournamentFilter === "organizer" ? "default" : "outline",
              onClick: () => setTournamentFilter("organizer"),
              children: [
                "ORGANIZER (",
                organizerTournaments?.length || 0,
                ")"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: tournamentFilter === "manager" ? "default" : "outline",
              onClick: () => setTournamentFilter("manager"),
              children: "MANAGER (0)"
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: tournamentFilter === "player" ? "default" : "outline",
              onClick: () => setTournamentFilter("player"),
              children: [
                "PLAYER (",
                uniquePlayerTournaments || 0,
                ")"
              ]
            }
          )
        ] }),
        isOwnProfile && /* @__PURE__ */ jsx(Link, { to: "/tournaments", children: /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
          "Find Tournaments"
        ] }) })
      ] }),
      tournaments.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Tournament" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Venue" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          tournamentFilter === "player" && /* @__PURE__ */ jsx(TableHead, { children: "Position" }),
          tournamentFilter === "player" && /* @__PURE__ */ jsx(TableHead, { children: "Winnings" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Entry Fee" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: tournaments.map((tournament) => {
          const registration = tournamentFilter === "player" ? playerRegistrations?.find((r) => r.tournament?._id === tournament._id) : null;
          return /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: tournament.name }),
            /* @__PURE__ */ jsx(TableCell, { children: tournament.venue ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: tournament.venue.name })
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Badge, { variant: tournament.status === "completed" ? "default" : "secondary", children: tournament.status }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 text-muted-foreground" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: formatDistanceToNow(new Date(tournament.date), { addSuffix: true }) })
            ] }) }),
            tournamentFilter === "player" && /* @__PURE__ */ jsx(TableCell, { children: registration?.position ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Medal, { className: `h-4 w-4 ${registration.position === 1 ? "text-yellow-500" : registration.position === 2 ? "text-gray-400" : registration.position === 3 ? "text-orange-600" : "text-muted-foreground"}` }),
              /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: registration.position === 1 ? "1st" : registration.position === 2 ? "2nd" : registration.position === 3 ? "3rd" : `${registration.position}th` })
            ] }) : tournament.status === "completed" ? /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "TBD" }) }),
            tournamentFilter === "player" && /* @__PURE__ */ jsx(TableCell, { children: registration?.winnings ? /* @__PURE__ */ jsxs("span", { className: "text-sm font-semibold text-green-500", children: [
              "$",
              registration.winnings.toLocaleString()
            ] }) : registration?.position && tournament.status === "completed" ? /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "$0" }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: tournament.entryFee ? /* @__PURE__ */ jsxs("span", { className: "text-green-500", children: [
              "$",
              tournament.entryFee
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Free" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Link, { to: "/tournaments/$id", params: { id: tournament._id }, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: "View Details" }) }) })
          ] }, tournament._id);
        }) })
      ] }) : /* @__PURE__ */ jsxs(Empty, { children: [
        /* @__PURE__ */ jsxs(EmptyHeader, { children: [
          /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Trophy, {}) }),
          /* @__PURE__ */ jsxs(EmptyTitle, { children: [
            tournamentFilter === "organizer" && "No tournaments organized yet",
            tournamentFilter === "manager" && "No tournaments managed yet",
            tournamentFilter === "player" && "No tournaments played yet"
          ] }),
          /* @__PURE__ */ jsx(EmptyDescription, { children: isOwnProfile ? /* @__PURE__ */ jsxs(Fragment, { children: [
            tournamentFilter === "organizer" && "Create your first tournament to get started",
            tournamentFilter === "manager" && "You don't have manager access to any tournaments yet",
            tournamentFilter === "player" && "Register for a tournament to start competing"
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            tournamentFilter === "organizer" && "This player hasn't organized any tournaments yet",
            tournamentFilter === "manager" && "This player doesn't manage any tournaments yet",
            tournamentFilter === "player" && "This player hasn't played in any tournaments yet"
          ] }) })
        ] }),
        isOwnProfile && /* @__PURE__ */ jsx(EmptyContent, { children: tournamentFilter === "organizer" ? /* @__PURE__ */ jsx(Link, { to: "/tournaments/new", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Create Tournament" }) }) : tournamentFilter === "player" ? /* @__PURE__ */ jsx(Link, { to: "/tournaments", children: /* @__PURE__ */ jsx(Button, { variant: "outline", children: "Browse Tournaments" }) }) : null })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(TabsContent, { value: "statistics", className: "space-y-4", children: [
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
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-yellow-500", children: tournaments.length }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Participated" })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Performance Breakdown" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: "Recent Form (Last 10 matches)" }),
            /* @__PURE__ */ jsx("div", { className: "flex gap-1", children: completedMatches.length > 0 ? completedMatches.slice(0, 10).map((match, index) => {
              const isWin = match.winnerId && userPlayerIds.has(match.winnerId);
              return /* @__PURE__ */ jsx(
                "div",
                {
                  className: `w-3 h-3 rounded-full ${isWin ? "bg-green-500" : "bg-red-500"}`
                },
                match._id || index
              );
            }) : /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: "No matches yet" }) })
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
    /* @__PURE__ */ jsxs(TabsContent, { value: "matches", className: "space-y-4", children: [
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end mb-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Filter" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", children: "Export" })
      ] }) }),
      matches.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Result" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Opponent" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Score" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Tournament" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Game Type" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Date" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: matches.filter((match) => {
          if (!match.player1Id && !match.player2Id) {
            return false;
          }
          const isPlayer1 = match.player1Id ? userPlayerIds.has(match.player1Id) : false;
          const isPlayer2 = match.player2Id ? userPlayerIds.has(match.player2Id) : false;
          const isUserInMatch = isPlayer1 || isPlayer2;
          if (!isUserInMatch) {
            return false;
          }
          if (match.status !== "completed") {
            return false;
          }
          return true;
        }).slice(0, 50).map((match) => {
          const isPlayer1 = match.player1Id && userPlayerIds.has(match.player1Id);
          const opponentPlayerId = isPlayer1 ? match.player2Id : match.player1Id;
          const opponentPlayer = isPlayer1 ? match.player2 : match.player1;
          const opponentUser = isPlayer1 ? match.player2User : match.player1User;
          const isOpponentUser = opponentUser && opponentUser._id !== userId;
          const isOpponentPlayer = opponentPlayerId && !userPlayerIds.has(opponentPlayerId);
          let opponentName = "Unknown";
          if (isOpponentUser && opponentUser) {
            opponentName = opponentUser.displayName || opponentUser.name || opponentUser.username || "Unknown";
          } else if (isOpponentPlayer && opponentPlayer) {
            opponentName = opponentPlayer.name || "Unknown Player";
          } else if (opponentPlayer) {
            opponentName = opponentPlayer.name || "Opponent";
          }
          const currentUserName = userProfile?.displayName || userProfile?.name || userProfile?.username;
          if (opponentName === currentUserName || opponentUser?._id === userId) {
            opponentName = opponentPlayer?.name || `Player ${opponentPlayerId ? opponentPlayerId.slice(-4) : ""}` || "Opponent";
          }
          const userScore = isPlayer1 ? match.player1Score : match.player2Score;
          const opponentScore = isPlayer1 ? match.player2Score : match.player1Score;
          const userWon = match.winnerId && userPlayerIds.has(match.winnerId);
          const gameTypeLabel = match.tournament?.gameType ? match.tournament.gameType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) : null;
          return /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: match.status === "completed" && match.winnerId ? /* @__PURE__ */ jsx(Medal, { className: `h-4 w-4 ${userWon ? "text-yellow-500" : "text-gray-400"}` }) : /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: match.status === "in_progress" ? "Live" : "Pending" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: opponentName }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: userWon ? "default" : "outline",
                  className: `text-xs ${userWon ? "bg-green-500" : ""}`,
                  children: userScore || 0
                }
              ),
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "-" }),
              /* @__PURE__ */ jsx(
                Badge,
                {
                  variant: !userWon && match.status === "completed" ? "default" : "outline",
                  className: `text-xs ${!userWon && match.status === "completed" ? "bg-red-500" : ""}`,
                  children: opponentScore || 0
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: match.tournament ? /* @__PURE__ */ jsx(
              Link,
              {
                to: "/tournaments/$id",
                params: { id: match.tournament._id },
                className: "text-sm text-primary hover:underline",
                children: match.tournament.name
              }
            ) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: gameTypeLabel ? /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: gameTypeLabel }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: match.completedAt ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
              /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3 text-muted-foreground" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: formatDistanceToNow(new Date(match.completedAt), { addSuffix: true }) })
            ] }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Link, { to: "/tournaments/$id", params: { id: match.tournamentId }, children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: "View Details" }) }) })
          ] }, match._id);
        }) })
      ] }) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "text-center py-8", children: [
        /* @__PURE__ */ jsx(Activity, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-2", children: "No matches played yet" }),
        isOwnProfile && /* @__PURE__ */ jsx(Link, { to: "/tournaments", children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Find Tournaments to Play" }) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(TabsContent, { value: "venues", className: "space-y-4", children: venues && venues.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { children: "Venue Name" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Address" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Location" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: venues.slice(0, 10).map((venue) => {
        const fullAddress = [venue.address, venue.city, venue.state, venue.country].filter(Boolean).join(", ");
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
        return /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: venue.name }),
          /* @__PURE__ */ jsx(TableCell, { children: venue.address ? /* @__PURE__ */ jsx("span", { className: "text-sm", children: venue.address }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
            "a",
            {
              href: mapsUrl,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "flex items-center gap-1 text-blue-500 hover:text-blue-600 hover:underline cursor-pointer",
              children: [
                /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3" }),
                "Open in Google Maps",
                /* @__PURE__ */ jsx("span", { className: "text-sm", children: [venue.city, venue.state, venue.country].filter(Boolean).join(", ") })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              onClick: () => {
                console.log("Navigate to venue:", venue._id);
              },
              children: "View Details"
            }
          ) })
        ] }, venue._id);
      }) })
    ] }) : /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "text-center py-8", children: [
      /* @__PURE__ */ jsx(MapPin, { className: "h-12 w-12 text-muted-foreground mx-auto mb-4" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-2", children: "No venues found nearby" }),
      isOwnProfile && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => {
            console.log("Navigate to venues page");
          },
          children: "Browse All Venues"
        }
      )
    ] }) }) })
  ] }) });
}
function UserProfileClient({ user, isOwnProfile }) {
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState("social");
  const leftPanelContent = /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4", children: [
    /* @__PURE__ */ jsx(
      EnhancedUserCard,
      {
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          bio: user.bio,
          image: user.image,
          followerCount: user.followerCount,
          followingCount: user.followingCount,
          interests: user.interests,
          playerId: user.playerId
        },
        isOwnProfile
      }
    ),
    user.player && /* @__PURE__ */ jsx(FargoRatingCard, { player: user.player }),
    /* @__PURE__ */ jsx(NearbyVenues, { userId: user._id, limit: 5 })
  ] }) });
  const rightPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-shrink-0 flex justify-end items-center gap-2 p-4 pb-4 border-b bg-background", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: viewMode === "social" ? "secondary" : "outline",
          size: "sm",
          onClick: () => setViewMode("social"),
          children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-2" }),
            "Social Feed"
          ]
        }
      ),
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: viewMode === "activity" ? "secondary" : "outline",
          size: "sm",
          onClick: () => setViewMode("activity"),
          children: [
            /* @__PURE__ */ jsx(Activity, { className: "h-4 w-4 mr-2" }),
            "Activity & Stats"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-y-auto p-4", children: viewMode === "social" ? /* @__PURE__ */ jsx(
      ActivityFeed,
      {
        userId: user._id,
        feedType: "user",
        showComposer: isOwnProfile
      }
    ) : /* @__PURE__ */ jsx(
      UserActivityStats,
      {
        userId: user._id,
        isOwnProfile
      }
    ) })
  ] });
  return /* @__PURE__ */ jsx(
    ResizableLayout,
    {
      isMobile,
      defaultTab: "right",
      leftPanel: {
        content: leftPanelContent,
        label: "Profile",
        icon: Users,
        defaultSize: 25,
        minSize: 10,
        maxSize: 35,
        minWidth: "20rem"
      },
      rightPanel: {
        content: rightPanelContent,
        label: "Content",
        icon: TrendingUp,
        defaultSize: 75
      }
    }
  );
}
function UserProfilePage() {
  const {
    username
  } = Route.useParams();
  const currentUser = useCurrentUser();
  const user = useQuery(api.users.getByUsername, {
    username
  });
  const userProfile = useQuery(api.users.getProfile, user?._id ? {
    userId: user._id
  } : "skip");
  if (user === void 0 || userProfile === void 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("div", { className: "text-muted-foreground", children: "Loading..." }) });
  }
  if (!user) {
    throw notFound();
  }
  const isOwnProfile = currentUser?.convexUser?._id === user._id;
  return /* @__PURE__ */ jsx(UserProfileClient, { user: {
    _id: user._id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    image: userProfile?.imageUrl,
    followerCount: user.followerCount,
    followingCount: user.followingCount,
    interests: user.interests,
    playerId: user.playerId,
    player: userProfile?.player ? {
      _id: userProfile.player._id,
      name: userProfile.player.name || void 0,
      fargoRating: userProfile.player.fargoRating ?? void 0,
      fargoRobustness: userProfile.player.fargoRobustness ?? void 0,
      fargoReadableId: userProfile.player.fargoReadableId || void 0
    } : null
  }, isOwnProfile });
}
export {
  UserProfilePage as component
};
