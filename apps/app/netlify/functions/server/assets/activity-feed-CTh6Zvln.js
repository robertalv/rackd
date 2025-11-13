import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useQuery, useAction, useMutation } from "convex/react";
import { useState, useEffect, useRef, createContext, useContext } from "react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { B as Button } from "./router-CozkPsbM.js";
import { C as Card, a as CardHeader, d as CardContent } from "./card-CNeVhZxM.js";
import { A as Avatar, a as AvatarImage, b as AvatarFallback } from "./avatar-B5vlBfAE.js";
import { D as DropdownMenu, a as DropdownMenuTrigger, b as DropdownMenuContent, g as DropdownMenuItem, T as Tooltip, c as TooltipTrigger, d as TooltipContent } from "./tooltip-DeKNATFQ.js";
import { T as Textarea } from "./textarea-CRbQQyBj.js";
import { Hash, MoreVertical, Edit, Trash2, EyeOff, Flag, Heart, Trophy, MoreHorizontal, Pin, Calendar, MapPin, DollarSign, Users, ExternalLink, MessageCircle, Share, X, ImageIcon, Video, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "@tanstack/react-router";
import { u as useCurrentUser } from "./use-current-user-CdMPB1RC.js";
import { P as ProfileAvatar } from "./profile-avatar--lu5GzhZ.js";
import { B as Badge } from "./badge-yPJu83x5.js";
import { g as getGameTypeImage, b as getGameTypeLabel } from "./tournament-utils-BsxWYtEj.js";
import { u as useImageUpload } from "./use-image-upload-BDsUfsQO.js";
function PostImage({
  storageId,
  alt,
  className,
  maxSize = 680,
  showBackground = true,
  containerHeight = "min-h-32"
}) {
  const standardUrl = useQuery(api.files.getFileUrl, { storageId });
  const getFileUrlWithConversion = useAction(api.files.getFileUrlWithHeicConversion);
  const [imageUrl, setImageUrl] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  useEffect(() => {
    if (standardUrl && !imageUrl && !isConverting) {
      const mightBeHeic = standardUrl.includes(".heic") || standardUrl.includes(".heif");
      if (mightBeHeic) {
        setIsConverting(true);
        getFileUrlWithConversion({ storageId }).then((convertedUrl) => {
          setImageUrl(convertedUrl || standardUrl);
          setIsConverting(false);
        }).catch(() => {
          setImageUrl(standardUrl);
          setIsConverting(false);
        });
      } else {
        setImageUrl(standardUrl);
      }
    } else if (standardUrl && !imageUrl) {
      setImageUrl(standardUrl);
    }
  }, [standardUrl, storageId, getFileUrlWithConversion, imageUrl, isConverting]);
  if (!imageUrl) {
    return /* @__PURE__ */ jsx("div", { className: `bg-gray-200 animate-pulse rounded-lg ${containerHeight} ${className}`, children: /* @__PURE__ */ jsx("div", { className: "w-full h-full flex items-center justify-center", children: /* @__PURE__ */ jsx("span", { className: "text-gray-400", children: "Loading..." }) }) });
  }
  const imageStyle = {
    maxWidth: `${maxSize}px`,
    maxHeight: `${maxSize}px`,
    width: "auto",
    height: "auto"
  };
  if (!showBackground) {
    return /* @__PURE__ */ jsx(
      "img",
      {
        src: imageUrl,
        alt,
        className: `${className} object-cover`,
        style: imageStyle
      }
    );
  }
  return /* @__PURE__ */ jsx("div", { className: `flex items-center justify-center bg-accent ${containerHeight}`, children: /* @__PURE__ */ jsx(
    "img",
    {
      src: imageUrl,
      alt,
      className: "object-contain",
      style: imageStyle
    }
  ) });
}
function EnhancedMentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  disabled,
  maxLength = 500,
  postId,
  autoFocus = false
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [suggestionStart, setSuggestionStart] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionType, setSuggestionType] = useState("mention");
  const textareaRef = useRef(null);
  const suggestionsRef = useRef(null);
  const mentionResults = useQuery(
    api.users.searchForTagging,
    suggestionType === "mention" && query.length >= 1 ? {
      query,
      postId,
      limit: 8
    } : "skip"
  );
  const hashtagResults = useQuery(
    api.posts.searchHashtags,
    suggestionType === "hashtag" && query.length >= 1 ? {
      query,
      limit: 8
    } : "skip"
  );
  const searchResults = suggestionType === "mention" ? mentionResults : hashtagResults;
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);
    setCursorPosition(cursorPos);
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");
    const hashIndex = textBeforeCursor.lastIndexOf("#");
    const mostRecentIndex = Math.max(atIndex, hashIndex);
    if (mostRecentIndex !== -1) {
      const isHashtag = hashIndex > atIndex;
      const textAfterSymbol = textBeforeCursor.slice(mostRecentIndex + 1);
      if (!textAfterSymbol.includes(" ") && textAfterSymbol.length <= 20) {
        setSuggestionStart(mostRecentIndex);
        setQuery(textAfterSymbol);
        setSuggestionType(isHashtag ? "hashtag" : "mention");
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };
  const handleKeyDown = (e) => {
    if (showSuggestions && searchResults && searchResults.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex(
            (prev) => prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex(
            (prev) => prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case "Enter":
        case "Tab":
          if (selectedIndex < searchResults.length) {
            e.preventDefault();
            if (searchResults[selectedIndex]) {
              if (suggestionType === "mention") {
                insertMention(searchResults[selectedIndex]);
              } else {
                insertHashtag(searchResults[selectedIndex]);
              }
            }
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          break;
      }
    }
    onKeyDown?.(e);
  };
  const insertMention = (user) => {
    const beforeMention = value.slice(0, suggestionStart);
    const afterMention = value.slice(cursorPosition);
    const mentionText = `@${user.displayName}`;
    const newValue = beforeMention + mentionText + " " + afterMention;
    onChange(newValue);
    setShowSuggestions(false);
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = suggestionStart + mentionText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  const insertHashtag = (hashtag) => {
    const beforeHashtag = value.slice(0, suggestionStart);
    const afterHashtag = value.slice(cursorPosition);
    const hashtagText = `#${hashtag.displayTag}`;
    const newValue = beforeHashtag + hashtagText + " " + afterHashtag;
    onChange(newValue);
    setShowSuggestions(false);
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = suggestionStart + hashtagText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const getSuggestionPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };
    const textarea = textareaRef.current;
    const textBeforeCursor = value.slice(0, suggestionStart);
    const temp = document.createElement("div");
    temp.style.position = "absolute";
    temp.style.visibility = "hidden";
    temp.style.whiteSpace = "pre-wrap";
    temp.style.wordWrap = "break-word";
    temp.style.font = window.getComputedStyle(textarea).font;
    temp.style.width = textarea.clientWidth + "px";
    temp.style.padding = window.getComputedStyle(textarea).padding;
    temp.textContent = textBeforeCursor;
    document.body.appendChild(temp);
    const rect = textarea.getBoundingClientRect();
    const tempRect = temp.getBoundingClientRect();
    document.body.removeChild(temp);
    return {
      top: rect.top + tempRect.height + 8,
      left: rect.left + tempRect.width % textarea.clientWidth
    };
  };
  const suggestionPosition = showSuggestions ? getSuggestionPosition() : { top: 0, left: 0 };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsx(
      Textarea,
      {
        ref: textareaRef,
        value,
        onChange: handleInputChange,
        onKeyDown: handleKeyDown,
        placeholder,
        className,
        disabled,
        maxLength,
        autoFocus
      }
    ),
    showSuggestions && searchResults && searchResults.length > 0 && /* @__PURE__ */ jsx(
      "div",
      {
        ref: suggestionsRef,
        className: "fixed mt-3 bg-accent border border-accent-foreground/10 rounded-lg shadow-lg z-50 max-w-xs w-64",
        style: {
          top: suggestionPosition.top + "px",
          left: suggestionPosition.left + "px"
        },
        children: suggestionType === "mention" ? (
          // Mention suggestions
          mentionResults?.map((user, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `flex rounded-md items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-accent ${index === selectedIndex ? "bg-accent" : ""}`,
              onClick: () => insertMention(user),
              children: [
                /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8", children: [
                  /* @__PURE__ */ jsx(AvatarImage, { src: user.image }),
                  /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground text-xs", children: user.displayName.charAt(0).toUpperCase() })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsx("p", { className: "text-sm font-medium truncate", children: user.displayName }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
                    "@",
                    user.username
                  ] })
                ] })
              ]
            },
            user._id
          ))
        ) : (
          // Hashtag suggestions
          hashtagResults?.map((hashtag, index) => /* @__PURE__ */ jsxs(
            "div",
            {
              className: `flex rounded-md items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-accent ${index === selectedIndex ? "bg-accent" : ""}`,
              onClick: () => insertHashtag(hashtag),
              children: [
                /* @__PURE__ */ jsx("div", { className: "h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center", children: /* @__PURE__ */ jsx(Hash, { className: "h-4 w-4 text-blue-500" }) }),
                /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxs("p", { className: "text-sm font-medium truncate", children: [
                    "#",
                    hashtag.displayTag
                  ] }),
                  /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground truncate", children: [
                    hashtag.useCount,
                    " ",
                    hashtag.useCount === 1 ? "post" : "posts"
                  ] })
                ] })
              ]
            },
            hashtag._id
          ))
        )
      }
    )
  ] });
}
function CommentInput({
  postId,
  parentId,
  replyToUser,
  onCommentAdded,
  onCancel,
  compact = false
}) {
  const { user: currentUser } = useCurrentUser();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addComment = useMutation(api.posts.addComment);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await addComment({
        postId,
        content: comment.trim(),
        parentId
      });
      setComment("");
      onCommentAdded?.();
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  if (!currentUser) return null;
  const placeholder = replyToUser ? `Reply to ${replyToUser}... (Cmd/Ctrl + Enter to post)` : "Write a comment... (Cmd/Ctrl + Enter to post)";
  const buttonText = replyToUser ? "Reply" : "Comment";
  return /* @__PURE__ */ jsxs("div", { className: `flex space-x-3 ${compact ? "pt-2" : "pt-3"}`, children: [
    /* @__PURE__ */ jsx(
      ProfileAvatar,
      {
        user: {
          displayName: currentUser.displayName,
          image: currentUser.imageUrl ?? void 0,
          country: currentUser.country
        },
        size: "sm"
      }
    ),
    /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, className: "flex-1", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      replyToUser && /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
        "Replying to ",
        /* @__PURE__ */ jsxs("span", { className: "font-medium", children: [
          "@",
          replyToUser
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        EnhancedMentionInput,
        {
          value: comment,
          onChange: setComment,
          onKeyDown: handleKeyDown,
          placeholder,
          className: `bg-muted rounded-lg border-none resize-none text-sm placeholder:text-gray-400 focus-visible:ring-0 ${compact ? "min-h-[32px] py-1" : "min-h-[40px] py-2"}`,
          disabled: isSubmitting,
          maxLength: 500,
          postId,
          autoFocus: !!replyToUser
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
          comment.length,
          "/500"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
          onCancel && /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              onClick: onCancel,
              className: "text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              size: "sm",
              disabled: !comment.trim() || isSubmitting || comment.length > 500,
              className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full disabled:opacity-50",
              children: isSubmitting ? "Posting..." : buttonText
            }
          )
        ] })
      ] })
    ] }) })
  ] });
}
function MentionText({ content, className }) {
  const users = useQuery(api.users.search, { query: "", limit: 1e3 });
  const parseContent = (text) => {
    if (!users) return [{ type: "text", content: text }];
    const mentionRegex = /@([A-Za-z0-9\s]+?)(?=\s|$|[^\w\s])/g;
    const hashtagRegex = /#([A-Za-z0-9_]+)/g;
    const matches = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      matches.push({
        type: "mention",
        index: match.index,
        length: match[0].length,
        content: match[0],
        value: match[1]?.trim()
      });
    }
    hashtagRegex.lastIndex = 0;
    while ((match = hashtagRegex.exec(text)) !== null) {
      matches.push({
        type: "hashtag",
        index: match.index,
        length: match[0].length,
        content: match[0],
        value: match[1]
      });
    }
    matches.sort((a, b) => a.index - b.index);
    const parts2 = [];
    let lastIndex = 0;
    for (const match2 of matches) {
      if (match2.index > lastIndex) {
        parts2.push({
          type: "text",
          content: text.slice(lastIndex, match2.index)
        });
      }
      if (match2.type === "mention") {
        const user = users.find(
          (u) => u.displayName.toLowerCase() === match2.value?.toLowerCase()
        );
        if (user) {
          parts2.push({
            type: "mention",
            content: match2.content,
            user
          });
        } else {
          parts2.push({
            type: "text",
            content: match2.content
          });
        }
      } else if (match2.type === "hashtag") {
        parts2.push({
          type: "hashtag",
          content: match2.content,
          hashtag: match2.value
        });
      }
      lastIndex = match2.index + match2.length;
    }
    if (lastIndex < text.length) {
      parts2.push({
        type: "text",
        content: text.slice(lastIndex)
      });
    }
    return parts2;
  };
  const parts = parseContent(content);
  return /* @__PURE__ */ jsx("span", { className, children: parts.map((part, index) => {
    if (part.type === "mention" && part.user) {
      return /* @__PURE__ */ jsx(
        Link,
        {
          to: `/${part.user.username}`,
          className: "text-blue-600 hover:text-blue-700 font-medium hover:underline",
          children: part.content
        },
        index
      );
    } else if (part.type === "hashtag" && part.hashtag) {
      return /* @__PURE__ */ jsx(
        Link,
        {
          to: `/hashtag/${part.hashtag}`,
          className: "text-blue-600 hover:text-blue-700 font-medium hover:underline",
          children: part.content
        },
        index
      );
    } else {
      return /* @__PURE__ */ jsx("span", { children: part.content }, index);
    }
  }) });
}
function Comment({ comment, postId, level = 0, mainCommentId }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const { user: currentUser } = useCurrentUser();
  const post = useQuery(api.posts.getPost, { postId });
  const replies = useQuery(api.posts.getComments, { postId });
  const commentReplies = level === 0 ? replies?.filter((reply) => reply.parentId === comment._id) || [] : [];
  const isCommentAuthor = currentUser?._id === comment.userId;
  const isPostAuthor = currentUser?._id === post?.userId;
  const isLiked = useQuery(api.posts.isCommentLiked, { commentId: comment._id });
  const commentStats = useQuery(api.posts.getCommentCounterStats, { commentId: comment._id });
  const likeComment = useMutation(api.posts.likeComment);
  const unlikeComment = useMutation(api.posts.unlikeComment);
  const editComment = useMutation(api.posts.editComment);
  const deleteComment = useMutation(api.posts.deleteComment);
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
        content: editContent.trim()
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
  return /* @__PURE__ */ jsxs("div", { className: `flex space-x-3 ${level > 0 ? "mt-3" : ""}`, children: [
    /* @__PURE__ */ jsxs(Avatar, { className: "h-8 w-8 shrink-0", children: [
      /* @__PURE__ */ jsx(AvatarImage, { src: comment.user?.image || void 0 }),
      /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground", children: comment.user?.displayName?.charAt(0).toUpperCase() || comment.user?.name?.charAt(0).toUpperCase() || comment.user?.firstName?.charAt(0).toUpperCase() || "U" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          className: "relative bg-muted rounded-lg p-3 hover:bg-muted/80 transition-colors",
          onMouseEnter: () => setIsHovered(true),
          onMouseLeave: () => setIsHovered(false),
          children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2 mb-1", children: [
                /* @__PURE__ */ jsx(
                  Link,
                  {
                    to: `/${comment.user?.username}`,
                    className: "font-semibold text-xs hover:underline",
                    children: comment.user?.displayName
                  }
                ),
                isPostAuthor && comment.userId === post?.userId && /* @__PURE__ */ jsx(
                  Badge,
                  {
                    variant: "secondary",
                    className: "text-xs text-muted-foreground py-0.5! px-1! bg-foreground/10",
                    children: "Author"
                  }
                )
              ] }),
              isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    value: editContent,
                    onChange: (e) => setEditContent(e.target.value),
                    className: "w-full text-sm bg-background border rounded-xl p-2 resize-none",
                    rows: 3
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "sm",
                      onClick: handleEdit,
                      disabled: !editContent.trim() || editContent === comment.content,
                      className: "bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-full",
                      children: "Save"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      onClick: handleEditCancel,
                      className: "text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full",
                      children: "Cancel"
                    }
                  )
                ] })
              ] }) : /* @__PURE__ */ jsx(
                MentionText,
                {
                  content: comment.content,
                  className: "text-sm wrap-break-words"
                }
              )
            ] }),
            /* @__PURE__ */ jsx("div", { className: `absolute top-2 right-2 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"}`, children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
              /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", className: "h-6 w-6 p-0 hover:bg-background/50", children: /* @__PURE__ */ jsx(MoreVertical, { className: "h-4 w-4" }) }) }),
              /* @__PURE__ */ jsx(DropdownMenuContent, { align: "end", children: isCommentAuthor ? (
                // Show Edit/Delete for comment author
                /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs(
                    DropdownMenuItem,
                    {
                      className: "flex items-center space-x-2",
                      onClick: () => setIsEditing(true),
                      children: [
                        /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
                        /* @__PURE__ */ jsx("span", { children: "Edit" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    DropdownMenuItem,
                    {
                      className: "flex items-center space-x-2 text-red-600",
                      onClick: handleDelete,
                      children: [
                        /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                        /* @__PURE__ */ jsx("span", { children: "Delete" })
                      ]
                    }
                  )
                ] })
              ) : (
                // Show Hide/Report for others
                /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsx(EyeOff, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Hide comment" })
                  ] }),
                  /* @__PURE__ */ jsxs(DropdownMenuItem, { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsx(Flag, { className: "h-4 w-4" }),
                    /* @__PURE__ */ jsx("span", { children: "Report comment" })
                  ] })
                ] })
              ) })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4 mt-1 ml-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: formatDistanceToNow(new Date(comment._creationTime), { addSuffix: true }) }),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: handleLike,
            className: `text-xs p-0 h-auto font-semibold ${isLiked ? "text-blue-600" : "text-muted-foreground hover:text-foreground"}`,
            children: "Like"
          }
        ),
        /* @__PURE__ */ jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: handleReplyClick,
            className: "text-xs text-muted-foreground hover:text-foreground p-0 h-auto font-semibold",
            children: "Reply"
          }
        ),
        (commentStats?.likeCount ?? comment.likeCount) > 0 && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsx(Heart, { className: "h-3 w-3 text-red-500 fill-red-500" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs text-muted-foreground", children: commentStats?.likeCount ?? comment.likeCount })
        ] })
      ] }),
      level === 0 && commentReplies.length > 0 && /* @__PURE__ */ jsx("div", { className: "ml-3 mt-2", children: /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: () => setShowReplies(!showReplies),
          className: "text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-normal",
          children: showReplies ? "Hide replies" : `View ${commentReplies.length} ${commentReplies.length === 1 ? "reply" : "replies"}`
        }
      ) }),
      showReplyInput && /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx(
        CommentInput,
        {
          postId,
          parentId: level === 0 ? comment._id : mainCommentId,
          replyToUser: level === 0 ? comment.user?.displayName : `${comment.user?.displayName}`,
          onCommentAdded: handleReplyAdded,
          onCancel: () => setShowReplyInput(false),
          compact: true
        }
      ) }),
      level === 0 && showReplies && commentReplies.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-3 pl-4 border-l-2 border-border space-y-3", children: commentReplies.map((reply) => /* @__PURE__ */ jsx(
        Comment,
        {
          comment: reply,
          postId,
          level: 1,
          mainCommentId: comment._id
        },
        reply._id
      )) })
    ] })
  ] });
}
function TournamentPostCard({ post }) {
  const [showComments, setShowComments] = useState(false);
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
  const isNewTournament = post.tournament?._creationTime ? Date.now() - post.tournament._creationTime < 48 * 60 * 60 * 1e3 : false;
  const tournament = post.tournament;
  const flyerImageId = post.images && post.images.length > 0 ? post.images[0] : tournament?.flyerUrl;
  const isFlyerUrl = flyerImageId && flyerImageId.startsWith("http");
  const flyerImageUrl = useQuery(
    api.files.getFileUrl,
    flyerImageId && !isFlyerUrl ? { storageId: flyerImageId } : "skip"
  );
  const displayFlyerUrl = isFlyerUrl ? flyerImageId : flyerImageUrl;
  const tournamentDate = tournament?.date ? new Date(tournament.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : null;
  const gameTypeImage = tournament?.gameType ? getGameTypeImage(tournament.gameType) : null;
  return /* @__PURE__ */ jsxs(Card, { className: "mb-4 overflow-hidden border-2 border-primary/20 hover:border-primary/40 transition-colors py-0 pb-6", children: [
    isNewTournament && /* @__PURE__ */ jsx("div", { className: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-3 text-center shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-2", children: [
      /* @__PURE__ */ jsx(Trophy, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("span", { className: "font-bold text-sm tracking-tighter uppercase", children: "New Tournament" })
    ] }) }),
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxs(Avatar, { className: "h-10 w-10", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: post.user?.image || void 0 }),
          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground", children: post.user?.displayName?.charAt(0).toUpperCase() || post.user?.name?.charAt(0).toUpperCase() || post.user?.firstName?.charAt(0).toUpperCase() || "U" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx("span", { className: "text-sm font-bold tracking-tighter", children: post.user?.name }),
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/${post.user?.username}`,
                className: "font-bold hover:underline",
                children: post.user?.displayName
              }
            ),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs", children: "Tournament Update" })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "@",
            post.user?.username,
            " • ",
            formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })
          ] })
        ] })
      ] }),
      isPostOwner && /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              className: "flex items-center space-x-2",
              onClick: handlePin,
              children: [
                /* @__PURE__ */ jsx(Pin, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { children: post.isPinned ? "Unpin post" : "Pin post" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              className: "flex items-center space-x-2 text-red-600",
              onClick: handleDelete,
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { children: "Delete" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "pt-0", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        displayFlyerUrl && /* @__PURE__ */ jsx("div", { className: "flex-shrink-0 w-full sm:w-48 h-48 rounded-lg overflow-hidden border-2 border-border bg-accent shadow-sm", children: /* @__PURE__ */ jsx(
          "img",
          {
            src: displayFlyerUrl,
            alt: `${tournament?.name || "Tournament"} flyer`,
            className: "w-full h-full object-cover"
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-3 min-w-0", children: [
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
            Link,
            {
              to: `/tournaments/${post.tournamentId}`,
              className: "text-2xl font-bold hover:text-primary transition-colors tracking-tighter",
              children: tournament?.name || "Tournament"
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 text-sm", children: [
            tournamentDate && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Calendar, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { children: tournamentDate })
            ] }),
            tournament?.gameType && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              gameTypeImage && /* @__PURE__ */ jsx(
                "img",
                {
                  src: gameTypeImage.imageSrc,
                  alt: gameTypeImage.alt,
                  className: "h-4 w-4 rounded-full"
                }
              ),
              /* @__PURE__ */ jsx("span", { children: getGameTypeLabel(tournament.gameType) })
            ] }),
            tournament?.venue?.name && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(MapPin, { className: "h-4 w-4" }),
              post.venueId ? /* @__PURE__ */ jsxs(
                Link,
                {
                  to: `/venues/${post.venueId}`,
                  className: "hover:text-primary hover:underline transition-colors",
                  children: [
                    tournament.venue.name,
                    tournament.venue.city ? `, ${tournament.venue.city}` : ""
                  ]
                }
              ) : /* @__PURE__ */ jsxs("span", { children: [
                tournament.venue.name,
                tournament.venue.city ? `, ${tournament.venue.city}` : ""
              ] })
            ] }),
            tournament?.entryFee !== void 0 && tournament.entryFee !== null && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(DollarSign, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxs("span", { children: [
                "$",
                tournament.entryFee
              ] })
            ] }),
            tournament?.maxPlayers && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Users, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsxs("span", { children: [
                tournament.registeredCount || 0,
                " / ",
                tournament.maxPlayers,
                " players"
              ] })
            ] }),
            tournament?.type && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-muted-foreground", children: [
              /* @__PURE__ */ jsx(Trophy, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "capitalize", children: tournament.type.replace("_", " ") })
            ] })
          ] }),
          tournament?.description && /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2", children: tournament.description }),
          /* @__PURE__ */ jsxs(
            Link,
            {
              to: `/tournaments/${post.tournamentId}`,
              className: "inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm transition-colors",
              children: [
                /* @__PURE__ */ jsx("span", { children: "View Tournament" }),
                /* @__PURE__ */ jsx(ExternalLink, { className: "h-3 w-3" })
              ]
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pt-4 mt-4 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-6", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: `flex items-center ${isLiked ? "text-red-500" : ""}`,
            onClick: handleLike,
            children: [
              /* @__PURE__ */ jsx(Heart, { className: `h-4 w-4 ${isLiked ? "fill-current" : ""}` }),
              /* @__PURE__ */ jsx("span", { className: "text-sm ml-1", children: postStats?.likeCount ?? post.likeCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "flex items-center",
            onClick: () => setShowComments(!showComments),
            children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm ml-1", children: postStats?.commentCount ?? post.commentCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, { disabled: true, variant: "ghost", size: "sm", className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(Share, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: post.shareCount })
          ] }) }) }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "right", align: "center", children: /* @__PURE__ */ jsx("p", { children: "Share this post -- Coming soon!" }) })
        ] })
      ] }) }),
      showComments && /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-3 border-t mt-4", children: [
        comments && comments.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: comments.filter((comment) => !comment.parentId).map((comment) => /* @__PURE__ */ jsx(
          Comment,
          {
            comment,
            postId: post._id,
            level: 0
          },
          comment._id
        )) }),
        /* @__PURE__ */ jsx(
          CommentInput,
          {
            postId: post._id,
            onCommentAdded: () => {
            }
          }
        )
      ] })
    ] })
  ] });
}
function PostCard({ post }) {
  if (post.tournamentId && post.tournament) {
    return /* @__PURE__ */ jsx(TournamentPostCard, { post });
  }
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const { user: currentUser } = useCurrentUser();
  const isLiked = useQuery(api.posts.isLiked, { postId: post._id });
  const comments = useQuery(api.posts.getComments, { postId: post._id });
  const postStats = useQuery(api.posts.getPostCounterStats, { postId: post._id });
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
        content: editContent.trim()
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
  const getPostTypeLabel = (type) => {
    switch (type) {
      case "highlight":
        return "Match Highlight";
      case "tournament_update":
        return "Tournament Update";
      case "result":
        return "Match Result";
      default:
        return "";
    }
  };
  const getPostTypeColor = (type) => {
    switch (type) {
      case "highlight":
        return "bg-yellow-100 text-yellow-800";
      case "tournament_update":
        return "bg-blue-100 text-blue-800";
      case "result":
        return "bg-green-100 text-green-800";
      default:
        return "";
    }
  };
  return /* @__PURE__ */ jsxs(Card, { className: "mb-4 bg-accent/50 gap-2", children: [
    /* @__PURE__ */ jsx(CardHeader, { className: "pb-3", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
        /* @__PURE__ */ jsxs(Avatar, { className: "h-10 w-10", children: [
          /* @__PURE__ */ jsx(AvatarImage, { src: post.user?.image || void 0 }),
          /* @__PURE__ */ jsx(AvatarFallback, { className: "bg-accent text-accent-foreground", children: post.user?.displayName?.charAt(0).toUpperCase() || post.user?.name?.charAt(0).toUpperCase() || post.user?.firstName?.charAt(0).toUpperCase() || "U" })
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                to: `/${post.user?.username}`,
                className: "font-semibold hover:underline",
                children: post.user?.displayName
              }
            ),
            post.type !== "post" && /* @__PURE__ */ jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getPostTypeColor(post.type)}`, children: getPostTypeLabel(post.type) })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "@",
            post.user?.username,
            " • ",
            formatDistanceToNow(new Date(post._creationTime), { addSuffix: true })
          ] })
        ] })
      ] }),
      isPostOwner && /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "sm", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              className: "flex items-center space-x-2",
              onClick: handlePin,
              children: [
                /* @__PURE__ */ jsx(Pin, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { children: post.isPinned ? "Unpin post" : "Pin post" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              className: "flex items-center space-x-2",
              onClick: () => setIsEditing(true),
              children: [
                /* @__PURE__ */ jsx(Edit, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { children: "Edit post" })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            DropdownMenuItem,
            {
              className: "flex items-center space-x-2 text-red-600",
              onClick: handleDelete,
              children: [
                /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsx("span", { children: "Delete" })
              ]
            }
          )
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      isEditing ? /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsx(
          Textarea,
          {
            value: editContent,
            onChange: (e) => setEditContent(e.target.value),
            className: "w-full text-sm bg-background border rounded-xl p-3 resize-none",
            rows: 4,
            placeholder: "What's on your mind?"
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-400", children: [
            editContent.length,
            "/1000"
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                onClick: handleEditCancel,
                className: "text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full",
                children: "Cancel"
              }
            ),
            /* @__PURE__ */ jsx(
              Button,
              {
                size: "sm",
                onClick: handleEdit,
                disabled: !editContent.trim() || editContent === post.content || editContent.length > 1e3,
                className: "bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded-full",
                children: "Save"
              }
            )
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        post.isPinned && /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1 text-xs text-blue-600 font-medium", children: [
          /* @__PURE__ */ jsx(Pin, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { children: "Pinned Post" })
        ] }),
        /* @__PURE__ */ jsx(
          MentionText,
          {
            content: post.content,
            className: "text-sm leading-relaxed"
          }
        )
      ] }),
      post.images && post.images.length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-lg overflow-hidden", children: post.images.length === 1 ? /* @__PURE__ */ jsx(
        PostImage,
        {
          storageId: post.images[0],
          alt: "Post image",
          maxSize: 680,
          showBackground: true,
          containerHeight: "min-h-64"
        }
      ) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2", children: post.images.slice(0, 4).map((image, index) => /* @__PURE__ */ jsx(
        PostImage,
        {
          storageId: image,
          alt: `Post image ${index + 1}`,
          className: "w-full h-32 object-cover rounded-lg",
          maxSize: 340,
          showBackground: false
        },
        index
      )) }) }),
      post.tournament && /* @__PURE__ */ jsxs("div", { className: "p-3 bg-muted rounded-lg", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium", children: "Tournament" }),
        /* @__PURE__ */ jsx(
          Link,
          {
            to: `/tournaments/${post.tournamentId}`,
            className: "text-sm text-primary hover:underline",
            children: post.tournament.name
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between pt-2 border-t", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-6", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: `flex items-center ${isLiked ? "text-red-500" : ""}`,
            onClick: handleLike,
            children: [
              /* @__PURE__ */ jsx(Heart, { className: `h-4 w-4 ${isLiked ? "fill-current" : ""}` }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: postStats?.likeCount ?? post.likeCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            className: "flex items-center",
            onClick: () => setShowComments(!showComments),
            children: [
              /* @__PURE__ */ jsx(MessageCircle, { className: "h-4 w-4" }),
              /* @__PURE__ */ jsx("span", { className: "text-sm", children: postStats?.commentCount ?? post.commentCount })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Tooltip, { children: [
          /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs(Button, { disabled: true, variant: "ghost", size: "sm", className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(Share, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { className: "text-sm", children: post.shareCount })
          ] }) }) }),
          /* @__PURE__ */ jsx(TooltipContent, { side: "right", align: "center", children: /* @__PURE__ */ jsx("p", { children: "Share this post -- Coming soon!" }) })
        ] })
      ] }) }),
      showComments && /* @__PURE__ */ jsxs("div", { className: "space-y-4 pt-3 border-t", children: [
        comments && comments.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-4", children: comments.filter((comment) => !comment.parentId).map((comment) => /* @__PURE__ */ jsx(
          Comment,
          {
            comment,
            postId: post._id,
            level: 0
          },
          comment._id
        )) }),
        /* @__PURE__ */ jsx(
          CommentInput,
          {
            postId: post._id,
            onCommentAdded: () => {
            }
          }
        )
      ] })
    ] }) })
  ] });
}
function PostComposer({
  placeholder = "Tell your friends about your thoughts...",
  onPostCreated
}) {
  const { user: currentUser } = useCurrentUser();
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const fileInputRef = useRef(null);
  const createPost = useMutation(api.posts.create);
  const { uploadImage, isUploading } = useImageUpload({
    category: "other",
    onSuccess: (_, storageId) => {
      setUploadedImages((prev) => [...prev, storageId]);
    }
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && uploadedImages.length === 0) return;
    setIsPosting(true);
    try {
      await createPost({
        content: content.trim(),
        images: uploadedImages.length > 0 ? uploadedImages : void 0,
        type: "post"
        // turnstileToken: turnstileToken || undefined, // Commented out
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
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadImage(file);
    }
  };
  const removeImage = (indexToRemove) => {
    setUploadedImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };
  if (!currentUser) return null;
  return /* @__PURE__ */ jsx(Card, { className: "bg-accent/50 mb-6 p-0", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start space-x-3 mb-4", children: [
      /* @__PURE__ */ jsx(
        ProfileAvatar,
        {
          user: {
            displayName: currentUser.displayName || currentUser.email || "User",
            image: currentUser.imageUrl,
            country: currentUser.locale
          },
          size: "sm"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsx(
        EnhancedMentionInput,
        {
          value: content,
          onChange: setContent,
          placeholder,
          className: "bg-transparent rounded-2xl border-none resize-none text-base placeholder:text-gray-400 focus-visible:ring-0 min-h-[60px]",
          disabled: isPosting || isUploading,
          maxLength: 500
        }
      ) }) })
    ] }),
    uploadedImages.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-4", children: uploadedImages.length === 1 ? /* @__PURE__ */ jsxs("div", { className: "relative group max-w-md", children: [
      /* @__PURE__ */ jsx(
        PostImage,
        {
          storageId: uploadedImages[0],
          alt: "Uploaded image",
          maxSize: 680,
          showBackground: true,
          containerHeight: "min-h-48"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => removeImage(0),
          className: "absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) : /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 max-w-md", children: uploadedImages.map((storageId, index) => /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
      /* @__PURE__ */ jsx(
        PostImage,
        {
          storageId,
          alt: `Uploaded image ${index + 1}`,
          maxSize: 340,
          showBackground: false,
          className: "w-full h-32 object-cover rounded-lg"
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => removeImage(index),
          className: "absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }, index)) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-6", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "file",
            ref: fileInputRef,
            onChange: handleImageUpload,
            accept: "image/*",
            className: "hidden"
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            variant: "ghost",
            size: "sm",
            className: "flex items-center space-x-2 px-3 py-2 rounded-full",
            onClick: () => fileInputRef.current?.click(),
            disabled: isUploading || isPosting,
            children: [
              /* @__PURE__ */ jsx(ImageIcon, { className: "h-5 w-5 text-green-400" }),
              /* @__PURE__ */ jsx("span", { children: isUploading ? "Uploading..." : "Photo" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(Button, { disabled: true, type: "button", variant: "ghost", size: "sm", className: "flex items-center space-x-2 px-3 py-2 rounded-full", children: [
          /* @__PURE__ */ jsx(Video, { className: "h-5 w-5 text-blue-400" }),
          /* @__PURE__ */ jsx("span", { children: "Video" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { disabled: true, type: "button", variant: "ghost", size: "sm", className: "flex items-center space-x-2 px-3 py-2 rounded-full", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex space-x-1", children: [
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-red-400 rounded-full" }),
            /* @__PURE__ */ jsx("div", { className: "w-2 h-2 bg-orange-400 rounded-full" })
          ] }),
          /* @__PURE__ */ jsx("span", { children: "Poll" })
        ] }),
        /* @__PURE__ */ jsxs(Button, { disabled: true, type: "button", variant: "ghost", size: "sm", className: "flex items-center space-x-2 px-3 py-2 rounded-full", children: [
          /* @__PURE__ */ jsx(Calendar, { className: "h-5 w-5 text-yellow-400" }),
          /* @__PURE__ */ jsx("span", { children: "Schedule" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-6" }),
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-sm text-gray-400", children: [
            content.length,
            "/500"
          ] }),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              onClick: handleSubmit,
              disabled: !content.trim() && uploadedImages.length === 0 || isPosting || isUploading || content.length > 500,
              className: "bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full disabled:opacity-50",
              children: isPosting ? "Posting..." : "Post"
            }
          )
        ] })
      ] })
    ] })
  ] }) });
}
const FeedContext = createContext(void 0);
function FeedProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshFeed = () => {
    setRefreshKey((prev) => prev + 1);
  };
  return /* @__PURE__ */ jsx(FeedContext.Provider, { value: { refreshKey, refreshFeed }, children });
}
function useFeedRefresh() {
  const context = useContext(FeedContext);
  if (context === void 0) {
    return { refreshKey: 0, refreshFeed: () => {
    } };
  }
  return context;
}
function ActivityFeed({
  userId,
  showComposer = false,
  feedType = "following"
}) {
  const { refreshKey } = useFeedRefresh();
  const [queryKey, setQueryKey] = useState(0);
  useEffect(() => {
    setQueryKey(refreshKey);
  }, [refreshKey]);
  const followingPosts = useQuery(
    api.posts.getFeed,
    feedType === "following" ? { limit: 50 } : "skip"
  );
  const globalPosts = useQuery(
    api.posts.getDiscoverFeed,
    feedType === "global" ? { limit: 50 } : "skip"
  );
  const userPosts = useQuery(
    api.posts.getByUser,
    feedType === "user" && userId ? { userId, limit: 50 } : "skip"
  );
  const posts = feedType === "user" ? userPosts : feedType === "global" ? globalPosts : followingPosts;
  if (posts === void 0) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      showComposer && /* @__PURE__ */ jsx(PostComposer, {}),
      /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "flex items-center justify-center py-12", children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 animate-spin" }),
        /* @__PURE__ */ jsx("span", { className: "ml-2", children: "Loading posts..." })
      ] }) })
    ] });
  }
  const pinnedPosts = posts.filter((post) => post.isPinned);
  const regularPosts = posts.filter((post) => !post.isPinned);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    showComposer && /* @__PURE__ */ jsx(PostComposer, {}),
    posts.length === 0 ? /* @__PURE__ */ jsx(Card, { className: "border-none", children: /* @__PURE__ */ jsx(CardContent, { className: "text-center py-12", children: /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("h3", { className: "text-lg font-semibold", children: "No posts yet" }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: feedType === "user" ? "This user hasn't posted anything yet." : feedType === "global" ? "Be the first to share something with the community!" : "Follow some players to see their posts in your feed." })
    ] }) }) }) : /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      pinnedPosts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-1 text-sm font-medium text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Pin, { className: "h-3 w-3" }),
          /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Pinned Posts" })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: pinnedPosts.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post._id)) })
      ] }),
      regularPosts.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        pinnedPosts.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex items-center space-x-1 text-xs font-medium text-muted-foreground", children: /* @__PURE__ */ jsx("span", { className: "text-xs", children: "Recent Posts" }) }),
        /* @__PURE__ */ jsx("div", { className: "space-y-4", children: regularPosts.map((post) => /* @__PURE__ */ jsx(PostCard, { post }, post._id)) })
      ] })
    ] })
  ] });
}
export {
  ActivityFeed as A,
  FeedProvider as F
};
