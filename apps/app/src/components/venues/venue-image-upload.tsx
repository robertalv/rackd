"use client";

import { useState } from "react";
import { Button } from "@rackd/ui/components/button";
import { Progress } from "@rackd/ui/components/progress";
import { X, Image as ImageIcon } from "lucide-react";
import { cn } from "@rackd/ui/lib/utils";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@rackd/ui/components/dropzone";
import { useFileUpload } from "../../hooks/use-file-upload";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface VenueImageUploadProps {
  onUpload?: (storageId: Id<"_storage">) => void;
  onDelete?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  currentUrl?: string;
  currentStorageId?: Id<"_storage">;
}

export function VenueImageUpload({
  onUpload,
  onDelete,
  onError,
  className,
  currentUrl,
  currentStorageId,
}: VenueImageUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedStorageId, setUploadedStorageId] = useState<Id<"_storage"> | null>(null);
  const { uploadFile, deleteFileFromStorage, isUploading, uploadProgress } = useFileUpload();

  // Get URL for newly uploaded image
  const uploadedImageUrl = useQuery(
    api.files.getFileUrl,
    uploadedStorageId ? { storageId: uploadedStorageId } : "skip"
  );

  // Get URL for current image
  const currentImageUrl = useQuery(
    api.files.getFileUrl,
    currentStorageId ? { storageId: currentStorageId } : "skip"
  );

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFiles([file]);
    try {
      const result = await uploadFile(file, {
        category: "venue_image",
        description: "Venue image",
      });

      setUploadedStorageId(result.storageId as Id<"_storage">);
      onUpload?.(result.storageId as Id<"_storage">);
    } catch (error) {
      console.error("Upload failed:", error);
      onError?.(error as Error);
      setUploadedFiles([]);
      setUploadedStorageId(null);
    }
  };

  const removeFile = async () => {
    try {
      // If there's a newly uploaded file, delete it from storage first
      if (uploadedStorageId) {
        await deleteFileFromStorage(uploadedStorageId);
        setUploadedFiles([]);
        setUploadedStorageId(null);
      }
      // If there's a current storage ID, delete it from storage and database
      else if (currentStorageId) {
        await deleteFileFromStorage(currentStorageId);
        onDelete?.();
      }
      // If it's just a file that hasn't been uploaded yet
      else {
        setUploadedFiles([]);
        setUploadedStorageId(null);
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
      onError?.(error as Error);
    }
  };

  // Use the proper Convex-generated URLs
  const displayUrl = uploadedImageUrl || currentImageUrl || currentUrl;
  const hasFiles = uploadedFiles.length > 0 || displayUrl;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading venue image...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Preview */}
      {displayUrl && (
        <div className="relative">
          <div className="border rounded-lg overflow-hidden bg-gray-50">
            <img
              src={displayUrl}
              alt="Venue image"
              className="w-full h-64 object-cover"
            />
          </div>
          <div className="absolute top-2 right-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={removeFile}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {uploadedFiles[0] && (
            <div className="mt-2 p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">{uploadedFiles[0].name}</span>
                <span className="text-xs text-muted-foreground">
                  ({(uploadedFiles[0].size / 1024 / 1024).toFixed(2)} MB)
                </span>
                {uploadedImageUrl && (
                  <span className="text-xs text-green-600">• Uploaded</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dropzone */}
      {!hasFiles && (
        <Dropzone
          src={uploadedFiles}
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] }}
          maxSize={10 * 1024 * 1024} // 10MB
          maxFiles={1}
          onDrop={handleDrop}
          onError={onError}
          disabled={isUploading}
        >
          <DropzoneContent>
            {uploadedFiles.length > 0 ? (
              <div className="flex flex-col items-center justify-center">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <ImageIcon size={16} />
                </div>
                <p className="my-2 w-full truncate font-medium text-sm">
                  {uploadedFiles[0]?.name}
                </p>
                <p className="w-full text-wrap text-muted-foreground text-xs">
                  Drag and drop or click to replace
                </p>
              </div>
            ) : null}
          </DropzoneContent>
          <DropzoneEmptyState>
            <div className="flex flex-col items-center justify-center">
              <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                <ImageIcon size={16} />
              </div>
              <p className="my-2 w-full truncate text-wrap font-medium text-sm">
                Upload venue image
              </p>
              <p className="w-full truncate text-wrap text-muted-foreground text-xs">
                Drag and drop or click to upload
              </p>
              <p className="text-wrap text-muted-foreground text-xs">
                PNG, JPG, GIF, WebP up to 10MB
              </p>
            </div>
          </DropzoneEmptyState>
        </Dropzone>
      )}
    </div>
  );
}


