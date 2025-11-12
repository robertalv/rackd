"use client"

import { useState } from "react"
import { useMutation } from "convex/react"
import { api } from "@rackd/backend/convex/_generated/api"
import { toast } from "sonner"

interface UseImageUploadOptions {
  category: "player_avatar" | "venue_image" | "tournament_flyer" | "document" | "other"
  relatedId?: string
  relatedType?: "user" | "player" | "venue" | "tournament"
  onSuccess?: (imageUrl: string, storageId: string) => void
  onError?: (error: Error) => void
}

export function useImageUpload(options: UseImageUploadOptions) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)

  const uploadImage = async (file: File) => {
    if (!file) {
      toast.error("Please select a file to upload")
      return null
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, GIF, or WebP)")
      return null
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB")
      return null
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl()

      // Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!response.ok) {
        throw new Error("Failed to upload file")
      }

      const { storageId } = await response.json()
      setUploadProgress(100)

      // For now, we'll use the storageId as the image URL since Convex will handle the URL generation
      // In a real implementation, you'd get the actual URL from the server
      const imageUrl = storageId // The backend will resolve this to a proper URL

      if (options.onSuccess) {
        options.onSuccess(imageUrl, storageId)
      }

      toast.success("Image uploaded successfully!")
      return { imageUrl, storageId }

    } catch (error) {
      console.error("Image upload failed:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image"
      toast.error(errorMessage)
      
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(errorMessage))
      }
      
      return null
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return {
    uploadImage,
    isUploading,
    uploadProgress,
  }
}