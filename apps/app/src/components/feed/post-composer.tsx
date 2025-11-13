"use client";

import { useState, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader } from "@rackd/ui/components/card";
import { ImageIcon, Video, Calendar, MapPin, X } from "lucide-react";
import { useImageUpload } from "../../hooks/use-image-upload";
import { PostImage } from "./post-image";
import { EnhancedMentionInput } from "./enhanced-mention-input";
import { ProfileAvatar } from "../profile-avatar";
import { useCurrentUser } from "@/hooks/use-current-user";
// Turnstile - Commented out, only using on login/signup
// import { useTurnstile } from "@rackd/cloudflare/client/turnstile";

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

  // Turnstile bot protection - Commented out, only using on login/signup
  // const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;
  // const { token: turnstileToken, containerRef: turnstileContainerRef, reset: resetTurnstile } = useTurnstile({
  //   siteKey: turnstileSiteKey || "",
  //   theme: "auto",
  //   size: "normal",
  //   onSuccess: () => {
  //     // Token is ready
  //   },
  //   onError: (error) => {
  //     console.error("Turnstile error:", error);
  //   },
  // });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim() && uploadedImages.length === 0) return;
    
    // Turnstile verification - Commented out, only using on login/signup
    // if (turnstileSiteKey && !turnstileToken) {
    //   alert("Please complete the verification");
    //   return;
    // }
    
    setIsPosting(true);
    try {
      await createPost({
        content: content.trim(),
        images: uploadedImages.length > 0 ? uploadedImages : undefined,
        type: "post",
        // turnstileToken: turnstileToken || undefined, // Commented out
      });
      
      // Reset Turnstile after successful post - Commented out
      // if (turnstileSiteKey) {
      //   resetTurnstile();
      // }
      
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
                className="bg-transparent rounded-2xl border-none resize-none text-base placeholder:text-gray-400 focus-visible:ring-0 min-h-[60px]"
                disabled={isPosting || isUploading}
                maxLength={500}
              />
            </form>
          </div>
        </div>
        
        {/* Image Preview */}
        {uploadedImages.length > 0 && (
          <div className="mt-4">
            {uploadedImages.length === 1 ? (
              <div className="relative group max-w-md">
                <PostImage
                  storageId={uploadedImages[0] as Id<"_storage">}
                  alt="Uploaded image"
                  maxSize={680}
                  showBackground={true}
                  containerHeight="min-h-48"
                />
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-w-md">
                {uploadedImages.map((storageId, index) => (
                  <div key={index} className="relative group">
                    <PostImage
                      storageId={storageId as Id<"_storage">}
                      alt={`Uploaded image ${index + 1}`}
                      maxSize={340}
                      showBackground={false}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="flex items-center space-x-2 px-3 py-2 rounded-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || isPosting}
            >
              <ImageIcon className="h-5 w-5 text-green-400" />
              <span>{isUploading ? "Uploading..." : "Photo"}</span>
            </Button>
            <Button disabled type="button" variant="ghost" size="sm" className="flex items-center space-x-2 px-3 py-2 rounded-full">
              <Video className="h-5 w-5 text-blue-400" />
              <span>Video</span>
            </Button>
            <Button disabled type="button" variant="ghost" size="sm" className="flex items-center space-x-2 px-3 py-2 rounded-full">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              </div>
              <span>Poll</span>
            </Button>
            <Button disabled type="button" variant="ghost" size="sm" className="flex items-center space-x-2 px-3 py-2 rounded-full">
              <Calendar className="h-5 w-5 text-yellow-400" />
              <span>Schedule</span>
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Turnstile widget - Commented out, only using on login/signup */}
              {/* {turnstileSiteKey && (
                <div ref={turnstileContainerRef} className="flex justify-end" />
              )} */}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-400">
                {content.length}/500
              </span>
              <Button 
                type="submit" 
                onClick={handleSubmit}
                disabled={(!content.trim() && uploadedImages.length === 0) || isPosting || isUploading || content.length > 500}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full disabled:opacity-50"
              >
                {isPosting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}