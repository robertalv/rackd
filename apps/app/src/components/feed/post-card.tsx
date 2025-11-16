"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader } from "@rackd/ui/components/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@rackd/ui/components/dropdown-menu";
import { Textarea } from "@rackd/ui/components/textarea";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import { PostImage } from "./post-image";
import { CommentInput } from "./comment-input";
import { Comment } from "./comment";
import { MentionText } from "./mention-text";
import { TournamentPostCard } from "./tournament-post-card";
import { ReportPostDialog } from "./report-post-dialog";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ProfileAvatar } from "../profile-avatar";
import { Icon, PinIcon, MoreVerticalIcon, PencilEdit02Icon, Delete03Icon, FavouriteIcon, Comment01Icon, Share01Icon, Flag03Icon } from "@rackd/ui/icons";
import { SharePostModal } from "./share-post-modal";

interface PostCardProps {
  post: any;
  highlight?: boolean;
}

export function PostCard({ post, highlight = false }: PostCardProps) {
  if (post.tournamentId && post.tournament) {
    return <TournamentPostCard post={post} highlight={highlight} />;
  }
  const [showComments, setShowComments] = useState(false);
  const [showHiddenComments, setShowHiddenComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  const { user: currentUser } = useCurrentUser();
  const isLiked = useQuery(api.posts.isLiked, { postId: post._id });
  const comments = useQuery(api.posts.getComments, { 
    postId: post._id,
    includeHidden: showHiddenComments,
  });
  const hiddenCommentsCount = useQuery(api.posts.getHiddenCommentsCount, { postId: post._id });
  const postStats = useQuery(api.posts.getPostCounterStats, { postId: post._id });
  
  // Automatically hide hidden comments section when count reaches 0
  useEffect(() => {
    if (hiddenCommentsCount === 0 && showHiddenComments) {
      setShowHiddenComments(false);
    }
  }, [hiddenCommentsCount, showHiddenComments]);

  // Handle post highlighting when shared link is clicked
  useEffect(() => {
    if (highlight && cardRef.current) {
      setIsHighlighted(true);
      
      // Scroll to the post with smooth behavior
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      
      // Remove highlight after 3 seconds
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 3000);
      
      // Clean up URL query parameter
      const url = new URL(window.location.href);
      if (url.searchParams.has("postId")) {
        url.searchParams.delete("postId");
        window.history.replaceState({}, "", url.toString());
      }
      
      return () => clearTimeout(timer);
    }
  }, [highlight]);
  
  const isPostOwner = currentUser?._id === post.userId;
  
  const likePost = useMutation(api.posts.like);
  const unlikePost = useMutation(api.posts.unlike);
  const togglePin = useMutation(api.posts.togglePin);
  const editPost = useMutation(api.posts.editPost);
  const deletePost = useMutation(api.posts.deletePost);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await unlikePost({ postId: post._id });
      } else {
        await likePost({ postId: post._id });
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handlePin = async () => {
    try {
      await togglePin({ postId: post._id });
    } catch (error) {
      console.error("Error pinning post:", error);
    }
  };

  const handleEdit = async () => {
    try {
      await editPost({
        postId: post._id,
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error editing post:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await deletePost({ postId: post._id });
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const handleEditCancel = () => {
    setEditContent(post.content);
    setIsEditing(false);
  };

  const getPostTypeLabel = (type: string) => {
    switch (type) {
      case "highlight": return "Match Highlight";
      case "tournament_update": return "Tournament Update";
      case "result": return "Match Result";
      default: return "";
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case "highlight": return "bg-yellow-100 text-yellow-800";
      case "tournament_update": return "bg-blue-100 text-blue-800";
      case "result": return "bg-green-100 text-green-800";
      default: return "";
    }
  };

  return (
    <>
      {isHighlighted && (
        <style>{`
          @keyframes border-pulse {
            0%, 100% { 
              opacity: 1;
            }
            50% { 
              opacity: 0.4;
            }
          }
          .pulse-border {
            animation: border-pulse 1s ease-in-out 3;
          }
        `}</style>
      )}
      <div ref={cardRef} className="mb-4">
        <Card 
          className={`bg-accent/50 gap-2 transition-all duration-300 ${
            isHighlighted 
              ? "ring-2 ring-primary border-primary shadow-lg pulse-border" 
              : "ring-0 border-transparent"
          }`}
        >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <ProfileAvatar
              user={post.user}
              size="sm"
            />
            <div>
              <div className="flex items-center space-x-2">
                {post.user?.username ? (
                  <Link 
                    to="/$username"
                    params={{ username: post.user.username }}
                    className="font-semibold hover:underline"
                  >
                    {post.user?.displayName}
                  </Link>
                ) : (
                  <span className="font-semibold">{post.user?.displayName}</span>
                )}
                {post.type !== "post" && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`}>
                    {getPostTypeLabel(post.type)}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                @{post.user?.username} • {formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Icon icon={MoreVerticalIcon} className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isPostOwner && (
                <>
                  <DropdownMenuItem 
                    className="flex items-center"
                    onClick={handlePin}
                  >
                    <Icon icon={PinIcon} className="h-4 w-4" />
                    <span>{post.isPinned ? "Unpin post" : "Pin post"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="flex items-center"
                    onClick={() => setIsEditing(true)}
                  >
                    <Icon icon={PencilEdit02Icon} className="h-4 w-4" />
                    <span>Edit post</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="flex items-center text-red-600"
                    onClick={handleDelete}
                  >
                    <Icon icon={Delete03Icon} className="h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </>
              )}
              {!isPostOwner && (
                <DropdownMenuItem 
                  className="flex items-center"
                  onClick={() => setShowReportDialog(true)}
                >
                  <Icon icon={Flag03Icon} className="h-4 w-4" />
                  <span>Report post</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-4">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full text-sm bg-background border rounded-xl p-3 resize-none"
                rows={4}
                placeholder="What's on your mind?"
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {editContent.length}/1000
                </span>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleEditCancel}
                    className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEdit}
                    disabled={!editContent.trim() || editContent === post.content || editContent.length > 1000}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {post.isPinned && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 font-medium">
                  <Icon icon={PinIcon} className="h-3 w-3" />
                  <span>Pinned Post</span>
                </div>
              )}
              <MentionText 
                content={post.content} 
                className="text-sm leading-relaxed"
              />
            </div>
          )}
          
          {/* Images */}
          {post.images && post.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              {post.images.length === 1 ? (
                <PostImage
                  storageId={post.images[0]}
                  alt="Post image"
                  maxSize={680}
                  showBackground={true}
                  containerHeight="min-h-64"
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {post.images.slice(0, 4).map((image: string, index: number) => (
                    <PostImage
                      key={index}
                      storageId={image as Id<"_storage">}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      maxSize={340}
                      showBackground={false}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Tournament/Match context */}
          {post.tournament && post.tournamentId && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium">Tournament</p>
              <Link 
                to="/tournaments/$id"
                params={{ id: post.tournamentId }}
                className="text-sm text-primary hover:underline"
              >
                {post.tournament.name}
              </Link>
            </div>
          )}
          
          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center ${isLiked ? "text-red-500" : ""}`}
                onClick={handleLike}
              >
                <Icon icon={FavouriteIcon} className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                <span className="text-sm">{postStats?.likeCount ?? post.likeCount}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center"
                onClick={() => setShowComments(!showComments)}
              >
                <Icon icon={Comment01Icon} className="h-4 w-4" />
                <span className="text-sm">{postStats?.commentCount ?? post.commentCount}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center space-x-2"
                onClick={() => setShowShareModal(true)}
              >
                <Icon icon={Share01Icon} className="h-4 w-4" />
                {/* TODO: Create a share by messages and display the count */}
                {/* <span className="text-sm">{post.shareCount}</span> */}
              </Button>

            </div>
          </div>
          
          {/* Comments section */}
          {showComments && (
            <div className="space-y-4 pt-3 border-t">
              {/* Show hidden comments toggle */}
              {hiddenCommentsCount !== undefined && hiddenCommentsCount > 0 && (
                <div className="pb-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowHiddenComments(!showHiddenComments)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {showHiddenComments 
                      ? `Hide ${hiddenCommentsCount} hidden ${hiddenCommentsCount === 1 ? 'comment' : 'comments'}`
                      : `Show ${hiddenCommentsCount} hidden ${hiddenCommentsCount === 1 ? 'comment' : 'comments'}`
                    }
                  </Button>
                </div>
              )}
              
              {/* Top-level comments */}
              {comments && comments.length > 0 && (
                <div className="space-y-4">
                  {comments
                    .filter((comment: any) => !comment.parentId) // Only show top-level comments
                    .map((comment: any) => (
                      <Comment
                        key={comment._id}
                        comment={comment}
                        postId={post._id}
                        level={0}
                      />
                    ))}
                </div>
              )}
              
              {/* Comment input - always show if comments section is open */}
              <CommentInput 
                postId={post._id}
                onCommentAdded={() => {
                  // Comments will auto-refresh due to Convex reactivity
                }}
              />
            </div>
          )}
        </div>
      </CardContent>
      
      <SharePostModal
        open={showShareModal}
        onOpenChange={setShowShareModal}
        postId={post._id}
        postContent={post.content}
        postAuthor={post.user?.displayName || post.user?.username}
      />
      
      {/* Report Post Dialog */}
      <ReportPostDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        postId={post._id}
      />
        </Card>
      </div>
    </>
  );
}