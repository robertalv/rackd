import { useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { ScrollArea } from "@rackd/ui/components/scroll-area";
import { 
  Icon,
  UserGroupIcon,
  ChampionIcon,
  Dollar01Icon,
  Clock01Icon
} from "@rackd/ui/icons";

interface TournamentDashboardProps {
  tournamentId: Id<"tournaments">;
}

export function TournamentDashboard({ tournamentId }: TournamentDashboardProps) {
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const matches = useQuery(api.matches.getByTournament, { tournamentId });
  const playerCount = useQuery(api.tournaments.getPlayerCount, { tournamentId });
  const payoutData = useQuery(api.tournaments.getPayoutCalculation, { tournamentId });
  const savedPayoutStructure = useQuery(api.tournaments.getPayoutStructure, { tournamentId });

  if (!tournament) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  // Calculate match statistics
  const allMatches = matches || [];
  const completedMatches = allMatches.filter(m => m.status === "completed").length;
  const inProgressMatches = allMatches.filter(m => m.status === "in_progress").length;
  const upcomingMatches = allMatches.filter(m => m.status === "pending").length;
  const totalMatches = allMatches.length;
  const completionPercentage = totalMatches > 0 
    ? Math.round((completedMatches / totalMatches) * 100) 
    : 0;

  // Get venue information
  const venue = useQuery(
    api.venues.getById, 
    tournament.venueId ? { id: tournament.venueId } : "skip"
  );

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        {/* Tournament Progress */}
        <Card className="bg-accent/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tournament Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold">
                  {completionPercentage}% complete ({completedMatches} of {totalMatches} matches)
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {inProgressMatches > 0 && `${inProgressMatches} match${inProgressMatches !== 1 ? "es" : ""} in progress`}
                </div>
              </div>
              {tournament.status === "active" && (
                <div className="flex items-center gap-2">
                  <Icon icon={Clock01Icon} className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Tournament is LIVE</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tournament Details */}
        <Card className="bg-accent/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tournament Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Name</div>
                  <div className="text-sm">{tournament.name}</div>
                  {tournamentId && (
                    <div className="text-xs text-muted-foreground mt-1">ID: {tournamentId}</div>
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Description</div>
                  <div className="text-sm">{tournament.description || "-"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                  <div className="text-sm">{formatDate(tournament.date)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">End Date</div>
                  <div className="text-sm">
                    {tournament.status === "completed" ? "Tournament completed" : "Invalid Date"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Venue</div>
                  <div className="text-sm">
                    {venue ? (
                      <span className="text-blue-500 hover:underline cursor-pointer">
                        {venue.name}
                      </span>
                    ) : tournament.venue ? (
                      tournament.venue
                    ) : (
                      "N/A"
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Player Type</div>
                  <div className="text-sm">
                    {tournament.playerType?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Singles"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Tournament Type</div>
                  <div className="text-sm">
                    {tournament.type?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Single"} Elimination
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Game Type</div>
                  <div className="text-sm flex items-center gap-2">
                    {tournament.gameType?.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()) || "Nine Ball"}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Winners Race To</div>
                  <div className="text-sm">{tournament.winnersRaceTo || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Losers Race To</div>
                  <div className="text-sm">{tournament.losersRaceTo || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Finals Race To</div>
                  <div className="text-sm">N/A</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Bracket Size</div>
                  <div className="text-sm">{playerCount?.total || 0}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Players</div>
                  <div className="text-sm">{playerCount?.total || 0} Players</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Rating System</div>
                  <div className="text-sm">N/A</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Matches Card */}
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon={ChampionIcon} className="h-5 w-5" />
                MATCHES ({totalMatches})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Completed: </span>
                  <span className="font-medium">{completedMatches}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">In progress: </span>
                  <span className="font-medium">{inProgressMatches}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Upcoming: </span>
                  <span className="font-medium">{upcomingMatches}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Players Card */}
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon={UserGroupIcon} className="h-5 w-5" />
                PLAYERS ({playerCount?.total || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Confirmed: </span>
                  <span className="font-medium">{playerCount?.checkedIn || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Unconfirmed: </span>
                  <span className="font-medium">{((playerCount?.total || 0) - (playerCount?.checkedIn || 0))}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Waiting list: </span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payouts Card */}
          <Card className="bg-accent/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Icon icon={Dollar01Icon} className="h-5 w-5" />
                PAYOUTS
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Collected: </span>
                  <span className="font-medium">${payoutData?.totalCollected.toFixed(2) || "0.00"}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Entry fee: </span>
                  <span className="font-medium">${tournament.entryFee || 0}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">House fee: </span>
                  <span className="font-medium">
                    {savedPayoutStructure?.houseFeePerPlayer 
                      ? `$${savedPayoutStructure.houseFeePerPlayer.toFixed(2)}/player`
                      : "$0.00"}
                  </span>
                </div>
                {savedPayoutStructure?.payoutStructure && (
                  <div className="text-sm pt-2 border-t">
                    <span className="text-muted-foreground">Pot amount: </span>
                    <span className="font-medium text-green-600">
                      ${savedPayoutStructure.payoutStructure.potAmount.toFixed(2)}
                    </span>
                  </div>
                )}
                {savedPayoutStructure?.payoutStructure && savedPayoutStructure.payoutStructure.payouts.length > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Payout places: </span>
                    <span className="font-medium">{savedPayoutStructure.payoutStructure.payouts.length}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ScrollArea>
  );
}

