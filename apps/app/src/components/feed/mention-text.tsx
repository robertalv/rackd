"use client";

import { Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";

interface MentionTextProps {
  content: string;
  className?: string;
}

export function MentionText({ content, className }: MentionTextProps) {
  // Get all users to resolve mentions
  const users = useQuery(api.users.search, { query: "", limit: 1000 });
  
  // Parse content for @mentions and #hashtags
  const parseContent = (text: string) => {
    if (!users) return [{ type: 'text', content: text }];
    
    // Combined regex for mentions and hashtags
    const mentionRegex = /@([A-Za-z0-9\s]+?)(?=\s|$|[^\w\s])/g;
    const hashtagRegex = /#([A-Za-z0-9_]+)/g;
    
    const matches = [];
    let match;
    
    // Find all mentions
    while ((match = mentionRegex.exec(text)) !== null) {
      matches.push({
        type: 'mention',
        index: match.index,
        length: match[0].length,
        content: match[0],
        value: match[1]?.trim()
      });
    }
    
    // Reset regex state and find all hashtags
    hashtagRegex.lastIndex = 0;
    while ((match = hashtagRegex.exec(text)) !== null) {
      matches.push({
        type: 'hashtag',
        index: match.index,
        length: match[0].length,
        content: match[0],
        value: match[1]
      });
    }
    
    // Sort matches by position
    matches.sort((a, b) => a.index - b.index);
    
    const parts = [];
    let lastIndex = 0;
    
    for (const match of matches) {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      if (match.type === 'mention') {
        // Find user by display name
        const user = users.find(u => 
          u.displayName.toLowerCase() === match.value?.toLowerCase()
        );
        
        if (user) {
          parts.push({
            type: 'mention',
            content: match.content,
            user: user
          });
        } else {
          // If user not found, treat as regular text
          parts.push({
            type: 'text',
            content: match.content
          });
        }
      } else if (match.type === 'hashtag') {
        parts.push({
          type: 'hashtag',
          content: match.content,
          hashtag: match.value
        });
      }
      
      lastIndex = match.index + match.length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex)
      });
    }
    
    return parts;
  };

  const parts = parseContent(content);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === 'mention' && part.user) {
          return (
            <Link
              key={index}
              to={`/${part.user.username}`}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              {part.content}
            </Link>
          );
        } else if (part.type === 'hashtag' && part.hashtag) {
          return (
            <Link
              key={index}
              to={`/hashtag/${part.hashtag}`}
              className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              {part.content}
            </Link>
          );
        } else {
          return (
            <span key={index}>{part.content}</span>
          );
        }
      })}
    </span>
  );
}