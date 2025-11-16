"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader } from "@rackd/ui/components/card";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@rackd/ui/components/dropdown-menu";
import { Heart, MessageCircle, Share, MoreHorizontal, Pin, Trash2, Calendar, MapPin, DollarSign, Users, Trophy, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import { CommentInput } from "./comment-input";
import { Comment } from "./comment";
import { getGameTypeLabel, getGameTypeImage } from "@/lib/tournament-utils";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@rackd/ui/components/tooltip";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Badge } from "@rackd/ui/components/badge";

interface TournamentPostCardProps {
  post: any;
  highlight?: boolean;
}

export function TournamentPostCard({ post, highlight = false }: TournamentPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const { user: currentUser } = useCurrentUser();
  const isLiked = useQuery(api.posts.isLiked, { postId: post._id });
  const comments = useQuery(api.posts.getComments, { postId: post._id });
  const postStats = useQuery(api.posts.getPostCounterStats, { postId: post._id });
  
  const isPostOwner = currentUser?._id === post.userId;
  
  const likePost = useMutation(api.posts.like);
  const unlikePost = useMutation(api.posts.unlike);
  const togglePin = useMutation(api.posts.togglePin);
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

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      try {
        await deletePost({ postId: post._id });
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  // Check if tournament was created within 48 hours
  const isNewTournament = post.tournament?._creationTime 
    ? Date.now() - post.tournament._creationTime < 48 * 60 * 60 * 1000
    : false;

  const tournament = post.tournament;
  const flyerImageId = post.images && post.images.length > 0 ? post.images[0] : tournament?.flyerUrl;
  
  // Check if flyerImageId is a URL or storage ID
  const isFlyerUrl = flyerImageId && flyerImageId.startsWith("http");
  const flyerImageUrl = useQuery(
    api.files.getFileUrl,
    flyerImageId && !isFlyerUrl ? { storageId: flyerImageId as Id<"_storage"> } : "skip"
  );
  const displayFlyerUrl = isFlyerUrl ? flyerImageId : flyerImageUrl;

  // Format tournament date
  const tournamentDate = tournament?.date 
    ? new Date(tournament.date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const gameTypeImage = tournament?.gameType ? getGameTypeImage(tournament.gameType) : null;

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
          className={`overflow-hidden transition-all duration-300 py-0 pb-6 ${
            isHighlighted 
              ? "border-2 ring-2 ring-primary border-primary shadow-lg pulse-border" 
              : "border-2 border-primary/20 hover:border-primary/40"
          }`}
        >
      {/* New Tournament Banner */}
      {isNewTournament && (
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 text-center shadow-lg">
          <div className="flex items-center justify-center gap-2">
            <Trophy className="h-5 w-5" />
            <span className="font-bold text-sm tracking-tighter uppercase">New Tournament</span>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.user?.image || undefined} />
              <AvatarFallback className="bg-accent text-accent-foreground">
                {post.user?.displayName?.charAt(0).toUpperCase() || 
                 post.user?.name?.charAt(0).toUpperCase() || 
                 post.user?.firstName?.charAt(0).toUpperCase() || 
                 "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tighter">
                    {post.user?.name}
                </span>
                <Link 
                  to={`/${post.user?.username}` as any}
                  className="font-bold hover:underline"
                >
                  {post.user?.displayName}
                </Link>
                <Badge variant="secondary" className="text-xs">
                  Tournament Update
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                @{post.user?.username} • {formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })}
              </p>
            </div>
          </div>
          {isPostOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="flex items-center space-x-2"
                  onClick={handlePin}
                >
                  <Pin className="h-4 w-4" />
                  <span>{post.isPinned ? "Unpin post" : "Pin post"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center space-x-2 text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Flyer Image on Left */}
          {displayFlyerUrl && (
            <div className="flex-shrink-0 w-full sm:w-48 h-48 rounded-lg overflow-hidden border-2 border-border bg-accent shadow-sm">
              <img
                src={displayFlyerUrl}
                alt={`${tournament?.name || "Tournament"} flyer`}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Tournament Info on Right */}
          <div className="flex-1 space-y-3 min-w-0">
            {/* Tournament Name */}
            <div>
              <Link 
                to={`/tournaments/${post.tournamentId}` as any}
                className="text-2xl font-bold hover:text-primary transition-colors tracking-tighter"
              >
                {tournament?.name || "Tournament"}
              </Link>
            </div>

            {/* Tournament Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {tournamentDate && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{tournamentDate}</span>
                </div>
              )}

              {tournament?.gameType && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  {gameTypeImage && (
                    <img 
                      src={gameTypeImage.imageSrc} 
                      alt={gameTypeImage.alt}
                      className="h-4 w-4 rounded-full"
                    />
                  )}
                  <span>{getGameTypeLabel(tournament.gameType)}</span>
                </div>
              )}

              {tournament?.venue?.name && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {post.venueId ? (
                    <Link 
                      to={`/venues/${post.venueId}` as any}
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {tournament.venue.name}{tournament.venue.city ? `, ${tournament.venue.city}` : ""}
                    </Link>
                  ) : (
                    <span>{tournament.venue.name}{tournament.venue.city ? `, ${tournament.venue.city}` : ""}</span>
                  )}
                </div>
              )}

              {tournament?.entryFee !== undefined && tournament.entryFee !== null && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>${tournament.entryFee}</span>
                </div>
              )}

              {tournament?.maxPlayers && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{tournament.registeredCount || 0} / {tournament.maxPlayers} players</span>
                </div>
              )}

              {tournament?.type && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Trophy className="h-4 w-4" />
                  <span className="capitalize">{tournament.type.replace("_", " ")}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {tournament?.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {tournament.description}
              </p>
            )}

            {/* View Tournament Link */}
            <Link 
              to={`/tournaments/${post.tournamentId}` as any}
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              <span>View Tournament</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
          
        {/* Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className={`flex items-center ${isLiked ? "text-red-500" : ""}`}
              onClick={handleLike}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span className="text-sm ml-1">{postStats?.likeCount ?? post.likeCount}</span>
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm ml-1">{postStats?.commentCount ?? post.commentCount}</span>
            </Button>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Button disabled variant="ghost" size="sm" className="flex items-center space-x-2">
                    <Share className="h-4 w-4" />
                    <span className="text-sm">{post.shareCount}</span>
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right" align="center">
                <p>Share this post -- Coming soon!</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
          
        {/* Comments section */}
        {showComments && (
          <div className="space-y-4 pt-3 border-t mt-4">
            {/* Top-level comments */}
            {comments && comments.length > 0 && (
              <div className="space-y-4">
                {comments
                  .filter((comment: any) => !comment.parentId)
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
              
            {/* Comment input */}
            <CommentInput 
              postId={post._id}
              onCommentAdded={() => {
                // Comments will auto-refresh due to Convex reactivity
              }}
            />
          </div>
        )}
      </CardContent>
        </Card>
      </div>
    </>
  );
}

