import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@rackd/ui/components/dialog";
import { Input } from "@rackd/ui/components/input";
import { Button } from "@rackd/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@rackd/ui/components/avatar";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { Loader2, Search, UserPlus } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

interface AddManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tournamentId: Id<"tournaments">;
}

export function AddManagerDialog({
  open,
  onOpenChange,
  tournamentId,
}: AddManagerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const currentUser = useCurrentUser();

  // Search for users
  const searchResults = useQuery(
    api.users.search,
    searchQuery.length >= 1
      ? { query: searchQuery, limit: 10 }
      : "skip"
  );

  // Get existing managers to filter them out
  const existingManagers = useQuery(api.tournaments.getManagers, {
    tournamentId,
  });

  // Get tournament to check organizer
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });

  const addManager = useMutation(api.tournaments.addManager);

  // Filter out current user, organizer, and existing managers
  const currentUserId = currentUser?.convexUser?._id as unknown as Id<"users"> | undefined;
  const filteredResults =
    searchResults?.filter((user) => {
      if (currentUserId && user._id === currentUserId) return false;
      if (tournament && user._id === tournament.organizerId) return false;
      if (
        existingManagers?.some((manager) => manager.userId === user._id)
      ) {
        return false;
      }
      return true;
    }) || [];

  const handleAddManager = async () => {
    if (!selectedUserId) return;

    try {
      await addManager({
        tournamentId,
        userId: selectedUserId,
        role: "manager",
      });
      setSearchQuery("");
      setSelectedUserId(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add manager:", error);
      alert(
        error instanceof Error ? error.message : "Failed to add manager"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manager</DialogTitle>
          <DialogDescription>
            Search for a user to add as a tournament manager.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>

          {/* Search Results */}
          {searchQuery.length >= 1 && (
            <ScrollArea className="max-h-[300px]">
              {searchResults === undefined ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredResults.map((user) => (
                    <div
                      key={user._id}
                      className={`flex items-center gap-3 rounded-md p-3 cursor-pointer transition-colors ${
                        selectedUserId === user._id
                          ? "bg-accent"
                          : "hover:bg-accent/50"
                      }`}
                      onClick={() => setSelectedUserId(user._id as Id<"users">)}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {user.displayName || user.name || "Unknown"}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </div>
                      </div>
                      {selectedUserId === user._id && (
                        <UserPlus className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedUserId(null);
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddManager}
              disabled={!selectedUserId}
            >
              Add Manager
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

