import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useCallback, useReducer, createContext, useContext, useMemo } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent, c as CardDescription } from "./card-CNeVhZxM.js";
import { S as ScrollArea } from "./scroll-area-DVprZJU7.js";
import { Clock, Trophy, Users, DollarSign, Search, UserPlus, Star, Plus, Pencil, Trash2, CheckCircle, Loader2, Calculator, Sparkles, Edit2, Save, AlertCircle, CalendarIcon, CheckSquare2, HelpCircle, X, Filter, Medal, Award, Target, TrendingUp, BarChart3, Play, MapPin, ChevronRight, LayoutDashboard, Network, Table as Table$1, Gamepad2, Settings, RefreshCw } from "lucide-react";
import { B as Button, c as cn, e as Route } from "./router-CozkPsbM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { useNavigate } from "@tanstack/react-router";
import { R as RadioGroup, a as RadioGroupItem, A as AddTablesModal, C as Calendar, V as VenueSearch, T as TournamentFlyerUpload } from "./tournament-flyer-upload-CtjPewB5.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, b as DialogTitle, c as DialogDescription } from "./dialog-C0i-cdoB.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CvQ4KYcO.js";
import { A as Avatar, b as AvatarFallback, a as AvatarImage } from "./avatar-B5vlBfAE.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { a as formatFargoRating, b as formatRobustness, s as searchFargoRatePlayers } from "./fargorate-api-CQHsWq4R.js";
import { cva } from "class-variance-authority";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { useForm } from "react-hook-form";
import { C as Checkbox } from "./checkbox-Bd8KRozL.js";
import { T as Textarea } from "./textarea-CRbQQyBj.js";
import { P as Popover, b as PopoverTrigger, a as PopoverContent } from "./popover-BvaypCcm.js";
import styled, { ThemeProvider, css } from "styled-components";
import "deepmerge";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, g as DropdownMenuItem } from "./tooltip-DeKNATFQ.js";
import { f as formatDate } from "./tournament-utils-BsxWYtEj.js";
import { N as NavigationButton } from "./navigation-button-DrYMr2Yp.js";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
import "react-resizable-panels";
import "./tabs-BPSwp-0A.js";
import "@radix-ui/react-tabs";
import "./use-mobile-BsFue-bT.js";
import "@radix-ui/react-scroll-area";
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
import "tailwind-merge";
import "react-day-picker";
import "@radix-ui/react-radio-group";
import "./add-venue-modal-C10x_m-g.js";
import "./venue-image-upload-VPDsqg2T.js";
import "@radix-ui/react-progress";
import "react-dropzone";
import "@radix-ui/react-dialog";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-avatar";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-popover";
import "@radix-ui/react-dropdown-menu";
import "@radix-ui/react-tooltip";
function TournamentDashboard({ tournamentId }) {
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const playerCount = useQuery(api.tournaments.getPlayerCount, { tournamentId });
  const payoutData = useQuery(api.tournaments.getPayoutCalculation, { tournamentId });
  const savedPayoutStructure = useQuery(api.tournaments.getPayoutStructure, { tournamentId });
  if (!tournament) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: "Loading..." });
  }
  const allMatches = matches || [];
  const completedMatches = allMatches.filter((m) => m.status === "completed").length;
  const inProgressMatches = allMatches.filter((m) => m.status === "in_progress").length;
  const upcomingMatches = allMatches.filter((m) => m.status === "pending").length;
  const totalMatches = allMatches.length;
  const completionPercentage = totalMatches > 0 ? Math.round(completedMatches / totalMatches * 100) : 0;
  const venue = useQuery(
    api.venues.getById,
    tournament.venueId ? { id: tournament.venueId } : "skip"
  );
  const formatDate2 = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    });
  };
  return /* @__PURE__ */ jsx(ScrollArea, { className: "h-full", children: /* @__PURE__ */ jsxs("div", { className: "p-6 space-y-6", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Tournament Progress" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
            completionPercentage,
            "% complete (",
            completedMatches,
            " of ",
            totalMatches,
            " matches)"
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-1", children: inProgressMatches > 0 && `${inProgressMatches} match${inProgressMatches !== 1 ? "es" : ""} in progress` })
        ] }),
        tournament.status === "active" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-muted-foreground" }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Tournament is LIVE" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Tournament Details" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "space-y-3", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Name" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.name }),
          tournamentId && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [
            "ID: ",
            tournamentId
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Description" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.description || "-" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Start Date" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: formatDate2(tournament.date) })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "End Date" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.status === "completed" ? "Tournament completed" : "Invalid Date" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Venue" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: venue ? /* @__PURE__ */ jsx("span", { className: "text-blue-500 hover:underline cursor-pointer", children: venue.name }) : tournament.venue ? tournament.venue : "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Player Type" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.playerType?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Singles" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Tournament Type" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            tournament.type?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Single",
            " Elimination"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Game Type" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm flex items-center gap-2", children: tournament.gameType?.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Nine Ball" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Winners Race To" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.winnersRaceTo || "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Losers Race To" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: tournament.losersRaceTo || "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Finals Race To" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: "N/A" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Bracket Size" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: playerCount?.total || 0 })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Players" }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            playerCount?.total || 0,
            " Players"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "text-sm font-medium text-muted-foreground", children: "Rating System" }),
          /* @__PURE__ */ jsx("div", { className: "text-sm", children: "N/A" })
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5" }),
          "MATCHES (",
          totalMatches,
          ")"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Completed: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: completedMatches })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "In progress: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: inProgressMatches })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Upcoming: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: upcomingMatches })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Users, { className: "h-5 w-5" }),
          "PLAYERS (",
          playerCount?.total || 0,
          ")"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Confirmed: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: playerCount?.checkedIn || 0 })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Unconfirmed: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: (playerCount?.total || 0) - (playerCount?.checkedIn || 0) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Waiting list: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: "0" })
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5" }),
          "PAYOUTS"
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Collected: " }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              "$",
              payoutData?.totalCollected.toFixed(2) || "0.00"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Entry fee: " }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
              "$",
              tournament.entryFee || 0
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "House fee: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: savedPayoutStructure?.houseFeePerPlayer ? `$${savedPayoutStructure.houseFeePerPlayer.toFixed(2)}/player` : "$0.00" })
          ] }),
          savedPayoutStructure?.payoutStructure && /* @__PURE__ */ jsxs("div", { className: "text-sm pt-2 border-t", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Pot amount: " }),
            /* @__PURE__ */ jsxs("span", { className: "font-medium text-green-600", children: [
              "$",
              savedPayoutStructure.payoutStructure.potAmount.toFixed(2)
            ] })
          ] }),
          savedPayoutStructure?.payoutStructure && savedPayoutStructure.payoutStructure.payouts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Payout places: " }),
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: savedPayoutStructure.payoutStructure.payouts.length })
          ] })
        ] }) })
      ] })
    ] })
  ] }) });
}
function TablesPlayersView({ tournamentId, onManagePlayers }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const registrations = useQuery(api.tournaments.getRegistrations, { tournamentId });
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const addLatePlayerToBracket = useMutation(api.matches.addLatePlayerToBracket);
  const bracketExists = matches && matches.length > 0;
  const playersInBracket = new Set(
    matches?.flatMap((m) => [m.player1Id, m.player2Id].filter(Boolean)) || []
  );
  const isPlayerInBracket = (playerId) => {
    return playerId ? playersInBracket.has(playerId) : false;
  };
  const handleAddToBracket = async (playerId) => {
    try {
      await addLatePlayerToBracket({ tournamentId, playerId });
      alert("Player added to bracket successfully!");
    } catch (error) {
      console.error("Failed to add player to bracket:", error);
      alert(`Failed to add player to bracket: ${error?.message || "Unknown error"}`);
    }
  };
  const totalPlayers = registrations?.length || 0;
  const checkedInPlayers = registrations?.filter((r) => r.checkedIn).length || 0;
  const eliminatedPlayers = 0;
  const filteredPlayers = registrations?.filter((reg) => {
    if (!searchQuery) return true;
    const name = reg.player?.name || reg.user?.name || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  }) || [];
  return /* @__PURE__ */ jsx("div", { className: "flex flex-col h-full", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-auto flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        Input,
        {
          placeholder: "Search by player name",
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          className: "flex-1"
        }
      ),
      /* @__PURE__ */ jsx(Button, { size: "icon", variant: "outline", children: /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "px-4 py-3 border-b", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 text-sm", children: [
      /* @__PURE__ */ jsxs("span", { children: [
        "Total players: ",
        totalPlayers
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Players left: ",
        checkedInPlayers
      ] }),
      /* @__PURE__ */ jsxs("span", { children: [
        "Eliminated: ",
        eliminatedPlayers
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto px-4 py-4", children: filteredPlayers.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-0", children: filteredPlayers.map((registration) => {
      const playerName = registration.player?.name || registration.user?.name || "Unknown";
      const playerCountry = registration.player?.city || registration.user?.country;
      const getFlagEmoji = (country) => {
        if (!country) return null;
        const countryMap = {
          "US": "🇺🇸",
          "USA": "🇺🇸",
          "United States": "🇺🇸"
        };
        return countryMap[country] || null;
      };
      const flagEmoji = getFlagEmoji(playerCountry);
      const canAddToBracket = registration.checkedIn && bracketExists && !isPlayerInBracket(registration.player?._id);
      return /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center justify-between py-3 border-b last:border-b-0",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "-" }),
              /* @__PURE__ */ jsx("span", { className: "flex-1 truncate", children: playerName }),
              flagEmoji && /* @__PURE__ */ jsx("span", { className: "text-lg shrink-0", children: flagEmoji })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              canAddToBracket && /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "secondary",
                  size: "sm",
                  onClick: () => registration.player?._id && handleAddToBracket(registration.player._id),
                  title: "Add player to bracket",
                  children: /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4" })
                }
              ),
              /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: /* @__PURE__ */ jsx(Star, { className: "h-4 w-4" }) })
            ] })
          ]
        },
        registration._id
      );
    }) }) : /* @__PURE__ */ jsx("div", { className: "text-center text-gray-400 py-8", children: "No players found" }) }),
    /* @__PURE__ */ jsx("div", { className: "px-4 py-4 border-t", children: /* @__PURE__ */ jsx(
      Button,
      {
        variant: "outline",
        className: "w-full",
        onClick: () => {
          if (onManagePlayers) {
            onManagePlayers();
          } else {
            navigate({ to: "/tournaments/$id", params: { id: tournamentId } });
          }
        },
        children: "Manage Players"
      }
    ) })
  ] }) });
}
function EditTableModal({ open, onOpenChange, table, onUpdateTable }) {
  const [formData, setFormData] = useState({
    label: "",
    manufacturer: "",
    size: "8 Foot",
    isLiveStreaming: false,
    liveStreamUrl: "",
    status: "OPEN"
  });
  const [isSaving, setIsSaving] = useState(false);
  const manufacturersList = [
    "Aileex",
    "Blackball",
    "Brunswick",
    "Diamond",
    "Gabriels",
    "Heiron & Smith",
    "Imperial",
    "Joy",
    "Min",
    "Olhausen",
    "Olio",
    "Pot Black",
    "Predator",
    "Rasson",
    "Shender",
    "Star",
    "Supreme",
    "Valley",
    "Wiraka",
    "Xing Pai",
    "Other"
  ];
  const sizes = [
    "6.5 Foot",
    "7 Foot",
    "8 Foot",
    "9 Foot",
    "10 Foot",
    "12 Foot"
  ];
  useEffect(() => {
    if (table) {
      setFormData({
        label: table.label || "",
        manufacturer: table.manufacturer || "",
        size: table.size || "8 Foot",
        isLiveStreaming: table.isLiveStreaming ?? false,
        liveStreamUrl: table.liveStreamUrl || "",
        status: table.status || "OPEN"
      });
    }
  }, [table]);
  const handleSave = async () => {
    if (!table) return;
    setIsSaving(true);
    try {
      await onUpdateTable(table._id, {
        label: formData.label,
        manufacturer: formData.manufacturer,
        size: formData.size,
        isLiveStreaming: formData.isLiveStreaming,
        liveStreamUrl: formData.liveStreamUrl,
        status: formData.status
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update table:", error);
      alert("Failed to update table. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleClose = () => {
    if (table) {
      setFormData({
        label: table.label || "",
        manufacturer: table.manufacturer || "",
        size: table.size || "8 Foot",
        isLiveStreaming: table.isLiveStreaming ?? false,
        liveStreamUrl: table.liveStreamUrl || "",
        status: table.status || "OPEN"
      });
    }
    onOpenChange(false);
  };
  if (!table) return null;
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: handleClose, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-semibold", children: "Edit Table" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "label", children: "* Label" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "label",
            value: formData.label,
            onChange: (e) => setFormData({ ...formData, label: e.target.value }),
            placeholder: "How to refer to this table (e.g. Table 1)"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "manufacturer", children: "Manufacturer" }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            value: formData.manufacturer,
            onValueChange: (value) => setFormData({ ...formData, manufacturer: value }),
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a manufacturer" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: manufacturersList.map((manufacturer) => /* @__PURE__ */ jsx(SelectItem, { value: manufacturer, children: manufacturer }, manufacturer)) })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Size" }),
        /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: sizes.map((size) => /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: formData.size === size ? "default" : "outline",
            size: "sm",
            onClick: () => setFormData({ ...formData, size }),
            children: size
          },
          size
        )) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Live Streaming table" }),
        /* @__PURE__ */ jsx(
          RadioGroup,
          {
            value: formData.isLiveStreaming ? "yes" : "no",
            onValueChange: (value) => setFormData({ ...formData, isLiveStreaming: value === "yes" }),
            children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx(RadioGroupItem, { value: "yes", id: "streaming-yes" }),
                /* @__PURE__ */ jsx(Label, { htmlFor: "streaming-yes", children: "Yes" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                /* @__PURE__ */ jsx(RadioGroupItem, { value: "no", id: "streaming-no" }),
                /* @__PURE__ */ jsx(Label, { htmlFor: "streaming-no", children: "No" })
              ] })
            ] })
          }
        )
      ] }),
      formData.isLiveStreaming && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "stream-url", children: "Live Stream URL" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "stream-url",
            value: formData.liveStreamUrl,
            onChange: (e) => setFormData({ ...formData, liveStreamUrl: e.target.value }),
            placeholder: "https://www.domain.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["OPEN", "CLOSED", "IN_USE"].map((status) => /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: formData.status === status ? "default" : "outline",
            size: "sm",
            onClick: () => setFormData({ ...formData, status }),
            children: status
          },
          status
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t mt-6", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: handleClose,
          disabled: isSaving,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "default",
          onClick: handleSave,
          disabled: isSaving || !formData.label,
          children: isSaving ? "Updating..." : "Update Table"
        }
      )
    ] })
  ] }) });
}
function TablesManagement({ tournamentId }) {
  const [activeTab, setActiveTab] = useState("all");
  const [showAddTablesModal, setShowAddTablesModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [deletingTable, setDeletingTable] = useState(null);
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const tables = useQuery(api.tournaments.getTables, { tournamentId }) || [];
  const addTables = useMutation(api.tournaments.addTables);
  const updateTable = useMutation(api.tournaments.updateTable);
  const deleteTable = useMutation(api.tournaments.deleteTable);
  const getPlayersForTable = (tableNumber) => {
    return matches?.filter((m) => m.tableNumber === tableNumber) || [];
  };
  const filteredTables = tables.filter((table) => {
    if (activeTab === "all") return true;
    if (activeTab === "in_use") {
      const tableNum = table.tableNumber || table.startNumber;
      return table.status === "IN_USE" || getPlayersForTable(tableNum).length > 0;
    }
    return true;
  });
  const handleAddTables = async (newTables, importVenueId) => {
    try {
      if (importVenueId) {
        console.log("Venue table import not yet implemented");
        return;
      }
      if (newTables.length > 0) {
        await addTables({
          tournamentId,
          tables: newTables.map((table) => ({
            label: table.label,
            startNumber: table.startNumber,
            endNumber: table.endNumber,
            manufacturer: table.manufacturer,
            size: table.size,
            isLiveStreaming: table.isLiveStreaming,
            liveStreamUrl: table.liveStreamUrl,
            status: table.status
          }))
        });
      }
    } catch (error) {
      console.error("Failed to add tables:", error);
      alert("Failed to add tables. Please try again.");
    }
  };
  const handleUpdateTable = async (tableId, updates) => {
    try {
      await updateTable({
        tableId,
        label: updates.label,
        manufacturer: updates.manufacturer,
        size: updates.size,
        isLiveStreaming: updates.isLiveStreaming,
        liveStreamUrl: updates.liveStreamUrl,
        status: updates.status
      });
      setEditingTable(null);
    } catch (error) {
      console.error("Failed to update table:", error);
      throw error;
    }
  };
  const handleDeleteTable = async (tableId) => {
    try {
      await deleteTable({ tableId });
      setDeletingTable(null);
    } catch (error) {
      console.error("Failed to delete table:", error);
      alert(error.message || "Failed to delete table. Please try again.");
    }
  };
  if (!tournament) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsx("div", { children: "Loading..." }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col bg-background", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b bg-card px-4", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-4", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("all"),
          className: `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "all" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "ALL TABLES"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => setActiveTab("in_use"),
          className: `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === "in_use" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`,
          children: "IN USE"
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto px-4 py-6", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsx(
        Card,
        {
          className: "border-2 border-dashed cursor-pointer hover:border-primary transition-colors",
          onClick: () => setShowAddTablesModal(true),
          children: /* @__PURE__ */ jsxs(CardContent, { className: "p-8 flex flex-col items-center justify-center min-h-[300px]", children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-16 w-16 text-muted-foreground mb-4" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-muted-foreground", children: "Add New Table" })
          ] })
        }
      ),
      filteredTables.map((table) => {
        const tableNum = table.tableNumber || table.startNumber;
        const tableMatches = getPlayersForTable(tableNum);
        const isInUse = table.status === "IN_USE" || tableMatches.length > 0;
        const isClosed = table.status === "CLOSED";
        const currentMatch = tableMatches[0];
        return /* @__PURE__ */ jsx(Card, { className: "relative", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            /* @__PURE__ */ jsx("span", { className: "text-lg font-semibold", children: table.label || `Table ${tableNum}` }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              isInUse ? /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded font-medium", children: "IN_USE" }) : isClosed ? /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded font-medium", children: "CLOSED" }) : /* @__PURE__ */ jsx("span", { className: "px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-medium", children: "OPEN" }),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-6 w-6",
                  onClick: () => setEditingTable(table._id),
                  children: /* @__PURE__ */ jsx(Pencil, { className: "h-3 w-3" })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-6 w-6 text-destructive hover:text-destructive",
                  onClick: () => setDeletingTable(table._id),
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-3 w-3" })
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `aspect-video rounded-lg flex items-center justify-center mb-3 relative overflow-hidden ${isClosed ? "bg-gray-900/30" : "bg-blue-900/30"}`, children: /* @__PURE__ */ jsxs("div", { className: "w-full h-full relative", children: [
            /* @__PURE__ */ jsx("div", { className: `absolute inset-2 rounded-lg ${isClosed ? "bg-gray-700" : "bg-blue-700"}` }),
            /* @__PURE__ */ jsx("div", { className: "absolute -top-3 -left-3 w-4 h-4 bg-black rounded-full translate-x-1/2 translate-y-1/2" }),
            /* @__PURE__ */ jsx("div", { className: "absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full" }),
            /* @__PURE__ */ jsx("div", { className: "absolute top-0 left-1/2 w-4 h-4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsx("div", { className: "absolute -bottom-3 -left-3 w-4 h-4 bg-black rounded-full translate-x-1/2 -translate-y-1/2" }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-1 right-1 w-4 h-4 bg-black rounded-full translate-x-1/2 translate-y-1/2" }),
            /* @__PURE__ */ jsx("div", { className: "absolute bottom-0 left-1/2 w-4 h-4 bg-black rounded-full -translate-x-1/2 translate-y-1/2" }),
            isInUse && currentMatch ? /* @__PURE__ */ jsx("div", { className: "absolute inset-0 flex flex-col items-center justify-center p-4", children: /* @__PURE__ */ jsxs("div", { className: "w-full space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🇺🇸" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: currentMatch.player1?.name || "TBD" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "px-2 py-1 bg-background rounded text-xs font-medium", children: currentMatch.player1Score || 0 })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-lg", children: "🇺🇸" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: currentMatch.player2?.name || "TBD" })
                ] }),
                /* @__PURE__ */ jsx("div", { className: "px-2 py-1 bg-background rounded text-xs font-medium", children: currentMatch.player2Score || 0 })
              ] })
            ] }) }) : isClosed ? /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center text-white font-medium text-lg", children: "CLOSED" }) : /* @__PURE__ */ jsx("span", { className: "absolute inset-0 flex items-center justify-center text-muted-foreground font-medium text-lg", children: "OPEN" })
          ] }) }),
          isInUse && currentMatch && /* @__PURE__ */ jsxs("div", { className: "space-y-2 mt-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              "Match ",
              currentMatch.round || 1,
              " ",
              currentMatch.bracketType === "winner" ? `(W${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})` : currentMatch.bracketType === "loser" ? `(L${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})` : `(${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`
            ] }),
            /* @__PURE__ */ jsx("div", { className: "w-full bg-muted rounded-full h-1.5", children: /* @__PURE__ */ jsx("div", { className: "bg-primary h-1.5 rounded-full", style: { width: "0%" } }) }),
            /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground text-right", children: "0%" })
          ] })
        ] }) }, table._id);
      })
    ] }) }),
    /* @__PURE__ */ jsx(
      AddTablesModal,
      {
        open: showAddTablesModal,
        onOpenChange: setShowAddTablesModal,
        onAddTables: handleAddTables
      }
    ),
    /* @__PURE__ */ jsx(
      EditTableModal,
      {
        open: editingTable !== null,
        onOpenChange: (open) => !open && setEditingTable(null),
        table: editingTable ? tables.find((t) => t._id === editingTable) || null : null,
        onUpdateTable: handleUpdateTable
      }
    ),
    /* @__PURE__ */ jsx(Dialog, { open: deletingTable !== null, onOpenChange: (open) => !open && setDeletingTable(null), children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Delete Table" }),
        /* @__PURE__ */ jsx(DialogDescription, { children: "Are you sure you want to delete this table? This action cannot be undone." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => setDeletingTable(null), children: "Cancel" }),
        /* @__PURE__ */ jsx(Button, { variant: "destructive", onClick: () => deletingTable && handleDeleteTable(deletingTable), children: "Delete" })
      ] })
    ] }) })
  ] });
}
function PlayerRegistration({ tournamentId }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("registered");
  const [fargoResults, setFargoResults] = useState([]);
  const [isSearchingFargo, setIsSearchingFargo] = useState(false);
  const [fargoSearchTerm, setFargoSearchTerm] = useState("");
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const tournamentRegistrations = useQuery(api.tournaments.getRegistrations, { tournamentId });
  const allPlayers = useQuery(api.players.search, { searchTerm });
  const fargoIdsExist = useQuery(
    api.players.checkFargoIdsExist,
    fargoResults.length > 0 ? { fargoIds: fargoResults.map((p) => p.id) } : "skip"
  );
  const addPlayer = useMutation(api.tournaments.addPlayer);
  const removePlayer = useMutation(api.tournaments.removePlayer);
  const checkInPlayer = useMutation(api.tournaments.checkInPlayer);
  const updatePaymentStatus = useMutation(api.tournaments.updatePaymentStatus);
  const getOrCreateFromFargoRate = useMutation(api.players.getOrCreateFromFargoRate);
  const addLatePlayerToBracket = useMutation(api.matches.addLatePlayerToBracket);
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const bracketExists = matches && matches.length > 0;
  const playersInBracket = new Set(
    matches?.flatMap((m) => [m.player1Id, m.player2Id].filter(Boolean)) || []
  );
  const isPlayerInBracket = (playerId) => {
    return playerId ? playersInBracket.has(playerId) : false;
  };
  const handleAddPlayer = async (playerId) => {
    try {
      await addPlayer({ tournamentId, playerId });
    } catch (error) {
      console.error("Failed to add player:", error);
      alert("Failed to add player. They may already be registered.");
    }
  };
  const handleRemovePlayer = async (playerId) => {
    try {
      await removePlayer({ tournamentId, playerId });
    } catch (error) {
      console.error("Failed to remove player:", error);
      alert("Failed to remove player.");
    }
  };
  const handleCheckIn = async (playerId) => {
    try {
      await checkInPlayer({ tournamentId, playerId });
      if (bracketExists) {
        try {
          await addLatePlayerToBracket({ tournamentId, playerId });
        } catch (bracketError) {
          console.warn("Failed to add player to bracket:", bracketError);
          if (bracketError?.message?.includes("already in the bracket")) {
          } else {
            alert(`Player checked in, but could not be added to bracket: ${bracketError?.message || "Unknown error"}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to check in player:", error);
      alert("Failed to check in player.");
    }
  };
  const handleAddToBracket = async (playerId) => {
    try {
      await addLatePlayerToBracket({ tournamentId, playerId });
      alert("Player added to bracket successfully!");
    } catch (error) {
      console.error("Failed to add player to bracket:", error);
      alert(`Failed to add player to bracket: ${error?.message || "Unknown error"}`);
    }
  };
  const handleTogglePayment = async (playerId, currentStatus) => {
    try {
      const newStatus = currentStatus === "paid" ? "pending" : "paid";
      await updatePaymentStatus({ tournamentId, playerId, paymentStatus: newStatus });
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Failed to update payment status.");
    }
  };
  const handleFargoSearch = async () => {
    if (!fargoSearchTerm.trim()) {
      setFargoResults([]);
      return;
    }
    setIsSearchingFargo(true);
    try {
      const response = await searchFargoRatePlayers(fargoSearchTerm);
      setFargoResults(response.value || []);
    } catch (error) {
      console.error("Error searching FargoRate players:", error);
      setFargoResults([]);
    } finally {
      setIsSearchingFargo(false);
    }
  };
  const handleAddFargoPlayer = async (fargoPlayer) => {
    try {
      let playerId;
      const existingPlayer = fargoIdsExist?.[fargoPlayer.id];
      if (existingPlayer?.exists && existingPlayer.playerId) {
        playerId = existingPlayer.playerId;
      } else {
        const rating = parseInt(fargoPlayer.effectiveRating);
        playerId = await getOrCreateFromFargoRate({
          fargoId: fargoPlayer.id,
          firstName: fargoPlayer.firstName,
          lastName: fargoPlayer.lastName,
          city: fargoPlayer.location,
          fargoRating: rating
        });
      }
      await addPlayer({ tournamentId, playerId });
      setFargoResults((prev) => prev.filter((p) => p.id !== fargoPlayer.id));
    } catch (error) {
      console.error("Error adding FargoRate player:", error);
      if (error?.message?.includes("already registered")) {
        alert("This player is already registered for this tournament.");
      } else {
        alert(`Failed to add player: ${error?.message || "Unknown error"}`);
      }
    }
  };
  const availablePlayers = allPlayers?.filter(
    (player) => !tournamentRegistrations?.some((reg) => reg.player?._id === player._id)
  ) || [];
  if (!tournament) {
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 h-full", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs(
        Button,
        {
          variant: selectedTab === "registered" ? "default" : "outline",
          onClick: () => setSelectedTab("registered"),
          children: [
            "Registered Players (",
            tournamentRegistrations?.length || 0,
            ")"
          ]
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: selectedTab === "search" ? "default" : "outline",
          onClick: () => setSelectedTab("search"),
          children: "Local Players"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          variant: selectedTab === "fargo" ? "default" : "outline",
          onClick: () => setSelectedTab("fargo"),
          children: "FargoRate Search"
        }
      )
    ] }),
    selectedTab === "registered" && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "h-5 w-5" }),
        "Registered Players"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: tournamentRegistrations && tournamentRegistrations.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Player" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Rating" }),
          /* @__PURE__ */ jsx(TableHead, { children: "League" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Payment" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: tournamentRegistrations.map((registration) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(Avatar, { className: "h-10 w-10", children: /* @__PURE__ */ jsx(AvatarFallback, { children: registration.player?.name?.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2) || registration.user?.name?.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2) || "P" }) }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: registration.player?.name || registration.user?.name || "Unknown" }),
              registration.player?.fargoId && /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
                "Fargo ID: ",
                registration.player.fargoId
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "font-medium", children: registration.player?.fargoRating ? registration.player.fargoRating.toLocaleString() : "N/A" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: registration.player?.league ? /* @__PURE__ */ jsx(Badge, { variant: "outline", children: registration.player.league }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "N/A" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: registration.checkedIn ? /* @__PURE__ */ jsxs(Badge, { variant: "default", className: "flex items-center gap-1 w-fit", children: [
            /* @__PURE__ */ jsx(CheckCircle, { className: "h-3 w-3" }),
            "Checked In"
          ] }) : /* @__PURE__ */ jsxs(Badge, { variant: "secondary", className: "flex items-center gap-1 w-fit", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
            registration.status
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
            Button,
            {
              size: "sm",
              variant: registration.paymentStatus === "paid" ? "default" : "outline",
              onClick: () => registration.player?._id && handleTogglePayment(registration.player._id, registration.paymentStatus),
              className: "flex items-center gap-1",
              children: [
                /* @__PURE__ */ jsx(DollarSign, { className: "h-3 w-3" }),
                registration.paymentStatus === "paid" ? "Paid" : "Unpaid"
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            !registration.checkedIn && /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                onClick: () => registration.player?._id && handleCheckIn(registration.player._id),
                children: [
                  /* @__PURE__ */ jsx(CheckCircle, { className: "h-4 w-4 mr-1" }),
                  "Check In"
                ]
              }
            ),
            registration.checkedIn && bracketExists && !isPlayerInBracket(registration.player?._id) && /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "secondary",
                onClick: () => registration.player?._id && handleAddToBracket(registration.player._id),
                title: "Add player to bracket",
                children: [
                  /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4 mr-1" }),
                  "Add to Bracket"
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => registration.player?._id && handleRemovePlayer(registration.player._id),
                children: [
                  /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-1" }),
                  "Remove"
                ]
              }
            )
          ] }) })
        ] }, registration._id)) })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
        /* @__PURE__ */ jsx(UserPlus, { className: "h-12 w-12 mx-auto mb-4" }),
        /* @__PURE__ */ jsx("p", { children: "No players registered yet." }),
        /* @__PURE__ */ jsx("p", { children: 'Use the "Add Players" tab to register players for this tournament.' })
      ] }) })
    ] }),
    selectedTab === "search" && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-5 w-5" }),
        "Add Local Players to Tournament"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Search players...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value)
          }
        ) }) }),
        availablePlayers.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Player" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Rating" }),
            /* @__PURE__ */ jsx(TableHead, { children: "League" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: availablePlayers.map((player) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx(Avatar, { className: "h-10 w-10", children: /* @__PURE__ */ jsx(AvatarFallback, { children: player.name.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2) }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium", children: player.name }),
                player.fargoId && /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
                  "Fargo ID: ",
                  player.fargoId
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "font-medium", children: player.fargoRating ? player.fargoRating.toLocaleString() : "N/A" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: player.league ? /* @__PURE__ */ jsx(Badge, { variant: "outline", children: player.league }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "N/A" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
              Button,
              {
                size: "sm",
                onClick: () => handleAddPlayer(player._id),
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                  "Add"
                ]
              }
            ) })
          ] }, player._id)) })
        ] }) : searchTerm ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          'No available players found for "',
          searchTerm,
          '".'
        ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Search for local players to add to the tournament." })
      ] }) })
    ] }),
    selectedTab === "fargo" && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Search, { className: "h-5 w-5" }),
        "Search FargoRate Players"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(
            Input,
            {
              placeholder: "Search FargoRate players by name...",
              value: fargoSearchTerm,
              onChange: (e) => setFargoSearchTerm(e.target.value),
              onKeyDown: (e) => e.key === "Enter" && handleFargoSearch()
            }
          ) }),
          /* @__PURE__ */ jsx(Button, { onClick: handleFargoSearch, disabled: isSearchingFargo, children: isSearchingFargo ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Search, { className: "h-4 w-4" }) })
        ] }),
        fargoResults.length > 0 ? /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Player" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Location" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Rating" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Robustness" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: fargoResults.map((player) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
              /* @__PURE__ */ jsx(Avatar, { className: "h-10 w-10", children: /* @__PURE__ */ jsxs(AvatarFallback, { children: [
                player.firstName.charAt(0),
                player.lastName.charAt(0)
              ] }) }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "font-medium", children: [
                  player.firstName,
                  " ",
                  player.lastName
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
                  "ID: ",
                  player.readableId
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "text-sm", children: player.location || "N/A" }) }),
            /* @__PURE__ */ jsxs(TableCell, { children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium", children: formatFargoRating(player.effectiveRating) }),
              player.provisionalRating !== "0" && /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                "Provisional: ",
                formatFargoRating(player.provisionalRating)
              ] })
            ] }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "text-sm", children: formatRobustness(player.robustness) }) }),
            /* @__PURE__ */ jsx(TableCell, { children: player.provisionalRating !== "0" ? /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Provisional" }) : /* @__PURE__ */ jsx(Badge, { variant: "default", children: "Established" }) }),
            /* @__PURE__ */ jsx(TableCell, { children: (() => {
              const existingPlayer = fargoIdsExist?.[player.id];
              let isAlreadyRegistered = false;
              if (existingPlayer?.exists && existingPlayer.playerId) {
                isAlreadyRegistered = tournamentRegistrations?.some(
                  (reg) => reg.player?._id === existingPlayer.playerId
                ) || false;
              }
              if (!isAlreadyRegistered && tournamentRegistrations) {
                isAlreadyRegistered = tournamentRegistrations.some(
                  (reg) => reg.player?.fargoId === player.id
                );
              }
              if (isAlreadyRegistered) {
                return /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "Already Registered" });
              }
              if (existingPlayer?.exists && existingPlayer.playerId) {
                return /* @__PURE__ */ jsxs(
                  Button,
                  {
                    size: "sm",
                    onClick: () => {
                      if (existingPlayer.playerId) {
                        handleAddPlayer(existingPlayer.playerId);
                      }
                    },
                    children: [
                      /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4 mr-1" }),
                      "Register"
                    ]
                  }
                );
              }
              return /* @__PURE__ */ jsxs(
                Button,
                {
                  size: "sm",
                  onClick: () => handleAddFargoPlayer(player),
                  children: [
                    /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                    "Add & Register"
                  ]
                }
              );
            })() })
          ] }, player.id)) })
        ] }) : fargoSearchTerm && !isSearchingFargo ? /* @__PURE__ */ jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [
          'No FargoRate players found for "',
          fargoSearchTerm,
          '".'
        ] }) : /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-muted-foreground", children: "Search the FargoRate database to find and add players to the tournament." })
      ] }) })
    ] })
  ] });
}
const alertVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive: "text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);
function Alert({
  className,
  variant,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert",
      role: "alert",
      className: cn(alertVariants({ variant }), className),
      ...props
    }
  );
}
function AlertDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "alert-description",
      className: cn(
        "text-muted-foreground col-start-2 grid justify-items-start gap-1 text-sm [&_p]:leading-relaxed",
        className
      ),
      ...props
    }
  );
}
function PayoutCalculation({ tournamentId }) {
  const [houseFeePerPlayer, setHouseFeePerPlayer] = useState(0);
  const [payoutPlaces, setPayoutPlaces] = useState(3);
  const [isManualMode, setIsManualMode] = useState(false);
  const [editingPayouts, setEditingPayouts] = useState([]);
  const payoutData = useQuery(api.tournaments.getPayoutCalculation, { tournamentId });
  const savedPayoutStructure = useQuery(api.tournaments.getPayoutStructure, { tournamentId });
  const generatePayouts = useAction(api.tournaments.generateOptimalPayouts);
  const savePayoutStructure = useMutation(api.tournaments.savePayoutStructure);
  const [payouts, setPayouts] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    if (!savedPayoutStructure) return;
    if (savedPayoutStructure.payoutStructure && !payouts) {
      setPayouts({
        ...savedPayoutStructure.payoutStructure,
        rationale: savedPayoutStructure.payoutStructure.rationale || "Saved payout structure"
      });
      setEditingPayouts(savedPayoutStructure.payoutStructure.payouts.map((p) => ({ ...p })));
    }
    if (savedPayoutStructure.houseFeePerPlayer !== null && savedPayoutStructure.houseFeePerPlayer !== void 0) {
      setHouseFeePerPlayer(savedPayoutStructure.houseFeePerPlayer);
    }
  }, [savedPayoutStructure]);
  const handleGeneratePayouts = async () => {
    setIsGenerating(true);
    setIsManualMode(false);
    try {
      const result = await generatePayouts({
        tournamentId,
        houseFeePerPlayer,
        payoutPlaces
      });
      setPayouts(result);
      setEditingPayouts(result.payouts.map((p) => ({ ...p })));
      await handleSavePayoutStructure(result);
    } catch (error) {
      console.error("Failed to generate payouts:", error);
      alert("Failed to generate payouts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleSavePayoutStructure = async (payoutsToSave) => {
    const structureToSave = payoutsToSave || payouts;
    if (!structureToSave) return;
    setIsSaving(true);
    try {
      await savePayoutStructure({
        tournamentId,
        houseFeePerPlayer,
        payoutStructure: structureToSave
      });
      if (!payoutsToSave) {
        setIsManualMode(false);
      }
    } catch (error) {
      console.error("Failed to save payout structure:", error);
      alert(error?.message || "Failed to save payout structure. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleManualMode = () => {
    if (!payoutData) return;
    setIsManualMode(true);
    if (!payouts) {
      const { totalCollected: totalCollected2, paidPlayers: paidPlayers2 } = payoutData;
      const potAmount = totalCollected2 - houseFeePerPlayer * paidPlayers2;
      setEditingPayouts([{ place: 1, amount: 0, percentage: 0 }]);
      setPayouts({
        totalCollected: totalCollected2,
        houseFee: houseFeePerPlayer * paidPlayers2,
        potAmount,
        paidPlayers: paidPlayers2,
        payouts: [{ place: 1, amount: 0, percentage: 0 }],
        rationale: "Manual payout structure"
      });
    } else {
      setEditingPayouts(payouts.payouts.map((p) => ({ ...p })));
    }
  };
  const handleAddPayoutPlace = () => {
    const newPlace = editingPayouts.length + 1;
    setEditingPayouts([...editingPayouts, { place: newPlace, amount: 0, percentage: 0 }]);
  };
  const handleRemovePayoutPlace = (index) => {
    const newPayouts = editingPayouts.filter((_, i) => i !== index);
    const renumbered = newPayouts.map((p, i) => ({ ...p, place: i + 1 }));
    setEditingPayouts(renumbered);
  };
  const handleUpdatePayoutAmount = (index, amount) => {
    const newPayouts = [...editingPayouts];
    newPayouts[index] = {
      ...newPayouts[index],
      amount,
      percentage: payouts ? amount / payouts.potAmount * 100 : 0
    };
    setEditingPayouts(newPayouts);
  };
  const handleSaveManualPayouts = async () => {
    if (!payouts) return;
    const totalPayouts = editingPayouts.reduce((sum, p) => sum + p.amount, 0);
    const difference = Math.abs(totalPayouts - payouts.potAmount);
    if (difference > 0.01) {
      alert(`Total payouts ($${totalPayouts.toFixed(2)}) must equal pot amount ($${payouts.potAmount.toFixed(2)}). Difference: $${difference.toFixed(2)}`);
      return;
    }
    const updatedPayouts = {
      ...payouts,
      payouts: editingPayouts.map((p) => ({
        ...p,
        percentage: p.amount / payouts.potAmount * 100
      })),
      rationale: "Manual payout structure"
    };
    setPayouts(updatedPayouts);
    await handleSavePayoutStructure(updatedPayouts);
  };
  if (!payoutData) {
    return /* @__PURE__ */ jsx("div", { children: "Loading..." });
  }
  const { entryFee, totalPlayers, paidPlayers, unpaidPlayers, totalCollected } = payoutData;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6 h-full", children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5" }),
        "Payment Summary"
      ] }) }),
      /* @__PURE__ */ jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Entry Fee" }),
            /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
              "$",
              entryFee.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Total Players" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: totalPlayers })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Paid Players" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-green-600", children: paidPlayers })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Unpaid Players" }),
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-orange-600", children: unpaidPlayers })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 pt-4 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { className: "text-lg", children: "Total Collected" }),
          /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold text-green-600", children: [
            "$",
            totalCollected.toFixed(2)
          ] })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Calculator, { className: "h-5 w-5" }),
          "Payout Configuration"
        ] }),
        /* @__PURE__ */ jsx(CardDescription, { children: "Configure house fees and payout structure" })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "houseFeePerPlayer", children: "House Fee Per Player/Team" }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mt-1", children: [
            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "$" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "houseFeePerPlayer",
                type: "number",
                min: "0",
                step: "0.01",
                value: houseFeePerPlayer,
                onChange: (e) => setHouseFeePerPlayer(parseFloat(e.target.value) || 0),
                className: "max-w-[200px]"
              }
            ),
            houseFeePerPlayer > 0 && paidPlayers > 0 && /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
              "= $",
              (houseFeePerPlayer * paidPlayers).toFixed(2),
              " total (",
              paidPlayers,
              " players)"
            ] })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "This amount will be charged per paid player/team" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "payoutPlaces", children: "Number of Payout Places" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "payoutPlaces",
              type: "number",
              min: "1",
              max: paidPlayers,
              value: payoutPlaces,
              onChange: (e) => setPayoutPlaces(parseInt(e.target.value) || 1),
              className: "max-w-[200px] mt-1"
            }
          ),
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [
            "Maximum: ",
            paidPlayers,
            " (based on paid players)"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "pt-4 border-t space-y-2", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              onClick: handleGeneratePayouts,
              disabled: isGenerating || totalCollected === 0,
              className: "flex-1",
              children: isGenerating ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }),
                "Generating..."
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-2" }),
                "Generate Optimal Payouts (AI)"
              ] })
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              onClick: handleManualMode,
              disabled: totalCollected === 0,
              variant: "outline",
              className: "flex-1",
              children: [
                /* @__PURE__ */ jsx(Edit2, { className: "h-4 w-4 mr-2" }),
                payouts ? "Update Payout" : "Manual Entry"
              ]
            }
          )
        ] }) })
      ] }) })
    ] }),
    payouts && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardHeader, { children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(DollarSign, { className: "h-5 w-5" }),
            "Payout Structure"
          ] }),
          isManualMode && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxs(
              Button,
              {
                onClick: handleAddPayoutPlace,
                size: "sm",
                variant: "outline",
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                  "Add Place"
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                onClick: handleSaveManualPayouts,
                size: "sm",
                disabled: isSaving,
                children: isSaving ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 mr-1 animate-spin" }),
                  "Saving..."
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-1" }),
                  "Save"
                ] })
              }
            )
          ] })
        ] }),
        payouts.rationale && !isManualMode && /* @__PURE__ */ jsx(CardDescription, { children: payouts.rationale }),
        isManualMode && /* @__PURE__ */ jsx(CardDescription, { children: "Edit payout amounts manually. Total must equal pot amount." }),
        !isManualMode && payouts && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 mt-2", children: /* @__PURE__ */ jsx(
          Button,
          {
            onClick: () => handleSavePayoutStructure(),
            size: "sm",
            variant: "outline",
            disabled: isSaving,
            children: isSaving ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 mr-1 animate-spin" }),
              "Saving..."
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Save, { className: "h-3 w-3 mr-1" }),
              "Update Saved Structure"
            ] })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Total Collected" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold", children: [
              "$",
              payouts.totalCollected.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "House Fee" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-orange-600", children: [
              "$",
              payouts.houseFee.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Pot Amount" }),
            /* @__PURE__ */ jsxs("div", { className: "text-xl font-bold text-green-600", children: [
              "$",
              payouts.potAmount.toFixed(2)
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(Label, { className: "text-muted-foreground", children: "Total Payouts" }),
            /* @__PURE__ */ jsxs("div", { className: `text-xl font-bold ${isManualMode && Math.abs(
              editingPayouts.reduce((sum, p) => sum + p.amount, 0) - payouts.potAmount
            ) > 0.01 ? "text-red-600" : ""}`, children: [
              "$",
              (isManualMode ? editingPayouts.reduce((sum, p) => sum + p.amount, 0) : payouts.payouts.reduce((sum, p) => sum + p.amount, 0)).toFixed(2)
            ] })
          ] })
        ] }),
        isManualMode && (() => {
          const totalPayouts = editingPayouts.reduce((sum, p) => sum + p.amount, 0);
          const difference = Math.abs(totalPayouts - payouts.potAmount);
          if (difference > 0.01) {
            return /* @__PURE__ */ jsxs(Alert, { variant: "destructive", children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxs(AlertDescription, { children: [
                "Total payouts ($",
                totalPayouts.toFixed(2),
                ") does not match pot amount ($",
                payouts.potAmount.toFixed(2),
                "). Difference: $",
                difference.toFixed(2)
              ] })
            ] });
          }
          return null;
        })(),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Place" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Amount" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Percentage" }),
            isManualMode && /* @__PURE__ */ jsx(TableHead, { children: "Actions" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: (isManualMode ? editingPayouts : payouts.payouts).map((payout, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              payout.place === 1 && /* @__PURE__ */ jsx(Badge, { variant: "default", children: "🥇" }),
              payout.place === 2 && /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: "🥈" }),
              payout.place === 3 && /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "🥉" }),
              /* @__PURE__ */ jsx("span", { className: "font-medium", children: payout.place === 1 ? "1st Place" : payout.place === 2 ? "2nd Place" : payout.place === 3 ? "3rd Place" : `${payout.place}th Place` })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: isManualMode ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "$" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  type: "number",
                  min: "0",
                  step: "0.01",
                  value: payout.amount,
                  onChange: (e) => handleUpdatePayoutAmount(index, parseFloat(e.target.value) || 0),
                  className: "max-w-[150px]"
                }
              )
            ] }) : /* @__PURE__ */ jsxs("div", { className: "text-lg font-bold text-green-600", children: [
              "$",
              payout.amount.toFixed(2)
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
              payout.percentage.toFixed(1),
              "%"
            ] }) }),
            isManualMode && /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
              Button,
              {
                onClick: () => handleRemovePayoutPlace(index),
                size: "sm",
                variant: "ghost",
                disabled: editingPayouts.length === 1,
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
              }
            ) })
          ] }, payout.place)) })
        ] })
      ] }) })
    ] }),
    totalCollected === 0 && /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "pt-6", children: /* @__PURE__ */ jsxs("div", { className: "text-center text-muted-foreground", children: [
      /* @__PURE__ */ jsx(DollarSign, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }),
      /* @__PURE__ */ jsx("p", { children: "No payments collected yet." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm mt-2", children: 'Mark players as "Paid" in the Players tab to calculate payouts.' })
    ] }) }) })
  ] });
}
function AddManagerDialog({
  open,
  onOpenChange,
  tournamentId
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const currentUser = useCurrentUser();
  const searchResults = useQuery(
    api.users.search,
    searchQuery.length >= 1 ? { query: searchQuery, limit: 10 } : "skip"
  );
  const existingManagers = useQuery(api.tournaments.getManagers, {
    tournamentId
  });
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const addManager = useMutation(api.tournaments.addManager);
  const currentUserId = currentUser?.convexUser?._id;
  const filteredResults = searchResults?.filter((user) => {
    if (currentUserId && user._id === currentUserId) return false;
    if (tournament && user._id === tournament.organizerId) return false;
    if (existingManagers?.some((manager) => manager.userId === user._id)) {
      return false;
    }
    return true;
  }) || [];
  const handleAddManager = async () => {
    if (!selectedUserId) return;
    try {
      await addManager({
        tournamentId,
        userId: selectedUserId,
        role: "manager"
      });
      setSearchQuery("");
      setSelectedUserId(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add manager:", error);
      alert(
        error instanceof Error ? error.message : "Failed to add manager"
      );
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "sm:max-w-md", children: [
    /* @__PURE__ */ jsxs(DialogHeader, { children: [
      /* @__PURE__ */ jsx(DialogTitle, { children: "Add Manager" }),
      /* @__PURE__ */ jsx(DialogDescription, { children: "Search for a user to add as a tournament manager." })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            placeholder: "Search by username...",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            className: "pl-9",
            autoFocus: true
          }
        )
      ] }),
      searchQuery.length >= 1 && /* @__PURE__ */ jsx(ScrollArea, { className: "max-h-[300px]", children: searchResults === void 0 ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-8", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin text-muted-foreground" }) }) : filteredResults.length === 0 ? /* @__PURE__ */ jsx("div", { className: "py-8 text-center text-sm text-muted-foreground", children: "No users found" }) : /* @__PURE__ */ jsx("div", { className: "space-y-1", children: filteredResults.map((user) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: `flex items-center gap-3 rounded-md p-3 cursor-pointer transition-colors ${selectedUserId === user._id ? "bg-accent" : "hover:bg-accent/50"}`,
          onClick: () => setSelectedUserId(user._id),
          children: [
            /* @__PURE__ */ jsxs(Avatar, { className: "h-10 w-10", children: [
              /* @__PURE__ */ jsx(AvatarImage, { src: user.image }),
              /* @__PURE__ */ jsx(AvatarFallback, { children: user.displayName?.charAt(0).toUpperCase() || "U" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "font-medium text-sm truncate", children: user.displayName || user.name || "Unknown" }),
              /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground truncate", children: [
                "@",
                user.username
              ] })
            ] }),
            selectedUserId === user._id && /* @__PURE__ */ jsx(UserPlus, { className: "h-4 w-4 text-primary" })
          ]
        },
        user._id
      )) }) }),
      /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-2", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            onClick: () => {
              setSearchQuery("");
              setSelectedUserId(null);
              onOpenChange(false);
            },
            children: "Cancel"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            onClick: handleAddManager,
            disabled: !selectedUserId,
            children: "Add Manager"
          }
        )
      ] })
    ] })
  ] }) });
}
function TournamentSettings({ tournamentId }) {
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const update = useMutation(api.tournaments.update);
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      playerType: "singles",
      type: "single",
      gameType: "eight_ball",
      bracketOrdering: "random_draw"
    }
  });
  const flyerUrl = watch("flyerUrl");
  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        date: new Date(tournament.date),
        time: new Date(tournament.date).toTimeString().slice(0, 5),
        type: tournament.type,
        playerType: tournament.playerType,
        gameType: tournament.gameType,
        bracketOrdering: tournament.bracketOrdering,
        winnersRaceTo: tournament.winnersRaceTo ?? void 0,
        losersRaceTo: tournament.losersRaceTo ?? void 0,
        venueId: tournament.venueId,
        venue: tournament.venue ?? void 0,
        description: tournament.description ?? void 0,
        maxPlayers: tournament.maxPlayers ?? void 0,
        entryFee: tournament.entryFee ?? void 0,
        flyerUrl: tournament.flyerUrl ?? void 0,
        requiresApproval: tournament.requiresApproval,
        allowSelfRegistration: tournament.allowSelfRegistration,
        isPublic: tournament.isPublic
      });
      setSelectedDate(new Date(tournament.date));
      setSelectedTime(new Date(tournament.date).toTimeString().slice(0, 5));
    }
  }, [tournament, reset]);
  const handleExtractInfo = useCallback((info) => {
    if (info.name) setValue("name", info.name, { shouldDirty: true });
    if (info.dateTimestamp) {
      const date = new Date(info.dateTimestamp);
      setSelectedDate(date);
    }
    if (info.time) {
      setSelectedTime(info.time);
      setValue("time", info.time, { shouldDirty: true });
    }
    if (info.venue) setValue("venue", info.venue, { shouldDirty: true });
    if (info.entryFee !== void 0) setValue("entryFee", info.entryFee, { shouldDirty: true });
    if (info.description) setValue("description", info.description, { shouldDirty: true });
    if (info.gameType) setValue("gameType", info.gameType, { shouldDirty: true });
    if (info.playerType) setValue("playerType", info.playerType, { shouldDirty: true });
    if (info.maxPlayers) setValue("maxPlayers", info.maxPlayers, { shouldDirty: true });
  }, [setValue]);
  const handleFlyerUpload = useCallback((url) => {
    setValue("flyerUrl", url);
  }, [setValue]);
  const handleFlyerRemove = useCallback(() => {
    setValue("flyerUrl", void 0);
  }, [setValue]);
  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      let combinedDateTime;
      if (selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours || 0, minutes || 0, 0, 0);
        combinedDateTime = dateTime.getTime();
      } else {
        combinedDateTime = tournament?.date || Date.now();
      }
      const { time, date, ...rest } = data;
      await update({
        tournamentId,
        ...rest,
        date: combinedDateTime,
        bracketOrdering: data.bracketOrdering || "random_draw"
      });
      alert("Tournament updated successfully!");
    } catch (error) {
      console.error("Failed to update tournament:", error);
      alert("Failed to update tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const formatDate2 = (date) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  if (!tournament) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: "Loading..." });
  }
  return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto p-6", children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Save, { className: "h-5 w-5" }),
      "Tournament Settings"
    ] }) }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium border-b pb-2", children: "Basic Information" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Tournament Name *" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "name",
              ...register("name", { required: true }),
              placeholder: "e.g. Summer 9-Ball Open"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "date", children: "Date & Time *" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsxs(Popover, { children: [
                /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    variant: "outline",
                    className: cn(
                      "justify-start text-left font-normal flex-1 select-none focus-visible:ring-offset-2",
                      !selectedDate && "text-muted-foreground"
                    ),
                    children: [
                      /* @__PURE__ */ jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }),
                      formatDate2(selectedDate)
                    ]
                  }
                ) }),
                /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
                  Calendar,
                  {
                    mode: "single",
                    selected: selectedDate,
                    onSelect: setSelectedDate
                  }
                ) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsx(Clock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
                /* @__PURE__ */ jsx(
                  Input,
                  {
                    type: "time",
                    ...register("time", { required: true }),
                    value: selectedTime,
                    onChange: (e) => setSelectedTime(e.target.value),
                    className: "pl-10 w-32 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                  }
                )
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "venue", children: "Venue" }),
            /* @__PURE__ */ jsx(
              VenueSearch,
              {
                value: watch("venueId"),
                onChange: (venueId) => setValue("venueId", venueId),
                placeholder: "Search venues..."
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "flyer", children: "Tournament Flyer" }),
          /* @__PURE__ */ jsx(
            TournamentFlyerUpload,
            {
              onUpload: handleFlyerUpload,
              onRemove: handleFlyerRemove,
              onError: (error) => console.error("File upload error:", error),
              onExtractInfo: handleExtractInfo,
              currentUrl: flyerUrl
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium border-b pb-2", children: "Game Configuration" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "gameType", children: "Game Type *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("gameType", value), value: watch("gameType"), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Game Type" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "eight_ball", children: "8 Ball" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "nine_ball", children: "9 Ball" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "ten_ball", children: "10 Ball" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "one_pocket", children: "One Pocket" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "bank_pool", children: "Bank Pool" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "playerType", children: "Player Type *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("playerType", value), value: watch("playerType"), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Player Type" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "singles", children: "Singles (1v1)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "doubles", children: "Doubles (2v2)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "scotch_doubles", children: "Scotch Doubles (2v2 alternating)" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "teams", children: "Teams" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "type", children: "Tournament Type *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("type", value), value: watch("type"), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Type" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "single", children: "Single Elimination" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "double", children: "Double Elimination" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "scotch_double", children: "Scotch Double" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "teams", children: "Teams" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "round_robin", children: "Round Robin" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "bracketOrdering", children: "Bracket Ordering *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("bracketOrdering", value), value: watch("bracketOrdering"), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Bracket Ordering" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "random_draw", children: "Random Draw" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "seeded_draw", children: "Seeded Draw" })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "winnersRaceTo", children: "Winners Race To" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "winnersRaceTo",
                ...register("winnersRaceTo", { valueAsNumber: true }),
                type: "number",
                placeholder: "e.g. 7",
                min: "1"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "losersRaceTo", children: "Losers Race To" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "losersRaceTo",
                ...register("losersRaceTo", { valueAsNumber: true }),
                type: "number",
                placeholder: "e.g. 5",
                min: "1"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium border-b pb-2", children: "Tournament Settings" }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "maxPlayers", children: "Max Players" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "maxPlayers",
                ...register("maxPlayers", { valueAsNumber: true }),
                type: "number",
                placeholder: "e.g. 32",
                min: "2"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "entryFee", children: "Entry Fee ($)" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "entryFee",
                ...register("entryFee", { valueAsNumber: true }),
                type: "number",
                placeholder: "e.g. 25",
                min: "0",
                step: "0.01"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              id: "description",
              ...register("description"),
              rows: 3,
              placeholder: "Tournament details, rules, prizes, etc."
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "requiresApproval",
                ...register("requiresApproval"),
                checked: watch("requiresApproval"),
                onCheckedChange: (checked) => setValue("requiresApproval", checked === true)
              }
            ),
            /* @__PURE__ */ jsx(
              Label,
              {
                htmlFor: "requiresApproval",
                className: "text-sm font-normal cursor-pointer",
                children: "Requires approval for registration"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "allowSelfRegistration",
                ...register("allowSelfRegistration"),
                checked: watch("allowSelfRegistration"),
                onCheckedChange: (checked) => setValue("allowSelfRegistration", checked === true)
              }
            ),
            /* @__PURE__ */ jsx(
              Label,
              {
                htmlFor: "allowSelfRegistration",
                className: "text-sm font-normal cursor-pointer",
                children: "Allow self-registration"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "isPublic",
                ...register("isPublic"),
                checked: watch("isPublic"),
                onCheckedChange: (checked) => setValue("isPublic", checked === true)
              }
            ),
            /* @__PURE__ */ jsx(
              Label,
              {
                htmlFor: "isPublic",
                className: "text-sm font-normal cursor-pointer",
                children: "Make tournament public"
              }
            )
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 pt-4", children: /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isSubmitting, className: "flex-1", children: isSubmitting ? "Saving..." : "Save Changes" }) })
    ] }) })
  ] }) });
}
const sortAlphanumerically = (a, b) => {
  const collator = new Intl.Collator(void 0, {
    numeric: true,
    sensitivity: "base"
  });
  return collator.compare(a ?? "", b ?? "");
};
function calculateSVGDimensions(numOfRows, numOfColumns, rowHeight, columnWidth, canvasPadding, roundHeader, currentRound = "") {
  const bracketHeight = numOfRows * rowHeight;
  const bracketWidth = numOfColumns * columnWidth;
  const gameHeight = bracketHeight + canvasPadding * 2 + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0);
  const gameWidth = bracketWidth + canvasPadding * 2;
  const startPosition = [
    currentRound ? -(parseInt(currentRound, 10) * columnWidth - canvasPadding * 2) : 0,
    0
  ];
  return { gameWidth, gameHeight, startPosition };
}
const initialState = {
  hoveredMatchId: null,
  hoveredPartyId: null,
  hoveredColumnIndex: null,
  hoveredRowIndex: null
};
const store = createContext({
  state: initialState,
  dispatch: () => {
  }
});
const { Provider } = store;
const MatchContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer((previousState, action) => {
    switch (action.type) {
      case "SET_HOVERED_PARTYID": {
        const { partyId, columnIndex, rowIndex, matchId } = action.payload ?? {};
        return {
          ...previousState,
          hoveredPartyId: partyId ?? null,
          hoveredColumnIndex: columnIndex ?? null,
          hoveredRowIndex: rowIndex ?? null,
          hoveredMatchId: matchId ?? null
        };
      }
      default:
        throw new Error();
    }
  }, initialState);
  return /* @__PURE__ */ jsx(Provider, { value: { state, dispatch }, children });
};
const MATCH_STATES = {
  PLAYED: "PLAYED",
  NO_SHOW: "NO_SHOW",
  WALK_OVER: "WALK_OVER",
  NO_PARTY: "NO_PARTY",
  DONE: "DONE",
  SCORE_DONE: "SCORE_DONE"
};
const defaultStyle = {
  width: 300,
  boxHeight: 110,
  canvasPadding: 25,
  spaceBetweenColumns: 50,
  spaceBetweenRows: 50,
  connectorColor: "rgb(47, 54, 72)",
  connectorColorHighlight: "#DDD",
  roundHeader: {
    isShown: true,
    height: 40,
    marginBottom: 25,
    fontSize: 16,
    fontColor: "white",
    backgroundColor: "rgb(47, 54, 72)",
    fontFamily: '"Roboto", "Arial", "Helvetica", "sans-serif"',
    roundTextGenerator: void 0
  },
  roundSeparatorWidth: 24,
  lineInfo: {
    separation: -13,
    homeVisitorSpread: 0.5
  },
  horizontalOffset: 13,
  wonBywalkOverText: "WO",
  lostByNoShowText: "NS"
};
const getCalculatedStyles = (style = defaultStyle) => {
  const { boxHeight, width, spaceBetweenColumns, spaceBetweenRows } = style;
  const columnWidth = (width ?? defaultStyle.width) + ((spaceBetweenColumns ?? defaultStyle.spaceBetweenColumns) || 0);
  const rowHeight = (boxHeight ?? defaultStyle.boxHeight) + ((spaceBetweenRows ?? defaultStyle.spaceBetweenRows) || 0);
  return { ...style, rowHeight, columnWidth };
};
const generatePreviousRound = (matchesColumn, listOfMatches) => matchesColumn.reduce((result, match) => {
  return [
    ...result,
    ...listOfMatches.filter((m) => m.nextMatchId === match.id).sort((a, b) => sortAlphanumerically(a.name, b.name))
  ];
}, []);
function getPreviousMatches(columnIndex, columns, previousBottomPosition) {
  const previousTopMatch = columnIndex !== 0 ? columns[columnIndex - 1]?.[previousBottomPosition - 1] : void 0;
  const previousBottomMatch = columnIndex !== 0 ? columns[columnIndex - 1]?.[previousBottomPosition] : void 0;
  return { previousTopMatch, previousBottomMatch };
}
function sortTeamsSeedOrder(previousBottomMatch) {
  return (partyA, partyB) => {
    const partyAInBottomMatch = previousBottomMatch?.participants?.find(
      (p) => p.id === partyA.id
    );
    const partyBInBottomMatch = previousBottomMatch?.participants?.find(
      (p) => p.id === partyB.id
    );
    if (partyAInBottomMatch) {
      return 1;
    }
    if (partyBInBottomMatch) {
      return -1;
    }
    return 0;
  };
}
const createEmptyParticipant = () => ({
  id: "",
  name: "",
  isWinner: false,
  status: null,
  resultText: null
});
function MatchComponent({
  rowIndex,
  columnIndex,
  match,
  previousBottomMatch = null,
  teams,
  topText = "",
  bottomText = "",
  style = defaultStyle,
  matchComponent: MatchComponentRenderer,
  onMatchClick,
  onPartyClick,
  x = 0,
  y = 0,
  ...rest
}) {
  const {
    state: { hoveredPartyId },
    dispatch
  } = useContext(store);
  const computedStyles = getCalculatedStyles(style);
  const { width = 300, boxHeight = 70, connectorColor = "" } = computedStyles;
  const sortedTeams = teams.sort(sortTeamsSeedOrder(previousBottomMatch ?? void 0));
  const topParty = sortedTeams?.[0] ?? createEmptyParticipant();
  const bottomParty = sortedTeams?.[1] ?? createEmptyParticipant();
  const topHovered = hoveredPartyId !== null && hoveredPartyId !== void 0 && topParty?.id !== void 0 && hoveredPartyId === topParty.id;
  const bottomHovered = hoveredPartyId !== null && hoveredPartyId !== void 0 && bottomParty?.id !== void 0 && hoveredPartyId === bottomParty.id;
  const participantWalkedOver = (participant) => match.state === MATCH_STATES.WALK_OVER && teams.filter((team) => !!team.id).length < 2 && !!participant.id;
  const topWon = topParty.status === MATCH_STATES.WALK_OVER || participantWalkedOver(topParty) || !!topParty.isWinner;
  const bottomWon = bottomParty.status === MATCH_STATES.WALK_OVER || participantWalkedOver(bottomParty) || !!bottomParty.isWinner;
  const matchState = MATCH_STATES[match.state] ?? match.state;
  const teamNameFallback = {
    [MATCH_STATES.WALK_OVER]: "",
    [MATCH_STATES.NO_SHOW]: "",
    [MATCH_STATES.DONE]: "",
    [MATCH_STATES.SCORE_DONE]: "",
    [MATCH_STATES.NO_PARTY]: ""
  }[matchState] ?? "TBD";
  const resultFallback = (participant) => {
    if (participant.status) {
      return {
        WALKOVER: computedStyles.wonBywalkOverText,
        [MATCH_STATES.WALK_OVER]: computedStyles.wonBywalkOverText,
        [MATCH_STATES.NO_SHOW]: computedStyles.lostByNoShowText,
        [MATCH_STATES.NO_PARTY]: ""
      }[participant.status] ?? "";
    }
    if (participantWalkedOver(participant)) {
      return computedStyles.wonBywalkOverText ?? "";
    }
    return "";
  };
  const onMouseEnter = (partyId) => {
    dispatch({
      type: "SET_HOVERED_PARTYID",
      payload: {
        partyId,
        matchId: match.id,
        rowIndex,
        columnIndex
      }
    });
  };
  const onMouseLeave = () => {
    dispatch({ type: "SET_HOVERED_PARTYID", payload: void 0 });
  };
  const wrappedOnMatchClick = (args) => {
    if (onMatchClick) {
      onMatchClick({
        match: args.match,
        topWon: args.topWon,
        bottomWon: args.bottomWon
      });
    }
  };
  const finalTopParty = {
    ...topParty,
    name: topParty.name || teamNameFallback,
    resultText: topParty.resultText || resultFallback(topParty)
  };
  const finalBottomParty = {
    ...bottomParty,
    name: bottomParty.name || teamNameFallback,
    resultText: bottomParty.resultText || resultFallback(bottomParty)
  };
  return /* @__PURE__ */ jsx(
    "svg",
    {
      width,
      height: boxHeight,
      viewBox: `0 0 ${width} ${boxHeight}`,
      x,
      y,
      ...rest,
      children: /* @__PURE__ */ jsx("foreignObject", { x: 0, y: 0, width, height: boxHeight, children: MatchComponentRenderer && /* @__PURE__ */ jsx(
        MatchComponentRenderer,
        {
          ...{
            match,
            onMatchClick: wrappedOnMatchClick,
            onPartyClick: onPartyClick ?? (() => {
            }),
            onMouseEnter,
            onMouseLeave,
            topParty: finalTopParty,
            bottomParty: finalBottomParty,
            topWon,
            bottomWon,
            topHovered,
            bottomHovered,
            topText: topText ?? "",
            bottomText: bottomText ?? "",
            connectorColor,
            computedStyles,
            teamNameFallback,
            resultFallback
          }
        }
      ) })
    }
  );
}
const Text = styled.text`
  font-family: ${({ theme }) => theme.fontFamily};
  color: ${({ theme }) => theme.textColor.highlighted};
`;
const Rect = styled.rect.attrs(({ theme }) => ({
  fill: theme.roundHeaders.background
}))``;
function RoundHeader({
  x,
  y = 0,
  width,
  roundHeader,
  canvasPadding,
  numOfRounds,
  tournamentRoundText,
  columnIndex
}) {
  if (!roundHeader) {
    return null;
  }
  return /* @__PURE__ */ jsxs("g", { children: [
    /* @__PURE__ */ jsx(
      Rect,
      {
        x,
        y: y + canvasPadding,
        width,
        height: roundHeader.height ?? 0,
        fill: roundHeader.backgroundColor ?? "",
        rx: "3",
        ry: "3"
      }
    ),
    /* @__PURE__ */ jsxs(
      Text,
      {
        x: x + width / 2,
        y: y + canvasPadding + (roundHeader.height ?? 0) / 2,
        style: {
          fontFamily: roundHeader.fontFamily ?? "",
          fontSize: `${roundHeader.fontSize ?? 16}px`,
          color: roundHeader.fontColor ?? ""
        },
        fill: "currentColor",
        dominantBaseline: "middle",
        textAnchor: "middle",
        children: [
          !roundHeader.roundTextGenerator && columnIndex + 1 === numOfRounds && "Final",
          !roundHeader.roundTextGenerator && columnIndex + 1 === numOfRounds - 1 && "Semi-final",
          !roundHeader.roundTextGenerator && columnIndex + 1 < numOfRounds - 1 && `Round ${tournamentRoundText}`,
          roundHeader.roundTextGenerator && roundHeader.roundTextGenerator(columnIndex + 1, numOfRounds)
        ]
      }
    )
  ] });
}
const calculateVerticalStartingPoint$1 = (columnIndex, height) => 2 ** columnIndex * (height / 2) - height / 2;
const columnIncrement$1 = (columnIndex, height) => 2 ** columnIndex * height;
const calculateHeightIncrease$1 = (columnIndex, rowIndex, height) => columnIncrement$1(columnIndex, height) * rowIndex;
const calculateVerticalPositioning$1 = ({
  rowIndex,
  columnIndex,
  rowHeight: height
}) => {
  return calculateHeightIncrease$1(columnIndex, rowIndex, height) + calculateVerticalStartingPoint$1(columnIndex, height);
};
const calculatePositionOfMatch = (rowIndex, columnIndex, { canvasPadding, rowHeight, columnWidth, offsetX = 0, offsetY = 0 }) => {
  const result = calculateVerticalPositioning$1({
    rowHeight,
    rowIndex,
    columnIndex
  });
  return {
    x: columnIndex * columnWidth + canvasPadding + offsetX,
    y: result + canvasPadding + offsetY
  };
};
const useMatchHighlightContext = ({ bracketSnippet = null }) => {
  const {
    state: { hoveredPartyId }
  } = useContext(store);
  const previousTopMatch = bracketSnippet?.previousTopMatch;
  const previousBottomMatch = bracketSnippet?.previousBottomMatch;
  const currentMatch = bracketSnippet?.currentMatch;
  const topHighlighted = currentMatch?.participants?.some((p) => p.id === hoveredPartyId) && previousTopMatch?.participants?.some((p) => p.id === hoveredPartyId);
  const bottomHighlighted = currentMatch?.participants?.some((p) => p.id === hoveredPartyId) && previousBottomMatch?.participants?.some((p) => p.id === hoveredPartyId);
  return { topHighlighted, bottomHighlighted };
};
const Connector = ({
  bracketSnippet,
  previousBottomMatchPosition = null,
  previousTopMatchPosition = null,
  currentMatchPosition,
  style
}) => {
  const calculatedStyles = getCalculatedStyles(style);
  const {
    boxHeight = 0,
    connectorColor = "",
    roundHeader,
    roundSeparatorWidth = 0,
    lineInfo,
    horizontalOffset = 0,
    connectorColorHighlight = "",
    width = 0
  } = calculatedStyles;
  const pathInfo = (multiplier) => {
    const middlePointOfMatchComponent = boxHeight / 2;
    const previousMatch = multiplier > 0 ? previousBottomMatchPosition : previousTopMatchPosition;
    if (!previousMatch) return [];
    const startPoint = `${currentMatchPosition.x - horizontalOffset - (lineInfo?.separation ?? 0)} ${currentMatchPosition.y + (lineInfo?.homeVisitorSpread ?? 0) * multiplier + middlePointOfMatchComponent + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0)}`;
    const horizontalWidthLeft = currentMatchPosition.x - roundSeparatorWidth / 2 - horizontalOffset;
    const isPreviousMatchOnSameYLevel = Math.abs(currentMatchPosition.y - previousMatch.y) < 1;
    const verticalHeight = previousMatch.y + middlePointOfMatchComponent + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0);
    const horizontalWidthRight = previousMatch.x + width;
    if (isPreviousMatchOnSameYLevel) {
      return [`M${startPoint}`, `H${horizontalWidthRight}`];
    }
    return [
      `M${startPoint}`,
      `H${horizontalWidthLeft}`,
      `V${verticalHeight}`,
      `H${horizontalWidthRight}`
    ];
  };
  const { topHighlighted, bottomHighlighted } = useMatchHighlightContext({
    bracketSnippet
  });
  const { x, y } = currentMatchPosition;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    previousTopMatchPosition && /* @__PURE__ */ jsx(
      "path",
      {
        d: pathInfo(-1).join(" "),
        id: `connector-${x}-${y}-${-1}`,
        fill: "transparent",
        stroke: topHighlighted ? connectorColorHighlight : connectorColor
      }
    ),
    previousBottomMatchPosition && /* @__PURE__ */ jsx(
      "path",
      {
        d: pathInfo(1).join(" "),
        id: `connector-${x}-${y}-${1}`,
        fill: "transparent",
        stroke: bottomHighlighted ? connectorColorHighlight : connectorColor
      }
    ),
    topHighlighted && /* @__PURE__ */ jsx("use", { href: `connector-${x}-${y}-${-1}` }),
    bottomHighlighted && /* @__PURE__ */ jsx("use", { href: `connector-${x}-${y}-${1}` })
  ] });
};
const Connectors = ({
  bracketSnippet,
  rowIndex,
  columnIndex,
  style,
  offsetY = 0
}) => {
  const calculatedStyles = getCalculatedStyles(style);
  const {
    columnWidth = 0,
    rowHeight = 0,
    canvasPadding = 0
  } = calculatedStyles;
  const currentMatchPosition = calculatePositionOfMatch(rowIndex, columnIndex, {
    canvasPadding,
    rowHeight,
    columnWidth,
    offsetY
  });
  const previousBottomPosition = (rowIndex + 1) * 2 - 1;
  const previousTopMatchPosition = calculatePositionOfMatch(
    previousBottomPosition - 1,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  );
  const previousBottomMatchPosition = calculatePositionOfMatch(
    previousBottomPosition,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  );
  return /* @__PURE__ */ jsx(
    Connector,
    {
      bracketSnippet,
      previousBottomMatchPosition,
      previousTopMatchPosition,
      currentMatchPosition,
      style
    }
  );
};
const defaultTheme = {
  fontFamily: '"Roboto", "Arial", "Helvetica", "sans-serif"',
  transitionTimingFunction: "cubic-bezier(0, 0.92, 0.77, 0.99)",
  disabledColor: "#5D6371",
  roundHeaders: {
    background: "#2F3648"
  },
  matchBackground: {
    wonColor: "#1D2232",
    lostColor: "#141822"
  },
  border: {
    color: "#22293B",
    highlightedColor: "#707582"
  },
  textColor: {
    highlighted: "#E9EAEC",
    main: "#BEC0C6",
    dark: "#707582",
    disabled: "#5D6371"
  },
  score: {
    text: {
      highlightedWonColor: "#118ADE",
      highlightedLostColor: "#FF9505"
    },
    background: {
      wonColor: "#10131C",
      lostColor: "#10131C"
    }
  },
  canvasBackground: "#0B0D13"
};
const SingleEliminationBracket = ({
  matches,
  matchComponent,
  currentRound,
  onMatchClick,
  onPartyClick,
  svgWrapper: SvgWrapper = ({ children }) => /* @__PURE__ */ jsx("div", { children }),
  theme = defaultTheme,
  options: { style: inputStyle } = {
    style: defaultStyle
  }
}) => {
  const style = {
    ...defaultStyle,
    ...inputStyle,
    roundHeader: {
      ...defaultStyle.roundHeader,
      ...inputStyle?.roundHeader ?? {}
    },
    lineInfo: {
      ...defaultStyle.lineInfo,
      ...inputStyle?.lineInfo ?? {}
    }
  };
  const calculatedStyles = getCalculatedStyles(style);
  const { roundHeader, columnWidth = 0, canvasPadding = 0, rowHeight = 0, width = 0 } = calculatedStyles;
  const lastGame = matches.find((match) => !match.nextMatchId);
  const generateColumn = (matchesColumn) => {
    const previousMatchesColumn = matchesColumn.reduce(
      (result, match) => {
        return [
          ...result,
          ...matches.filter((m) => m.nextMatchId === match.id).sort((a, b) => sortAlphanumerically(a.name, b.name))
        ];
      },
      []
    );
    if (previousMatchesColumn.length > 0) {
      return [...generateColumn(previousMatchesColumn), previousMatchesColumn];
    }
    return [previousMatchesColumn];
  };
  const generate2DBracketArray = (final) => {
    return final ? [...generateColumn([final]), [final]].filter((arr) => arr.length > 0) : [];
  };
  const columns = generate2DBracketArray(lastGame);
  if (columns.length === 0 || !columns[0] || columns[0].length === 0) {
    return /* @__PURE__ */ jsx(ThemeProvider, { theme, children: /* @__PURE__ */ jsx("div", { children: "No bracket data available" }) });
  }
  const { gameWidth, gameHeight, startPosition } = calculateSVGDimensions(
    columns[0].length,
    columns.length,
    rowHeight,
    columnWidth,
    canvasPadding,
    roundHeader ?? defaultStyle.roundHeader,
    currentRound ?? ""
  );
  return /* @__PURE__ */ jsx(ThemeProvider, { theme, children: /* @__PURE__ */ jsx(
    SvgWrapper,
    {
      bracketWidth: gameWidth,
      bracketHeight: gameHeight,
      startAt: startPosition,
      children: /* @__PURE__ */ jsx(
        "svg",
        {
          height: gameHeight,
          width: gameWidth,
          viewBox: `0 0 ${gameWidth} ${gameHeight}`,
          children: /* @__PURE__ */ jsx(MatchContextProvider, { children: /* @__PURE__ */ jsx("g", { children: columns.map(
            (matchesColumn, columnIndex) => matchesColumn.map((match, rowIndex) => {
              const { x, y } = calculatePositionOfMatch(
                rowIndex,
                columnIndex,
                {
                  canvasPadding,
                  columnWidth,
                  rowHeight
                }
              );
              const previousBottomPosition = (rowIndex + 1) * 2 - 1;
              const { previousTopMatch, previousBottomMatch } = getPreviousMatches(
                columnIndex,
                columns,
                previousBottomPosition
              );
              return /* @__PURE__ */ jsxs("g", { children: [
                roundHeader?.isShown && /* @__PURE__ */ jsx(
                  RoundHeader,
                  {
                    x,
                    roundHeader,
                    canvasPadding,
                    width,
                    numOfRounds: columns.length,
                    tournamentRoundText: match.tournamentRoundText ?? "",
                    columnIndex
                  }
                ),
                columnIndex !== 0 && /* @__PURE__ */ jsx(
                  Connectors,
                  {
                    ...{
                      bracketSnippet: {
                        currentMatch: match,
                        previousTopMatch,
                        previousBottomMatch
                      },
                      rowIndex,
                      columnIndex,
                      gameHeight,
                      gameWidth,
                      style
                    }
                  }
                ),
                /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
                  MatchComponent,
                  {
                    x,
                    y: y + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0),
                    rowIndex,
                    columnIndex,
                    match,
                    previousBottomMatch: previousBottomMatch ?? null,
                    topText: match.startTime,
                    bottomText: match.name,
                    teams: match.participants,
                    onMatchClick,
                    onPartyClick,
                    style,
                    matchComponent
                  }
                ) })
              ] }, x + y);
            })
          ) }) })
        }
      )
    }
  ) });
};
const calculateVerticalStartingPoint = (columnIndex, height) => 2 ** columnIndex * (height / 2) - height / 2;
const columnIncrement = (columnIndex, height) => 2 ** columnIndex * height;
const calculateHeightIncrease = (columnIndex, rowIndex, height) => columnIncrement(columnIndex, height) * rowIndex;
const calculateVerticalPositioning = ({
  rowIndex,
  columnIndex,
  rowHeight: height
}) => {
  return calculateHeightIncrease(columnIndex, rowIndex, height) + calculateVerticalStartingPoint(columnIndex, height);
};
const calculatePositionOfFinalGame = (rowIndex, columnIndex, {
  canvasPadding,
  rowHeight,
  columnWidth,
  gameHeight,
  upperBracketHeight,
  lowerBracketHeight,
  offsetX = 0,
  offsetY = 0
}) => {
  const yResult = gameHeight * (lowerBracketHeight / upperBracketHeight) - rowHeight;
  return {
    x: columnIndex * columnWidth + canvasPadding + offsetX,
    y: yResult + canvasPadding + offsetY
  };
};
const calculatePositionOfMatchUpperBracket = (rowIndex, columnIndex, { canvasPadding, rowHeight, columnWidth, offsetX = 0, offsetY = 0 }) => {
  const yResult = calculateVerticalPositioning({
    rowHeight,
    rowIndex,
    columnIndex
  });
  const skipStep = (index) => Math.floor((index + 1) * 2) - 3;
  const xResult = columnIndex === 0 || columnIndex === 1 ? columnIndex * columnWidth : skipStep(columnIndex) * columnWidth;
  return {
    x: xResult + canvasPadding + offsetX,
    y: yResult + canvasPadding + offsetY
  };
};
const returnLowerBracketColumnIndex = (columnIndex) => Math.ceil((columnIndex + 1) / 2) - 1;
const calculatePositionOfMatchLowerBracket = (rowIndex, columnIndex, { canvasPadding, rowHeight, columnWidth, offsetX = 0, offsetY = 0 }) => {
  const result = calculateVerticalPositioning({
    rowHeight,
    rowIndex,
    columnIndex: returnLowerBracketColumnIndex(columnIndex)
  });
  return {
    x: columnIndex * columnWidth + canvasPadding + offsetX,
    y: result + canvasPadding + offsetY
  };
};
const ConnectorsUpper = ({
  bracketSnippet,
  rowIndex,
  columnIndex,
  style,
  offsetY = 0,
  isLowerBracket = false
}) => {
  const calculatedStyles = getCalculatedStyles(style);
  const { columnWidth = 0, rowHeight = 0, canvasPadding = 0 } = calculatedStyles;
  const isUpperSeedingRound = isLowerBracket && columnIndex % 2 !== 0;
  const positioningFunction = isLowerBracket ? calculatePositionOfMatchLowerBracket : calculatePositionOfMatchUpperBracket;
  const currentMatchPosition = positioningFunction(rowIndex, columnIndex, {
    canvasPadding,
    rowHeight,
    columnWidth,
    offsetY
  });
  const previousBottomPosition = isUpperSeedingRound ? rowIndex : (rowIndex + 1) * 2 - 1;
  const previousTopMatchPosition = !isUpperSeedingRound ? positioningFunction(previousBottomPosition - 1, columnIndex - 1, {
    canvasPadding,
    rowHeight,
    columnWidth,
    offsetY
  }) : null;
  const previousBottomMatchPosition = positioningFunction(
    previousBottomPosition,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  );
  return /* @__PURE__ */ jsx(
    Connector,
    {
      bracketSnippet,
      previousBottomMatchPosition,
      previousTopMatchPosition,
      currentMatchPosition,
      style
    }
  );
};
const UpperBracket = ({
  columns,
  calculatedStyles,
  gameHeight,
  gameWidth,
  onMatchClick,
  onPartyClick,
  matchComponent
}) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } = calculatedStyles;
  return columns.map(
    (matchesColumn, columnIndex) => matchesColumn.map((match, rowIndex) => {
      const { x, y } = calculatePositionOfMatchUpperBracket(
        rowIndex,
        columnIndex,
        {
          canvasPadding,
          columnWidth,
          rowHeight
        }
      );
      const previousBottomPosition = (rowIndex + 1) * 2 - 1;
      const { previousTopMatch, previousBottomMatch } = getPreviousMatches(
        columnIndex,
        columns,
        previousBottomPosition
      );
      return /* @__PURE__ */ jsxs("g", { children: [
        columnIndex !== 0 && /* @__PURE__ */ jsx(
          ConnectorsUpper,
          {
            ...{
              bracketSnippet: {
                currentMatch: match,
                previousTopMatch,
                previousBottomMatch
              },
              rowIndex,
              columnIndex,
              gameHeight,
              gameWidth,
              style: calculatedStyles
            }
          }
        ),
        /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
          MatchComponent,
          {
            x,
            y: y + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0),
            rowIndex,
            columnIndex,
            match,
            previousBottomMatch,
            topText: match.startTime,
            bottomText: match.name,
            teams: match.participants,
            onMatchClick,
            onPartyClick,
            style: calculatedStyles,
            matchComponent
          }
        ) })
      ] }, x + y);
    })
  );
};
const ConnectorsLower = ({
  bracketSnippet,
  rowIndex,
  columnIndex,
  style,
  offsetY = 0
}) => {
  const calculatedStyles = getCalculatedStyles(style);
  const { columnWidth = 0, rowHeight = 0, canvasPadding = 0 } = calculatedStyles;
  const isUpperSeedingRound = columnIndex % 2 !== 0;
  const currentMatchPosition = calculatePositionOfMatchLowerBracket(
    rowIndex,
    columnIndex,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  );
  const previousBottomPosition = isUpperSeedingRound ? rowIndex : (rowIndex + 1) * 2 - 1;
  const previousTopMatchPosition = !isUpperSeedingRound ? calculatePositionOfMatchLowerBracket(
    previousBottomPosition - 1,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  ) : null;
  const previousBottomMatchPosition = calculatePositionOfMatchLowerBracket(
    previousBottomPosition,
    columnIndex - 1,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  );
  return /* @__PURE__ */ jsx(
    Connector,
    {
      bracketSnippet,
      previousBottomMatchPosition,
      previousTopMatchPosition,
      currentMatchPosition,
      style
    }
  );
};
const LowerBracket = ({
  columns,
  calculatedStyles,
  gameHeight,
  gameWidth,
  onMatchClick,
  onPartyClick,
  matchComponent,
  upperBracketHeight
}) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } = calculatedStyles;
  return columns.map(
    (matchesColumn, columnIndex) => matchesColumn.map((match, rowIndex) => {
      const { x, y } = calculatePositionOfMatchLowerBracket(
        rowIndex,
        columnIndex,
        {
          canvasPadding,
          columnWidth,
          rowHeight,
          offsetY: upperBracketHeight
        }
      );
      const isUpperSeedingRound = columnIndex % 2 !== 0;
      const previousBottomPosition = isUpperSeedingRound ? rowIndex : (rowIndex + 1) * 2 - 1;
      const { previousTopMatch, previousBottomMatch } = getPreviousMatches(
        columnIndex,
        columns,
        previousBottomPosition
      );
      return /* @__PURE__ */ jsxs("g", { children: [
        columnIndex !== 0 && /* @__PURE__ */ jsx(
          ConnectorsLower,
          {
            ...{
              bracketSnippet: {
                currentMatch: match,
                previousTopMatch: !isUpperSeedingRound ? previousTopMatch : void 0,
                previousBottomMatch
              },
              rowIndex,
              columnIndex,
              gameHeight,
              gameWidth,
              style: calculatedStyles,
              offsetY: upperBracketHeight
            }
          }
        ),
        /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
          MatchComponent,
          {
            x,
            y: y + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0),
            rowIndex,
            columnIndex,
            match,
            previousBottomMatch,
            topText: match.startTime,
            bottomText: match.name,
            teams: match.participants,
            onMatchClick,
            onPartyClick,
            style: calculatedStyles,
            matchComponent
          }
        ) })
      ] }, x + y);
    })
  );
};
function RoundHeaders({
  numOfRounds,
  calculatedStyles: {
    canvasPadding = 0,
    columnWidth = 0,
    rowHeight = 0,
    roundHeader,
    width = 0
  }
}) {
  return /* @__PURE__ */ jsx(Fragment, { children: [...new Array(numOfRounds)].map((matchesColumn, columnIndex) => {
    const { x } = calculatePositionOfMatchLowerBracket(0, columnIndex, {
      canvasPadding,
      columnWidth,
      rowHeight
    });
    return /* @__PURE__ */ jsx("g", { children: roundHeader?.isShown && /* @__PURE__ */ jsx(
      RoundHeader,
      {
        x,
        roundHeader,
        canvasPadding,
        width,
        numOfRounds,
        tournamentRoundText: (columnIndex + 1).toString(),
        columnIndex
      }
    ) }, `round ${x}`);
  }) });
}
const FinalConnectors$1 = ({
  rowIndex,
  columnIndex,
  style,
  bracketSnippet = null,
  offsetY = 0,
  numOfUpperRounds,
  numOfLowerRounds,
  lowerBracketHeight,
  upperBracketHeight,
  gameHeight
}) => {
  const calculatedStyles = getCalculatedStyles(style);
  const { columnWidth = 0, rowHeight = 0, canvasPadding = 0 } = calculatedStyles;
  const currentMatchPosition = calculatePositionOfFinalGame(
    rowIndex,
    columnIndex,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
      lowerBracketHeight,
      upperBracketHeight,
      gameHeight
    }
  );
  const previousTopMatchPosition = calculatePositionOfMatchUpperBracket(
    0,
    numOfUpperRounds - 1,
    // numOfRounds is higher than index by 1 and we need 2nd to last index
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY
    }
  );
  const previousBottomMatchPosition = calculatePositionOfMatchLowerBracket(
    0,
    numOfLowerRounds - 1,
    // numOfRounds is higher than index by 1 and we need 2nd to last index
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY: upperBracketHeight + offsetY
    }
  );
  return /* @__PURE__ */ jsx(
    Connector,
    {
      bracketSnippet,
      previousBottomMatchPosition,
      previousTopMatchPosition,
      currentMatchPosition,
      style
    }
  );
};
const FinalGame = ({
  match,
  rowIndex,
  columnIndex,
  gameHeight,
  gameWidth,
  calculatedStyles,
  onMatchClick,
  onPartyClick,
  matchComponent,
  bracketSnippet,
  numOfUpperRounds,
  numOfLowerRounds,
  upperBracketHeight,
  lowerBracketHeight
}) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } = calculatedStyles;
  const { x, y } = calculatePositionOfFinalGame(rowIndex, columnIndex, {
    canvasPadding,
    columnWidth,
    rowHeight,
    gameHeight,
    upperBracketHeight,
    lowerBracketHeight
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    columnIndex !== 0 && /* @__PURE__ */ jsx(
      FinalConnectors$1,
      {
        ...{
          numOfUpperRounds,
          numOfLowerRounds,
          rowIndex,
          columnIndex,
          gameWidth,
          gameHeight,
          lowerBracketHeight,
          upperBracketHeight,
          style: calculatedStyles,
          bracketSnippet
        }
      }
    ),
    /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
      MatchComponent,
      {
        x,
        y: y + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0),
        rowIndex,
        columnIndex,
        match,
        previousBottomMatch: bracketSnippet.previousBottomMatch ?? null,
        topText: match.startTime,
        bottomText: match.name,
        teams: match.participants,
        onMatchClick,
        onPartyClick,
        style: calculatedStyles,
        matchComponent
      }
    ) })
  ] });
};
const FinalConnectors = ({
  rowIndex,
  columnIndex,
  style,
  bracketSnippet = null,
  offsetY = 0,
  numOfLowerRounds,
  lowerBracketHeight,
  upperBracketHeight,
  gameHeight
}) => {
  const calculatedStyles = getCalculatedStyles(style);
  const { columnWidth = 0, rowHeight = 0, canvasPadding = 0 } = calculatedStyles;
  const currentMatchPosition = calculatePositionOfFinalGame(
    rowIndex,
    columnIndex,
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
      lowerBracketHeight,
      upperBracketHeight,
      gameHeight
    }
  );
  const previousBottomMatchPosition = calculatePositionOfFinalGame(
    0,
    numOfLowerRounds,
    // numOfRounds is higher than index by 1 and we need 2nd to last index
    {
      canvasPadding,
      rowHeight,
      columnWidth,
      offsetY,
      lowerBracketHeight,
      upperBracketHeight,
      gameHeight
    }
  );
  return /* @__PURE__ */ jsx(
    Connector,
    {
      bracketSnippet,
      previousBottomMatchPosition,
      currentMatchPosition,
      style
    }
  );
};
const ExtraFinal = ({
  match,
  rowIndex,
  columnIndex,
  gameHeight,
  gameWidth,
  calculatedStyles,
  onMatchClick,
  onPartyClick,
  matchComponent,
  bracketSnippet,
  numOfUpperRounds,
  numOfLowerRounds,
  upperBracketHeight,
  lowerBracketHeight
}) => {
  const { canvasPadding = 0, columnWidth = 0, rowHeight = 0, roundHeader } = calculatedStyles;
  const { x, y } = calculatePositionOfFinalGame(rowIndex, columnIndex, {
    canvasPadding,
    columnWidth,
    rowHeight,
    gameHeight,
    upperBracketHeight,
    lowerBracketHeight
  });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    columnIndex !== 0 && /* @__PURE__ */ jsx(
      FinalConnectors,
      {
        ...{
          numOfUpperRounds,
          numOfLowerRounds,
          rowIndex,
          columnIndex,
          gameWidth,
          gameHeight,
          lowerBracketHeight,
          upperBracketHeight,
          style: calculatedStyles,
          bracketSnippet
        }
      }
    ),
    /* @__PURE__ */ jsx("g", { children: /* @__PURE__ */ jsx(
      MatchComponent,
      {
        x,
        y: y + (roundHeader?.isShown ? (roundHeader.height ?? 0) + (roundHeader.marginBottom ?? 0) : 0),
        rowIndex,
        columnIndex,
        match,
        previousBottomMatch: bracketSnippet.previousBottomMatch ?? null,
        topText: match.startTime,
        bottomText: match.name,
        teams: match.participants,
        onMatchClick,
        onPartyClick,
        style: calculatedStyles,
        matchComponent
      }
    ) })
  ] });
};
function findTheFinals(matches) {
  const isFinalInUpper = matches.upper.some((match) => !match.nextMatchId);
  const isFinalInLower = matches.lower.some((match) => !match.nextMatchId);
  let convergingMatch;
  let finalsArray = [];
  if (isFinalInLower) {
    const lastUpper = matches.upper.find((match) => {
      const hasNextMatchInUpper = matches.upper.some(
        (m) => m.id === match.nextMatchId
      );
      return !hasNextMatchInUpper;
    });
    if (lastUpper?.nextMatchId) {
      const foundMatch = matches.lower.find(
        (match) => match.id === lastUpper.nextMatchId
      );
      if (foundMatch) {
        convergingMatch = foundMatch;
        const nextMatch = foundMatch.nextMatchId ? matches.lower.find((m) => m.id === foundMatch.nextMatchId) : void 0;
        finalsArray = [
          foundMatch,
          nextMatch
        ].filter((m) => m !== void 0 && m.id !== null && m.id !== void 0);
      }
    }
  }
  if (isFinalInUpper) {
    const lastLower = matches.lower.find((match) => {
      const hasNextMatchInLower = matches.lower.some(
        (m) => m.id === match.nextMatchId
      );
      return !hasNextMatchInLower;
    });
    if (lastLower?.nextMatchId) {
      const foundMatch = matches.upper.find(
        (match) => match.id === lastLower.nextMatchId
      );
      if (foundMatch) {
        convergingMatch = foundMatch;
        const nextMatch = foundMatch.nextMatchId ? matches.upper.find((m) => m.id === foundMatch.nextMatchId) : void 0;
        finalsArray = [
          foundMatch,
          nextMatch
        ].filter((m) => m !== void 0 && m.id !== null && m.id !== void 0);
      }
    }
  }
  return { convergingMatch, finalsArray };
}
const DoubleEliminationBracket = ({
  matches,
  matchComponent,
  currentRound,
  onMatchClick,
  onPartyClick,
  svgWrapper: SvgWrapper = ({ children }) => /* @__PURE__ */ jsx("div", { children }),
  theme = defaultTheme,
  options: { style: inputStyle } = {
    style: defaultStyle
  }
}) => {
  const style = {
    ...defaultStyle,
    ...inputStyle,
    roundHeader: {
      ...defaultStyle.roundHeader,
      ...inputStyle.roundHeader
    },
    lineInfo: {
      ...defaultStyle.lineInfo,
      ...inputStyle.lineInfo
    }
  };
  const calculatedStyles = getCalculatedStyles(style);
  const { roundHeader, columnWidth, canvasPadding, rowHeight } = calculatedStyles;
  const { convergingMatch, finalsArray } = findTheFinals(matches);
  const hasMultipleFinals = finalsArray?.length > 1;
  const generateColumn = (matchesColumn, listOfMatches) => {
    const previousMatchesColumn = generatePreviousRound(
      matchesColumn,
      listOfMatches
    );
    if (previousMatchesColumn.length > 0) {
      return [
        ...generateColumn(previousMatchesColumn, listOfMatches),
        previousMatchesColumn
      ];
    }
    return [previousMatchesColumn];
  };
  const generate2DBracketArray = (final, listOfMatches) => {
    return final ? [...generateColumn([final], listOfMatches), []].filter(
      (arr) => arr.length > 0
    ) : [];
  };
  if (!convergingMatch) {
    return /* @__PURE__ */ jsx(ThemeProvider, { theme, children: /* @__PURE__ */ jsx("div", { children: "No bracket data available" }) });
  }
  const upperColumns = generate2DBracketArray(convergingMatch, matches.upper);
  const lowerColumns = generate2DBracketArray(convergingMatch, matches.lower);
  if (upperColumns.length === 0 || lowerColumns.length === 0 || !upperColumns[0] || !lowerColumns[0]) {
    return /* @__PURE__ */ jsx(ThemeProvider, { theme, children: /* @__PURE__ */ jsx("div", { children: "No bracket data available" }) });
  }
  const totalNumOfRounds = lowerColumns.length + 1 + (hasMultipleFinals ? finalsArray.length - 1 : 0);
  const upperBracketDimensions = calculateSVGDimensions(
    upperColumns[0].length,
    upperColumns.length,
    rowHeight ?? 0,
    columnWidth ?? 0,
    canvasPadding ?? 0,
    roundHeader ?? defaultStyle.roundHeader,
    currentRound ?? ""
  );
  const lowerBracketDimensions = calculateSVGDimensions(
    lowerColumns[0].length,
    lowerColumns.length,
    rowHeight ?? 0,
    columnWidth ?? 0,
    canvasPadding ?? 0,
    roundHeader ?? defaultStyle.roundHeader,
    currentRound ?? ""
  );
  const fullBracketDimensions = calculateSVGDimensions(
    lowerColumns[0].length,
    totalNumOfRounds,
    rowHeight ?? 0,
    columnWidth ?? 0,
    canvasPadding ?? 0,
    roundHeader ?? defaultStyle.roundHeader,
    currentRound ?? ""
  );
  const { gameWidth } = fullBracketDimensions;
  const gameHeight = upperBracketDimensions.gameHeight + lowerBracketDimensions.gameHeight;
  const { startPosition } = upperBracketDimensions;
  return /* @__PURE__ */ jsx(ThemeProvider, { theme, children: /* @__PURE__ */ jsx(
    SvgWrapper,
    {
      bracketWidth: gameWidth,
      bracketHeight: gameHeight,
      startAt: startPosition,
      children: /* @__PURE__ */ jsx(
        "svg",
        {
          height: gameHeight,
          width: gameWidth,
          viewBox: `0 0 ${gameWidth} ${gameHeight}`,
          children: /* @__PURE__ */ jsx(MatchContextProvider, { children: /* @__PURE__ */ jsxs("g", { children: [
            /* @__PURE__ */ jsx(
              RoundHeaders,
              {
                ...{
                  numOfRounds: totalNumOfRounds,
                  calculatedStyles
                }
              }
            ),
            /* @__PURE__ */ jsx(
              UpperBracket,
              {
                ...{
                  columns: upperColumns,
                  calculatedStyles,
                  gameHeight,
                  gameWidth,
                  onMatchClick,
                  onPartyClick,
                  matchComponent
                }
              }
            ),
            /* @__PURE__ */ jsx(
              LowerBracket,
              {
                ...{
                  columns: lowerColumns,
                  calculatedStyles,
                  gameHeight,
                  gameWidth,
                  onMatchClick,
                  onPartyClick,
                  matchComponent,
                  upperBracketHeight: upperBracketDimensions.gameHeight
                }
              }
            ),
            /* @__PURE__ */ jsx(
              FinalGame,
              {
                ...{
                  match: convergingMatch,
                  numOfUpperRounds: upperColumns.length,
                  numOfLowerRounds: lowerColumns.length,
                  bracketSnippet: {
                    previousTopMatch: upperColumns[upperColumns.length - 1]?.[0],
                    previousBottomMatch: lowerColumns[lowerColumns.length - 1]?.[0],
                    currentMatch: convergingMatch
                  },
                  upperBracketHeight: upperBracketDimensions.gameHeight,
                  lowerBracketHeight: lowerBracketDimensions.gameHeight,
                  calculatedStyles,
                  columnIndex: lowerColumns.length,
                  rowIndex: 0,
                  gameHeight,
                  gameWidth,
                  matchComponent,
                  onMatchClick,
                  onPartyClick
                }
              }
            ),
            finalsArray?.length > 1 && finalsArray[1] && /* @__PURE__ */ jsx(
              ExtraFinal,
              {
                ...{
                  match: finalsArray[1],
                  numOfUpperRounds: upperColumns.length,
                  numOfLowerRounds: lowerColumns.length,
                  bracketSnippet: {
                    previousBottomMatch: finalsArray[0],
                    currentMatch: finalsArray[1]
                  },
                  upperBracketHeight: upperBracketDimensions.gameHeight,
                  lowerBracketHeight: lowerBracketDimensions.gameHeight,
                  calculatedStyles,
                  columnIndex: lowerColumns.length + 1,
                  rowIndex: 0,
                  gameHeight,
                  gameWidth,
                  matchComponent,
                  onMatchClick,
                  onPartyClick
                }
              }
            )
          ] }) })
        }
      )
    }
  ) });
};
styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
  height: 100%;
  font-family: ${({ theme }) => theme.fontFamily};
`;
styled.p`
  color: ${({ theme }) => theme.textColor.dark};
  margin-bottom: 0.2rem;
  min-height: 1.25rem;
`;
styled.p`
  color: ${({ theme }) => theme.textColor.dark};

  flex: 0 0 none;
  text-align: center;
  margin-top: 0.2rem;
  min-height: 1.25rem;
`;
styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  justify-content: space-between;
`;
const Team = styled.div``;
const Score = styled.div`
  display: flex;
  height: 100%;
  padding: 0 1rem;
  align-items: center;
  width: 20%;
  justify-content: center;
  background: ${({ theme, won }) => won ? theme.score.background.wonColor : theme.score.background.lostColor};
  color: ${({ theme, won }) => won ? theme.textColor.highlighted : theme.textColor.dark};
`;
styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  padding: 0 0 0 1rem;
  background: ${({ theme, won }) => won ? theme.matchBackground.wonColor : theme.matchBackground.lostColor};

  :first-of-type {
    border-top-right-radius: 3px;
    border-top-left-radius: 3px;
    border-top-width: 2px;
  }
  :last-of-type {
    border-bottom-right-radius: 3px;
    border-bottom-left-radius: 3px;
    border-bottom-width: 2px;
  }
  border-right: 4px solid ${({ theme }) => theme.border.color};
  border-left: 4px solid ${({ theme }) => theme.border.color};
  border-top: 1px solid ${({ theme }) => theme.border.color};
  border-bottom: 1px solid ${({ theme }) => theme.border.color};

  transition: border-color 0.5s ${({ theme }) => theme.transitionTimingFunction};
  ${Team} {
    color: ${({ theme, won }) => won ? theme.textColor.highlighted : theme.textColor.dark};
  }
  ${Score} {
    color: ${({ theme, won }) => won ? theme.textColor.highlighted : theme.textColor.dark};
  }
  ${({ hovered, theme, won }) => hovered && css`
      border-color: ${theme.border.highlightedColor};
      ${Team} {
        color: ${theme.textColor.highlighted};
      }
      ${Score} {
        color: ${won ? theme.score.text.highlightedWonColor : theme.score.text.highlightedLostColor};
      }
    `}
`;
styled.div`
  height: 1px;
  transition: border-color 0.5s ${({ theme }) => theme.transitionTimingFunction};

  border-width: 1px;
  border-style: solid;
  border-color: ${({ highlighted, theme }) => highlighted ? theme.border.highlightedColor : theme.border.color};
`;
styled.a`
  font-family: ${(props) => props.font ? props.font : props.theme.fontFamily};
  font-weight: ${(props) => props.bold ? "700" : "400"};
  color: ${(props) => props.theme.textColor.main};
  font-size: ${(props) => props.size ? props.size : "1rem"};
  line-height: 1.375rem;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;
function MatchDetailModal({
  open,
  onOpenChange,
  match,
  tournamentId
}) {
  const [status, setStatus] = useState("pending");
  const [player1Score, setPlayer1Score] = useState(0);
  const [player2Score, setPlayer2Score] = useState(0);
  const [player1RaceTo, setPlayer1RaceTo] = useState(0);
  const [player2RaceTo, setPlayer2RaceTo] = useState(0);
  const [selectedTable, setSelectedTable] = useState(null);
  const [matchTime, setMatchTime] = useState("");
  const [winnerId, setWinnerId] = useState(null);
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const tables = useQuery(api.tournaments.getTables, { tournamentId }) || [];
  const updateMatch = useMutation(api.matches.updateMatch);
  const updateStatus = useMutation(api.matches.updateStatus);
  const assignTable = useMutation(api.matches.assignTable);
  useEffect(() => {
    if (match) {
      setStatus(match.status);
      setPlayer1Score(match.player1Score);
      setPlayer2Score(match.player2Score);
      setSelectedTable(match.tableNumber ?? null);
      setWinnerId(match.winnerId ?? null);
      if (tournament) {
        const isLoserBracket = match.bracketType === "loser";
        const raceTo = isLoserBracket ? tournament.losersRaceTo ?? tournament.winnersRaceTo ?? 0 : tournament.winnersRaceTo ?? 0;
        setPlayer1RaceTo(raceTo);
        setPlayer2RaceTo(raceTo);
      }
    }
  }, [match, tournament]);
  const handleSave = async () => {
    if (!match) return;
    try {
      const updateData = {
        id: match._id
      };
      if (status !== void 0) updateData.status = status;
      if (player1Score !== void 0) updateData.player1Score = player1Score;
      if (player2Score !== void 0) updateData.player2Score = player2Score;
      const currentTable = match.tableNumber ?? null;
      if (selectedTable !== currentTable) {
        updateData.tableNumber = selectedTable;
      }
      if (winnerId) {
        updateData.winnerId = winnerId;
      }
      await updateMatch(updateData);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to update match:", error);
      alert("Failed to update match. Please try again.");
    }
  };
  const handleStartMatch = async () => {
    if (!match) return;
    try {
      await updateStatus({ id: match._id, status: "in_progress" });
      setStatus("in_progress");
    } catch (error) {
      console.error("Failed to start match:", error);
      alert("Failed to start match. Please try again.");
    }
  };
  const handleRemoveTable = async () => {
    if (!match) return;
    try {
      await assignTable({ id: match._id, tableNumber: void 0 });
      setSelectedTable(null);
    } catch (error) {
      console.error("Failed to remove table:", error);
      alert("Failed to remove table assignment.");
    }
  };
  const getMatchName = () => {
    if (!match) return "";
    const bracketTypeLabel = match.bracketType === "loser" ? "L" : match.bracketType === "grand_final" ? "GF" : "W";
    return `Match ${match.bracketPosition + 1} (${bracketTypeLabel}${match.round}-${match.bracketPosition + 1})`;
  };
  const availableTables = tables.filter(
    (table) => table.status === "OPEN"
  );
  const isLive = status === "in_progress";
  if (!match) return null;
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CheckSquare2, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsx(DialogTitle, { children: getMatchName() })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: isLive && /* @__PURE__ */ jsx(Badge, { variant: "destructive", className: "bg-red-500", children: "LIVE" }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6 mt-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Match Status" }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            value: status,
            onValueChange: (value) => {
              setStatus(value);
              if (value === "in_progress" && status === "pending") {
                handleStartMatch();
              }
            },
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: "Pending" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "in_progress", children: "In Progress" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "completed", children: "Completed" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 font-medium text-sm border-b pb-2", children: [
          /* @__PURE__ */ jsx("div", { children: "Player" }),
          /* @__PURE__ */ jsx("div", { children: "Race To" }),
          /* @__PURE__ */ jsx("div", { children: "Score" }),
          /* @__PURE__ */ jsx("div", { children: "Actions" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 items-center", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              value: match.player1?.name || "TBD",
              disabled: true,
              className: "bg-muted"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              min: "0",
              value: player1RaceTo,
              onChange: (e) => setPlayer1RaceTo(parseInt(e.target.value) || 0),
              className: "w-20"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              min: "0",
              value: player1Score,
              onChange: (e) => {
                const score = parseInt(e.target.value) || 0;
                setPlayer1Score(score);
                if (score >= player1RaceTo && player1RaceTo > 0) {
                  setWinnerId(match.player1Id ?? null);
                  setStatus("completed");
                }
              },
              className: "w-20"
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Actions" }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { children: [
              /* @__PURE__ */ jsx(
                DropdownMenuItem,
                {
                  onClick: () => {
                    setWinnerId(match.player1Id ?? null);
                    setStatus("completed");
                  },
                  children: "Set as Winner"
                }
              ),
              /* @__PURE__ */ jsx(
                DropdownMenuItem,
                {
                  onClick: () => {
                    setPlayer1Score(player1RaceTo);
                    setWinnerId(match.player1Id ?? null);
                    setStatus("completed");
                  },
                  children: "Win by Race To"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4 items-center", children: [
          /* @__PURE__ */ jsx(
            Input,
            {
              value: match.player2?.name || "TBD",
              disabled: true,
              className: "bg-muted"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              min: "0",
              value: player2RaceTo,
              onChange: (e) => setPlayer2RaceTo(parseInt(e.target.value) || 0),
              className: "w-20"
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2", children: /* @__PURE__ */ jsx(
            Input,
            {
              type: "number",
              min: "0",
              value: player2Score,
              onChange: (e) => {
                const score = parseInt(e.target.value) || 0;
                setPlayer2Score(score);
                if (score >= player2RaceTo && player2RaceTo > 0) {
                  setWinnerId(match.player2Id ?? null);
                  setStatus("completed");
                }
              },
              className: "w-20"
            }
          ) }),
          /* @__PURE__ */ jsxs(DropdownMenu, { children: [
            /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "outline", size: "sm", children: "Actions" }) }),
            /* @__PURE__ */ jsxs(DropdownMenuContent, { children: [
              /* @__PURE__ */ jsx(
                DropdownMenuItem,
                {
                  onClick: () => {
                    setWinnerId(match.player2Id ?? null);
                    setStatus("completed");
                  },
                  children: "Set as Winner"
                }
              ),
              /* @__PURE__ */ jsx(
                DropdownMenuItem,
                {
                  onClick: () => {
                    setPlayer2Score(player2RaceTo);
                    setWinnerId(match.player2Id ?? null);
                    setStatus("completed");
                  },
                  children: "Win by Race To"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Assign open table" }),
          /* @__PURE__ */ jsx(HelpCircle, { className: "h-4 w-4 text-muted-foreground" })
        ] }),
        /* @__PURE__ */ jsxs(
          Select,
          {
            value: selectedTable?.toString() || "",
            onValueChange: (value) => {
              if (value) {
                setSelectedTable(parseInt(value));
              } else {
                setSelectedTable(null);
              }
            },
            children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a table" }) }),
              /* @__PURE__ */ jsx(SelectContent, { children: availableTables.map((table) => {
                const tableNum = table.tableNumber || table.startNumber;
                return /* @__PURE__ */ jsx(SelectItem, { value: tableNum.toString(), children: tableNum }, table._id);
              }) })
            ]
          }
        ),
        selectedTable && /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: handleRemoveTable,
            className: "mt-2 text-destructive",
            children: [
              /* @__PURE__ */ jsx(X, { className: "h-4 w-4 mr-2" }),
              "Remove table assignment"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-end pt-4 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Button, { variant: "default", onClick: handleSave, children: "Save" }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => onOpenChange(false), children: "Cancel" })
      ] }) })
    ] })
  ] }) });
}
function TournamentBracket({ matches, tournamentType, tournamentId }) {
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const playerCount = useQuery(
    api.tournaments.getPlayerCount,
    tournamentId ? { tournamentId } : "skip"
  );
  const selectedMatch = useMemo(() => {
    if (!selectedMatchId || !matches) return null;
    return matches.find((m) => m._id === selectedMatchId);
  }, [selectedMatchId, matches]);
  const handleMatchClick = (args) => {
    const backendMatch = matches?.find((m) => m._id === args.match.id);
    if (backendMatch) {
      setSelectedMatchId(args.match.id);
      setShowMatchModal(true);
    }
  };
  const bracketData = useMemo(() => {
    if (!matches || matches.length === 0) {
      return null;
    }
    const playersInMatches = new Set(
      matches.flatMap((m) => [m.player1Id, m.player2Id].filter(Boolean))
    );
    const numPlayers = playerCount?.checkedIn || playersInMatches.size || 0;
    const bracketSize = Math.max(16, Math.pow(2, Math.ceil(Math.log2(Math.max(numPlayers, 2)))));
    const maxFirstRoundMatches = bracketSize / 2;
    console.log(`Bracket size calculation: ${numPlayers} players → bracketSize: ${bracketSize}, maxFirstRoundMatches: ${maxFirstRoundMatches}`);
    const matchIdMap = /* @__PURE__ */ new Map();
    matches.forEach((m) => matchIdMap.set(m._id, m));
    const transformMatch = (match) => {
      const participants = [];
      const hasPlayer1 = !!(match.player1 || match.player1Id);
      const hasPlayer2 = !!(match.player2 || match.player2Id);
      const isBye = match.status === "completed" && (hasPlayer1 && !hasPlayer2 || !hasPlayer1 && hasPlayer2);
      if (match.player1) {
        const isWinner = match.winnerId === match.player1Id;
        participants.push({
          id: match.player1._id,
          name: match.player1.name || "",
          isWinner: match.status === "completed" ? isWinner : false,
          status: isBye ? "WALKOVER" : match.status === "completed" ? "PLAYED" : match.status === "in_progress" ? "PLAYED" : null,
          resultText: isBye ? null : match.status === "completed" && match.player1Score !== void 0 ? String(match.player1Score) : null
        });
      } else {
        participants.push({
          id: `empty-1-${match._id}`,
          name: "",
          isWinner: false,
          status: null,
          resultText: null
        });
      }
      if (match.player2) {
        const isWinner = match.winnerId === match.player2Id;
        participants.push({
          id: match.player2._id,
          name: match.player2.name || "",
          isWinner: match.status === "completed" ? isWinner : false,
          status: isBye ? "WALKOVER" : match.status === "completed" ? "PLAYED" : match.status === "in_progress" ? "PLAYED" : null,
          resultText: isBye ? null : match.status === "completed" && match.player2Score !== void 0 ? String(match.player2Score) : null
        });
      } else {
        participants.push({
          id: `empty-2-${match._id}`,
          name: isBye ? "BYE" : "",
          // Show "BYE" text for empty slots in bye matches
          isWinner: false,
          status: isBye ? "NO_PARTY" : null,
          resultText: null
        });
      }
      let state = "SCHEDULED";
      if (match.status === "completed") {
        state = isBye ? "WALK_OVER" : "SCORE_DONE";
      } else if (match.status === "in_progress") {
        state = "RUNNING";
      }
      let nextMatchId = match.nextMatchId && matchIdMap.has(match.nextMatchId) ? match.nextMatchId : null;
      const nextLooserMatchId = match.nextLooserMatchId && matchIdMap.has(match.nextLooserMatchId) ? match.nextLooserMatchId : void 0;
      return {
        id: match._id,
        name: `Round ${match.round} - Match ${match.bracketPosition + 1}`,
        nextMatchId,
        nextLooserMatchId,
        tournamentRoundText: String(match.round),
        startTime: match.completedAt ? new Date(match.completedAt).toISOString().split("T")[0] : "",
        state,
        participants
      };
    };
    if (tournamentType === "single") {
      let filteredMatches = matches.filter((m) => !m.bracketType || m.bracketType === "winner");
      const round1Matches = filteredMatches.filter((m) => m.round === 1);
      const otherRoundMatches = filteredMatches.filter((m) => m.round !== 1);
      let filteredRound1Matches = round1Matches.filter((m) => m.bracketPosition < maxFirstRoundMatches);
      console.log(`All round 1 matches (${round1Matches.length}):`, round1Matches.map((m) => ({ pos: m.bracketPosition, id: m._id })));
      console.log(`Filtered round 1 matches (${filteredRound1Matches.length}):`, filteredRound1Matches.map((m) => ({ pos: m.bracketPosition, id: m._id })));
      console.log(`Expected: ${maxFirstRoundMatches} matches for bracket size ${bracketSize}`);
      filteredRound1Matches.sort((a, b) => a.bracketPosition - b.bracketPosition);
      const expectedPositions = Array.from({ length: maxFirstRoundMatches }, (_, i) => i);
      const existingPositions = new Set(filteredRound1Matches.map((m) => m.bracketPosition));
      console.log(`Round 1 matches: Found ${filteredRound1Matches.length} matches, Expected ${maxFirstRoundMatches} matches for ${numPlayers} players (bracket size: ${bracketSize})`);
      console.log(`Round 1 match positions:`, filteredRound1Matches.map((m) => m.bracketPosition).sort((a, b) => a - b));
      const missingPositions = expectedPositions.filter((pos) => !existingPositions.has(pos));
      if (missingPositions.length > 0) {
        console.warn(`⚠️ Missing round 1 matches at positions: ${missingPositions.join(", ")}. Backend should create all ${maxFirstRoundMatches} matches for bracket size ${bracketSize}.`);
      }
      const expectedMatchesPerRound = {};
      let currentRoundMatches = maxFirstRoundMatches;
      let round = 2;
      while (currentRoundMatches > 1) {
        const matchesInRound = Math.floor(currentRoundMatches / 2);
        expectedMatchesPerRound[round] = matchesInRound;
        currentRoundMatches = matchesInRound;
        round++;
      }
      const filteredOtherRounds = otherRoundMatches.filter((match) => {
        const expectedCount = expectedMatchesPerRound[match.round];
        if (expectedCount !== void 0) {
          return match.bracketPosition < expectedCount;
        }
        return true;
      });
      filteredMatches = [...filteredRound1Matches, ...filteredOtherRounds];
      console.log(`Bracket structure: Round 1: ${filteredRound1Matches.length} matches, Expected rounds:`, expectedMatchesPerRound);
      console.log(`Actual rounds:`, filteredMatches.reduce((acc, m) => {
        if (!acc[m.round]) acc[m.round] = 0;
        acc[m.round]++;
        return acc;
      }, {}));
      const maxRound = Math.max(...filteredMatches.map((m) => m.round));
      const matchesWithFixedLinks = filteredMatches.map((match) => {
        if (!match.nextMatchId && match.round < maxRound) {
          const nextRound = match.round + 1;
          const nextRoundMatches = filteredMatches.filter((m) => m.round === nextRound);
          if (nextRoundMatches.length === 0) {
            return match;
          }
          const nextPosition = Math.floor(match.bracketPosition / 2);
          let nextMatch = nextRoundMatches.find((m) => m.bracketPosition === nextPosition);
          if (!nextMatch && nextRoundMatches.length > 0) {
            const sortedNextMatches = [...nextRoundMatches].sort((a, b) => a.bracketPosition - b.bracketPosition);
            if (nextPosition >= sortedNextMatches.length) {
              nextMatch = sortedNextMatches[sortedNextMatches.length - 1];
            } else {
              nextMatch = sortedNextMatches.find((m) => m.bracketPosition >= nextPosition) || sortedNextMatches[sortedNextMatches.length - 1];
            }
          }
          if (nextMatch) {
            return { ...match, nextMatchId: nextMatch._id };
          }
        }
        return match;
      });
      console.log("Fixed links - matches with null nextMatchId:", matchesWithFixedLinks.filter((m) => !m.nextMatchId).map((m) => ({
        id: m._id,
        round: m.round,
        position: m.bracketPosition,
        name: `Round ${m.round} - Match ${m.bracketPosition + 1}`
      })));
      const bracketMatches = matchesWithFixedLinks.map(transformMatch);
      console.log("Total bracket matches:", bracketMatches.length);
      console.log("Matches by round:", bracketMatches.reduce((acc, m) => {
        const round2 = m.tournamentRoundText || "unknown";
        if (!acc[round2]) acc[round2] = [];
        acc[round2].push({ id: m.id, name: m.name, nextMatchId: m.nextMatchId });
        return acc;
      }, {}));
      const finalMatches = bracketMatches.filter((m) => !m.nextMatchId);
      console.log("Final matches found:", finalMatches.length, finalMatches.map((m) => ({ id: m.id, name: m.name, round: m.tournamentRoundText })));
      return { type: "single", matches: bracketMatches };
    } else if (tournamentType === "double") {
      const upperMatches = matches.filter((m) => m.bracketType === "winner").map(transformMatch).sort((a, b) => {
        const roundA = parseInt(a.tournamentRoundText || "0");
        const roundB = parseInt(b.tournamentRoundText || "0");
        return roundA - roundB;
      });
      const lowerMatches = matches.filter((m) => m.bracketType === "loser").map(transformMatch).sort((a, b) => {
        const roundA = parseInt(a.tournamentRoundText || "0");
        const roundB = parseInt(b.tournamentRoundText || "0");
        return roundA - roundB;
      });
      const grandFinalMatches = matches.filter((m) => m.bracketType === "grand_final").map(transformMatch);
      const allLowerMatches = [...lowerMatches, ...grandFinalMatches];
      return {
        type: "double",
        matches: {
          upper: upperMatches,
          lower: allLowerMatches
        }
      };
    }
    return null;
  }, [matches, tournamentType, playerCount]);
  if (!bracketData) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "No bracket data available. Start the tournament to generate the bracket." });
  }
  if (bracketData.type === "single") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto", children: /* @__PURE__ */ jsx(
        SingleEliminationBracket,
        {
          matches: bracketData.matches,
          onMatchClick: handleMatchClick,
          matchComponent: ({ match, topParty, bottomParty, topWon, bottomWon, onMatchClick, onMouseEnter, onMouseLeave, topHovered, bottomHovered }) => {
            const isSelected = selectedMatchId === match.id;
            const backendMatch = matches?.find((m) => m._id === match.id);
            const isLive = backendMatch?.status === "in_progress";
            const isHovered = topHovered || bottomHovered;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `
                    border rounded p-2 min-w-[200px] cursor-pointer transition-all relative
                    ${isSelected ? "bg-primary/5" : ""}
                    ${isHovered ? "bg-primary/5 border border-primary/10" : "hover:bg-muted/50"}
                  `,
                onClick: (e) => {
                  e.preventDefault();
                  onMatchClick?.({ match, topWon, bottomWon, event: e });
                },
                onMouseEnter: () => {
                  if (topParty.id) onMouseEnter?.(topParty.id);
                },
                onMouseLeave,
                children: [
                  isLive && /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: "destructive",
                      className: "absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 font-semibold",
                      children: "LIVE"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: `text-xs mb-1 transition-colors ${isHovered ? "text-primary font-medium" : "text-muted-foreground"}`, children: match.name }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `flex justify-between items-center px-2 py-1 rounded transition-colors ${topWon ? "bg-green-100 dark:bg-green-900" : ""} ${isSelected ? "bg-primary/10" : ""} ${topHovered ? "bg-primary/30" : isHovered ? "" : ""}`,
                        onMouseEnter: () => onMouseEnter?.(topParty.id),
                        onMouseLeave,
                        children: [
                          /* @__PURE__ */ jsx("span", { className: `text-sm transition-colors ${topHovered ? "font-semibold" : ""}`, children: topParty.name || "TBD" }),
                          topParty.resultText && /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold`, children: topParty.resultText })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `flex justify-between items-center px-2 py-1 rounded transition-colors ${bottomWon ? "bg-green-100 dark:bg-green-900" : ""} ${isSelected ? "bg-primary/10" : ""} ${bottomHovered ? "bg-primary/30" : isHovered ? "" : ""}`,
                        onMouseEnter: () => onMouseEnter?.(bottomParty.id),
                        onMouseLeave,
                        children: [
                          /* @__PURE__ */ jsx("span", { className: `text-sm transition-colors ${bottomHovered ? "font-semibold" : ""}`, children: bottomParty.name || "TBD" }),
                          bottomParty.resultText && /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold ${bottomHovered ? "text-primary" : ""}`, children: bottomParty.resultText })
                        ]
                      }
                    )
                  ] })
                ]
              }
            );
          }
        }
      ) }),
      tournamentId && /* @__PURE__ */ jsx(
        MatchDetailModal,
        {
          open: showMatchModal,
          onOpenChange: setShowMatchModal,
          match: selectedMatch || null,
          tournamentId
        }
      )
    ] });
  }
  if (bracketData.type === "double") {
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto p-6", children: /* @__PURE__ */ jsx(
        DoubleEliminationBracket,
        {
          matches: bracketData.matches,
          onMatchClick: handleMatchClick,
          matchComponent: ({ match, topParty, bottomParty, topWon, bottomWon, onMatchClick, onMouseEnter, onMouseLeave, topHovered, bottomHovered }) => {
            const isSelected = selectedMatchId === match.id;
            const backendMatch = matches?.find((m) => m._id === match.id);
            const isLive = backendMatch?.status === "in_progress";
            const isHovered = topHovered || bottomHovered;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: `
                    border rounded p-2 min-w-[200px] cursor-pointer transition-all relative
                    ${isSelected ? "ring-2 ring-primary ring-offset-2 bg-primary/5" : ""}
                    ${isHovered ? "ring-2 ring-primary/70 bg-primary/10 border-primary/50 shadow-md" : "hover:bg-muted/50"}
                  `,
                onClick: (e) => {
                  e.preventDefault();
                  onMatchClick?.({ match, topWon, bottomWon, event: e });
                },
                onMouseEnter: () => {
                  if (topParty.id) onMouseEnter?.(topParty.id);
                },
                onMouseLeave,
                children: [
                  isLive && /* @__PURE__ */ jsx(
                    Badge,
                    {
                      variant: "destructive",
                      className: "absolute top-1 right-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 font-semibold",
                      children: "LIVE"
                    }
                  ),
                  /* @__PURE__ */ jsx("div", { className: `text-xs mb-1 transition-colors ${isHovered ? "text-primary font-medium" : "text-muted-foreground"}`, children: match.name }),
                  /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `flex justify-between items-center px-2 py-1 rounded transition-colors ${topWon ? "bg-green-100 dark:bg-green-900" : ""} ${isSelected ? "bg-primary/10" : ""} ${topHovered ? "bg-primary/30 border border-primary/70" : isHovered ? "bg-primary/15" : ""}`,
                        onMouseEnter: () => onMouseEnter?.(topParty.id),
                        onMouseLeave,
                        children: [
                          /* @__PURE__ */ jsx("span", { className: `text-sm transition-colors ${topHovered ? "font-semibold text-primary" : ""}`, children: topParty.name || "TBD" }),
                          topParty.resultText && /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold ${topHovered ? "text-primary" : ""}`, children: topParty.resultText })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: `flex justify-between items-center px-2 py-1 rounded transition-colors ${bottomWon ? "bg-green-100 dark:bg-green-900" : ""} ${isSelected ? "bg-primary/10" : ""} ${bottomHovered ? "bg-primary/30 border border-primary/70" : isHovered ? "bg-primary/15" : ""}`,
                        onMouseEnter: () => onMouseEnter?.(bottomParty.id),
                        onMouseLeave,
                        children: [
                          /* @__PURE__ */ jsx("span", { className: `text-sm transition-colors ${bottomHovered ? "font-semibold text-primary" : ""}`, children: bottomParty.name || "TBD" }),
                          bottomParty.resultText && /* @__PURE__ */ jsx("span", { className: `text-sm font-semibold ${bottomHovered ? "text-primary" : ""}`, children: bottomParty.resultText })
                        ]
                      }
                    )
                  ] })
                ]
              }
            );
          }
        }
      ) }),
      tournamentId && /* @__PURE__ */ jsx(
        MatchDetailModal,
        {
          open: showMatchModal,
          onOpenChange: setShowMatchModal,
          match: selectedMatch || null,
          tournamentId
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Bracket view not available for this tournament type." }),
    tournamentId && /* @__PURE__ */ jsx(
      MatchDetailModal,
      {
        open: showMatchModal,
        onOpenChange: setShowMatchModal,
        match: selectedMatch || null,
        tournamentId
      }
    )
  ] });
}
function MatchesTable({ tournamentId, matches }) {
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [roundFilter, setRoundFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredMatches = useMemo(() => {
    if (!matches) return [];
    let filtered = matches;
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }
    if (roundFilter !== "all") {
      filtered = filtered.filter((m) => m.round === roundFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => {
        const player1Name = m.player1?.name?.toLowerCase() || "";
        const player2Name = m.player2?.name?.toLowerCase() || "";
        return player1Name.includes(query) || player2Name.includes(query);
      });
    }
    return filtered.sort((a, b) => {
      if (a.round !== b.round) return a.round - b.round;
      return a.bracketPosition - b.bracketPosition;
    });
  }, [matches, statusFilter, roundFilter, searchQuery]);
  const rounds = useMemo(() => {
    if (!matches) return [];
    const uniqueRounds = new Set(matches.map((m) => m.round));
    return Array.from(uniqueRounds).sort((a, b) => a - b);
  }, [matches]);
  const selectedMatch = useMemo(() => {
    if (!selectedMatchId || !matches) return null;
    return matches.find((m) => m._id === selectedMatchId);
  }, [selectedMatchId, matches]);
  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return /* @__PURE__ */ jsx(Badge, { variant: "outline", children: "Pending" });
      case "in_progress":
        return /* @__PURE__ */ jsx(Badge, { variant: "destructive", className: "bg-red-500", children: "LIVE" });
      case "completed":
        return /* @__PURE__ */ jsx(Badge, { variant: "default", className: "bg-green-500", children: "Completed" });
    }
  };
  const getBracketTypeLabel = (bracketType) => {
    switch (bracketType) {
      case "winner":
        return "W";
      case "loser":
        return "L";
      case "grand_final":
        return "GF";
      default:
        return "";
    }
  };
  const handleMatchClick = (matchId) => {
    setSelectedMatchId(matchId);
    setShowMatchModal(true);
  };
  if (!matches) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Loading matches..." });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "border-b p-4 space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "relative flex-1 max-w-sm", children: [
            /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                placeholder: "Search players...",
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                className: "pl-9"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Select, { value: statusFilter, onValueChange: (value) => setStatusFilter(value), children: [
            /* @__PURE__ */ jsxs(SelectTrigger, { className: "w-[180px]", children: [
              /* @__PURE__ */ jsx(Filter, { className: "h-4 w-4 mr-2" }),
              /* @__PURE__ */ jsx(SelectValue, { placeholder: "Filter by status" })
            ] }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Status" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "pending", children: "Pending" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "in_progress", children: "In Progress" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "completed", children: "Completed" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: roundFilter === "all" ? "all" : String(roundFilter),
              onValueChange: (value) => setRoundFilter(value === "all" ? "all" : parseInt(value)),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[150px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Filter by round" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "all", children: "All Rounds" }),
                  rounds.map((round) => /* @__PURE__ */ jsxs(SelectItem, { value: String(round), children: [
                    "Round ",
                    round
                  ] }, round))
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-6 text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Total: ",
            matches.length
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Pending: ",
            matches.filter((m) => m.status === "pending").length
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "In Progress: ",
            matches.filter((m) => m.status === "in_progress").length
          ] }),
          /* @__PURE__ */ jsxs("span", { children: [
            "Completed: ",
            matches.filter((m) => m.status === "completed").length
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { className: "w-[80px]", children: "Round" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Match" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Player 1" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Score" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Player 2" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Table" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
          /* @__PURE__ */ jsx(TableHead, { children: "Completed" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: filteredMatches.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 8, className: "text-center text-muted-foreground py-8", children: "No matches found" }) }) : filteredMatches.map((match) => {
          const bracketLabel = getBracketTypeLabel(match.bracketType);
          const matchLabel = bracketLabel ? `${bracketLabel}${match.round}-${match.bracketPosition + 1}` : `R${match.round}-${match.bracketPosition + 1}`;
          return /* @__PURE__ */ jsxs(
            TableRow,
            {
              className: "cursor-pointer hover:bg-muted/50",
              onClick: () => handleMatchClick(match._id),
              children: [
                /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: match.round }),
                /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: matchLabel }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: match.winnerId === match.player1Id ? "font-bold text-green-600" : "", children: match.player1?.name || "TBD" }),
                  match.winnerId === match.player1Id && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: "W" })
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { children: match.status === "pending" ? /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "-" }) : /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
                  match.player1Score,
                  " - ",
                  match.player2Score
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("span", { className: match.winnerId === match.player2Id ? "font-bold text-green-600" : "", children: match.player2?.name || "TBD" }),
                  match.winnerId === match.player2Id && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: "W" })
                ] }) }),
                /* @__PURE__ */ jsx(TableCell, { children: match.tableNumber ? /* @__PURE__ */ jsxs(Badge, { variant: "secondary", children: [
                  "Table ",
                  match.tableNumber
                ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "-" }) }),
                /* @__PURE__ */ jsx(TableCell, { children: getStatusBadge(match.status) }),
                /* @__PURE__ */ jsx(TableCell, { className: "text-sm text-muted-foreground", children: match.completedAt ? formatDate(match.completedAt) : "-" })
              ]
            },
            match._id
          );
        }) })
      ] }) })
    ] }),
    selectedMatch && /* @__PURE__ */ jsx(
      MatchDetailModal,
      {
        open: showMatchModal,
        onOpenChange: setShowMatchModal,
        match: selectedMatch,
        tournamentId
      }
    )
  ] });
}
function ResultsTable({ matches }) {
  const completedMatches = useMemo(() => {
    if (!matches) return [];
    return matches.filter((m) => m.status === "completed").sort((a, b) => {
      const timeA = a.completedAt || 0;
      const timeB = b.completedAt || 0;
      return timeB - timeA;
    });
  }, [matches]);
  const playerResults = useMemo(() => {
    if (!matches) return [];
    const resultsMap = /* @__PURE__ */ new Map();
    matches.filter((m) => m.status === "completed").forEach((match) => {
      if (match.player1Id) {
        const existing = resultsMap.get(match.player1Id) || {
          playerId: match.player1Id,
          playerName: match.player1?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          finalRound: 0,
          isChampion: false
        };
        existing.totalMatches++;
        if (match.winnerId === match.player1Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }
        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 ? Math.round(existing.wins / existing.totalMatches * 100) : 0;
        resultsMap.set(match.player1Id, existing);
      }
      if (match.player2Id) {
        const existing = resultsMap.get(match.player2Id) || {
          playerId: match.player2Id,
          playerName: match.player2?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          finalRound: 0,
          isChampion: false
        };
        existing.totalMatches++;
        if (match.winnerId === match.player2Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }
        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 ? Math.round(existing.wins / existing.totalMatches * 100) : 0;
        resultsMap.set(match.player2Id, existing);
      }
    });
    const maxRound = Math.max(...Array.from(resultsMap.values()).map((r) => r.finalRound), 0);
    const finalRoundMatches = matches.filter(
      (m) => m.status === "completed" && m.round === maxRound
    );
    finalRoundMatches.forEach((match) => {
      if (match.winnerId) {
        const result = resultsMap.get(match.winnerId);
        if (result) {
          result.isChampion = true;
        }
      }
    });
    return Array.from(resultsMap.values()).sort((a, b) => {
      if (a.isChampion && !b.isChampion) return -1;
      if (!a.isChampion && b.isChampion) return 1;
      if (a.finalRound !== b.finalRound) return b.finalRound - a.finalRound;
      if (a.winRate !== b.winRate) return b.winRate - a.winRate;
      return b.wins - a.wins;
    });
  }, [matches]);
  const getPlaceIcon = (index) => {
    if (index === 0) {
      return /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5 text-yellow-500" });
    } else if (index === 1) {
      return /* @__PURE__ */ jsx(Medal, { className: "h-5 w-5 text-gray-400" });
    } else if (index === 2) {
      return /* @__PURE__ */ jsx(Award, { className: "h-5 w-5 text-amber-600" });
    }
    return null;
  };
  const getPlaceBadge = (index) => {
    if (index === 0) return /* @__PURE__ */ jsx(Badge, { className: "bg-yellow-500", children: "1st" });
    if (index === 1) return /* @__PURE__ */ jsx(Badge, { className: "bg-gray-400", children: "2nd" });
    if (index === 2) return /* @__PURE__ */ jsx(Badge, { className: "bg-amber-600", children: "3rd" });
    return /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: index + 1 });
  };
  if (!matches) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Loading results..." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b p-4", children: /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: completedMatches.length }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Matches Completed" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: playerResults.length }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Players" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: playerResults.filter((p) => p.isChampion).length > 0 ? playerResults[0].playerName : "-" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Champion" })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "text-2xl font-bold", children: [
          playerResults.length > 0 ? Math.round(playerResults.reduce((sum, p) => sum + p.winRate, 0) / playerResults.length) : 0,
          "%"
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "Avg Win Rate" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 grid grid-cols-2 gap-4 p-4 min-h-0 overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-4 flex-shrink-0", children: "Standings" }),
        /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { className: "w-[60px]", children: "Place" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Player" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "W" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "L" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Win %" }),
            /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Round" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: playerResults.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 6, className: "text-center text-muted-foreground py-8", children: "No results yet" }) }) : playerResults.map((result, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              getPlaceIcon(index),
              getPlaceBadge(index)
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx("span", { className: result.isChampion ? "font-bold text-yellow-500" : "font-medium", children: result.playerName }),
              result.isChampion && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: "Champion" })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: result.wins }),
            /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: result.losses }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
              result.winRate,
              "%"
            ] }),
            /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
              "R",
              result.finalRound
            ] })
          ] }, result.playerId)) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-h-0", children: [
        /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-4 flex-shrink-0", children: "Recent Matches" }),
        /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 min-h-0", children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Round" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Match" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Result" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Date" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: completedMatches.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: 4, className: "text-center text-muted-foreground py-8", children: "No completed matches yet" }) }) : completedMatches.slice(0, 20).map((match) => {
            const bracketLabel = match.bracketType === "loser" ? "L" : match.bracketType === "grand_final" ? "GF" : "W";
            const matchLabel = `${bracketLabel}${match.round}-${match.bracketPosition + 1}`;
            return /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: match.round }),
              /* @__PURE__ */ jsx(TableCell, { className: "font-medium", children: matchLabel }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-1", children: [
                /* @__PURE__ */ jsxs("div", { className: match.winnerId === match.player1Id ? "font-bold text-green-600" : "", children: [
                  match.player1?.name || "TBD",
                  " ",
                  match.player1Score
                ] }),
                /* @__PURE__ */ jsxs("div", { className: match.winnerId === match.player2Id ? "font-bold text-green-600" : "", children: [
                  match.player2?.name || "TBD",
                  " ",
                  match.player2Score
                ] })
              ] }) }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-sm text-muted-foreground", children: match.completedAt ? formatDate(match.completedAt) : "-" })
            ] }, match._id);
          }) })
        ] }) })
      ] })
    ] })
  ] });
}
function PlayerStats({ matches }) {
  const playerStats = useMemo(() => {
    if (!matches) return [];
    const statsMap = /* @__PURE__ */ new Map();
    matches.filter((m) => m.status === "completed").forEach((match) => {
      if (match.player1Id) {
        const existing = statsMap.get(match.player1Id) || {
          playerId: match.player1Id,
          playerName: match.player1?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          totalPointsScored: 0,
          totalPointsAllowed: 0,
          averageScore: 0,
          averageAllowed: 0,
          pointDifferential: 0,
          finalRound: 0,
          isChampion: false,
          highestScore: 0,
          largestMargin: 0,
          matchesByRound: {}
        };
        existing.totalMatches++;
        existing.totalPointsScored += match.player1Score;
        existing.totalPointsAllowed += match.player2Score;
        existing.highestScore = Math.max(existing.highestScore, match.player1Score);
        const margin = Math.abs(match.player1Score - match.player2Score);
        existing.largestMargin = Math.max(existing.largestMargin, margin);
        if (match.winnerId === match.player1Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }
        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 ? Math.round(existing.wins / existing.totalMatches * 100) : 0;
        existing.averageScore = existing.totalMatches > 0 ? Math.round(existing.totalPointsScored / existing.totalMatches * 10) / 10 : 0;
        existing.averageAllowed = existing.totalMatches > 0 ? Math.round(existing.totalPointsAllowed / existing.totalMatches * 10) / 10 : 0;
        existing.pointDifferential = existing.totalPointsScored - existing.totalPointsAllowed;
        if (!existing.matchesByRound[match.round]) {
          existing.matchesByRound[match.round] = { wins: 0, losses: 0 };
        }
        if (match.winnerId === match.player1Id) {
          existing.matchesByRound[match.round].wins++;
        } else {
          existing.matchesByRound[match.round].losses++;
        }
        statsMap.set(match.player1Id, existing);
      }
      if (match.player2Id) {
        const existing = statsMap.get(match.player2Id) || {
          playerId: match.player2Id,
          playerName: match.player2?.name || "Unknown",
          wins: 0,
          losses: 0,
          totalMatches: 0,
          winRate: 0,
          totalPointsScored: 0,
          totalPointsAllowed: 0,
          averageScore: 0,
          averageAllowed: 0,
          pointDifferential: 0,
          finalRound: 0,
          isChampion: false,
          highestScore: 0,
          largestMargin: 0,
          matchesByRound: {}
        };
        existing.totalMatches++;
        existing.totalPointsScored += match.player2Score;
        existing.totalPointsAllowed += match.player1Score;
        existing.highestScore = Math.max(existing.highestScore, match.player2Score);
        const margin = Math.abs(match.player2Score - match.player1Score);
        existing.largestMargin = Math.max(existing.largestMargin, margin);
        if (match.winnerId === match.player2Id) {
          existing.wins++;
        } else {
          existing.losses++;
        }
        existing.finalRound = Math.max(existing.finalRound, match.round);
        existing.winRate = existing.totalMatches > 0 ? Math.round(existing.wins / existing.totalMatches * 100) : 0;
        existing.averageScore = existing.totalMatches > 0 ? Math.round(existing.totalPointsScored / existing.totalMatches * 10) / 10 : 0;
        existing.averageAllowed = existing.totalMatches > 0 ? Math.round(existing.totalPointsAllowed / existing.totalMatches * 10) / 10 : 0;
        existing.pointDifferential = existing.totalPointsScored - existing.totalPointsAllowed;
        if (!existing.matchesByRound[match.round]) {
          existing.matchesByRound[match.round] = { wins: 0, losses: 0 };
        }
        if (match.winnerId === match.player2Id) {
          existing.matchesByRound[match.round].wins++;
        } else {
          existing.matchesByRound[match.round].losses++;
        }
        statsMap.set(match.player2Id, existing);
      }
    });
    const maxRound = Math.max(...Array.from(statsMap.values()).map((r) => r.finalRound), 0);
    const finalRoundMatches = matches.filter(
      (m) => m.status === "completed" && m.round === maxRound
    );
    finalRoundMatches.forEach((match) => {
      if (match.winnerId) {
        const stat = statsMap.get(match.winnerId);
        if (stat) {
          stat.isChampion = true;
        }
      }
    });
    return Array.from(statsMap.values()).sort((a, b) => {
      if (a.isChampion && !b.isChampion) return -1;
      if (!a.isChampion && b.isChampion) return 1;
      if (a.winRate !== b.winRate) return b.winRate - a.winRate;
      return b.pointDifferential - a.pointDifferential;
    });
  }, [matches]);
  const topPerformers = useMemo(() => {
    if (playerStats.length === 0) return null;
    const topWinRate = [...playerStats].sort((a, b) => b.winRate - a.winRate)[0];
    const topScorer = [...playerStats].sort((a, b) => b.averageScore - a.averageScore)[0];
    const topDefense = [...playerStats].sort((a, b) => a.averageAllowed - b.averageAllowed)[0];
    const topMargin = [...playerStats].sort((a, b) => b.largestMargin - a.largestMargin)[0];
    return { topWinRate, topScorer, topDefense, topMargin };
  }, [playerStats]);
  if (!matches) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "Loading stats..." });
  }
  if (playerStats.length === 0) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full text-muted-foreground", children: "No stats available yet. Complete some matches to see statistics." });
  }
  return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col p-6 space-y-6", children: [
    topPerformers && /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 text-yellow-500" }),
          "Best Win Rate"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: topPerformers.topWinRate.playerName }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [
            topPerformers.topWinRate.winRate,
            "% (",
            topPerformers.topWinRate.wins,
            "-",
            topPerformers.topWinRate.losses,
            ")"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Target, { className: "h-4 w-4 text-blue-500" }),
          "Top Scorer"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: topPerformers.topScorer.playerName }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [
            topPerformers.topScorer.averageScore,
            " avg points"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(Award, { className: "h-4 w-4 text-green-500" }),
          "Best Defense"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: topPerformers.topDefense.playerName }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [
            topPerformers.topDefense.averageAllowed,
            " avg allowed"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(TrendingUp, { className: "h-4 w-4 text-purple-500" }),
          "Largest Margin"
        ] }) }),
        /* @__PURE__ */ jsxs(CardContent, { children: [
          /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold", children: topPerformers.topMargin.playerName }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [
            "Won by ",
            topPerformers.topMargin.largestMargin,
            " points"
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(BarChart3, { className: "h-5 w-5" }),
        "Player Statistics"
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(ScrollArea, { className: "h-[600px]", children: /* @__PURE__ */ jsxs(Table, { children: [
        /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableHead, { children: "Player" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "W" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "L" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Win %" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Avg Score" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Avg Allowed" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Point Diff" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "High Score" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Largest Margin" }),
          /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Final Round" })
        ] }) }),
        /* @__PURE__ */ jsx(TableBody, { children: playerStats.map((stat) => /* @__PURE__ */ jsxs(TableRow, { children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx("span", { className: stat.isChampion ? "font-bold text-yellow-500" : "font-medium", children: stat.playerName }),
            stat.isChampion && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: "Champion" })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: stat.wins }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: stat.losses }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs(Badge, { variant: stat.winRate >= 50 ? "default" : "secondary", children: [
            stat.winRate,
            "%"
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: stat.averageScore }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: stat.averageAllowed }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsxs("span", { className: stat.pointDifferential >= 0 ? "text-green-600 font-medium" : "text-red-600", children: [
            stat.pointDifferential >= 0 ? "+" : "",
            stat.pointDifferential
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right font-medium", children: stat.highestScore }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: stat.largestMargin }),
          /* @__PURE__ */ jsxs(TableCell, { className: "text-right", children: [
            "R",
            stat.finalRound
          ] })
        ] }, stat.playerId)) })
      ] }) }) })
    ] })
  ] });
}
function TournamentDetailPage() {
  const {
    id
  } = Route.useParams();
  const tournamentId = id;
  const [viewMode, setViewMode] = useState("dashboard");
  const [leftPanelMode, setLeftPanelMode] = useState("overview");
  const [showAddManagerDialog, setShowAddManagerDialog] = useState(false);
  const currentUser = useCurrentUser();
  const tournament = useQuery(api.tournaments.getById, {
    id: tournamentId
  });
  const matches = useQuery(api.matches.getByTournament, {
    tournamentId
  });
  const venue = useQuery(api.venues.getById, tournament?.venueId ? {
    id: tournament.venueId
  } : "skip");
  const managers = useQuery(api.tournaments.getManagers, {
    tournamentId
  });
  const generateBracket = useMutation(api.matches.generateBracket);
  const regenerateBracket = useMutation(api.matches.regenerateBracket);
  const removeManager = useMutation(api.tournaments.removeManager);
  const updateTournament = useMutation(api.tournaments.update);
  const currentUserId = currentUser?.convexUser?._id;
  const allMatches = matches || [];
  const completedMatches = allMatches.filter((m) => {
    if (m.status !== "completed") return false;
    if (!m.player1Id && !m.player2Id) return true;
    return !!m.winnerId;
  }).length;
  const totalMatches = allMatches.length;
  const completionPercentage = totalMatches > 0 ? Math.round(completedMatches / totalMatches * 100) : 0;
  useEffect(() => {
    if (tournament && tournament.status === "active" && totalMatches > 0 && completionPercentage === 100 && completedMatches === totalMatches) {
      updateTournament({
        tournamentId,
        status: "completed"
      }).catch((error) => {
        console.error("Failed to auto-complete tournament:", error);
      });
    }
  }, [tournament, totalMatches, completedMatches, completionPercentage, tournamentId, updateTournament]);
  if (!tournament) {
    return /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center h-full", children: "Loading..." });
  }
  const isOrganizer = tournament && currentUserId && tournament.organizerId === currentUserId;
  const handleStartTournament = async () => {
    try {
      await generateBracket({
        tournamentId
      });
    } catch (error) {
      console.error("Error starting tournament:", error);
      alert("Failed to start tournament. Make sure at least 2 players are checked in.");
    }
  };
  const handleRegenerateBracket = async () => {
    if (!confirm("Regenerate bracket? This will preserve completed matches but recreate the bracket structure. Continue?")) {
      return;
    }
    try {
      await regenerateBracket({
        tournamentId
      });
      alert("Bracket regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating bracket:", error);
      alert(`Failed to regenerate bracket: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };
  const handleRemoveManager = async (userId) => {
    if (!confirm("Are you sure you want to remove this manager?")) {
      return;
    }
    try {
      await removeManager({
        tournamentId,
        userId
      });
    } catch (error) {
      console.error("Failed to remove manager:", error);
      alert(error instanceof Error ? error.message : "Failed to remove manager");
    }
  };
  const actionButtons = [{
    mode: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  }, {
    mode: "bracket",
    label: "Bracket",
    icon: Network
  }, {
    mode: "tables",
    label: "Tables",
    icon: Table$1
  }, {
    mode: "players",
    label: "Players",
    icon: Users
  }, {
    mode: "matches",
    label: "Matches",
    icon: Gamepad2
  }, {
    mode: "results",
    label: "Results",
    icon: Trophy
  }, {
    mode: "stats",
    label: "Stats",
    icon: BarChart3
  }, {
    mode: "payouts",
    label: "Payouts",
    icon: DollarSign
  }, {
    mode: "settings",
    label: "Settings",
    icon: Settings
  }];
  const leftPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col border-r", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3.5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 overflow-x-auto", children: [
      /* @__PURE__ */ jsx(Button, { variant: leftPanelMode === "overview" ? "secondary" : "ghost", size: "sm", className: "flex-shrink-0", onClick: () => setLeftPanelMode("overview"), children: "Overview" }),
      /* @__PURE__ */ jsx(Button, { variant: leftPanelMode === "players" ? "secondary" : "ghost", size: "sm", className: "flex-shrink-0", onClick: () => setLeftPanelMode("players"), children: "Player List" })
    ] }) }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: leftPanelMode === "players" ? /* @__PURE__ */ jsx(TablesPlayersView, { tournamentId, onManagePlayers: () => setViewMode("players") }) : /* @__PURE__ */ jsxs("div", { className: "p-4 space-y-6", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "Tournament Progress" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "text-3xl font-bold", children: [
              completionPercentage,
              "%"
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
              completedMatches,
              " of ",
              totalMatches,
              " matches completed"
            ] })
          ] }),
          tournament.status === "active" && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-sm text-green-600", children: [
            /* @__PURE__ */ jsx("div", { className: "h-2 w-2 bg-green-600 rounded-full animate-pulse" }),
            "LIVE"
          ] })
        ] }) })
      ] }),
      tournament.status === "upcoming" && completionPercentage < 100 && /* @__PURE__ */ jsxs(Button, { onClick: handleStartTournament, className: "w-full", size: "lg", children: [
        /* @__PURE__ */ jsx(Play, { className: "h-4 w-4 mr-2" }),
        "Start Tournament"
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "VENUE" }) }),
        /* @__PURE__ */ jsx(CardContent, { children: venue ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: venue.name }),
            /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-1", children: [
              venue.address,
              venue.city && `, ${venue.city}`,
              venue.region && `, ${venue.region}`,
              venue.country && ` ${venue.country}`
            ] })
          ] }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" })
        ] }) }) : tournament.venue ? /* @__PURE__ */ jsx("div", { className: "space-y-2", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
          /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 min-w-0", children: /* @__PURE__ */ jsx("div", { className: "font-medium", children: tournament.venue }) }),
          /* @__PURE__ */ jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground flex-shrink-0" })
        ] }) }) : /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: "No venue assigned" }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-lg", children: "MANAGERS" }),
          isOrganizer && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: () => setShowAddManagerDialog(true), children: [
            /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
            "Add Manager"
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableHead, { children: "Name" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Role" }),
            /* @__PURE__ */ jsx(TableHead, { children: "Accepted" }),
            isOrganizer && /* @__PURE__ */ jsx(TableHead, { children: "Action" })
          ] }) }),
          /* @__PURE__ */ jsx(TableBody, { children: managers === void 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: isOrganizer ? 4 : 3, className: "text-center text-muted-foreground py-4", children: "Loading..." }) }) : managers.length === 0 ? /* @__PURE__ */ jsx(TableRow, { children: /* @__PURE__ */ jsx(TableCell, { colSpan: isOrganizer ? 4 : 3, className: "text-center text-muted-foreground py-4", children: "No managers yet" }) }) : managers.map((manager) => /* @__PURE__ */ jsxs(TableRow, { children: [
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
                /* @__PURE__ */ jsx(AvatarImage, { src: manager.user?.image }),
                /* @__PURE__ */ jsx(AvatarFallback, { children: manager.user?.displayName?.charAt(0).toUpperCase() || manager.user?.name?.charAt(0).toUpperCase() || "U" })
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: manager.user?.displayName || manager.user?.name || "Unknown" }),
                /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                  "@",
                  manager.user?.username || "unknown"
                ] })
              ] })
            ] }) }),
            /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm capitalize", children: manager.role }) }),
            /* @__PURE__ */ jsx(TableCell, { children: manager.accepted ? /* @__PURE__ */ jsx("span", { className: "text-sm text-green-600", children: "Yes" }) : /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: "Pending" }) }),
            isOrganizer && /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleRemoveManager(manager.userId), className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) }) })
          ] }, manager._id)) })
        ] }) })
      ] })
    ] }) })
  ] });
  const renderContent = () => {
    switch (viewMode) {
      case "dashboard":
        return /* @__PURE__ */ jsx(TournamentDashboard, { tournamentId });
      case "bracket":
        return /* @__PURE__ */ jsxs("div", { className: "h-full flex flex-col", children: [
          matches && matches.length > 0 && isOrganizer && /* @__PURE__ */ jsxs("div", { className: "border-b px-4 py-2 flex items-center justify-between", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Tournament Bracket" }),
            /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: handleRegenerateBracket, className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(RefreshCw, { className: "h-4 w-4" }),
              "Regenerate Bracket"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-hidden", children: /* @__PURE__ */ jsx(TournamentBracket, { matches, tournamentType: tournament.type, tournamentId }) })
        ] });
      case "tables":
        return /* @__PURE__ */ jsx(TablesManagement, { tournamentId });
      case "players":
        return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto", children: /* @__PURE__ */ jsx(PlayerRegistration, { tournamentId }) });
      case "matches":
        return /* @__PURE__ */ jsx("div", { className: "h-full overflow-hidden", children: /* @__PURE__ */ jsx(MatchesTable, { tournamentId, matches }) });
      case "results":
        return /* @__PURE__ */ jsx("div", { className: "h-full overflow-hidden", children: /* @__PURE__ */ jsx(ResultsTable, { tournamentId, matches }) });
      case "stats":
        return /* @__PURE__ */ jsx("div", { className: "h-full overflow-hidden", children: /* @__PURE__ */ jsx(PlayerStats, { tournamentId, matches }) });
      case "payouts":
        return /* @__PURE__ */ jsx("div", { className: "h-full overflow-auto p-6", children: /* @__PURE__ */ jsx(PayoutCalculation, { tournamentId }) });
      case "settings":
        return /* @__PURE__ */ jsx(TournamentSettings, { tournamentId });
      default:
        return /* @__PURE__ */ jsx(TournamentDashboard, { tournamentId });
    }
  };
  const rightPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3.5", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 overflow-x-auto justify-end", children: actionButtons.map(({
      mode,
      label,
      icon: Icon
    }) => /* @__PURE__ */ jsx(NavigationButton, { icon: Icon, ariaLabel: label, tooltip: label, variant: viewMode === mode ? "secondary" : "outline", size: "sm", onClick: () => {
      setViewMode(mode);
    }, className: "flex-shrink-0", badgePosition: "bottom-right" }, mode)) }) }),
    /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-hidden", children: renderContent() })
  ] });
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className: "flex h-full flex-col", children: /* @__PURE__ */ jsx(ResizableLayout, { leftPanel: {
      content: leftPanelContent,
      label: "Tournament Info",
      icon: LayoutDashboard,
      defaultSize: 30,
      minSize: 20,
      maxSize: 40,
      minWidth: "20rem"
    }, rightPanel: {
      content: rightPanelContent,
      label: "Content",
      icon: LayoutDashboard,
      defaultSize: 70
    }, defaultTab: "right", className: "flex-1" }) }),
    /* @__PURE__ */ jsx(AddManagerDialog, { open: showAddManagerDialog, onOpenChange: setShowAddManagerDialog, tournamentId })
  ] });
}
export {
  TournamentDetailPage as component
};
