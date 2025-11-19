"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@rackd/ui/components/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import { CommentInput } from "./comment-input";
import { MentionText } from "./mention-text";
import { ReportCommentDialog } from "./report-comment-dialog";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Badge } from "@rackd/ui/components/badge";
import { Textarea } from "@rackd/ui/components/textarea";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Icon, MoreVerticalIcon, FavouriteIcon, Delete03Icon, PencilEdit02Icon, Flag03Icon, ViewOffSlashIcon, ViewIcon } from "@rackd/ui/icons";

interface CommentProps {
  comment: any;
  postId: Id<"posts">;
  level?: number;
  mainCommentId?: Id<"comments">; // For replies, this is the main comment they belong to
}

export function Comment({ comment, postId, level = 0, mainCommentId }: CommentProps) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReportDialog, setShowReportDialog] = useState(false);
  
  // Get current user and post data
  const { user: currentUser } = useCurrentUser();
  const post = useQuery(api.posts.getPost, { postId });
  
  // Get replies to this comment (only for top-level comments)
  const replies = useQuery(api.posts.getComments, { postId });
  const commentReplies = level === 0 ? (replies?.filter(reply => reply.parentId === comment._id) || []) : [];
  
  // Check ownership
  const isCommentAuthor = currentUser?._id === comment.userId;
  const isPostAuthor = currentUser?._id === post?.userId;
  
  // Comment interactions
  const isLiked = useQuery(api.posts.isCommentLiked, { commentId: comment._id });
  const commentStats = useQuery(api.posts.getCommentCounterStats, { commentId: comment._id });
  const likeComment = useMutation(api.posts.likeComment);
  const unlikeComment = useMutation(api.posts.unlikeComment);
  const editComment = useMutation(api.posts.editComment);
  const deleteComment = useMutation(api.posts.deleteComment);
  const hideComment = useMutation(api.posts.hideComment);
  const unhideComment = useMutation(api.posts.unhideComment);
  const isHidden = comment.isHidden || false;
  
  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikeComment({ commentId: comment._id });
      } else {
        await likeComment({ commentId: comment._id });
      }
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };
  
  const handleReplyClick = () => {
    setShowReplyInput(true);
    if (level === 0 && commentReplies.length > 0) {
      setShowReplies(true);
    }
  };

  const handleReplyAdded = () => {
    setShowReplyInput(false);
    if (level === 0) {
      setShowReplies(true);
    }
  };

  const handleEdit = async () => {
    try {
      await editComment({
        commentId: comment._id,
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing comment:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        await deleteComment({ commentId: comment._id });
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleEditCancel = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  const handleHide = async () => {
    try {
      await hideComment({ commentId: comment._id });
    } catch (error) {
      console.error("Error hiding comment:", error);
    }
  };

  const handleUnhide = async () => {
    try {
      await unhideComment({ commentId: comment._id });
    } catch (error) {
      console.error("Error unhiding comment:", error);
    }
  };

  return (
    <div className={`flex space-x-3 ${level > 0 ? 'mt-3' : ''}`}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={comment.user?.image || undefined} />
        <AvatarFallback className="bg-accent text-accent-foreground">
          {comment.user?.displayName?.charAt(0).toUpperCase() || 
           comment.user?.name?.charAt(0).toUpperCase() || 
           comment.user?.firstName?.charAt(0).toUpperCase() || 
           "U"}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        {/* Comment content */}
        <div 
          className={`relative bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors ${isHidden ? 'opacity-60 border border-dashed border-muted-foreground/30' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Link 
                to="/$username"
                params={{ username: comment.user?.username || "" }}
                className="font-semibold text-xs hover:underline"
              >
                {comment.user?.displayName}
              </Link>
              {isPostAuthor && comment.userId === post?.userId && (
                <Badge 
                  variant="secondary" 
                  className="text-xs text-muted-foreground py-0.5! px-1! bg-foreground/10"
                >
                  Author
                </Badge>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full text-sm bg-background border rounded-xl p-2 resize-none"
                  rows={3}
                />
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editContent.trim() || editContent === comment.content}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditCancel}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <MentionText 
                content={comment.content} 
                className="text-sm wrap-break-words"
              />
            )}
          </div>
          
          {/* Hover dropdown - only show on this specific comment */}
          <div className={`absolute top-2 right-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-background/50">
                  <Icon icon={MoreVerticalIcon} className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isCommentAuthor ? (
                  // Show Edit/Delete for comment author
                  <>
                    <DropdownMenuItem 
                      className="flex items-center space-x-2"
                      onClick={() => setIsEditing(true)}
                    >
                      <Icon icon={PencilEdit02Icon} className="h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 text-red-600"
                      onClick={handleDelete}
                    >
                      <Icon icon={Delete03Icon} className="h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  // Show Hide/Unhide/Report for others
                  <>
                    {isHidden ? (
                      <DropdownMenuItem 
                        className="flex items-center space-x-2"
                        onClick={handleUnhide}
                      >
                        <Icon icon={ViewIcon} className="h-4 w-4" />
                        <span>Show comment</span>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem 
                        className="flex items-center space-x-2"
                        onClick={handleHide}
                      >
                        <Icon icon={ViewOffSlashIcon} className="h-4 w-4" />
                        <span>Hide comment</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem 
                      className="flex items-center space-x-2"
                      onClick={() => setShowReportDialog(true)}
                    >
                      <Icon icon={Flag03Icon} className="h-4 w-4" />
                      <span>Report comment</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {/* Comment metadata and actions */}
        <div className="flex items-center space-x-4 mt-1 ml-3">
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment._creationTime), { addSuffix: true })}
          </p>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={`text-xs p-0 h-auto font-semibold ${isLiked ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Like
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReplyClick}
            className="text-xs text-muted-foreground hover:text-foreground p-0 h-auto font-semibold"
          >
            Reply
          </Button>
          
          {(commentStats?.likeCount ?? comment.likeCount) > 0 && (
            <div className="flex items-center space-x-1">
              <Icon icon={FavouriteIcon} className="h-3 w-3 text-red-500 fill-red-500" />
              <span className="text-xs text-muted-foreground">{commentStats?.likeCount ?? comment.likeCount}</span>
            </div>
          )}
        </div>
        
        {/* Reply count and toggle for top-level comments */}
        {level === 0 && commentReplies.length > 0 && (
          <div className="ml-3 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReplies(!showReplies)}
              className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal"
            >
              {showReplies ? 'Hide replies' : `View ${commentReplies.length} ${commentReplies.length === 1 ? 'reply' : 'replies'}`}
            </Button>
          </div>
        )}
        
        {/* Reply input */}
        {showReplyInput && (
          <div className="mt-2">
            <CommentInput
              postId={postId}
              parentId={level === 0 ? comment._id : mainCommentId} // Replies to replies go to main comment
              replyToUser={level === 0 ? comment.user?.displayName : `${comment.user?.displayName}`}
              onCommentAdded={handleReplyAdded}
              onCancel={() => setShowReplyInput(false)}
              compact={true}
            />
          </div>
        )}
        
        {/* Show all replies for top-level comments */}
        {level === 0 && showReplies && commentReplies.length > 0 && (
          <div className="mt-3 pl-4 border-l-2 border-border space-y-3">
            {commentReplies.map((reply) => (
              <Comment
                key={reply._id}
                comment={reply}
                postId={postId}
                level={1}
                mainCommentId={comment._id} // Pass the main comment ID for flattened replies
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Report Comment Dialog */}
      <ReportCommentDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        commentId={comment._id}
      />
    </div>
  );
}