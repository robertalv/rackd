import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { T as Tabs, a as TabsList, b as TabsTrigger } from "./tabs-BPSwp-0A.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { B as Button } from "./router-CozkPsbM.js";
import { Users, MapPin, ChevronLeft, ChevronRight, Trophy, Search } from "lucide-react";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { S as ScrollArea } from "./scroll-area-DVprZJU7.js";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CvQ4KYcO.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { C as Card, d as CardContent } from "./card-CNeVhZxM.js";
import { Link } from "@tanstack/react-router";
import { P as ProfileAvatar } from "./profile-avatar--lu5GzhZ.js";
import { A as Avatar, b as AvatarFallback } from "./avatar-B5vlBfAE.js";
import { g as getCountryName, f as fetchFargoRatePlayersServer } from "./fargorate-api-CQHsWq4R.js";
import { hasFlag } from "country-flag-icons";
import "clsx";
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
import "sonner";
import "@tanstack/react-router-devtools";
import "@convex-dev/better-auth/react";
import "@convex-dev/better-auth/react-start";
import "zod";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "tailwind-merge";
import "react-resizable-panels";
import "./use-mobile-BsFue-bT.js";
import "@radix-ui/react-scroll-area";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
import "@radix-ui/react-avatar";
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
  console.log("Frontend query params:", queryParams);
  console.log("Frontend filters:", filters);
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
  const userIdCounts = /* @__PURE__ */ new Map();
  filteredPlayers.forEach((player) => {
    if (player.userId) {
      userIdCounts.set(player.userId, (userIdCounts.get(player.userId) || 0) + 1);
    }
  });
  const shouldShowUsername = (player) => {
    if (!player.username || !player.userId) return false;
    return userIdCounts.get(player.userId) === 1;
  };
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
    if (player.postCount > 10) {
      categories.push("Content Creator");
    }
    if (player.followerCount > 100) {
      categories.push("Popular Player");
    }
    return categories.slice(0, 3);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
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
        return /* @__PURE__ */ jsxs(
          TableRow,
          {
            className: "hover:bg-muted/50",
            children: [
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/players/$id",
                  params: { id: player._id },
                  className: "flex items-center space-x-3 hover:text-primary",
                  children: [
                    /* @__PURE__ */ jsx(
                      ProfileAvatar,
                      {
                        user: {
                          displayName: player.displayName || player.name || "",
                          image: player.userImageUrl || player.avatarUrl || player.image,
                          country: player.country
                        },
                        size: "xs"
                      }
                    ),
                    /* @__PURE__ */ jsxs("div", { children: [
                      /* @__PURE__ */ jsx("p", { className: "font-medium", children: player.name }),
                      shouldShowUsername(player) && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
                        "@",
                        player.username
                      ] }),
                      player.isVerified && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs mt-1", children: "Verified" })
                    ] })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/players/$id",
                  params: { id: player._id },
                  className: "flex items-center space-x-1 text-sm",
                  children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-muted-foreground" }),
                    /* @__PURE__ */ jsx("span", { children: [player.city, player.region, player.country].filter(Boolean).join(", ") || "Unknown" })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/players/$id",
                  params: { id: player._id },
                  className: "flex items-center space-x-2",
                  children: player.fargoRating ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("span", { className: "font-bold text-lg text-primary", children: player.fargoRating }),
                    player.fargoRobustness && /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                      "R: ",
                      player.fargoRobustness
                    ] })
                  ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No rating" })
                }
              ) }),
              /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs(
                Link,
                {
                  to: "/players/$id",
                  params: { id: player._id },
                  className: "flex flex-wrap gap-1",
                  children: [
                    categories.slice(0, 2).map((category, index) => /* @__PURE__ */ jsx(Badge, { variant: "category", className: "text-xs", children: category }, index)),
                    categories.length > 2 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
                      "+",
                      categories.length - 2
                    ] })
                  ]
                }
              ) }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", asChild: true, children: /* @__PURE__ */ jsx(
                Link,
                {
                  to: "/players/$id",
                  params: { id: player._id },
                  children: "View Profile"
                }
              ) }) })
            ]
          },
          player._id
        );
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
function CountryFlag({ countryCode }) {
  const [FlagComponent, setFlagComponent] = useState(null);
  useEffect(() => {
    const countryCodeMap = {
      "USA": "US",
      "DEU": "DE",
      "IRQ": "IQ",
      "TWN": "TW",
      "ESP": "ES",
      "PHL": "PH",
      "SGP": "SG",
      "SCT": "GB",
      "ALB": "AL",
      "AUT": "AT",
      "POL": "PL",
      "GRC": "GR",
      "JPN": "JP",
      "CHN": "CN",
      "NLD": "NL",
      "CAN": "CA",
      "HKG": "HK",
      "HUN": "HU",
      "VNM": "VN",
      "BIH": "BA",
      "FIN": "FI",
      "GBR": "GB",
      "RUS": "RU",
      "UKR": "UA",
      "DNK": "DK",
      "SYR": "SY",
      "PER": "PE",
      "IDN": "ID",
      "CYP": "CY",
      "ITA": "IT",
      "FRA": "FR",
      "BEL": "BE",
      "SWE": "SE",
      "NOR": "NO",
      "CZE": "CZ",
      "SVK": "SK",
      "SVN": "SI",
      "HRV": "HR",
      "SRB": "RS",
      "MNE": "ME",
      "MKD": "MK",
      "BGR": "BG",
      "ROU": "RO",
      "LTU": "LT",
      "LVA": "LV",
      "EST": "EE",
      "BLR": "BY",
      "MDA": "MD",
      "GEO": "GE",
      "ARM": "AM",
      "AZE": "AZ",
      "KAZ": "KZ",
      "UZB": "UZ",
      "TKM": "TM",
      "KGZ": "KG",
      "TJK": "TJ",
      "MNG": "MN",
      "KOR": "KR",
      "PRK": "KP",
      "THA": "TH",
      "MYS": "MY",
      "BRN": "BN",
      "LAO": "LA",
      "KHM": "KH",
      "MMR": "MM"
    };
    const twoLetterCode = countryCodeMap[countryCode] || countryCode;
    if (hasFlag(twoLetterCode.toUpperCase())) {
      import("country-flag-icons/react/3x2").then((flags) => {
        const FlagComp = flags[twoLetterCode.toUpperCase()];
        if (FlagComp) {
          setFlagComponent(() => FlagComp);
        }
      }).catch(() => {
        setFlagComponent(null);
      });
    }
  }, [countryCode]);
  const renderFallback = () => {
    if (FlagComponent) {
      return /* @__PURE__ */ jsx("div", { className: "w-full h-full overflow-hidden rounded-full", children: /* @__PURE__ */ jsx(FlagComponent, { className: "w-full h-full object-cover scale-150" }) });
    }
    return /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center bg-muted rounded-full", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: countryCode.slice(0, 2) }) });
  };
  return /* @__PURE__ */ jsx(Avatar, { className: "w-6 h-6", children: /* @__PURE__ */ jsx(AvatarFallback, { className: "border-0 p-0", children: renderFallback() }) });
}
function FargoWorldRankingsTable({ players, searchQuery = "" }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  const filteredPlayers = players.filter((player) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const firstName = (player.FirstName || player.firstName || "").toLowerCase();
    const lastName = (player.LastName || player.lastName || "").toLowerCase();
    const nickname = (player.Nickname || "").toLowerCase();
    const city = (player.City || "").toLowerCase();
    const country = getCountryName(player.Country || player.country || "").toLowerCase();
    const id = (player.Id || player.id || "").toString();
    const fullName = `${firstName} ${lastName}`;
    return fullName.includes(query) || nickname.includes(query) || city.includes(query) || country.includes(query) || id.includes(query);
  });
  const totalPages = Math.ceil(filteredPlayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlayers = filteredPlayers.slice(startIndex, endIndex);
  const getRatingColor = (rating) => {
    const ratingNum = parseInt(rating);
    if (ratingNum >= 800) return "text-yellow-500";
    if (ratingNum >= 700) return "text-orange-500";
    if (ratingNum >= 600) return "text-blue-500";
    return "text-primary";
  };
  const getRatingBadge = (rating) => {
    const ratingNum = parseInt(rating);
    if (ratingNum >= 800) return { label: "Elite", variant: "default" };
    if (ratingNum >= 700) return { label: "Master", variant: "secondary" };
    if (ratingNum >= 600) return { label: "Pro", variant: "outline" };
    return { label: "Advanced", variant: "outline" };
  };
  if (filteredPlayers.length === 0) {
    return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold mb-2", children: "No players found" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: searchQuery.length > 0 ? "Try a different search term" : "No rankings available" })
    ] }) }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-4", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-2xl font-bold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Trophy, { className: "h-6 w-6 text-yellow-500" }),
        "World Pro Rankings"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Top ",
        filteredPlayers.length,
        " players worldwide by FargoRate"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Table, { children: [
      /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
        /* @__PURE__ */ jsx(TableHead, { className: "w-16", children: "Rank" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Player" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Location" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Nickname" }),
        /* @__PURE__ */ jsx(TableHead, { children: "Fargo ID" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Rating" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Robustness" }),
        /* @__PURE__ */ jsx(TableHead, { className: "text-center", children: "Tier" })
      ] }) }),
      /* @__PURE__ */ jsx(TableBody, { children: currentPlayers.map((player, index) => {
        const globalRank = startIndex + index + 1;
        const rating = player.FargoRating || player.rating || player.effectiveRating || "0";
        const ratingBadge = getRatingBadge(rating);
        const robustness = player.Robustness || player.robustness || "0";
        const firstName = player.FirstName || player.firstName || "";
        const lastName = player.LastName || player.lastName || "";
        const nickname = player.Nickname || "";
        const city = player.City || "";
        const state = player.State || "";
        const country = player.Country || player.country || "";
        const id = player.Id || player.id || "";
        return /* @__PURE__ */ jsxs(TableRow, { className: "hover:bg-muted/50", children: [
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "font-bold text-lg", children: globalRank <= 3 ? /* @__PURE__ */ jsxs("span", { className: globalRank === 1 ? "text-yellow-500" : globalRank === 2 ? "text-gray-400" : "text-orange-500", children: [
            "#",
            globalRank
          ] }) : /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
            "#",
            globalRank
          ] }) }) }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
            /* @__PURE__ */ jsx(CountryFlag, { countryCode: country }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("p", { className: "font-medium", children: [
                firstName,
                " ",
                lastName
              ] }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: getCountryName(country) })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm", children: city ? /* @__PURE__ */ jsxs(Fragment, { children: [
            city,
            state && state !== country && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              ", ",
              state
            ] })
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }) }),
          /* @__PURE__ */ jsx(TableCell, { children: nickname ? /* @__PURE__ */ jsxs("span", { className: "text-sm italic text-muted-foreground", children: [
            '"',
            nickname,
            '"'
          ] }) : /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-muted-foreground", children: id }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx("div", { className: "flex flex-col items-end", children: /* @__PURE__ */ jsx("span", { className: `font-bold text-lg ${getRatingColor(rating)}`, children: rating }) }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: parseInt(robustness).toLocaleString() }) }),
          /* @__PURE__ */ jsx(TableCell, { className: "text-center", children: /* @__PURE__ */ jsx(Badge, { variant: ratingBadge.variant, children: ratingBadge.label }) })
        ] }, id || index);
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
            let page = i + 1;
            if (totalPages > 5 && currentPage > 3) {
              page = currentPage - 2 + i;
              if (page > totalPages - 2) {
                page = totalPages - 4 + i;
              }
            }
            if (page > totalPages) return null;
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
          totalPages > 5 && currentPage < totalPages - 2 && /* @__PURE__ */ jsxs(Fragment, { children: [
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
function PlayersPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fargoProPlayers, setFargoProPlayers] = useState([]);
  const [isLoadingFargo, setIsLoadingFargo] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    country: "",
    region: "",
    fargoRating: [200, 900],
    location: "",
    followers: "Any",
    engagement: "",
    category: "Any"
  });
  useEffect(() => {
    const fetchFargoPlayers = async () => {
      if (activeTab === "pro" && fargoProPlayers.length === 0) {
        setIsLoadingFargo(true);
        try {
          const players = await fetchFargoRatePlayersServer("World");
          console.log("FargoRate World Rankings Data:", players);
          console.log("First player details:", players[0]);
          console.log("Total players fetched:", players.length);
          setFargoProPlayers(players);
        } catch (error) {
          console.error("Error fetching FargoRate players:", error);
        } finally {
          setIsLoadingFargo(false);
        }
      }
    };
    fetchFargoPlayers();
  }, [activeTab, fargoProPlayers.length]);
  const proFilters = {
    ...filters,
    fargoRating: [600, 900]
    // Pro level ratings
  };
  const leftPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3", children: /* @__PURE__ */ jsx(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "w-full", children: /* @__PURE__ */ jsxs(TabsList, { className: "w-full bg-transparent p-0", children: [
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "all", className: "flex-1 data-[state=active]:bg-accent", children: [
        /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-2" }),
        "All Players"
      ] }),
      /* @__PURE__ */ jsxs(TabsTrigger, { value: "pro", className: "flex-1 data-[state=active]:bg-accent", children: [
        /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4 mr-2" }),
        "Pro Rankings"
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      activeTab === "all" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "All Players" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Browse all players in the Digital Pool community. Use the search above to find specific players by name or username." })
      ] }),
      activeTab === "pro" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Pro Rankings" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "View professional players with Fargo ratings of 600 and above. These are the top-ranked players in the pool community." }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 p-3 bg-muted rounded-lg", children: /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("strong", { children: "Fargo Rating Scale:" }),
          /* @__PURE__ */ jsx("br", {}),
          "600+ = Professional",
          /* @__PURE__ */ jsx("br", {}),
          "500-599 = Advanced",
          /* @__PURE__ */ jsx("br", {}),
          "400-499 = Intermediate",
          /* @__PURE__ */ jsx("br", {}),
          "Below 400 = Beginner"
        ] }) })
      ] })
    ] }) })
  ] });
  const rightPanelContent = /* @__PURE__ */ jsx("div", { className: "flex h-full flex-col", children: /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-y-auto p-4", children: [
    activeTab === "all" && /* @__PURE__ */ jsx(DiscoverPlayersTable, { searchQuery, filters }),
    activeTab === "pro" && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: isLoadingFargo ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" }),
      /* @__PURE__ */ jsx("p", { children: "Loading world rankings from FargoRate..." })
    ] }) }) : fargoProPlayers.length > 0 ? /* @__PURE__ */ jsx(FargoWorldRankingsTable, { players: fargoProPlayers, searchQuery }) : /* @__PURE__ */ jsx(DiscoverPlayersTable, { searchQuery, filters: proFilters }) })
  ] }) });
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { placeholder: "Search players by name or username...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
    ] }) }) }),
    /* @__PURE__ */ jsx(ResizableLayout, { leftPanel: {
      content: leftPanelContent,
      label: "Filters",
      icon: Users,
      defaultSize: 30,
      minSize: 20,
      maxSize: 40,
      minWidth: "20rem"
    }, rightPanel: {
      content: rightPanelContent,
      label: "Players",
      icon: Search,
      defaultSize: 70
    }, defaultTab: "right", className: "flex-1" })
  ] });
}
export {
  PlayersPage as component
};
