import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { B as Button } from "./router-CozkPsbM.js";
import { ArrowLeft } from "lucide-react";
import { A as AddVenueModal } from "./add-venue-modal-C10x_m-g.js";
import { useState } from "react";
import "convex/react";
import "./globals-Bsfdm3JA.js";
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
import "react-hook-form";
import "./input-DCxY3WWX.js";
import "./label-Z8WohVOh.js";
import "@radix-ui/react-label";
import "./select-BtqsTuOV.js";
import "@radix-ui/react-select";
import "./textarea-CRbQQyBj.js";
import "./dialog-C0i-cdoB.js";
import "@radix-ui/react-dialog";
import "./venue-image-upload-VPDsqg2T.js";
import "@radix-ui/react-progress";
import "react-dropzone";
function NewVenuePage() {
  const navigate = useNavigate();
  const {
    user: currentUser
  } = useCurrentUser();
  const [modalOpen, setModalOpen] = useState(true);
  if (!currentUser) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", children: "Add New Venue" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mb-4", children: "You need to sign in to create a venue" }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => navigate({
        to: "/venues"
      }), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
        "Back to Venues"
      ] })
    ] }) });
  }
  const handleVenueAdded = (venueId) => {
    navigate({
      to: "/venues/$id",
      params: {
        id: venueId
      }
    });
  };
  const handleCancel = () => {
    navigate({
      to: "/venues"
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: handleCancel, children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
        "Back to Venues"
      ] }),
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Add New Venue" })
    ] }),
    /* @__PURE__ */ jsx(AddVenueModal, { open: modalOpen, onOpenChange: (open) => {
      setModalOpen(open);
      if (!open) {
        handleCancel();
      }
    }, onVenueAdded: handleVenueAdded })
  ] });
}
export {
  NewVenuePage as component
};
