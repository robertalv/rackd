"use client";

import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export type FileCategory = "tournament_flyer" | "venue_image" | "player_avatar" | "document" | "other";
export type RelatedType = "tournament" | "venue" | "player" | "user";

interface UploadOptions {
  category?: FileCategory;
  relatedId?: string;
  relatedType?: RelatedType;
  description?: string;
}

interface UploadResult {
  storageId: Id<"_storage">;
  url: string;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const deleteFileByStorageId = useMutation(api.files.deleteFileByStorageId);
  const processImageUpload = useAction(api.files.processImageUpload);

  const uploadFile = async (
    file: File,
    _options: UploadOptions = {}
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      setUploadProgress(25);

      // Step 2: Upload file to storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        body: file,
      });

      if (!result.ok) {
        throw new Error(`Upload failed: ${result.statusText}`);
      }

      const { storageId } = await result.json();
      setUploadProgress(75);

      // Process image if it's an image file - automatically converts HEIC
      let url = storageId;
      const isImage = file.type.startsWith("image/");
      if (isImage) {
        try {
          const processed = await processImageUpload({ storageId });
          url = processed.displayUrl;
          setUploadProgress(100);
        } catch (error) {
          console.error("Failed to process image:", error);
          // Continue with original storageId if processing fails
          setUploadProgress(100);
        }
      } else {
        setUploadProgress(100);
      }

      // Return the storage ID and processed URL
      return {
        storageId,
        url,
      };
    } catch (error) {
      console.error("File upload failed:", error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const uploadFiles = async (
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const result = await uploadFile(files[i], options);
      results.push(result);
    }
    
    return results;
  };

  const deleteFileFromStorage = async (storageId: Id<"_storage">) => {
    try {
      await deleteFileByStorageId({ storageId });
      return { success: true };
    } catch (error) {
      console.error("Failed to delete file:", error);
      throw error;
    }
  };

  return {
    uploadFile,
    uploadFiles,
    deleteFileFromStorage,
    isUploading,
    uploadProgress,
  };
}