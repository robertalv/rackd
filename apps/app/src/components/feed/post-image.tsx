"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useState, useEffect } from "react";

interface PostImageProps {
  storageId: Id<"_storage">;
  alt: string;
  className?: string;
  maxSize?: number;
  showBackground?: boolean;
  containerHeight?: string;
}

export function PostImage({ 
  storageId, 
  alt, 
  className, 
  maxSize = 680, 
  showBackground = true,
  containerHeight = "min-h-32"
}: PostImageProps) {
  const standardUrl = useQuery(api.files.getFileUrl, { storageId });
  const getFileUrlWithConversion = useAction(api.files.getFileUrlWithHeicConversion);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  // Automatically convert HEIC images on display
  useEffect(() => {
    if (standardUrl && !imageUrl && !isConverting) {
      // Check if it might be HEIC
      const mightBeHeic = standardUrl.includes(".heic") || standardUrl.includes(".heif");
      
      if (mightBeHeic) {
        setIsConverting(true);
        // Try to get converted URL
        getFileUrlWithConversion({ storageId })
          .then((convertedUrl) => {
            setImageUrl(convertedUrl || standardUrl);
            setIsConverting(false);
          })
          .catch(() => {
            setImageUrl(standardUrl);
            setIsConverting(false);
          });
      } else {
        // Not HEIC, use standard URL
        setImageUrl(standardUrl);
      }
    } else if (standardUrl && !imageUrl) {
      // Fallback: use standard URL
      setImageUrl(standardUrl);
    }
  }, [standardUrl, storageId, getFileUrlWithConversion, imageUrl, isConverting]);

  if (!imageUrl) {
    return (
      <div className={`bg-gray-200 animate-pulse rounded-lg ${containerHeight} ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  const imageStyle = {
    maxWidth: `${maxSize}px`,
    maxHeight: `${maxSize}px`,
    width: 'auto',
    height: 'auto',
  };

  if (!showBackground) {
    return (
      <img
        src={imageUrl}
        alt={alt}
        className={`${className} object-cover`}
        style={imageStyle}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-accent ${containerHeight}`}>
      <img
        src={imageUrl}
        alt={alt}
        className="object-contain"
        style={imageStyle}
      />
    </div>
  );
}