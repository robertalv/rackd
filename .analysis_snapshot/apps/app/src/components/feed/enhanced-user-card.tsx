"use client";

import { useState } from "react";
import * as React from "react";
import { Card, CardContent, CardFooter } from "@rackd/ui/components/card";
import { Button } from "@rackd/ui/components/button";
import { Badge } from "@rackd/ui/components/badge";
import { Input } from "@rackd/ui/components/input";
import { ProfileAvatar } from "../profile-avatar";
import { ExpandableSection } from "@/components/layout/expandable-section";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import { toast } from "sonner";
import { NavigationButton } from "../navigation-button";
import { useSettingsState } from "@/providers/SettingsProvider";
import { Add01Icon, Cancel01Icon, ChampionIcon, Clock01Icon, Icon, LabelImportantIcon, Location03Icon, MoreVerticalIcon, Tick01Icon } from "@rackd/ui/icons";

interface Tournament {
  _id: string;
  name: string;
  venue?: {
    name: string;
    city?: string;
    state?: string;
  };
  startDate: number;
  entryFee?: number;
  maxPlayers?: number;
  registeredPlayers: number;
}

interface EnhancedUserCardProps {
  user: {
    _id: Id<"users">;
    username: string;
    displayName: string;
    bio?: string;
    image?: string;
    country?: string;
    followerCount: number;
    followingCount: number;
    interests?: string[];
    playerId?: Id<"players">;
  };
  localTournaments?: Tournament[];
  isOwnProfile?: boolean;
}

export function EnhancedUserCard({ user, localTournaments = [], isOwnProfile = false }: EnhancedUserCardProps) {
  const [interests, setInterests] = useState(user.interests || []);
  const [isAddingInterest, setIsAddingInterest] = useState(false);
  const [newInterest, setNewInterest] = useState("");
  const updateUserInterests = useMutation(api.users.updateInterests);
  const { open: settingsDialogOpen, setOpen: setSettingsDialogOpen } = useSettingsState();

  // Sync interests when user prop changes
  React.useEffect(() => {
    if (user.interests) {
      setInterests(user.interests);
    }
  }, [user.interests]);

  const handleAddInterest = async () => {
    const trimmedInterest = newInterest.trim();
    
    if (!trimmedInterest) return;
    
    if (interests.length >= 15) {
      toast.error("Maximum 15 interests allowed");
      return;
    }
    
    if (interests.some(interest => 
      interest.toLowerCase() === trimmedInterest.toLowerCase()
    )) {
      toast.error("Interest already exists");
      return;
    }
    
    const newInterests = [...interests, trimmedInterest];
    setInterests(newInterests);
    setNewInterest("");
    setIsAddingInterest(false);
    
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest added successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to add interest");
      setInterests(interests);
    }
  };

  const handleRemoveInterest = async (interestToRemove: string) => {
    const newInterests = interests.filter(interest => interest !== interestToRemove);
    setInterests(newInterests);
    
    try {
      await updateUserInterests({ interests: newInterests });
      toast.success("Interest removed successfully");
    } catch (error) {
      console.error("Failed to update interests:", error);
      toast.error("Failed to remove interest");
      setInterests(interests);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddInterest();
    } else if (e.key === "Escape") {
      setIsAddingInterest(false);
      setNewInterest("");
    }
  };

  return (
    <div className="w-full mx-auto space-y-4">
      {/* Main User Card */}
      <Card className="bg-accent/50 overflow-hidden p-0">
        <CardContent className="p-0">
          {/* Cover Area */}
          <div className="relative h-30 bg-accent/50">
            {/* Menu Button */}
            <Button size="icon" variant="ghost" className="absolute top-3 right-3 transition-colors">
              <Icon icon={MoreVerticalIcon} size={20} />
            </Button>
          </div>

          {/* Content with proper spacing */}
          <div className="px-6 pt-0 relative -top-12">
            {/* Profile Image - Overlapping the cover */}
            <div className="flex justify-center relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 overflow-hidden border shadow-2xl">
                <ProfileAvatar 
                  user={{
                    displayName: user.displayName,
                    image: user.image,
                    country: user.country,
                  }}
                  size="xl" 
                  className="w-full h-full" 
                />
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-30 mb-6 -top-24">
              <div className="text-center">
                <div className="text-xl font-semibold mb-1">{user.followerCount}</div>
                <div className="text-gray-400 text-xs">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-semibold mb-1">{user.followingCount}</div>
                <div className="text-gray-400 text-xs">Following</div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center">
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-gray-400 text-sm">@{user.username}</p>
              {user.bio && (
                <p className="text-accent-foreground leading-relaxed px-2 mt-6">
                  {user.bio}
                </p>
              )}
            </div>

          </div>
        </CardContent>

        <CardFooter className="flex justify-center items-center p-3 border-t bg-accent/50 gap-2">
          {/* Profile Button */}
          {user.username && (
            <Button 
              variant="outline"
              className="rounded-full"
              onClick={() => window.location.href = `/${user.username}`}
            >
              My Profile
            </Button>
          )}

          {user.playerId && (
            <Button 
              variant="outline"
              className="rounded-full"
              onClick={() => window.location.href = `/players/${user.playerId}`}
            >
              My Player Profile
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Interests Section */}
      <ExpandableSection
        title="Interests"
        expanded={true}
        icon={
          <NavigationButton
            icon={LabelImportantIcon}
            ariaLabel="Interests"
          />
        }
      >
        <div className="space-y-3">
          {isOwnProfile && !isAddingInterest && interests.length < 15 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setSettingsDialogOpen(true)}
              className="w-full"
            >
              <Icon icon={Add01Icon} size={20} />
              Add Interest
            </Button>
          )}
          
          {interests.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {interests.slice(0, 7).map((interest, index) => (
                  <Badge 
                    key={index}
                    variant="secondary" 
                    className={`px-3 py-1 flex items-center gap-1 ${isOwnProfile ? 'group hover:bg-destructive/20 transition-colors' : ''}`}
                  >
                    {interest}
                    {isOwnProfile && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-3 w-3 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRemoveInterest(interest)}
                      >
                        <Icon icon={Cancel01Icon} size={8} />
                      </Button>
                    )}
                  </Badge>
                ))}
                {interests.length > 7 && (
                  <Badge variant="outline" className="px-3 py-1">
                    +{interests.length - 7} more
                  </Badge>
                )}
              </div>
              
              {isOwnProfile && isAddingInterest && (
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Add interest..."
                    className="h-8 text-sm"
                    maxLength={30}
                    autoFocus
                  />
                  <Button 
                    size="sm" 
                    onClick={handleAddInterest}
                    disabled={!newInterest.trim()}
                    className="h-8 px-2"
                  >
                    <Icon icon={Tick01Icon} size={12} />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsAddingInterest(false);
                      setNewInterest("");
                    }}
                    className="h-8 px-2"
                  >
                    <Icon icon={Cancel01Icon} size={12} />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">No interests added yet</p>
              {isOwnProfile && (
                isAddingInterest ? (
                  <div className="flex gap-2 justify-center">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Add your first interest..."
                      className="h-8 text-sm max-w-48"
                      maxLength={30}
                      autoFocus
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddInterest}
                      disabled={!newInterest.trim()}
                      className="h-8 px-2"
                    >
                      <Icon icon={Tick01Icon} size={12} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setIsAddingInterest(false);
                        setNewInterest("");
                      }}
                      className="h-8 px-2"
                    >
                      <Icon icon={Cancel01Icon} size={12} />
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSettingsDialogOpen(true)}
                  >
                    Add Interests
                  </Button>
                )
              )}
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Local Tournaments Section - Only show for own profile */}
      {isOwnProfile && (
        <ExpandableSection
          title="Local Tournaments"
          expanded={true}
          icon={
            <NavigationButton
              icon={ChampionIcon}
              ariaLabel="Local Tournaments"
            />
          }
        >
          {localTournaments.length > 0 ? (
            <>
              <div className="space-y-3">
                {localTournaments.slice(0, 2).map((tournament) => (
                  <div key={tournament._id} className="p-3 rounded-lg hover:bg-gray-800/50 transition-colors border border-gray-700/50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{tournament.name}</h4>
                        {tournament.venue && (
                          <>
                            <div className="flex items-center gap-1 mt-1">
                              <Icon icon={Location03Icon} className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-400">{tournament.venue.name}</span>
                            </div>
                            {(tournament.venue.city || tournament.venue.state) && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-400">
                                  {[tournament.venue.city, tournament.venue.state].filter(Boolean).join(", ")}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {tournament.entryFee && (
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-400">${tournament.entryFee}</div>
                          <div className="text-xs text-gray-400">Entry</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Icon icon={Clock01Icon} className="h-3 w-3" />
                        <span>{formatDistanceToNow(new Date(tournament.startDate), { addSuffix: true })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {tournament.maxPlayers && (
                          <span className="text-xs text-gray-400">
                            {tournament.registeredPlayers}/{tournament.maxPlayers}
                          </span>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs"
                          onClick={() => window.location.href = `/tournaments/${tournament._id}`}
                        >
                          Join
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs"
                  onClick={() => window.location.href = "/tournaments"}
                >
                  View all tournaments in your area
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <Icon icon={ChampionIcon} className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">No local tournaments found</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = "/tournaments"}
              >
                Browse Tournaments
              </Button>
            </div>
          )}
        </ExpandableSection>
      )}
    </div>
  );
}