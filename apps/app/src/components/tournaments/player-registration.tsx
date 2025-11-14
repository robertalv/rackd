import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@rackd/ui/components/table";
import { Avatar, AvatarFallback } from "@rackd/ui/components/avatar";
import { Badge } from "@rackd/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { useState } from "react";
import { Search, UserPlus, CheckCircle, Clock, Plus, Trash2, Loader2, DollarSign } from "lucide-react";
import type { PlayerSearchResult } from "@rackd/types";
import { searchFargoRatePlayers, formatFargoRating, formatRobustness } from "@/lib/fargorate-api";

type Props = {
  tournamentId: Id<"tournaments">;
};

export function PlayerRegistration({ tournamentId }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"registered" | "search" | "fargo">("registered");
  const [fargoResults, setFargoResults] = useState<PlayerSearchResult[]>([]);
  const [isSearchingFargo, setIsSearchingFargo] = useState(false);
  const [fargoSearchTerm, setFargoSearchTerm] = useState("");
  
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const tournamentRegistrations = useQuery(api.tournaments.getRegistrations, { tournamentId });
  const allPlayers = useQuery(api.players.search, { searchTerm });
  
  // Check which FargoRate players already exist
  const fargoIdsExist = useQuery(
    api.players.checkFargoIdsExist,
    fargoResults.length > 0
      ? { fargoIds: fargoResults.map((p) => p.id) }
      : "skip"
  );
  
  const addPlayer = useMutation(api.tournaments.addPlayer);
  const removePlayer = useMutation(api.tournaments.removePlayer);
  const checkInPlayer = useMutation(api.tournaments.checkInPlayer);
  const updatePaymentStatus = useMutation(api.tournaments.updatePaymentStatus);
  const getOrCreateFromFargoRate = useMutation(api.players.getOrCreateFromFargoRate);
  const addLatePlayerToBracket = useMutation(api.matches.addLatePlayerToBracket);
  
  // Check if bracket exists and which players are already in it
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const bracketExists = matches && matches.length > 0;
  const playersInBracket = new Set(
    matches?.flatMap(m => [m.player1Id, m.player2Id].filter(Boolean)) || []
  );
  
  const isPlayerInBracket = (playerId: Id<"players"> | undefined) => {
    return playerId ? playersInBracket.has(playerId) : false;
  };

  const handleAddPlayer = async (playerId: Id<"players">) => {
    try {
      await addPlayer({ tournamentId, playerId });
    } catch (error) {
      console.error("Failed to add player:", error);
      alert("Failed to add player. They may already be registered.");
    }
  };

  const handleRemovePlayer = async (playerId: Id<"players">) => {
    try {
      await removePlayer({ tournamentId, playerId });
    } catch (error) {
      console.error("Failed to remove player:", error);
      alert("Failed to remove player.");
    }
  };

  const handleCheckIn = async (playerId: Id<"players">) => {
    try {
      await checkInPlayer({ tournamentId, playerId });
      
      // If bracket exists, automatically add the player to the bracket
      if (bracketExists) {
        try {
          await addLatePlayerToBracket({ tournamentId, playerId });
        } catch (bracketError: any) {
          // Don't fail check-in if bracket addition fails - player is still checked in
          console.warn("Failed to add player to bracket:", bracketError);
          // Show a warning but don't block check-in
          if (bracketError?.message?.includes("already in the bracket")) {
            // Player is already in bracket, that's fine
          } else {
            alert(`Player checked in, but could not be added to bracket: ${bracketError?.message || "Unknown error"}`);
          }
        }
      }
    } catch (error) {
      console.error("Failed to check in player:", error);
      alert("Failed to check in player.");
    }
  };

  const handleAddToBracket = async (playerId: Id<"players">) => {
    try {
      await addLatePlayerToBracket({ tournamentId, playerId });
      alert("Player added to bracket successfully!");
    } catch (error: any) {
      console.error("Failed to add player to bracket:", error);
      alert(`Failed to add player to bracket: ${error?.message || "Unknown error"}`);
    }
  };

  const handleTogglePayment = async (playerId: Id<"players">, currentStatus: "pending" | "paid" | "refunded" | null | undefined) => {
    try {
      const newStatus = currentStatus === "paid" ? "pending" : "paid";
      await updatePaymentStatus({ tournamentId, playerId, paymentStatus: newStatus });
    } catch (error) {
      console.error("Failed to update payment status:", error);
      alert("Failed to update payment status.");
    }
  };

  const handleFargoSearch = async () => {
    if (!fargoSearchTerm.trim()) {
      setFargoResults([]);
      return;
    }
    
    setIsSearchingFargo(true);
    try {
      const response = await searchFargoRatePlayers(fargoSearchTerm);
      setFargoResults(response.value || []);
    } catch (error) {
      console.error("Error searching FargoRate players:", error);
      setFargoResults([]);
    } finally {
      setIsSearchingFargo(false);
    }
  };

  const handleAddFargoPlayer = async (fargoPlayer: PlayerSearchResult) => {
    try {
      let playerId: Id<"players">;
      
      // Check if player already exists
      const existingPlayer = fargoIdsExist?.[fargoPlayer.id];
      
      if (existingPlayer?.exists && existingPlayer.playerId) {
        // Player already exists, just use their ID
        playerId = existingPlayer.playerId;
      } else {
        // Player doesn't exist, create them
        const rating = parseInt(fargoPlayer.effectiveRating);
        playerId = await getOrCreateFromFargoRate({
          fargoId: fargoPlayer.id,
          firstName: fargoPlayer.firstName,
          lastName: fargoPlayer.lastName,
          city: fargoPlayer.location,
          fargoRating: rating,
        });
      }
      
      // Then add them to the tournament
      await addPlayer({ tournamentId, playerId });
      
      // Remove from search results
      setFargoResults(prev => prev.filter(p => p.id !== fargoPlayer.id));
    } catch (error: any) {
      console.error("Error adding FargoRate player:", error);
      if (error?.message?.includes("already registered")) {
        alert("This player is already registered for this tournament.");
      } else {
        alert(`Failed to add player: ${error?.message || "Unknown error"}`);
      }
    }
  };

  // Filter out already registered players from the search results
  const availablePlayers = allPlayers?.filter(player => 
    !tournamentRegistrations?.some(reg => reg.player?._id === player._id)
  ) || [];

  if (!tournament) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 h-full">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <Button
          variant={selectedTab === "registered" ? "default" : "outline"}
          onClick={() => setSelectedTab("registered")}
        >
          Registered Players ({tournamentRegistrations?.length || 0})
        </Button>
        <Button
          variant={selectedTab === "search" ? "default" : "outline"}
          onClick={() => setSelectedTab("search")}
        >
          Local Players
        </Button>
        <Button
          variant={selectedTab === "fargo" ? "default" : "outline"}
          onClick={() => setSelectedTab("fargo")}
        >
          FargoRate Search
        </Button>
      </div>

      {selectedTab === "registered" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Registered Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tournamentRegistrations && tournamentRegistrations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>League</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tournamentRegistrations.map((registration) => (
                    <TableRow key={registration._id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {registration.player?.name?.split(' ').map(n => n.charAt(0)).join('').slice(0, 2) ||
                               registration.user?.name?.split(' ').map(n => n.charAt(0)).join('').slice(0, 2) ||
                               'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {registration.player?.name || registration.user?.name || 'Unknown'}
                            </div>
                            {registration.player?.fargoId && (
                              <div className="text-sm text-muted-foreground">
                                Fargo ID: {registration.player.fargoId}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {registration.player?.fargoRating ? registration.player.fargoRating.toLocaleString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {registration.player?.league ? (
                          <Badge variant="outline">{registration.player.league}</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {registration.checkedIn ? (
                          <Badge variant="default" className="flex items-center gap-1 w-fit">
                            <CheckCircle className="h-3 w-3" />
                            Checked In
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="flex items-center gap-1 w-fit">
                            <Clock className="h-3 w-3" />
                            {registration.status}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={registration.paymentStatus === "paid" ? "default" : "outline"}
                          onClick={() => registration.player?._id && handleTogglePayment(registration.player._id, registration.paymentStatus)}
                          className="flex items-center gap-1"
                        >
                          <DollarSign className="h-3 w-3" />
                          {registration.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!registration.checkedIn && (
                            <Button
                              size="sm"
                              onClick={() => registration.player?._id && handleCheckIn(registration.player._id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Check In
                            </Button>
                          )}
                          {registration.checkedIn && bracketExists && !isPlayerInBracket(registration.player?._id) && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => registration.player?._id && handleAddToBracket(registration.player._id)}
                              title="Add player to bracket"
                            >
                              <UserPlus className="h-4 w-4 mr-1" />
                              Add to Bracket
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => registration.player?._id && handleRemovePlayer(registration.player._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4" />
                <p>No players registered yet.</p>
                <p>Use the "Add Players" tab to register players for this tournament.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === "search" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Add Local Players to Tournament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search players..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {availablePlayers.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>League</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availablePlayers.map((player) => (
                      <TableRow key={player._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {player.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              {player.fargoId && (
                                <div className="text-sm text-muted-foreground">
                                  Fargo ID: {player.fargoId}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {player.fargoRating ? player.fargoRating.toLocaleString() : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          {player.league ? (
                            <Badge variant="outline">{player.league}</Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAddPlayer(player._id)}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : searchTerm ? (
                <div className="text-center py-8 text-muted-foreground">
                  No available players found for "{searchTerm}".
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Search for local players to add to the tournament.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTab === "fargo" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search FargoRate Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search FargoRate players by name..."
                    value={fargoSearchTerm}
                    onChange={(e) => setFargoSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleFargoSearch()}
                  />
                </div>
                <Button onClick={handleFargoSearch} disabled={isSearchingFargo}>
                  {isSearchingFargo ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {fargoResults.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Player</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Robustness</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fargoResults.map((player) => (
                      <TableRow key={player.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {player.firstName.charAt(0)}{player.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {player.firstName} {player.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {player.readableId}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {player.location || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {formatFargoRating(player.effectiveRating)}
                          </div>
                          {player.provisionalRating !== "0" && (
                            <div className="text-xs text-muted-foreground">
                              Provisional: {formatFargoRating(player.provisionalRating)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatRobustness(player.robustness)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {player.provisionalRating !== "0" ? (
                            <Badge variant="secondary">Provisional</Badge>
                          ) : (
                            <Badge variant="default">Established</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const existingPlayer = fargoIdsExist?.[player.id];
                            
                            // Check if this FargoRate player is already registered
                            // First check by player ID if we have it
                            let isAlreadyRegistered = false;
                            if (existingPlayer?.exists && existingPlayer.playerId) {
                              isAlreadyRegistered = tournamentRegistrations?.some(
                                reg => reg.player?._id === existingPlayer.playerId
                              ) || false;
                            }
                            
                            // Also check by FargoRate ID in case the query hasn't loaded yet
                            if (!isAlreadyRegistered && tournamentRegistrations) {
                              isAlreadyRegistered = tournamentRegistrations.some(
                                reg => reg.player?.fargoId === player.id
                              );
                            }
                            
                            if (isAlreadyRegistered) {
                              return (
                                <Badge variant="secondary">Already Registered</Badge>
                              );
                            }
                            
                            if (existingPlayer?.exists && existingPlayer.playerId) {
                              return (
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    if (existingPlayer.playerId) {
                                      handleAddPlayer(existingPlayer.playerId);
                                    }
                                  }}
                                >
                                  <UserPlus className="h-4 w-4 mr-1" />
                                  Register
                                </Button>
                              );
                            }
                            
                            return (
                              <Button
                                size="sm"
                                onClick={() => handleAddFargoPlayer(player)}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add & Register
                              </Button>
                            );
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : fargoSearchTerm && !isSearchingFargo ? (
                <div className="text-center py-8 text-muted-foreground">
                  No FargoRate players found for "{fargoSearchTerm}".
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Search the FargoRate database to find and add players to the tournament.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

