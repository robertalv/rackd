"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Label } from "@rackd/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { Textarea } from "@rackd/ui/components/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@rackd/ui/components/dialog";
import { Plus, X, Facebook, Instagram, Twitter, Globe, Youtube, Linkedin } from "lucide-react";
import { VenueImageUpload } from "./venue-image-upload";

type VenueFormData = {
  name: string;
  type: "residence" | "business" | "pool_hall" | "sports_facility" | "bar" | "other";
  description?: string;
  operatingHours?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  socialLinks: { platform: string; url: string; icon: string }[];
  access: "public" | "private" | "membership_needed";
  images?: string[];
};

interface AddVenueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVenueAdded?: (venueId: string) => void;
}

export function AddVenueModal({ open, onOpenChange, onVenueAdded }: AddVenueModalProps) {
  const create = useMutation(api.venues.create);
  const { register, handleSubmit, control, formState: { isSubmitting }, reset, setValue } = useForm<VenueFormData>({
    defaultValues: {
      socialLinks: [],
      images: undefined
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialLinks"
  });

  const onSubmit = async (data: VenueFormData) => {
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
    { value: "linkedin", label: "LinkedIn", icon: "linkedin" },
  ];

  const getIconComponent = (iconName: string) => {
    const iconProps = { className: "h-4 w-4" };
    switch (iconName) {
      case "facebook": return <Facebook {...iconProps} />;
      case "instagram": return <Instagram {...iconProps} />;
      case "twitter": return <Twitter {...iconProps} />;
      case "globe": return <Globe {...iconProps} />;
      case "youtube": return <Youtube {...iconProps} />;
      case "linkedin": return <Linkedin {...iconProps} />;
      default: return <Globe {...iconProps} />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Venue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="venue-name">Venue Name *</Label>
            <Input
              id="venue-name"
              {...register("name", { required: true })}
              placeholder="e.g. Downtown Pool Hall"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue-type">Venue Type *</Label>
              <Select onValueChange={(value) => setValue("type", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residence">Residence</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="pool_hall">Pool Hall</SelectItem>
                  <SelectItem value="sports_facility">Sports Facility</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-access">Access *</Label>
              <Select onValueChange={(value) => setValue("access", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="membership_needed">Membership Needed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue-address">Address</Label>
            <Input
              id="venue-address"
              {...register("address")}
              placeholder="123 Main St, City, State, ZIP"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue-description">Description</Label>
            <Textarea
              id="venue-description"
              {...register("description")}
              rows={3}
              placeholder="Describe the venue, amenities, etc."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue-hours">Operating Hours</Label>
            <Input
              id="venue-hours"
              {...register("operatingHours")}
              placeholder="e.g. Mon-Fri 9AM-11PM, Sat-Sun 10AM-12AM"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue-phone">Phone Number</Label>
              <Input
                id="venue-phone"
                {...register("phone")}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-email">Email</Label>
              <Input
                id="venue-email"
                {...register("email")}
                type="email"
                placeholder="contact@venue.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="venue-website">Website</Label>
            <Input
              id="venue-website"
              {...register("website")}
              placeholder="https://www.venue.com"
            />
          </div>
          <div className="space-y-2">
            <Label>Venue Image</Label>
            <VenueImageUpload
              onUpload={(storageId) => setValue("images", [storageId])}
              onError={(error) => {
                console.error("Image upload error:", error);
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Social Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ platform: "", url: "", icon: "" })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Social Link
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2">
                <div className="w-48">
                  <Select
                    onValueChange={(value) => {
                      setValue(`socialLinks.${index}.platform` as const, value);
                      const selected = socialPlatforms.find(p => p.value === value);
                      if (selected) {
                        setValue(`socialLinks.${index}.icon` as const, selected.icon);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {socialPlatforms.map(platform => (
                        <SelectItem key={platform.value} value={platform.value}>
                          <div className="flex items-center gap-2">
                            {getIconComponent(platform.icon)}
                            {platform.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Input
                  {...register(`socialLinks.${index}.url` as const)}
                  placeholder="URL"
                  className="flex-1"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              disabled={isSubmitting}
              className="flex-1"
              onClick={handleSubmit(onSubmit)}
            >
              {isSubmitting ? "Adding..." : "Add Venue"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





