import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { useMutation } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { useForm, useFieldArray } from "react-hook-form";
import { B as Button } from "./router-CozkPsbM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import { T as Textarea } from "./textarea-CRbQQyBj.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, b as DialogTitle } from "./dialog-C0i-cdoB.js";
import { Plus, X, Globe, Linkedin, Youtube, Twitter, Instagram, Facebook } from "lucide-react";
import { V as VenueImageUpload } from "./venue-image-upload-VPDsqg2T.js";
function AddVenueModal({ open, onOpenChange, onVenueAdded }) {
  const create = useMutation(api.venues.create);
  const { register, handleSubmit, control, formState: { isSubmitting }, reset, setValue } = useForm({
    defaultValues: {
      socialLinks: [],
      images: void 0
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks"
  });
  const onSubmit = async (data) => {
    try {
      const venueId = await create(data);
      onVenueAdded?.(venueId);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create venue:", error);
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
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Add New Venue" }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
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
          /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("type", value), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Type" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "residence", children: "Residence" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "business", children: "Business" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "pool_hall", children: "Pool Hall" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "sports_facility", children: "Sports Facility" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "bar", children: "Bar" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "other", children: "Other" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "venue-access", children: "Access *" }),
          /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("access", value), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Access" }) }),
            /* @__PURE__ */ jsxs(SelectContent, { children: [
              /* @__PURE__ */ jsx(SelectItem, { value: "public", children: "Public" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "private", children: "Private" }),
              /* @__PURE__ */ jsx(SelectItem, { value: "membership_needed", children: "Membership Needed" })
            ] })
          ] })
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
            onUpload: (storageId) => setValue("images", [storageId]),
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
            type: "button",
            disabled: isSubmitting,
            className: "flex-1",
            onClick: handleSubmit(onSubmit),
            children: isSubmitting ? "Adding..." : "Add Venue"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => onOpenChange(false),
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] }) });
}
export {
  AddVenueModal as A
};
