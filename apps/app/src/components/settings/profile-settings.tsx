"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useMutation } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"
import { Button } from "@rackd/ui/components/button"
import { Input } from "@rackd/ui/components/input"
import { HeaderLabel, Label } from "@rackd/ui/components/label"
import { Textarea } from "@rackd/ui/components/textarea"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@rackd/ui/components/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rackd/ui/components/select"
import { Camera, Upload, X } from "lucide-react"
import { useImageUpload } from "@/hooks/use-image-upload"
import { countries as countriesList } from 'countries-list'
import * as flags from 'country-flag-icons/react/3x2'
import { ProfileAvatar } from "../profile-avatar"

const profileFormSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  country: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileSettingsProps {
  user: any
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const updateProfile = useMutation(api.users.updateProfile)
  const [profileImage, setProfileImage] = React.useState<string>(user?.imageUrl || user?.coverImage || "")

  // Update profile image when user data changes
  React.useEffect(() => {
    if (user?.imageUrl || user?.coverImage) {
      setProfileImage(user.imageUrl || user.coverImage || "")
    }
  }, [user?.imageUrl, user?.coverImage])
  
  const { uploadImage, isUploading } = useImageUpload({
    category: "player_avatar",
    relatedId: user?._id,
    relatedType: "user",
    onSuccess: async (imageUrl, _storageId) => {
      // imageUrl is already the processed URL from processImageUpload
      // (could be Cloudflare Images URL for HEIC files, or regular Convex storage URL)
      try {
        if (imageUrl) {
          // Update profile with the processed image URL
          await updateProfile({ image: imageUrl })
          setProfileImage(imageUrl)
          toast.success("Profile image updated successfully!")
        }
      } catch (error) {
        console.error("Failed to update profile image:", error)
        toast.error("Failed to update profile image. Please try again.")
      }
    },
  })
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      displayName: user?.displayName || "",
      email: user?.email || "",
      bio: user?.bio || "",
      city: user?.city || "",
      region: user?.region || "",
      country: user?.country || "",
    },
  })

  // Update form values when user data changes
  React.useEffect(() => {
    if (user) {
      form.reset({
        displayName: user.displayName || "",
        email: user.email || "",
        bio: user.bio || "",
        city: user.city || "",
        region: user.region || "",
        country: user.country || "",
      })
    }
  }, [user, form])

  async function onSubmit(data: ProfileFormValues) {
    try {
      await updateProfile({
        displayName: data.displayName,
        bio: data.bio,
        city: data.city,
        region: data.region,
        country: data.country,
      })
      
      toast.success("Profile updated successfully!")
    } catch (error) {
      console.error("Failed to update profile:", error)
      toast.error("Failed to update profile. Please try again.")
    }
  }


  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await uploadImage(file)
    // Reset the input so the same file can be selected again
    event.target.value = ""
  }

  const handleRemoveImage = async () => {
    try {
      setProfileImage("")
      await updateProfile({ image: "" })
      toast.success("Profile image removed successfully!")
    } catch (error) {
      console.error("Failed to remove image:", error)
      toast.error("Failed to remove profile image. Please try again.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <div className="space-y-2 flex flex-col gap-2">
        <div className="flex flex-col">
          <HeaderLabel size="2xl">Profile Information</HeaderLabel>
          <span className="text-md text-muted-foreground">
            Update your personal information and profile details
            </span>
        </div>

      {/* Upload Profile Image */}
      <div className="flex items-center gap-4">
    <div className="relative">
      <ProfileAvatar
        user={{
          displayName: user?.displayName || "",
          image: profileImage || user?.imageUrl || user?.coverImage || "",
          country: user?.country || "",
        }}
        size="xl"
      />
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
          <Upload className="h-6 w-6 animate-pulse" />
        </div>
      )}
    </div>
    <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="avatar-upload"
            disabled={isUploading}
          />
          <label htmlFor="avatar-upload">
            <Button variant="outline" size="sm" asChild disabled={isUploading}>
              <span className="cursor-pointer">
                <Camera className="mr-2 h-4 w-4" />
                {isUploading ? "Uploading..." : "Change Photo"}
              </span>
            </Button>
          </label>
          {(profileImage || user?.imageUrl || user?.coverImage) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRemoveImage}
              disabled={isUploading}
            >
              <X className="mr-2 h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          JPG, PNG, GIF or WebP. Max size 5MB.
        </p>
      </div>
    </div>
      </div>

      <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Identity Fields */}
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter display name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="space-y-2">
          <Label className="text-[10px]">Username</Label>
          <Input 
            value={user?.username || ""} 
            disabled 
            className="bg-muted"
          />
          {/* <p className="text-xs text-muted-foreground">
            Your username cannot be changed after account creation
          </p> */}
        </div>
      </div>

      {/* Email */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            {/* <FormLabel>Email Address *</FormLabel> */}
            <FormControl>
              <Input placeholder="your@email.com" {...field} disabled />
            </FormControl>
            <FormDescription className="text-[10px] text-muted-foreground">
              Contact support to change your email address
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Location */}
      <div className="grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country">
                      {field.value && (() => {
                        const countryInfo = countriesList[field.value as keyof typeof countriesList]
                        const FlagComponent = flags[field.value as keyof typeof flags]
                        return countryInfo ? (
                          <div className="flex items-center gap-2">
                            {FlagComponent && <FlagComponent className="w-5 h-3" />}
                            <span>{countryInfo.name}</span>
                          </div>
                        ) : field.value
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(countriesList).map(([code, country]) => {
                    const FlagComponent = flags[code as keyof typeof flags]
                    return (
                      <SelectItem key={code} value={code}>
                        <div className="flex items-center gap-2">
                          {FlagComponent && <FlagComponent className="w-5 h-3" />}
                          <span>{country.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="region"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State/Region</FormLabel>
              <FormControl>
                <Input placeholder="Enter state/region" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>


      {/* Bio */}
      <FormField
        control={form.control}
        name="bio"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bio</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Tell us about yourself and your pool playing experience..."
                className="min-h-[100px]"
                {...field}
              />
            </FormControl>
            <FormDescription className="text-[10px] text-muted-foreground">
              {field.value?.length || 0}/500 characters
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex justify-end">
        <Button type="submit">
          Update Profile
        </Button>
      </div>
    </form>
  </Form>

    </div>
  )
}