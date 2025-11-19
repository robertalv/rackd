"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@rackd/ui/components/dialog";
import { Button } from "@rackd/ui/components/button";
import { Icon, Share01Icon, Copy01Icon, Link01Icon } from "@rackd/ui/icons";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface SharePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: Id<"posts">;
  postContent?: string;
  postAuthor?: string;
}

export function SharePostModal({ open, onOpenChange, postId, postContent, postAuthor }: SharePostModalProps) {
  const [copied, setCopied] = useState(false);
  
  // Generate shareable URL
  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/feed?postId=${postId}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleShareTwitter = () => {
    const text = postContent 
      ? `${postContent.substring(0, 100)}${postContent.length > 100 ? "..." : ""}`
      : `Check out this post${postAuthor ? ` by ${postAuthor}` : ""} on Rackd!`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: postAuthor ? `Post by ${postAuthor}` : "Check out this post on Rackd",
          text: postContent?.substring(0, 200) || "Check out this post on Rackd",
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error occurred
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      // Fallback to copy link if native share is not available
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
          <DialogDescription>
            Share this post with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* Copy Link */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleCopyLink}
          >
            <Icon icon={copied ? Link01Icon : Copy01Icon} className="h-5 w-5 mr-3" />
            <div className="flex flex-col items-start">
              <span className="font-medium">{copied ? "Link Copied!" : "Copy Link"}</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                {shareUrl.length > 50 ? `${shareUrl.substring(0, 50)}...` : shareUrl}
              </span>
            </div>
          </Button>

          {/* Native Share (mobile) */}
          {typeof navigator !== "undefined" && "share" in navigator && typeof navigator.share === "function" && (
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-3"
              onClick={handleNativeShare}
            >
              <Icon icon={Share01Icon} className="h-5 w-5 mr-3" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Share via...</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Use your device's share menu
                </span>
              </div>
            </Button>
          )}

          {/* Twitter/X */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleShareTwitter}
          >
            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="font-medium">Share on X (Twitter)</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Share this post on X
              </span>
            </div>
          </Button>

          {/* Facebook */}
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-3"
            onClick={handleShareFacebook}
          >
            <svg className="h-5 w-5 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
            </svg>
            <div className="flex flex-col items-start">
              <span className="font-medium">Share on Facebook</span>
              <span className="text-xs text-muted-foreground mt-0.5">
                Share this post on Facebook
              </span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

