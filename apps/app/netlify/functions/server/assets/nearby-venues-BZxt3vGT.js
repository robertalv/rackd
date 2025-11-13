import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState } from "react";
import { C as Card, d as CardContent, e as CardFooter } from "./card-CNeVhZxM.js";
import { B as Button } from "./router-CozkPsbM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { P as ProfileAvatar } from "./profile-avatar--lu5GzhZ.js";
import { E as ExpandableSection } from "./expandable-section-DasINGSb.js";
import { MoreVertical, Plus, X, Check, Tags, MapPin, Clock, Trophy, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQuery } from "convex/react";
import { b as api, u as useSettingsState } from "./globals-Bsfdm3JA.js";
import { toast } from "sonner";
import { N as NavigationButton } from "./navigation-button-DrYMr2Yp.js";
function EnhancedUserCard({ user, localTournaments = [], isOwnProfile = false }) {
  const [interests, setInterests] = useState(user.interests || []);
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const updateUserInterests = useMutation(api.users.updateInterests);
  const { setOpen: setSettingsDialogOpen } = useSettingsState();
  React.useEffect(() => {
    if (user.interests) {
      setInterests(user.interests);
    }
  }, [user.interests]);
  const handleAddInterest = async () => {
    const trimmedInterest = newInterest.trim();
    if (!trimmedInterest) return;
    if (interests.length >= 15) {
      toast.error("Maximum 15 interests allowed");
      return;
    }
    if (interests.some(
      (interest) => interest.toLowerCase() === trimmedInterest.toLowerCase()
    )) {
      toast.error("Interest already exists");
      return;
    }
    const newInterests = [...interests, trimmedInterest];
    setInterests(newInterests);
    setNewInterest("");
    setIsAddingInterest(false);
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest added successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to add interest");
      setInterests(interests);
    }
  };
  const handleRemoveInterest = async (interestToRemove) => {
    const newInterests = interests.filter((interest) => interest !== interestToRemove);
    setInterests(newInterests);
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest removed successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to remove interest");
      setInterests(interests);
    }
  };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    } else if (e.key === "Escape") {
      setIsAddingInterest(false);
      setNewInterest("");
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full mx-auto space-y-4", children: [
    /* @__PURE__ */ jsxs(Card, { className: "bg-accent/50 overflow-hidden p-0", children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsx("div", { className: "relative h-30 bg-accent/50", children: /* @__PURE__ */ jsx(Button, { size: "icon", variant: "ghost", className: "absolute top-3 right-3 transition-colors", children: /* @__PURE__ */ jsx(MoreVertical, { size: 20 }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "px-6 pt-0 relative -top-12", children: [
          /* @__PURE__ */ jsx("div", { className: "flex justify-center relative", children: /* @__PURE__ */ jsx("div", { className: "w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 overflow-hidden border-4 border-gray-700 shadow-2xl", children: /* @__PURE__ */ jsx(
            ProfileAvatar,
            {
              user,
              size: "xl",
              className: "w-full h-full"
            }
          ) }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex justify-center gap-30 mb-6 -top-24", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold mb-1", children: user.followerCount }),
              /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs", children: "Followers" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("div", { className: "text-xl font-semibold mb-1", children: user.followingCount }),
              /* @__PURE__ */ jsx("div", { className: "text-gray-400 text-xs", children: "Following" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
            /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: user.displayName }),
            /* @__PURE__ */ jsxs("p", { className: "text-gray-400 text-sm", children: [
              "@",
              user.username
            ] }),
            user.bio && /* @__PURE__ */ jsx("p", { className: "text-accent-foreground leading-relaxed px-2 mt-6", children: user.bio })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(CardFooter, { className: "flex justify-center items-center p-3 border-t bg-accent/50 gap-2", children: [
        user.username && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            className: "rounded-full",
            onClick: () => window.location.href = `/${user.username}`,
            children: "My Profile"
          }
        ),
        user.playerId && /* @__PURE__ */ jsx(
          Button,
          {
            variant: "outline",
            className: "rounded-full",
            onClick: () => window.location.href = `/players/${user.playerId}`,
            children: "My Player Profile"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx(
      ExpandableSection,
      {
        title: "Interests",
        expanded: true,
        icon: /* @__PURE__ */ jsx(
          NavigationButton,
          {
            icon: Tags,
            ariaLabel: "Interests"
          }
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
          isOwnProfile && !isAddingInterest && interests.length < 15 && /* @__PURE__ */ jsxs(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => setSettingsDialogOpen(true),
              className: "w-full",
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
                "Add Interest"
              ]
            }
          ),
          interests.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              interests.slice(0, 7).map((interest, index) => /* @__PURE__ */ jsxs(
                Badge,
                {
                  variant: "secondary",
                  className: `px-3 py-1 flex items-center gap-1 ${isOwnProfile ? "group hover:bg-destructive/20 transition-colors" : ""}`,
                  children: [
                    interest,
                    isOwnProfile && /* @__PURE__ */ jsx(
                      Button,
                      {
                        size: "icon",
                        variant: "ghost",
                        className: "h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground",
                        onClick: () => handleRemoveInterest(interest),
                        children: /* @__PURE__ */ jsx(X, { size: 8 })
                      }
                    )
                  ]
                },
                index
              )),
              interests.length > 7 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "px-3 py-1", children: [
                "+",
                interests.length - 7,
                " more"
              ] })
            ] }),
            isOwnProfile && isAddingInterest && /* @__PURE__ */ jsxs("div", { className: "flex gap-2 mb-3", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: newInterest,
                  onChange: (e) => setNewInterest(e.target.value),
                  onKeyDown: handleKeyPress,
                  placeholder: "Add interest...",
                  className: "h-8 text-sm",
                  maxLength: 30,
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  onClick: handleAddInterest,
                  disabled: !newInterest.trim(),
                  className: "h-8 px-2",
                  children: /* @__PURE__ */ jsx(Check, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => {
                    setIsAddingInterest(false);
                    setNewInterest("");
                  },
                  className: "h-8 px-2",
                  children: /* @__PURE__ */ jsx(X, { size: 12 })
                }
              )
            ] })
          ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "No interests added yet" }),
            isOwnProfile && (isAddingInterest ? /* @__PURE__ */ jsxs("div", { className: "flex gap-2 justify-center", children: [
              /* @__PURE__ */ jsx(
                Input,
                {
                  value: newInterest,
                  onChange: (e) => setNewInterest(e.target.value),
                  onKeyDown: handleKeyPress,
                  placeholder: "Add your first interest...",
                  className: "h-8 text-sm max-w-48",
                  maxLength: 30,
                  autoFocus: true
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  onClick: handleAddInterest,
                  disabled: !newInterest.trim(),
                  className: "h-8 px-2",
                  children: /* @__PURE__ */ jsx(Check, { size: 12 })
                }
              ),
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline",
                  onClick: () => {
                    setIsAddingInterest(false);
                    setNewInterest("");
                  },
                  className: "h-8 px-2",
                  children: /* @__PURE__ */ jsx(X, { size: 12 })
                }
              )
            ] }) : /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => setSettingsDialogOpen(true),
                children: "Add Interests"
              }
            ))
          ] })
        ] })
      }
    ),
    isOwnProfile && /* @__PURE__ */ jsx(
      ExpandableSection,
      {
        title: "Local Tournaments",
        expanded: true,
        icon: /* @__PURE__ */ jsx(
          NavigationButton,
          {
            icon: Trophy,
            ariaLabel: "Local Tournaments"
          }
        ),
        children: localTournaments.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "space-y-3", children: localTournaments.slice(0, 2).map((tournament) => /* @__PURE__ */ jsxs("div", { className: "p-3 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/50", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between mb-2", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm", children: tournament.name }),
                tournament.venue && /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 mt-1", children: [
                    /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 text-gray-400" }),
                    /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: tournament.venue.name })
                  ] }),
                  (tournament.venue.city || tournament.venue.state) && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1", children: /* @__PURE__ */ jsx("span", { className: "text-xs text-gray-400", children: [tournament.venue.city, tournament.venue.state].filter(Boolean).join(", ") }) })
                ] })
              ] }),
              tournament.entryFee && /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
                /* @__PURE__ */ jsxs("div", { className: "text-sm font-medium text-green-400", children: [
                  "$",
                  tournament.entryFee
                ] }),
                /* @__PURE__ */ jsx("div", { className: "text-xs text-gray-400", children: "Entry" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-400", children: [
                /* @__PURE__ */ jsx(Clock, { className: "h-3 w-3" }),
                /* @__PURE__ */ jsx("span", { children: formatDistanceToNow(new Date(tournament.startDate), { addSuffix: true }) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                tournament.maxPlayers && /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
                  tournament.registeredPlayers,
                  "/",
                  tournament.maxPlayers
                ] }),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "h-6 px-2 text-xs",
                    onClick: () => window.location.href = `/tournaments/${tournament._id}`,
                    children: "Join"
                  }
                )
              ] })
            ] })
          ] }, tournament._id)) }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 pt-3 border-t border-gray-700/50", children: /* @__PURE__ */ jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              className: "w-full text-xs",
              onClick: () => window.location.href = "/tournaments",
              children: "View all tournaments in your area"
            }
          ) })
        ] }) : /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
          /* @__PURE__ */ jsx(Trophy, { className: "h-8 w-8 text-gray-400 mx-auto mb-2" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mb-2", children: "No local tournaments found" }),
          /* @__PURE__ */ jsx(
            Button,
            {
              variant: "outline",
              size: "sm",
              onClick: () => window.location.href = "/tournaments",
              children: "Browse Tournaments"
            }
          )
        ] })
      }
    )
  ] });
}
function NearbyVenues({ userId, limit = 5 }) {
  const venues = useQuery(api.venues.getNearby, { limit }) ?? [];
  if (!venues || venues.length === 0) {
    return null;
  }
  return /* @__PURE__ */ jsxs(
    ExpandableSection,
    {
      title: "Nearby Venues",
      expanded: true,
      icon: /* @__PURE__ */ jsx("div", { className: "h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-orange-500" }) }),
      children: [
        /* @__PURE__ */ jsx("div", { className: "space-y-3", children: venues.map((venue) => /* @__PURE__ */ jsx(Card, { className: "hover:bg-muted/50 transition-colors border-muted", children: /* @__PURE__ */ jsx(CardContent, { className: "p-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
              /* @__PURE__ */ jsx("h4", { className: "font-medium text-sm truncate", children: venue.name }),
              /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs shrink-0", children: venue.type?.replace(/_/g, " ") })
            ] }),
            (venue.city || venue.region) && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-1 text-xs text-muted-foreground mb-1", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-3 w-3 shrink-0 mt-0.5" }),
              /* @__PURE__ */ jsx("span", { className: "truncate", children: [venue.city, venue.region].filter(Boolean).join(", ") })
            ] }),
            venue.address && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground line-clamp-1", children: venue.address })
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              size: "sm",
              variant: "ghost",
              className: "h-8 px-2 shrink-0",
              onClick: () => {
                console.log("Navigate to venue:", venue._id);
              },
              children: /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
            }
          )
        ] }) }) }, venue._id)) }),
        /* @__PURE__ */ jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "outline",
            className: "w-full",
            size: "sm",
            onClick: () => {
              console.log("Navigate to venues page");
            },
            children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 mr-2" }),
              "Browse All Venues"
            ]
          }
        ) })
      ]
    }
  );
}
export {
  EnhancedUserCard as E,
  NearbyVenues as N
};
