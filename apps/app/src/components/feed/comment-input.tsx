"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { EnhancedMentionInput } from "./enhanced-mention-input";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ProfileAvatar } from "../profile-avatar";

interface CommentInputProps {
  postId: Id<"posts">;
  parentId?: Id<"comments">;
  replyToUser?: string;
  onCommentAdded?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}

export function CommentInput({ 
  postId, 
  parentId, 
  replyToUser, 
  onCommentAdded, 
  onCancel, 
  compact = false 
}: CommentInputProps) {
  const { user: currentUser } = useCurrentUser();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const addComment = useMutation(api.posts.addComment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) return;
    
    setIsSubmitting(true);
    try {
      // The mention input already handles @mentions in the content
      await addComment({
        postId,
        content: comment.trim(),
        parentId,
      });
      
      setComment("");
      onCommentAdded?.();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!currentUser) return null;

  const placeholder = replyToUser 
    ? `Reply to ${replyToUser}... (Cmd/Ctrl + Enter to post)`
    : "Write a comment... (Cmd/Ctrl + Enter to post)";

  const buttonText = replyToUser ? "Reply" : "Comment";

  return (
    <div className={`flex space-x-3 ${compact ? 'pt-2' : 'pt-3'}`}>
      <ProfileAvatar
        user={{
          displayName: currentUser.displayName,
          image: currentUser.imageUrl ?? undefined,
          country: currentUser.country
        }}
        size="sm"
      />
      
      <form onSubmit={handleSubmit} className="flex-1">
        <div className="space-y-2">
          {replyToUser && (
            <p className="text-xs text-muted-foreground">
              Replying to <span className="font-medium">@{replyToUser}</span>
            </p>
          )}
          
          <EnhancedMentionInput
            value={comment}
            onChange={setComment}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`bg-muted rounded-lg border-none resize-none text-sm placeholder:text-gray-400 focus-visible:ring-0 ${compact ? 'min-h-[32px] py-1' : 'min-h-[40px] py-2'}`}
            disabled={isSubmitting}
            maxLength={500}
            postId={postId}
            autoFocus={!!replyToUser}
          />
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {comment.length}/500
            </span>
            
            <div className="flex items-center space-x-2">
              {onCancel && (
                <Button 
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onCancel}
                  className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full"
                >
                  Cancel
                </Button>
              )}
              
              <Button 
                type="submit" 
                size="sm"
                disabled={!comment.trim() || isSubmitting || comment.length > 500}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : buttonText}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}