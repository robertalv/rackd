"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent } from "@rackd/ui/components/card";
import { useImageUpload } from "../../hooks/use-image-upload";
import { PostImage } from "./post-image";
import { EnhancedMentionInput } from "./enhanced-mention-input";
import { ProfileAvatar } from "../profile-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Icon, Image02Icon, Video02Icon, Chart01Icon, Cancel01Icon, Calendar02Icon, SentIcon } from "@rackd/ui/icons";

interface PostComposerProps {
  placeholder?: string;
  onPostCreated?: () => void;
}

export function PostComposer({ 
  placeholder = "Tell your friends about your thoughts...", 
  onPostCreated 
}: PostComposerProps) {
  const { user: currentUser } = useCurrentUser();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Id<"_storage">[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useMutation(api.posts.create);

  const { uploadImage, isUploading } = useImageUpload({
    category: "other",
    onSuccess: (_, storageId) => {
      setUploadedImages(prev => [...prev, storageId as Id<"_storage">]);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && uploadedImages.length === 0) return;
    
    setIsPosting(true);
    try {
      await createPost({
        content: content.trim(),
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        type: "post",
      });
      
      setContent("");
      setUploadedImages([]);
      onPostCreated?.();
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  if (!currentUser) return null;

  return (
    <Card className="bg-accent/50 mb-6 p-0">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3 mb-4">
          <ProfileAvatar 
            user={{
              displayName: currentUser.displayName || currentUser.email || "User",
              image: currentUser.imageUrl,
              country: currentUser.locale
            }}
            size="sm"
          />
          <div className="flex-1">
            <form onSubmit={handleSubmit}>
              <EnhancedMentionInput
                value={content}
                onChange={setContent}
                placeholder={placeholder}
                className="bg-transparent rounded-2xl border-none resize-none shadow-none text-base placeholder:text-gray-400 focus-visible:ring-0 min-h-[60px]"
                disabled={isPosting || isUploading}
                maxLength={500}
              />
            </form>
          </div>
        </div>
        
        {/* Image Preview */}
        {uploadedImages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {uploadedImages.map((storageId, index) => (
              <div key={index} className="relative group">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                  <PostImage
                    storageId={storageId as Id<"_storage">}
                    alt={`Uploaded image ${index + 1}`}
                    maxSize={80}
                    showBackground={false}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-sm transition-opacity opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                >
                  <Icon icon={Cancel01Icon} className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              className="flex items-center px-3 py-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isPosting}
            >
              <Icon icon={Image02Icon} className="h-5 w-5 text-green-400" />
              <span>{isUploading ? "Uploading..." : "Photo"}</span>
            </Button>
            <Button disabled type="button" variant="ghost" size="sm" className="flex items-center px-3 py-2">
              <Icon icon={Video02Icon} className="h-5 w-5 text-blue-400" />
              <span>Video</span>
            </Button>
            <Button disabled type="button" variant="ghost" size="sm" className="flex items-center px-3 py-2">
              <Icon icon={Chart01Icon} className="h-5 w-5 text-red-400" />
              <span>Poll</span>
            </Button>
            <Button disabled type="button" variant="ghost" size="sm" className="flex items-center px-3 py-2">
              <Icon icon={Calendar02Icon} className="h-5 w-5 text-yellow-400" />
              <span>Schedule</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
            </div>
            <div className="flex items-center space-x-3">
              {content.length > 500 && (
                <span className="text-sm text-gray-400">
                  {content.length}/500
                </span>
              )}
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={(!content.trim() && uploadedImages.length === 0) || isPosting || isUploading || content.length > 500}
                variant="default"
              >
                <Icon icon={SentIcon} className="h-5 w-5" />
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}