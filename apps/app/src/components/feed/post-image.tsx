"use client";

import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

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
  const imageUrl = useQuery(api.files.getFileUrl, { storageId });

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