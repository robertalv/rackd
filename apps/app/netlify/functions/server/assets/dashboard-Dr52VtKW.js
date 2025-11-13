import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { F as FeedProvider, A as ActivityFeed } from "./activity-feed-CTh6Zvln.js";
import { E as EnhancedUserCard, N as NearbyVenues } from "./nearby-venues-BZxt3vGT.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-CNeVhZxM.js";
import { B as Button } from "./router-CozkPsbM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { E as ExpandableSection } from "./expandable-section-DasINGSb.js";
import { u as useIsMobile } from "./use-mobile-BsFue-bT.js";
import { Users, UserPlus, Hash, TrendingUp } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { u as useCurrentUser, a as useIsCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { N as NavigationButton } from "./navigation-button-DrYMr2Yp.js";
import { P as ProfileAvatar } from "./profile-avatar--lu5GzhZ.js";
function FeedDashboard() {
  const isMobile = useIsMobile();
  const { user: currentUser } = useCurrentUser();
  const isOwnProfile = useIsCurrentUser(currentUser?._id);
  const [showHashtagSuggestions, setShowHashtagSuggestions] = useState(false);
  const [hashtagQuery, setHashtagQuery] = useState("");
  const [selectedHashtagIndex, setSelectedHashtagIndex] = useState(0);
  const hashtagSuggestionsRef = useRef(null);
  const customUser = useQuery(api.users.currentUser);
  const userProfile = useQuery(
    api.users.getProfile,
    customUser ? { userId: customUser._id } : "skip"
  );
  const userStats = useQuery(
    api.users.getStats,
    customUser ? { userId: customUser._id } : "skip"
  );
  const recentUsers = useQuery(api.users.getRecentUsers, { limit: 3 });
  const trendingHashtags = useQuery(api.posts.getTrendingHashtags, { limit: 5 });
  const hashtagSearchResults = useQuery(
    api.posts.searchHashtags,
    hashtagQuery.length >= 1 ? { query: hashtagQuery, limit: 10 } : "skip"
  );
  const notifications = useQuery(api.notifications.getUnreadCount);
  const handleHashtagClick = (hashtag) => {
    setHashtagQuery(hashtag.displayTag);
    setShowHashtagSuggestions(true);
    setSelectedHashtagIndex(0);
  };
  const handleHashtagSelect = (hashtag) => {
    window.location.href = `/hashtag/${hashtag.tag}`;
    setShowHashtagSuggestions(false);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (hashtagSuggestionsRef.current && !hashtagSuggestionsRef.current.contains(event.target)) {
        setShowHashtagSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const leftPanelContent = /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4 p-4", children: [
    customUser && userStats && /* @__PURE__ */ jsx(
      EnhancedUserCard,
      {
        user: {
          _id: customUser._id,
          username: customUser.username || "user",
          displayName: customUser.name || "User",
          bio: userProfile?.player?.bio || void 0,
          image: userProfile?.imageUrl || customUser.image || void 0,
          country: void 0,
          // Add if available in schema
          followerCount: userStats.followerCount,
          followingCount: userStats.followingCount,
          interests: customUser.interests || void 0,
          playerId: customUser.playerId
        },
        isOwnProfile
      }
    ),
    recentUsers && recentUsers.length > 0 && /* @__PURE__ */ jsxs(
      ExpandableSection,
      {
        title: "New Members",
        expanded: true,
        icon: /* @__PURE__ */ jsx(
          NavigationButton,
          {
            icon: UserPlus,
            ariaLabel: "New Members"
          }
        ),
        children: [
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: recentUsers.map((user) => {
            const daysAgo = Math.floor((Date.now() - user._creationTime) / (1e3 * 60 * 60 * 24));
            const timeText = daysAgo === 0 ? "today" : `${daysAgo}d ago`;
            return /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer",
                onClick: () => window.location.href = `/${user.username || "user"}`,
                children: [
                  /* @__PURE__ */ jsx(
                    ProfileAvatar,
                    {
                      user: {
                        displayName: currentUser?.displayName || user.username || "User",
                        image: currentUser?.imageUrl ?? void 0,
                        country: void 0
                      },
                      size: "sm"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                    /* @__PURE__ */ jsx("p", { className: "font-medium text-sm", children: user.displayName || user.name }),
                    /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
                      "@",
                      user.username
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: timeText })
                ]
              },
              user._id
            );
          }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", asChild: true, children: /* @__PURE__ */ jsxs("a", { href: "/discover/players", children: [
            /* @__PURE__ */ jsx(Users, { className: "h-4 w-4 mr-2" }),
            "Discover More Players"
          ] }) }) })
        ]
      }
    ),
    trendingHashtags && trendingHashtags.length > 0 && /* @__PURE__ */ jsxs(
      ExpandableSection,
      {
        title: "Trending Hashtags",
        expanded: true,
        icon: /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Hash, { className: "h-5 w-5 text-blue-500" }) }),
        children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-3 relative", children: [
            trendingHashtags.map((hashtag) => /* @__PURE__ */ jsxs(
              "div",
              {
                className: "flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer",
                onClick: () => handleHashtagClick(hashtag),
                children: [
                  /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsxs("p", { className: "font-medium text-sm", children: [
                    "#",
                    hashtag.displayTag
                  ] }) }),
                  /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
                    hashtag.useCount,
                    " ",
                    hashtag.useCount === 1 ? "post" : "posts"
                  ] })
                ]
              },
              hashtag._id
            )),
            showHashtagSuggestions && hashtagSearchResults && hashtagSearchResults.length > 0 && /* @__PURE__ */ jsx(
              "div",
              {
                ref: hashtagSuggestionsRef,
                className: "absolute top-0 left-0 right-0 mt-2 bg-accent border border-accent-foreground/10 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto",
                children: /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground mb-2", children: "Similar hashtags:" }),
                  hashtagSearchResults.map((hashtag, index) => /* @__PURE__ */ jsxs(
                    "div",
                    {
                      className: `flex items-center justify-between px-3 py-2 cursor-pointer rounded-md hover:bg-muted ${index === selectedHashtagIndex ? "bg-muted" : ""}`,
                      onClick: () => handleHashtagSelect(hashtag),
                      children: [
                        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                          /* @__PURE__ */ jsx(Hash, { className: "h-4 w-4 text-blue-500" }),
                          /* @__PURE__ */ jsxs("span", { className: "text-sm font-medium", children: [
                            "#",
                            hashtag.displayTag
                          ] })
                        ] }),
                        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
                          hashtag.useCount,
                          " ",
                          hashtag.useCount === 1 ? "post" : "posts"
                        ] })
                      ]
                    },
                    hashtag._id
                  ))
                ] })
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs(Button, { variant: "outline", className: "w-full", children: [
            /* @__PURE__ */ jsx(Hash, { className: "h-4 w-4 mr-2" }),
            "Explore More Tags"
          ] }) })
        ]
      }
    ),
    currentUser && /* @__PURE__ */ jsx(NearbyVenues, { limit: 5 })
  ] }) });
  const rightPanelContent = /* @__PURE__ */ jsx("div", { className: "h-full overflow-y-auto", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6 p-4", children: [
    notifications !== void 0 && notifications > 0 && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsxs(CardTitle, { className: "text-lg flex items-center justify-between", children: [
        "Notifications",
        /* @__PURE__ */ jsx(Badge, { variant: "destructive", children: notifications })
      ] }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx(Link, { to: "/feed", children: /* @__PURE__ */ jsx(Button, { variant: "outline", className: "w-full", children: "View All Notifications" }) }) })
    ] }),
    /* @__PURE__ */ jsx(ActivityFeed, { showComposer: true, feedType: "following" })
  ] }) });
  return /* @__PURE__ */ jsx(FeedProvider, { children: /* @__PURE__ */ jsx(
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
        label: "Feed",
        icon: TrendingUp,
        defaultSize: 75
      }
    }
  ) });
}
export {
  FeedDashboard as F
};
