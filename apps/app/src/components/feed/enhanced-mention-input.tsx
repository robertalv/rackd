"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { Textarea } from "@rackd/ui/components/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { Hash } from "lucide-react";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface EnhancedMentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  postId?: Id<"posts">;
  autoFocus?: boolean;
}

interface MentionSuggestion {
  _id: string;
  username: string;
  displayName: string;
  image?: string;
  _score: number;
}

interface HashtagSuggestion {
  _id: string;
  tag: string;
  displayTag: string;
  useCount: number;
}

type SuggestionType = 'mention' | 'hashtag';

export function EnhancedMentionInput({
  value,
  onChange,
  onKeyDown,
  placeholder,
  className,
  disabled,
  maxLength = 500,
  postId,
  autoFocus = false
}: EnhancedMentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [suggestionStart, setSuggestionStart] = useState(-1);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [suggestionType, setSuggestionType] = useState<SuggestionType>('mention');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Search for users when typing @
  const mentionResults = useQuery(
    api.users.searchForTagging,
    suggestionType === 'mention' && query.length >= 1 ? { 
      query: query,
      postId,
      limit: 8 
    } : "skip"
  ) as MentionSuggestion[] | undefined;

  // Search for hashtags when typing #
  const hashtagResults = useQuery(
    api.posts.searchHashtags,
    suggestionType === 'hashtag' && query.length >= 1 ? { 
      query: query,
      limit: 8 
    } : "skip"
  ) as HashtagSuggestion[] | undefined;

  const searchResults = suggestionType === 'mention' ? mentionResults : hashtagResults;

  // Handle input change and detect @ mentions and # hashtags
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(cursorPos);
    
    // Detect @ mention or # hashtag
    const textBeforeCursor = newValue.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    const hashIndex = textBeforeCursor.lastIndexOf('#');
    
    // Determine which one is closer to cursor
    const mostRecentIndex = Math.max(atIndex, hashIndex);
    
    if (mostRecentIndex !== -1) {
      const isHashtag = hashIndex > atIndex;
      const textAfterSymbol = textBeforeCursor.slice(mostRecentIndex + 1);
      
      // Check if we're in a valid context
      if (!textAfterSymbol.includes(' ') && textAfterSymbol.length <= 20) {
        setSuggestionStart(mostRecentIndex);
        setQuery(textAfterSymbol);
        setSuggestionType(isHashtag ? 'hashtag' : 'mention');
        setShowSuggestions(true);
        setSelectedIndex(0);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle key navigation in suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && searchResults && searchResults.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case 'Enter':
        case 'Tab':
          if (selectedIndex < searchResults.length) {
            e.preventDefault();
            if (searchResults[selectedIndex]) {
              if (suggestionType === 'mention') {
                insertMention(searchResults[selectedIndex] as MentionSuggestion);
              } else {
                insertHashtag(searchResults[selectedIndex] as HashtagSuggestion);
              }
            }
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    }
    
    onKeyDown?.(e);
  };

  // Insert selected mention
  const insertMention = (user: MentionSuggestion) => {
    const beforeMention = value.slice(0, suggestionStart);
    const afterMention = value.slice(cursorPosition);
    const mentionText = `@${user.displayName}`;
    
    const newValue = beforeMention + mentionText + ' ' + afterMention;
    onChange(newValue);
    
    setShowSuggestions(false);
    
    // Focus and position cursor after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = suggestionStart + mentionText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Insert selected hashtag
  const insertHashtag = (hashtag: HashtagSuggestion) => {
    const beforeHashtag = value.slice(0, suggestionStart);
    const afterHashtag = value.slice(cursorPosition);
    const hashtagText = `#${hashtag.displayTag}`;
    
    const newValue = beforeHashtag + hashtagText + ' ' + afterHashtag;
    onChange(newValue);
    
    setShowSuggestions(false);
    
    // Focus and position cursor after hashtag
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = suggestionStart + hashtagText.length + 1;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate suggestion position
  const getSuggestionPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };
    
    const textarea = textareaRef.current;
    const textBeforeCursor = value.slice(0, suggestionStart);
    
    // Create a temporary element to measure text position
    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.whiteSpace = 'pre-wrap';
    temp.style.wordWrap = 'break-word';
    temp.style.font = window.getComputedStyle(textarea).font;
    temp.style.width = textarea.clientWidth + 'px';
    temp.style.padding = window.getComputedStyle(textarea).padding;
    temp.textContent = textBeforeCursor;
    
    document.body.appendChild(temp);
    const rect = textarea.getBoundingClientRect();
    const tempRect = temp.getBoundingClientRect();
    document.body.removeChild(temp);
    
    return {
      top: rect.top + tempRect.height + 8,
      left: rect.left + (tempRect.width % textarea.clientWidth)
    };
  };

  const suggestionPosition = showSuggestions ? getSuggestionPosition() : { top: 0, left: 0 };

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
        maxLength={maxLength}
        autoFocus={autoFocus}
      />
      
      {/* Suggestions dropdown */}
      {showSuggestions && searchResults && searchResults.length > 0 && (
        <div
          ref={suggestionsRef}
          className="fixed mt-3 bg-accent border border-accent-foreground/10 rounded-lg shadow-lg z-50 max-w-xs w-64"
          style={{
            top: suggestionPosition.top + 'px',
            left: suggestionPosition.left + 'px'
          }}
        >
          {suggestionType === 'mention' ? (
            // Mention suggestions
            (mentionResults as MentionSuggestion[])?.map((user, index) => (
              <div
                key={user._id}
                className={`flex rounded-md items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-accent ${
                  index === selectedIndex ? 'bg-accent' : ''
                }`}
                onClick={() => insertMention(user)}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-xs">
                    {user.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                </div>
              </div>
            ))
          ) : (
            // Hashtag suggestions
            (hashtagResults as HashtagSuggestion[])?.map((hashtag, index) => (
              <div
                key={hashtag._id}
                className={`flex rounded-md items-center space-x-3 px-3 py-2 cursor-pointer hover:bg-accent ${
                  index === selectedIndex ? 'bg-accent' : ''
                }`}
                onClick={() => insertHashtag(hashtag)}
              >
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Hash className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">#{hashtag.displayTag}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {hashtag.useCount} {hashtag.useCount === 1 ? 'post' : 'posts'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}