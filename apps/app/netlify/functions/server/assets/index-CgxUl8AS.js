import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { B as Button } from "./router-CozkPsbM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-CNeVhZxM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { S as ScrollArea } from "./scroll-area-DVprZJU7.js";
import { R as ResizableLayout } from "./resizable-layout-Zh5SKP7T.js";
import { Plus, MapPin, Search, ListFilter, Edit, Clock, Phone, Mail, Globe } from "lucide-react";
import { useState } from "react";
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
import "@radix-ui/react-scroll-area";
import "react-resizable-panels";
import "./tabs-BPSwp-0A.js";
import "@radix-ui/react-tabs";
import "./use-mobile-BsFue-bT.js";
function VenuesPage() {
  const navigate = useNavigate();
  const {
    user: currentUser
  } = useCurrentUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const myVenues = useQuery(api.venues.getMyVenues);
  const allVenues = useQuery(api.venues.list, {});
  const venueTypes = [{
    value: "all",
    label: "All Types"
  }, {
    value: "pool_hall",
    label: "Pool Hall"
  }, {
    value: "bar",
    label: "Bar"
  }, {
    value: "sports_facility",
    label: "Sports Facility"
  }, {
    value: "business",
    label: "Business"
  }, {
    value: "residence",
    label: "Residence"
  }, {
    value: "other",
    label: "Other"
  }];
  const filteredVenues = allVenues?.filter((venue) => {
    const matchesSearch = !searchQuery || venue.name.toLowerCase().includes(searchQuery.toLowerCase()) || venue.address?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || venue.type === typeFilter;
    return matchesSearch && matchesType;
  }) || [];
  const leftPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsxs("div", { className: "border-b px-4 py-3.5", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-3", children: "Filter by Type" }),
      /* @__PURE__ */ jsx("div", { className: "space-y-2", children: venueTypes.map((type) => /* @__PURE__ */ jsx(Button, { variant: typeFilter === type.value ? "default" : "outline", size: "sm", onClick: () => setTypeFilter(type.value), className: "w-full justify-start", children: type.label }, type.value)) })
    ] }),
    currentUser && myVenues && myVenues.length > 0 && /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "My Venues" }),
      myVenues.map((venue) => /* @__PURE__ */ jsxs(Link, { to: "/venues/$id", params: {
        id: venue._id
      }, className: "block p-2 rounded-lg hover:bg-accent transition-colors", children: [
        /* @__PURE__ */ jsx("div", { className: "font-medium text-sm", children: venue.name }),
        /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: venue.type.replace("_", " ") })
      ] }, venue._id))
    ] }) })
  ] });
  const rightPanelContent = /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-4 py-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold", children: [
        filteredVenues.length,
        " ",
        filteredVenues.length === 1 ? "Venue" : "Venues"
      ] }),
      currentUser && /* @__PURE__ */ jsxs(Button, { onClick: () => navigate({
        to: "/venues/new"
      }), children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Add Venue"
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1", children: /* @__PURE__ */ jsx("div", { className: "p-4", children: filteredVenues.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(MapPin, { className: "h-12 w-12 mx-auto mb-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: searchQuery || typeFilter !== "all" ? "No venues match your filters" : "No venues found" }),
      currentUser && /* @__PURE__ */ jsxs(Button, { onClick: () => navigate({
        to: "/venues/new"
      }), children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-2" }),
        "Add First Venue"
      ] })
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: filteredVenues.map((venue) => /* @__PURE__ */ jsx(VenueCard, { venue, canEdit: venue.organizerId === currentUser?._id }, venue._id)) }) }) })
  ] });
  return /* @__PURE__ */ jsxs("div", { className: "flex h-full flex-col", children: [
    /* @__PURE__ */ jsx("div", { className: "border-b px-6 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex items-center gap-4", children: /* @__PURE__ */ jsxs("div", { className: "relative flex-1", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { placeholder: "Search venues...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-9" })
    ] }) }) }),
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
      label: "Venues",
      icon: MapPin,
      defaultSize: 75
    }, defaultTab: "right", className: "flex-1" })
  ] });
}
function VenueCard({
  venue,
  canEdit
}) {
  const getTypeDisplay = (type) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };
  const getAccessColor = (access) => {
    switch (access) {
      case "public":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "private":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "membership_needed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };
  return /* @__PURE__ */ jsx(Link, { to: "/venues/$id", params: {
    id: venue._id
  }, children: /* @__PURE__ */ jsxs(Card, { className: "hover:shadow-md transition-shadow overflow-hidden h-full cursor-pointer", children: [
    venue.imageUrl && /* @__PURE__ */ jsxs("div", { className: "aspect-video relative overflow-hidden", children: [
      /* @__PURE__ */ jsx("img", { src: venue.imageUrl, alt: venue.name, className: "w-full h-full object-cover" }),
      canEdit && /* @__PURE__ */ jsx("div", { className: "absolute top-2 right-2", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) }) })
    ] }),
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx(CardTitle, { className: "text-lg mb-2", children: venue.name }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-2 flex-wrap", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "text-xs", children: getTypeDisplay(venue.type) }),
          /* @__PURE__ */ jsx(Badge, { className: `text-xs ${getAccessColor(venue.access)}`, children: venue.access.replace("_", " ") })
        ] })
      ] }),
      canEdit && !venue.imageUrl && /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", className: "h-8 w-8 p-0", children: /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }) })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      venue.address && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4 text-muted-foreground mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground line-clamp-2", children: venue.address })
      ] }),
      venue.operatingHours && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2 text-sm", children: [
        /* @__PURE__ */ jsx(Clock, { className: "h-4 w-4 text-muted-foreground mt-0.5 shrink-0" }),
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground line-clamp-1", children: venue.operatingHours })
      ] }),
      venue.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: venue.description }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 pt-2", children: [
        venue.phone && /* @__PURE__ */ jsx("a", { href: `tel:${venue.phone}`, className: "text-muted-foreground hover:text-primary", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }) }),
        venue.email && /* @__PURE__ */ jsx("a", { href: `mailto:${venue.email}`, className: "text-muted-foreground hover:text-primary", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }) }),
        venue.website && /* @__PURE__ */ jsx("a", { href: venue.website, target: "_blank", rel: "noopener noreferrer", className: "text-muted-foreground hover:text-primary", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }) })
      ] }),
      venue.socialLinks && venue.socialLinks.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2 pt-1", children: venue.socialLinks.map((link, index) => /* @__PURE__ */ jsx("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", className: "text-xs hover:underline", title: link.platform, onClick: (e) => e.stopPropagation(), children: link.icon }, index)) })
    ] })
  ] }) });
}
export {
  VenuesPage as component
};
