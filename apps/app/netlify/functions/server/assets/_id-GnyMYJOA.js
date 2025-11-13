import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { B as Button, b as Route } from "./router-CozkPsbM.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-CNeVhZxM.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { Plus, X, Globe, Linkedin, Youtube, Twitter, Instagram, Facebook, ArrowLeft, Edit, Trash2, MapPin, Clock, Phone, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import { T as Textarea } from "./textarea-CRbQQyBj.js";
import { V as VenueImageUpload } from "./venue-image-upload-VPDsqg2T.js";
import { A as AlertDialog, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-J_mAUxEW.js";
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
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "@radix-ui/react-progress";
import "react-dropzone";
import "@radix-ui/react-alert-dialog";
function EditVenueForm({ venue, onVenueUpdated, onCancel }) {
  const update = useMutation(api.venues.update);
  const { register, handleSubmit, control, formState: { isSubmitting }, reset, setValue, watch } = useForm({
    defaultValues: {
      name: venue.name || "",
      type: venue.type || "other",
      description: venue.description || "",
      operatingHours: venue.operatingHours || "",
      address: venue.address || "",
      phone: venue.phone || "",
      email: venue.email || "",
      website: venue.website || "",
      socialLinks: venue.socialLinks || [],
      access: venue.access || "public",
      imageStorageId: venue.images?.[0]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks"
  });
  useEffect(() => {
    if (venue) {
      reset({
        name: venue.name || "",
        type: venue.type || "other",
        description: venue.description || "",
        operatingHours: venue.operatingHours || "",
        address: venue.address || "",
        phone: venue.phone || "",
        email: venue.email || "",
        website: venue.website || "",
        socialLinks: venue.socialLinks || [],
        access: venue.access || "public",
        imageStorageId: venue.images?.[0]
      });
    }
  }, [venue, reset]);
  const onSubmit = async (data) => {
    try {
      await update({
        id: venue._id,
        name: data.name,
        type: data.type,
        description: data.description,
        operatingHours: data.operatingHours,
        address: data.address,
        phone: data.phone,
        email: data.email,
        website: data.website,
        socialLinks: data.socialLinks,
        access: data.access,
        imageStorageId: data.imageStorageId
      });
      onVenueUpdated?.();
    } catch (error) {
      console.error("Failed to update venue:", error);
    }
  };
  const socialPlatforms = [
    { value: "facebook", label: "Facebook", icon: "facebook" },
    { value: "instagram", label: "Instagram", icon: "instagram" },
    { value: "twitter", label: "Twitter", icon: "twitter" },
    { value: "website", label: "Website", icon: "globe" },
    { value: "youtube", label: "YouTube", icon: "youtube" },
    { value: "linkedin", label: "LinkedIn", icon: "linkedin" }
  ];
  const getIconComponent = (iconName) => {
    const iconProps = { className: "h-4 w-4" };
    switch (iconName) {
      case "facebook":
        return /* @__PURE__ */ jsx(Facebook, { ...iconProps });
      case "instagram":
        return /* @__PURE__ */ jsx(Instagram, { ...iconProps });
      case "twitter":
        return /* @__PURE__ */ jsx(Twitter, { ...iconProps });
      case "globe":
        return /* @__PURE__ */ jsx(Globe, { ...iconProps });
      case "youtube":
        return /* @__PURE__ */ jsx(Youtube, { ...iconProps });
      case "linkedin":
        return /* @__PURE__ */ jsx(Linkedin, { ...iconProps });
      default:
        return /* @__PURE__ */ jsx(Globe, { ...iconProps });
    }
  };
  const currentImageStorageId = watch("imageStorageId");
  const currentImageUrl = venue.imageUrl;
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Edit Venue" }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "venue-name", children: "Venue Name *" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "venue-name",
            ...register("name", { required: true }),
            placeholder: "e.g. Downtown Pool Hall"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "venue-type", children: "Venue Type *" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: watch("type"),
              onValueChange: (value) => setValue("type", value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Type" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "residence", children: "Residence" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "business", children: "Business" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "pool_hall", children: "Pool Hall" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "sports_facility", children: "Sports Facility" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "bar", children: "Bar" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "other", children: "Other" })
                ] })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "venue-access", children: "Access *" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: watch("access"),
              onValueChange: (value) => setValue("access", value),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Access" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "public", children: "Public" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "private", children: "Private" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "membership_needed", children: "Membership Needed" })
                ] })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "venue-address", children: "Address" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "venue-address",
            ...register("address"),
            placeholder: "123 Main St, City, State, ZIP"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "venue-description", children: "Description" }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "venue-description",
            ...register("description"),
            rows: 3,
            placeholder: "Describe the venue, amenities, etc."
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "venue-hours", children: "Operating Hours" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "venue-hours",
            ...register("operatingHours"),
            placeholder: "e.g. Mon-Fri 9AM-11PM, Sat-Sun 10AM-12AM"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "venue-phone", children: "Phone Number" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "venue-phone",
              ...register("phone"),
              placeholder: "(555) 123-4567"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "venue-email", children: "Email" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "venue-email",
              ...register("email"),
              type: "email",
              placeholder: "contact@venue.com"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "venue-website", children: "Website" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            id: "venue-website",
            ...register("website"),
            placeholder: "https://www.venue.com"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { children: "Venue Image" }),
        /* @__PURE__ */ jsx(
          VenueImageUpload,
          {
            currentStorageId: currentImageStorageId,
            currentUrl: currentImageUrl,
            onUpload: (storageId) => setValue("imageStorageId", storageId),
            onDelete: () => setValue("imageStorageId", void 0),
            onError: (error) => {
              console.error("Image upload error:", error);
            }
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(Label, { children: "Social Links" }),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => append({ platform: "", url: "", icon: "" }),
              children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                "Add Social Link"
              ]
            }
          )
        ] }),
        fields.map((field, index) => /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx("div", { className: "w-48", children: /* @__PURE__ */ jsxs(
            Select,
            {
              value: watch(`socialLinks.${index}.platform`),
              onValueChange: (value) => {
                setValue(`socialLinks.${index}.platform`, value);
                const selected = socialPlatforms.find((p) => p.value === value);
                if (selected) {
                  setValue(`socialLinks.${index}.icon`, selected.icon);
                }
              },
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Platform" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: socialPlatforms.map((platform) => /* @__PURE__ */ jsx(SelectItem, { value: platform.value, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  getIconComponent(platform.icon),
                  platform.label
                ] }) }, platform.value)) })
              ]
            }
          ) }),
          /* @__PURE__ */ jsx(
            Input,
            {
              ...register(`socialLinks.${index}.url`),
              placeholder: "URL",
              className: "flex-1"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              onClick: () => remove(index),
              children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
            }
          )
        ] }, field.id))
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4", children: [
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "submit",
            disabled: isSubmitting,
            className: "flex-1",
            children: isSubmitting ? "Saving..." : "Save Changes"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: onCancel,
            children: "Cancel"
          }
        )
      ] })
    ] }) })
  ] });
}
function VenueDetailPage() {
  const navigate = useNavigate();
  const {
    user: currentUser
  } = useCurrentUser();
  const {
    id
  } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const venue = useQuery(api.venues.getById, {
    id
  });
  const deleteVenue = useMutation(api.venues.remove);
  const canEdit = venue && currentUser && venue.organizerId === currentUser._id;
  if (!venue) {
    return /* @__PURE__ */ jsx("div", { className: "container mx-auto px-4 py-8", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold mb-4", children: "Venue Not Found" }),
      /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => navigate({
        to: "/venues"
      }), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
        "Back to Venues"
      ] })
    ] }) });
  }
  const handleDelete = async () => {
    try {
      await deleteVenue({
        id
      });
      navigate({
        to: "/venues"
      });
    } catch (error) {
      console.error("Failed to delete venue:", error);
    }
  };
  const handleVenueUpdated = () => {
    setIsEditing(false);
  };
  if (isEditing && canEdit) {
    return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4 mb-6", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => setIsEditing(false), children: [
          /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
          "Cancel Edit"
        ] }),
        /* @__PURE__ */ jsxs("h1", { className: "text-2xl font-bold", children: [
          "Edit Venue: ",
          venue.name
        ] })
      ] }),
      /* @__PURE__ */ jsx(EditVenueForm, { venue, onVenueUpdated: handleVenueUpdated, onCancel: () => setIsEditing(false) })
    ] });
  }
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
  return /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxs(Button, { variant: "ghost", size: "sm", onClick: () => navigate({
        to: "/venues"
      }), children: [
        /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4 mr-2" }),
        "Back to Venues"
      ] }),
      canEdit && /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => setIsEditing(true), children: [
          /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4 mr-2" }),
          "Edit"
        ] }),
        /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: () => setShowDeleteDialog(true), children: [
          /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4 mr-2" }),
          "Delete"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      venue.imageUrl && /* @__PURE__ */ jsx("div", { className: "aspect-video rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx("img", { src: venue.imageUrl, alt: venue.name, className: "w-full h-full object-cover" }) }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx("div", { className: "flex items-start justify-between", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl mb-2", children: venue.name }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsx(Badge, { variant: "outline", children: getTypeDisplay(venue.type) }),
            /* @__PURE__ */ jsx(Badge, { className: getAccessColor(venue.access), children: venue.access.replace("_", " ") })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
          venue.description && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Description" }),
            /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: venue.description })
          ] }),
          venue.address && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(MapPin, { className: "h-5 w-5 text-muted-foreground mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-1", children: "Address" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: venue.address })
            ] })
          ] }),
          venue.operatingHours && /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsx(Clock, { className: "h-5 w-5 text-muted-foreground mt-0.5 shrink-0" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-1", children: "Operating Hours" }),
              /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: venue.operatingHours })
            ] })
          ] }),
          (venue.phone || venue.email || venue.website) && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Contact Information" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-4", children: [
              venue.phone && /* @__PURE__ */ jsxs("a", { href: `tel:${venue.phone}`, className: "flex items-center gap-2 text-muted-foreground hover:text-primary", children: [
                /* @__PURE__ */ jsx(Phone, { className: "h-4 w-4" }),
                venue.phone
              ] }),
              venue.email && /* @__PURE__ */ jsxs("a", { href: `mailto:${venue.email}`, className: "flex items-center gap-2 text-muted-foreground hover:text-primary", children: [
                /* @__PURE__ */ jsx(Mail, { className: "h-4 w-4" }),
                venue.email
              ] }),
              venue.website && /* @__PURE__ */ jsxs("a", { href: venue.website, target: "_blank", rel: "noopener noreferrer", className: "flex items-center gap-2 text-muted-foreground hover:text-primary", children: [
                /* @__PURE__ */ jsx(Globe, { className: "h-4 w-4" }),
                "Website"
              ] })
            ] })
          ] }),
          venue.socialLinks && venue.socialLinks.length > 0 && /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h3", { className: "font-semibold mb-2", children: "Social Links" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-4", children: venue.socialLinks.map((link, index) => /* @__PURE__ */ jsx("a", { href: link.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm hover:underline", children: link.platform }, index)) })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx(AlertDialog, { open: showDeleteDialog, onOpenChange: setShowDeleteDialog, children: /* @__PURE__ */ jsxs(AlertDialogContent, { children: [
      /* @__PURE__ */ jsxs(AlertDialogHeader, { children: [
        /* @__PURE__ */ jsx(AlertDialogTitle, { children: "Are you sure?" }),
        /* @__PURE__ */ jsxs(AlertDialogDescription, { children: [
          'This action cannot be undone. This will permanently delete the venue "',
          venue.name,
          '".'
        ] })
      ] }),
      /* @__PURE__ */ jsxs(AlertDialogFooter, { children: [
        /* @__PURE__ */ jsx(AlertDialogCancel, { children: "Cancel" }),
        /* @__PURE__ */ jsx(AlertDialogAction, { onClick: handleDelete, className: "bg-destructive text-destructive-foreground hover:bg-destructive/90", children: "Delete" })
      ] })
    ] }) })
  ] });
}
export {
  VenueDetailPage as component
};
