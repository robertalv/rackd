import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { CounterHelpers } from "./counters";
import { getCurrentUserId, getCurrentUserIdOrThrow, getCurrentUser } from "./lib/utils";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { check, track, attach } from "./autumn";

export const create = mutation({
  args: {
    content: v.string(),
    images: v.optional(v.array(v.string())),
    tournamentId: v.optional(v.id("tournaments")),
    matchId: v.optional(v.id("matches")),
    type: v.optional(v.string()),
    turnstileToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const unlimitedPostsCheck = await check(ctx, {
      featureId: "unlimited_posts",
    });

    if (!unlimitedPostsCheck.data?.allowed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayTimestamp = today.getTime();

      const postsToday = await ctx.db
        .query("posts")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.gte(q.field("_creationTime"), todayTimestamp))
        .collect();

      if (postsToday.length >= 10) {
        throw new Error(
          "Free plan allows up to 10 posts per day. Please upgrade for unlimited posts."
        );
      }
    }

    // Verify Turnstile token if provided
    if (args.turnstileToken) {
      const secretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
      if (secretKey) {
        try {
          const formData = new FormData();
          formData.append("secret", secretKey);
          formData.append("response", args.turnstileToken);

          const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
              method: "POST",
              body: formData,
            }
          );

          if (!response.ok) {
            throw new Error("Turnstile verification request failed");
          }

          const result = (await response.json()) as {
            success: boolean;
            error_codes?: string[];
          };

          if (!result.success || result.error_codes?.length) {
            throw new Error(`Turnstile verification failed: ${result.error_codes?.join(", ") || "Unknown error"}`);
          }
        } catch (error) {
          console.error("Turnstile verification failed:", error);
          throw new Error("Verification failed. Please try again.");
        }
      }
    }

    const postId = await ctx.db.insert("posts", {
      userId,
      content: args.content,
      images: args.images,
      tournamentId: args.tournamentId,
      matchId: args.matchId,
      type: (args.type as any) || "post",
      likeCount: 0,
      commentCount: 0,
      shareCount: 0,
      isPublic: true,
    });

    await CounterHelpers.incrementUserPosts(ctx, userId);

    await track(ctx, {
      featureId: "post_creation",
      quantity: 1,
    });

    await attach(ctx, {
      entityId: postId,
      entityType: "post",
    });

    const hashtagRegex = /#([A-Za-z0-9_]+)/g;
    const hashtags = [];
    let hashtagMatch;
    let position = 0;
    
    while ((hashtagMatch = hashtagRegex.exec(args.content)) !== null) {
      const originalTag = hashtagMatch[1];
      const normalizedTag = originalTag.toLowerCase();
      hashtags.push({
        original: originalTag,
        normalized: normalizedTag,
        position: position++
      });
    }
    
    if (hashtags.length > 0) {
      const now = Date.now();
      
      for (const hashtag of hashtags) {
        let existingHashtag = await ctx.db
          .query("hashtags")
          .withIndex("by_tag", q => q.eq("tag", hashtag.normalized))
          .first();
        
        let hashtagId;
        
        if (existingHashtag) {
          hashtagId = existingHashtag._id;
          await ctx.db.patch(hashtagId, {
            useCount: existingHashtag.useCount + 1,
            lastUsed: now,
            displayTag: hashtag.original.length > existingHashtag.displayTag.length ? 
              hashtag.original : existingHashtag.displayTag
          });
        } else {
          hashtagId = await ctx.db.insert("hashtags", {
            tag: hashtag.normalized,
            displayTag: hashtag.original,
            useCount: 1,
            firstUsed: now,
            lastUsed: now,
          });
        }
        
        await ctx.db.insert("postHashtags", {
          postId,
          hashtagId,
          position: hashtag.position,
        });
      }
    }

    return postId;
  },
});

export const getFeed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    const userId = user._id;

    const follows = await ctx.db
      .query("follows")
      .withIndex("by_follower", q => q.eq("followerId", userId))
      .collect();

    const followingIds = follows.map(f => f.followingId);
    followingIds.push(userId);

    const allPosts = await ctx.db
      .query("posts")
      .order("desc")
      .collect();

    const feedPosts = allPosts
      .filter(p => followingIds.includes(p.userId))
      .slice(0, args.limit || 50);

    return await Promise.all(
      feedPosts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        let tournament = null;
        let venue = null;
        
        if (post.tournamentId) {
          tournament = await ctx.db.get(post.tournamentId);
          if (tournament) {
            if (tournament.venueId) {
              venue = await ctx.db.get(tournament.venueId);
            }
            tournament = {
              ...tournament,
              venue: venue ? {
                name: venue.name,
                city: venue.city,
                region: venue.region,
                country: venue.country,
              } : null,
            };
          }
        }
        
        if (post.venueId && !venue) {
          venue = await ctx.db.get(post.venueId);
        }
        
        return { 
          ...post, 
          user: user || null,
          tournament: tournament || null,
          venue: venue ? {
            _id: venue._id,
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null
        };
      })
    );
  },
});

export const getByUser = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("posts")
      .withIndex("by_user", q => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 50);

    return await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        let tournament = null;
        let venue = null;
        
        if (post.tournamentId) {
          tournament = await ctx.db.get(post.tournamentId);
          if (tournament) {
            if (tournament.venueId) {
              venue = await ctx.db.get(tournament.venueId);
            }
            tournament = {
              ...tournament,
              venue: venue ? {
                name: venue.name,
                city: venue.city,
                region: venue.region,
                country: venue.country,
              } : null,
            };
          }
        }
        
        if (post.venueId && !venue) {
          venue = await ctx.db.get(post.venueId);
        }
        
        return { 
          ...post, 
          user: user || null,
          tournament: tournament || null,
          venue: venue ? {
            _id: venue._id,
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null
        };
      })
    );
  },
});

export const getPost = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const user = await ctx.db.get(post.userId);
    let tournament = null;
    let venue = null;
    
    if (post.tournamentId) {
      tournament = await ctx.db.get(post.tournamentId);
      if (tournament) {
        if (tournament.venueId) {
          venue = await ctx.db.get(tournament.venueId);
        }
        tournament = {
          ...tournament,
          venue: venue ? {
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null,
        };
      }
    }
    
    if (post.venueId && !venue) {
      venue = await ctx.db.get(post.venueId);
    }
    
    return { 
      ...post, 
      user: user || null,
      tournament: tournament || null,
      venue: venue ? {
        _id: venue._id,
        name: venue.name,
        city: venue.city,
        region: venue.region,
        country: venue.country,
      } : null
    };
  },
});

// Like post
export const like = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if already liked
    const existing = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", q =>
        q.eq("postId", args.postId).eq("userId", userId)
      )
      .first();

    if (existing) return;

    // Create like
    await ctx.db.insert("postLikes", {
      postId: args.postId,
      userId,
    });

    // Update like count using sharded counter
    await CounterHelpers.incrementPostLikes(ctx, args.postId);
    
    // Update the post document for backward compatibility
    const newLikeCount = await CounterHelpers.getPostLikeCount(ctx, args.postId);
    await ctx.db.patch(args.postId, {
      likeCount: newLikeCount,
    });

    // Create notification
    const post = await ctx.db.get(args.postId);
    if (post && post.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "like",
        actorId: userId,
        postId: args.postId,
        read: false,

      });
    }
  },
});

// Unlike post
export const unlike = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", q =>
        q.eq("postId", args.postId).eq("userId", userId)
      )
      .first();

    if (!like) return;

    await ctx.db.delete(like._id);

    // Update like count using sharded counter
    await CounterHelpers.decrementPostLikes(ctx, args.postId);
    
    // Update the post document for backward compatibility
    const newLikeCount = await CounterHelpers.getPostLikeCount(ctx, args.postId);
    await ctx.db.patch(args.postId, {
      likeCount: newLikeCount,
    });
  },
});

// Check if user liked post
export const isLiked = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return false;

    const like = await ctx.db
      .query("postLikes")
      .withIndex("by_post_and_user", q =>
        q.eq("postId", args.postId).eq("userId", userId)
      )
      .first();

    return !!like;
  },
});

// Add comment
export const addComment = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
    parentId: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const commentId = await ctx.db.insert("comments", {
      postId: args.postId,
      userId,
      content: args.content,
      parentId: args.parentId,
      likeCount: 0,
    });

    // Update comment count using sharded counter
    await CounterHelpers.incrementPostComments(ctx, args.postId);
    
    // Update the post document for backward compatibility
    const newCommentCount = await CounterHelpers.getPostCommentCount(ctx, args.postId);
    await ctx.db.patch(args.postId, {
      commentCount: newCommentCount,
    });

    // Create notification for post owner
    const post = await ctx.db.get(args.postId);
    if (post && post.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "comment",
        actorId: userId,
        postId: args.postId,
        commentId,
        read: false,
      });
    }
    
    // Extract mentioned users from comment content and create notifications
    // Mentions use @username format (username is stored in Convex)
    const mentionRegex = /@([A-Za-z0-9_]+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(args.content)) !== null) {
      const mentionedUsername = match[1].trim().toLowerCase();
      mentions.push(mentionedUsername);
    }
    
    if (mentions.length > 0) {
      // Get all users to find mentioned ones by username
      const users = await ctx.db.query("users").collect();
      
      for (const mentionedUsername of mentions) {
        const mentionedUser = users.find(u => 
          u.username?.toLowerCase() === mentionedUsername
        );
        
        if (mentionedUser && mentionedUser._id !== userId) {
          await ctx.db.insert("notifications", {
            userId: mentionedUser._id,
            type: "mention",
            actorId: userId,
            postId: args.postId,
            commentId,
            read: false,
          });
        }
      }
    }
    
    // Extract hashtags from comment content
    const hashtagRegex = /#([A-Za-z0-9_]+)/g;
    const hashtags = [];
    let hashtagMatch;
    let position = 0;
    
    while ((hashtagMatch = hashtagRegex.exec(args.content)) !== null) {
      const originalTag = hashtagMatch[1];
      const normalizedTag = originalTag.toLowerCase();
      hashtags.push({
        original: originalTag,
        normalized: normalizedTag,
        position: position++
      });
    }
    
    if (hashtags.length > 0) {
      const now = Date.now();
      
      for (const hashtag of hashtags) {
        // Find or create hashtag
        let existingHashtag = await ctx.db
          .query("hashtags")
          .withIndex("by_tag", q => q.eq("tag", hashtag.normalized))
          .first();
        
        let hashtagId;
        
        if (existingHashtag) {
          // Update existing hashtag stats
          hashtagId = existingHashtag._id;
          await ctx.db.patch(hashtagId, {
            useCount: existingHashtag.useCount + 1,
            lastUsed: now,
            // Keep the original display casing if it was more readable
            displayTag: hashtag.original.length > existingHashtag.displayTag.length ? 
              hashtag.original : existingHashtag.displayTag
          });
        } else {
          // Create new hashtag
          hashtagId = await ctx.db.insert("hashtags", {
            tag: hashtag.normalized,
            displayTag: hashtag.original,
            useCount: 1,
            firstUsed: now,
            lastUsed: now,
          });
        }
        
        // Link hashtag to comment
        await ctx.db.insert("commentHashtags", {
          commentId,
          hashtagId,
          position: hashtag.position,
        });
      }
    }

    return commentId;
  },
});

// Like comment
export const likeComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    // Check if already liked
    const existing = await ctx.db
      .query("commentLikes")
      .withIndex("by_comment_and_user", q =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    if (existing) return;

    // Create like
    await ctx.db.insert("commentLikes", {
      commentId: args.commentId,
      userId,
    });

    // Update like count using sharded counter
    await CounterHelpers.incrementCommentLikes(ctx, args.commentId);
    
    // Update the comment document for backward compatibility
    const newLikeCount = await CounterHelpers.getCommentLikeCount(ctx, args.commentId);
    await ctx.db.patch(args.commentId, {
      likeCount: newLikeCount,
    });
  },
});

// Unlike comment
export const unlikeComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const like = await ctx.db
      .query("commentLikes")
      .withIndex("by_comment_and_user", q =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    if (!like) return;

    await ctx.db.delete(like._id);

    // Update like count using sharded counter
    await CounterHelpers.decrementCommentLikes(ctx, args.commentId);
    
    // Update the comment document for backward compatibility
    const newLikeCount = await CounterHelpers.getCommentLikeCount(ctx, args.commentId);
    await ctx.db.patch(args.commentId, {
      likeCount: newLikeCount,
    });
  },
});

// Check if user liked comment
export const isCommentLiked = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return false;

    const like = await ctx.db
      .query("commentLikes")
      .withIndex("by_comment_and_user", q =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    return !!like;
  },
});

// Get comments for post
export const getComments = query({
  args: { 
    postId: v.id("posts"),
    includeHidden: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .order("asc")
      .collect();

    // Get hidden comments for current user if logged in
    let hiddenCommentIds = new Set<Id<"comments">>();
    if (userId) {
      const hiddenComments = await ctx.db
        .query("hiddenComments")
        .withIndex("by_user", q => q.eq("userId", userId))
        .collect();
      hiddenCommentIds = new Set(hiddenComments.map(hc => hc.commentId));
    }

    // Filter out hidden comments unless includeHidden is true
    const visibleComments = args.includeHidden 
      ? comments 
      : comments.filter(comment => !hiddenCommentIds.has(comment._id));

    // Populate with user data and mark hidden comments
    return await Promise.all(
      visibleComments.map(async (comment) => {
        const user = await ctx.db.get(comment.userId);
        const isHidden = userId ? hiddenCommentIds.has(comment._id) : false;
        
        return { 
          ...comment, 
          user: user || null,
          isHidden,
        };
      })
    );
  },
});

// Get count of hidden comments for a post
export const getHiddenCommentsCount = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return 0;

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .collect();

    const hiddenComments = await ctx.db
      .query("hiddenComments")
      .withIndex("by_user", q => q.eq("userId", userId))
      .collect();

    const hiddenCommentIds = new Set(hiddenComments.map(hc => hc.commentId));
    const hiddenCount = comments.filter(comment => hiddenCommentIds.has(comment._id)).length;

    return hiddenCount;
  },
});

// Edit comment
export const editComment = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const comment = await ctx.db.get(args.commentId);
    
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Not authorized to edit this comment");

    await ctx.db.patch(args.commentId, {
      content: args.content,
    });

    return args.commentId;
  },
});

// Delete comment
export const deleteComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const comment = await ctx.db.get(args.commentId);
    
    if (!comment) throw new Error("Comment not found");
    if (comment.userId !== userId) throw new Error("Not authorized to delete this comment");

    // Delete the comment
    await ctx.db.delete(args.commentId);

    // Update comment count using sharded counter
    await CounterHelpers.decrementPostComments(ctx, comment.postId);
    
    // Update the post document for backward compatibility
    const newCommentCount = await CounterHelpers.getPostCommentCount(ctx, comment.postId);
    await ctx.db.patch(comment.postId, {
      commentCount: newCommentCount,
    });

    // Also delete any likes on this comment
    const commentLikes = await ctx.db
      .query("commentLikes")
      .withIndex("by_comment", q => q.eq("commentId", args.commentId))
      .collect();
    
    await Promise.all(
      commentLikes.map(like => ctx.db.delete(like._id))
    );

    // Also delete any hidden records for this comment
    const hiddenComments = await ctx.db
      .query("hiddenComments")
      .withIndex("by_comment", q => q.eq("commentId", args.commentId))
      .collect();
    
    await Promise.all(
      hiddenComments.map(hidden => ctx.db.delete(hidden._id))
    );

    return args.commentId;
  },
});

// Hide comment
export const hideComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const comment = await ctx.db.get(args.commentId);
    
    if (!comment) throw new Error("Comment not found");

    // Check if already hidden
    const existing = await ctx.db
      .query("hiddenComments")
      .withIndex("by_comment_and_user", q =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    if (existing) return;

    // Create hidden record
    await ctx.db.insert("hiddenComments", {
      commentId: args.commentId,
      userId,
    });

    return args.commentId;
  },
});

// Unhide comment
export const unhideComment = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);

    const hidden = await ctx.db
      .query("hiddenComments")
      .withIndex("by_comment_and_user", q =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    if (!hidden) return;

    await ctx.db.delete(hidden._id);

    return args.commentId;
  },
});

// Check if comment is hidden by current user
export const isCommentHidden = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserId(ctx);
    if (!userId) return false;

    const hidden = await ctx.db
      .query("hiddenComments")
      .withIndex("by_comment_and_user", q =>
        q.eq("commentId", args.commentId).eq("userId", userId)
      )
      .first();

    return !!hidden;
  },
});

// Report comment
export const reportComment = mutation({
  args: {
    commentId: v.id("comments"),
    reason: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const comment = await ctx.db.get(args.commentId);
    
    if (!comment) throw new Error("Comment not found");
    
    // Check if user already reported this comment
    const existingReport = await ctx.db
      .query("reports")
      .withIndex("by_comment", q => q.eq("commentId", args.commentId))
      .filter(q => q.eq(q.field("reporterId"), userId))
      .first();

    if (existingReport) {
      throw new Error("You have already reported this comment");
    }

    // Create report
    await ctx.db.insert("reports", {
      reporterId: userId,
      commentId: args.commentId,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });

    return args.commentId;
  },
});

// Report post
export const reportPost = mutation({
  args: {
    postId: v.id("posts"),
    reason: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const post = await ctx.db.get(args.postId);
    
    if (!post) throw new Error("Post not found");
    
    // Check if user already reported this post
    const existingReport = await ctx.db
      .query("reports")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .filter(q => q.eq(q.field("reporterId"), userId))
      .first();

    if (existingReport) {
      throw new Error("You have already reported this post");
    }

    // Create report
    await ctx.db.insert("reports", {
      reporterId: userId,
      postId: args.postId,
      reason: args.reason,
      description: args.description,
      status: "pending",
      createdAt: Date.now(),
    });

    // Notify the post creator (don't notify if user is reporting their own post)
    if (post.userId !== userId) {
      await ctx.db.insert("notifications", {
        userId: post.userId,
        type: "report",
        actorId: userId,
        postId: args.postId,
        read: false,
      });

      // Increment unread notifications counter
      await CounterHelpers.incrementUserNotifications(ctx, post.userId);
    }

    return args.postId;
  },
});

// Pin/Unpin post
export const togglePin = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const post = await ctx.db.get(args.postId);
    
    if (!post) throw new Error("Post not found");
    if (post.userId !== userId) throw new Error("Not authorized to pin this post");

    await ctx.db.patch(args.postId, {
      isPinned: !post.isPinned,
    });

    return args.postId;
  },
});

// Edit post
export const editPost = mutation({
  args: {
    postId: v.id("posts"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const post = await ctx.db.get(args.postId);
    
    if (!post) throw new Error("Post not found");
    if (post.userId !== userId) throw new Error("Not authorized to edit this post");

    await ctx.db.patch(args.postId, {
      content: args.content,
    });

    return args.postId;
  },
});

// Delete post
export const deletePost = mutation({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    const userId = await getCurrentUserIdOrThrow(ctx);
    const post = await ctx.db.get(args.postId);
    
    if (!post) throw new Error("Post not found");
    if (post.userId !== userId) throw new Error("Not authorized to delete this post");

    // Delete all comments for this post
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .collect();
    
    await Promise.all(comments.map(comment => ctx.db.delete(comment._id)));

    // Delete all comment likes for this post
    for (const comment of comments) {
      const commentLikes = await ctx.db
        .query("commentLikes")
        .withIndex("by_comment", q => q.eq("commentId", comment._id))
        .collect();
      
      await Promise.all(commentLikes.map(like => ctx.db.delete(like._id)));
    }

    // Delete all post likes
    const postLikes = await ctx.db
      .query("postLikes")
      .withIndex("by_post", q => q.eq("postId", args.postId))
      .collect();
    
    await Promise.all(postLikes.map(like => ctx.db.delete(like._id)));

    // Delete the post itself
    await ctx.db.delete(args.postId);

    // Update user post count using sharded counter
    await CounterHelpers.decrementUserPosts(ctx, userId);

    return args.postId;
  },
});

// Get discover feed (public posts from all users)
export const getDiscoverFeed = query({
  args: { 
    limit: v.optional(v.number()),
    query: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let posts = await ctx.db
      .query("posts")
      .filter(q => q.eq(q.field("isPublic"), true))
      .order("desc")
      .take((args.limit || 50) * 2); // Take more to filter later

    // Populate with user, tournament, and venue data
    let postsWithUsers = await Promise.all(
      posts.map(async (post) => {
        const user = await ctx.db.get(post.userId);
        let tournament = null;
        let venue = null;
        
        if (post.tournamentId) {
          tournament = await ctx.db.get(post.tournamentId);
          if (tournament) {
            // Get venue info from tournament if available
            if (tournament.venueId) {
              venue = await ctx.db.get(tournament.venueId);
            }
            tournament = {
              ...tournament,
              venue: venue ? {
                name: venue.name,
                city: venue.city,
                region: venue.region,
                country: venue.country,
              } : null,
            };
          }
        }
        
        // Get venue from post if not already set from tournament
        if (post.venueId && !venue) {
          venue = await ctx.db.get(post.venueId);
        }
        
        return { 
          ...post, 
          user: user || null,
          tournament: tournament || null,
          venue: venue ? {
            _id: venue._id,
            name: venue.name,
            city: venue.city,
            region: venue.region,
            country: venue.country,
          } : null
        };
      })
    );

    // Apply search query filter if provided
    if (args.query && args.query.length > 0) {
      const searchTerm = args.query.toLowerCase();
      postsWithUsers = postsWithUsers.filter((post: any) => {
        const contentMatch = post.content.toLowerCase().includes(searchTerm);
        const userNameMatch = post.user?.name?.toLowerCase().includes(searchTerm);
        const usernameMatch = post.user?.username?.toLowerCase().includes(searchTerm);
        return contentMatch || userNameMatch || usernameMatch;
      });
    }

    return postsWithUsers.slice(0, args.limit || 50);
  },
});

// Get trending hashtags
export const getTrendingHashtags = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hashtags = await ctx.db
      .query("hashtags")
      .withIndex("by_use_count")
      .order("desc")
      .take(args.limit || 20);

    return hashtags;
  },
});

// Get recent hashtags
export const getRecentHashtags = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const hashtags = await ctx.db
      .query("hashtags")
      .withIndex("by_last_used")
      .order("desc")
      .take(args.limit || 20);

    return hashtags;
  },
});

// Search hashtags
export const searchHashtags = query({
  args: { query: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const searchTerm = args.query.toLowerCase().replace(/^#/, '');
    
    const allHashtags = await ctx.db.query("hashtags").collect();
    
    const matchingHashtags = allHashtags
      .filter(hashtag => hashtag.tag.includes(searchTerm))
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, args.limit || 10);

    return matchingHashtags;
  },
});

// Get comments by hashtag
export const getCommentsByHashtag = query({
  args: { 
    hashtag: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const normalizedHashtag = args.hashtag.toLowerCase().replace(/^#/, '');
    
    // Find the hashtag
    const hashtagRecord = await ctx.db
      .query("hashtags")
      .withIndex("by_tag", q => q.eq("tag", normalizedHashtag))
      .first();

    if (!hashtagRecord) return [];

    // Get comment-hashtag relationships
    const commentHashtags = await ctx.db
      .query("commentHashtags")
      .withIndex("by_hashtag", q => q.eq("hashtagId", hashtagRecord._id))
      .take(args.limit || 50);

    // Get the comments
    const comments = await Promise.all(
      commentHashtags.map(async (ch) => {
        const comment = await ctx.db.get(ch.commentId);
        if (!comment) return null;
        
        const user = await ctx.db.get(comment.userId);
        
        return {
          ...comment,
          user: user || null
        };
      })
    );

    return comments.filter(Boolean).sort((a, b) => b!._creationTime - a!._creationTime);
  },
});

// Get hashtags for a comment
export const getCommentHashtags = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const commentHashtags = await ctx.db
      .query("commentHashtags")
      .withIndex("by_comment", q => q.eq("commentId", args.commentId))
      .collect();

    const hashtags = await Promise.all(
      commentHashtags.map(async (ch) => {
        const hashtag = await ctx.db.get(ch.hashtagId);
        return hashtag ? { ...hashtag, position: ch.position } : null;
      })
    );

    return hashtags
      .filter(Boolean)
      .sort((a, b) => a!.position - b!.position);
  },
});

// Get counter stats for dashboard/analytics
export const getCounterStats = query({
  args: {},
  handler: async (ctx) => {
    return {
      totalUsers: await CounterHelpers.getTotalUserCount(ctx),
      totalPosts: await CounterHelpers.getTotalPostCount(ctx),
      totalComments: await CounterHelpers.getTotalCommentCount(ctx),
      totalHashtags: await CounterHelpers.getTotalHashtagCount(ctx),
    };
  },
});

// Get user counter stats
export const getUserCounterStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return {
      postCount: await CounterHelpers.getUserPostCount(ctx, args.userId),
      followerCount: await CounterHelpers.getUserFollowerCount(ctx, args.userId),
      followingCount: await CounterHelpers.getUserFollowingCount(ctx, args.userId),
      unreadNotifications: await CounterHelpers.getUserUnreadNotificationCount(ctx, args.userId),
    };
  },
});

// Get post counter stats
export const getPostCounterStats = query({
  args: { postId: v.id("posts") },
  handler: async (ctx, args) => {
    return {
      likeCount: await CounterHelpers.getPostLikeCount(ctx, args.postId),
      commentCount: await CounterHelpers.getPostCommentCount(ctx, args.postId),
    };
  },
});


// Get comment counter stats
export const getCommentCounterStats = query({
  args: { commentId: v.id("comments") },
  handler: async (ctx, args) => {
    return {
      likeCount: await CounterHelpers.getCommentLikeCount(ctx, args.commentId),
    };
  },
});
