"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@rackd/ui/components/button";
import { Progress } from "@rackd/ui/components/progress";
import { X, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@rackd/ui/lib/utils";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@rackd/ui/components/dropzone";
import { useFileUpload } from "../../hooks/use-file-upload";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

export interface ExtractedTournamentInfo {
  name?: string;
  dateTimestamp?: number; // Timestamp in milliseconds (Convex doesn't support Date objects)
  time?: string;
  venue?: string;
  entryFee?: number;
  description?: string;
  gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
  playerType?: "singles" | "doubles" | "scotch_doubles" | "teams";
  maxPlayers?: number;
}

interface TournamentFlyerUploadProps {
  onUpload?: (url: string) => void;
  onRemove?: () => void;
  onError?: (error: Error) => void;
  onExtractInfo?: (info: ExtractedTournamentInfo) => void;
  className?: string;
  currentUrl?: string;
  currentStorageId?: Id<"_storage">;
}

export function TournamentFlyerUpload({
  onUpload,
  onRemove,
  onError,
  onExtractInfo,
  className,
  currentUrl,
  currentStorageId,
}: TournamentFlyerUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedStorageId, setUploadedStorageId] = useState<Id<"_storage"> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const extractInfo = useAction(api.tournaments.extractTournamentInfo);
  const deleteFileByStorageId = useMutation(api.files.deleteFileByStorageId);
  const onExtractInfoRef = useRef(onExtractInfo);
  const onUploadRef = useRef(onUpload);
  const [isDeleting, setIsDeleting] = useState(false);

  // Keep refs updated - use separate useEffects to avoid dependency array size changes
  useEffect(() => {
    onExtractInfoRef.current = onExtractInfo;
  }, [onExtractInfo]);
  
  useEffect(() => {
    onUploadRef.current = onUpload;
  }, [onUpload]);

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
        category: "tournament_flyer",
        description: "Tournament flyer image",
      });

      setUploadedStorageId(result.storageId as Id<"_storage">);
      // The URL will be available via the query hook, and we'll handle it in useEffect
    } catch (error) {
      console.error("Upload failed:", error);
      onError?.(error as Error);
      setUploadedFiles([]);
      setUploadedStorageId(null);
    }
  };

  const removeFile = useCallback(async () => {
    // Capture storage ID before clearing state
    const storageIdToDelete = uploadedStorageId || currentStorageId;
    
    if (!storageIdToDelete) {
      // No storage ID, just clear local state
      setUploadedFiles([]);
      setUploadedStorageId(null);
      onRemove?.();
      return;
    }
    
    // Delete from storage first, then clear UI
    setIsDeleting(true);
    try {
      console.log("Deleting file from storage:", storageIdToDelete);
      await deleteFileByStorageId({ storageId: storageIdToDelete });
      console.log("File deleted successfully from storage");
      
      // Clear local state after successful deletion
      setUploadedFiles([]);
      setUploadedStorageId(null);
      
      // Notify parent component
      onRemove?.();
    } catch (error) {
      console.error("Failed to delete file from storage:", error);
      onError?.(error as Error);
      // Still clear UI even if storage deletion fails
      setUploadedFiles([]);
      setUploadedStorageId(null);
      onRemove?.();
    } finally {
      setIsDeleting(false);
    }
  }, [uploadedStorageId, currentStorageId, deleteFileByStorageId, onRemove, onError]);

  const handleExtractInfo = useCallback(async () => {
    const storageIdToUse = uploadedStorageId || currentStorageId;
    if (!storageIdToUse) {
      onError?.(new Error("No image uploaded"));
      return;
    }

    setIsExtracting(true);
    try {
      const extractedInfo = await extractInfo({ storageId: storageIdToUse });
      // Use ref to avoid dependency issues
      onExtractInfoRef.current?.(extractedInfo);
    } catch (error) {
      console.error("Failed to extract tournament info:", error);
      onError?.(error as Error);
    } finally {
      setIsExtracting(false);
    }
  }, [uploadedStorageId, currentStorageId, extractInfo, onError]);

  // Use the proper Convex-generated URLs
  const displayUrl = uploadedImageUrl || currentImageUrl || currentUrl;
  const hasFiles = uploadedFiles.length > 0 || displayUrl;

  // Notify parent when URL becomes available
  useEffect(() => {
    if (uploadedImageUrl && onUploadRef.current) {
      onUploadRef.current(uploadedImageUrl);
    }
  }, [uploadedImageUrl]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Upload Progress */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading flyer...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="w-full" />
        </div>
      )}

      {/* Preview */}
      {displayUrl && (
        <div className="relative">
          <div className="border rounded-lg overflow-hidden">
            <img
              src={displayUrl}
              alt="Tournament flyer"
              className="w-full h-48 object-cover"
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleExtractInfo}
              disabled={isUploading || isExtracting}
              title="Extract tournament information from flyer"
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {isExtracting ? "Extracting..." : "Extract Info"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={removeFile}
              disabled={isUploading || isExtracting || isDeleting}
            >
              <X className="h-4 w-4" />
              {isDeleting && <span className="ml-1">Deleting...</span>}
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
          accept={{ "image/*": [".png", ".jpg", ".jpeg", ".gif", ".heic", ".heif"] }}
          maxSize={5 * 1024 * 1024} // 5MB
          maxFiles={1}
          onDrop={handleDrop}
          onError={onError}
          disabled={isUploading}
        >
          <DropzoneContent />
          <DropzoneEmptyState />
        </Dropzone>
      )}
    </div>
  );
}

