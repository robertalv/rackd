import { useState } from "react";
import { useMutation, useAction } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { toast } from "sonner";
function useImageUpload(options) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  const processImageUpload = useAction(api.files.processImageUpload);
  const uploadImage = async (file) => {
    if (!file) {
      toast.error("Please select a file to upload");
      return null;
    }
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image file (JPG, PNG, GIF, WebP, or HEIC)");
      return null;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size must be less than 5MB");
      return null;
    }
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!response.ok) {
        throw new Error("Failed to upload file");
      }
      const { storageId } = await response.json();
      setUploadProgress(75);
      let imageUrl = storageId;
      try {
        const processed = await processImageUpload({ storageId });
        imageUrl = processed.displayUrl;
        setUploadProgress(100);
      } catch (error) {
        console.error("Failed to process image:", error);
        setUploadProgress(100);
      }
      if (options.onSuccess) {
        options.onSuccess(imageUrl, storageId);
      }
      toast.success("Image uploaded successfully!");
      return { imageUrl, storageId };
    } catch (error) {
      console.error("Image upload failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
      toast.error(errorMessage);
      if (options.onError) {
        options.onError(error instanceof Error ? error : new Error(errorMessage));
      }
      return null;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };
  return {
    uploadImage,
    isUploading,
    uploadProgress
  };
}
export {
  useImageUpload as u
};
