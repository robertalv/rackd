"use client";

import { useState, KeyboardEvent, useEffect } from "react";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Badge } from "@rackd/ui/components/badge";
import { Label } from "@rackd/ui/components/label";
import { X, Plus } from "lucide-react";
import { useAction } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { toast } from "sonner";

interface InterestTagsManagerProps {
  interests: string[];
  onInterestsChange?: (interests: string[]) => void;
  maxTags?: number;
  placeholder?: string;
}

export function InterestTagsManager({ 
  interests = [], 
  onInterestsChange,
  maxTags = 15,
  placeholder = "Add an interest..."
}: InterestTagsManagerProps) {
  const [inputValue, setInputValue] = useState("");
  const [localInterests, setLocalInterests] = useState(interests);
  const updateUserInterests = useAction(api.users.updateInterests);

  // Sync local interests when prop changes
  useEffect(() => {
    setLocalInterests(interests);
  }, [interests]);

  const handleAddInterest = async () => {
    const trimmedInput = inputValue.trim();
    
    if (!trimmedInput) return;
    
    if (localInterests.length >= maxTags) {
      toast.error(`Maximum ${maxTags} interests allowed`);
      return;
    }
    
    if (localInterests.some(interest => 
      interest.toLowerCase() === trimmedInput.toLowerCase()
    )) {
      toast.error("Interest already exists");
      return;
    }
    
    const newInterests = [...localInterests, trimmedInput];
    setLocalInterests(newInterests);
    setInputValue("");
    onInterestsChange?.(newInterests);
    
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest added successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to add interest");
      setLocalInterests(localInterests);
      onInterestsChange?.(localInterests);
    }
  };

  const handleRemoveInterest = async (interestToRemove: string) => {
    const newInterests = localInterests.filter(interest => interest !== interestToRemove);
    setLocalInterests(newInterests);
    onInterestsChange?.(newInterests);
    
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest removed successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to remove interest");
      setLocalInterests(localInterests);
      onInterestsChange?.(localInterests);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const handleInputChange = (value: string) => {
    if (value.length <= 30) {
      setInputValue(value);
    }
  };

  return (
    <div className="space-y-4">
        {/* Display existing interests */}
        {localInterests.length > 0 ? (
          <div className="flex flex-wrap gap-2 min-h-10 p-2 rounded-md border bg-muted/30">
            {localInterests.map((interest, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium cursor-default hover:bg-secondary/80 transition-colors"
              >
                <span>{interest}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-destructive/20 hover:text-destructive rounded-full"
                  onClick={() => handleRemoveInterest(interest)}
                  aria-label={`Remove ${interest}`}
                >
                  <X size={10} />
                </Button>
              </Badge>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-10 p-4 rounded-md border border-dashed bg-muted/20">
            <p className="text-sm text-muted-foreground">No interests added yet</p>
          </div>
        )}
        
        {/* Add new interest input */}
        {localInterests.length < maxTags && (
          <div className="space-y-2">
            <Label htmlFor="interest-input" className="text-sm font-medium">
              Add Interest
            </Label>
            <div className="flex gap-2">
              <Input
                id="interest-input"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="flex-1"
                maxLength={30}
              />
              <Button
                onClick={handleAddInterest}
                disabled={!inputValue.trim()}
                size="default"
                variant="default"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
        
        {/* Counter and max info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <span>
            {localInterests.length} of {maxTags} interests added
          </span>
          {localInterests.length >= maxTags && (
            <span className="text-amber-600 dark:text-amber-500">
              Maximum reached
            </span>
          )}
        </div>
    </div>
  );
}