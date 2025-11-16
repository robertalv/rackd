"use client";

import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useForm } from "react-hook-form";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Label } from "@rackd/ui/components/label";
import { Checkbox } from "@rackd/ui/components/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { Textarea } from "@rackd/ui/components/textarea";
import { Calendar } from "@rackd/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@rackd/ui/components/popover";
import { CalendarIcon, Clock, Save } from "lucide-react";
import { cn } from "@rackd/ui/lib/utils";
import { VenueSearch } from "../venues/venue-search";
import { TournamentFlyerUpload } from "../file-upload/tournament-flyer-upload";

type FormData = {
  name: string;
  date: Date;
  time: string;
  type: "single" | "double" | "scotch_double" | "teams" | "round_robin";
  playerType: "singles" | "doubles" | "scotch_doubles" | "teams";
  gameType: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
  bracketOrdering?: "random_draw" | "seeded_draw";
  winnersRaceTo?: number;
  losersRaceTo?: number;
  venueId?: Id<"venues">;
  venue?: string;
  description?: string;
  maxPlayers?: number;
  entryFee?: number;
  flyerUrl?: string;
  requiresApproval?: boolean;
  allowSelfRegistration?: boolean;
  isPublic?: boolean;
};

type Props = {
  tournamentId: Id<"tournaments">;
};

export function TournamentSettings({ tournamentId }: Props) {
  const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
  const update = useMutation(api.tournaments.update);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, setValue, reset } = useForm<FormData>({
    defaultValues: {
      playerType: "singles",
      type: "single",
      gameType: "eight_ball",
      bracketOrdering: "random_draw",
    }
  });

  const flyerUrl = watch("flyerUrl");

  // Initialize form with tournament data
  useEffect(() => {
    if (tournament) {
      reset({
        name: tournament.name,
        date: new Date(tournament.date),
        time: new Date(tournament.date).toTimeString().slice(0, 5),
        type: tournament.type,
        playerType: tournament.playerType,
        gameType: tournament.gameType,
        bracketOrdering: tournament.bracketOrdering,
        winnersRaceTo: tournament.winnersRaceTo ?? undefined,
        losersRaceTo: tournament.losersRaceTo ?? undefined,
        venueId: tournament.venueId,
        venue: tournament.venue ?? undefined,
        description: tournament.description ?? undefined,
        maxPlayers: tournament.maxPlayers ?? undefined,
        entryFee: tournament.entryFee ?? undefined,
        flyerUrl: tournament.flyerUrl ?? undefined,
        requiresApproval: tournament.requiresApproval,
        allowSelfRegistration: tournament.allowSelfRegistration,
        isPublic: tournament.isPublic,
      });
      setSelectedDate(new Date(tournament.date));
      setSelectedTime(new Date(tournament.date).toTimeString().slice(0, 5));
    }
  }, [tournament, reset]);

  const handleExtractInfo = useCallback((info: {
    name?: string;
    dateTimestamp?: number;
    time?: string;
    venue?: string;
    entryFee?: number;
    description?: string;
    gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
    playerType?: "singles" | "doubles" | "scotch_doubles" | "teams";
    maxPlayers?: number;
  }) => {
    if (info.name) setValue("name", info.name, { shouldDirty: true });
    if (info.dateTimestamp) {
      const date = new Date(info.dateTimestamp);
      setSelectedDate(date);
    }
    if (info.time) {
      setSelectedTime(info.time);
      setValue("time", info.time, { shouldDirty: true });
    }
    if (info.venue) setValue("venue", info.venue, { shouldDirty: true });
    if (info.entryFee !== undefined) setValue("entryFee", info.entryFee, { shouldDirty: true });
    if (info.description) setValue("description", info.description, { shouldDirty: true });
    if (info.gameType) setValue("gameType", info.gameType, { shouldDirty: true });
    if (info.playerType) setValue("playerType", info.playerType, { shouldDirty: true });
    if (info.maxPlayers) setValue("maxPlayers", info.maxPlayers, { shouldDirty: true });
  }, [setValue]);

  const handleFlyerUpload = useCallback((url: string) => {
    setValue("flyerUrl", url);
  }, [setValue]);

  const handleFlyerRemove = useCallback(() => {
    setValue("flyerUrl", undefined);
  }, [setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      // Combine selected date and time
      let combinedDateTime: number;
      if (selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours || 0, minutes || 0, 0, 0);
        combinedDateTime = dateTime.getTime();
      } else {
        combinedDateTime = tournament?.date || Date.now();
      }

      const { time, date, ...rest } = data;

      await update({
        tournamentId,
        ...rest,
        date: combinedDateTime,
        bracketOrdering: data.bracketOrdering || "random_draw",
      });

      alert("Tournament updated successfully!");
    } catch (error) {
      console.error("Failed to update tournament:", error);
      alert("Failed to update tournament. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (!tournament) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="h-full overflow-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              Tournament Settings
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Basic Information</h3>

              <div className="space-y-2">
                <Label htmlFor="name">Tournament Name *</Label>
                <Input
                  id="name"
                  {...register("name", { required: true })}
                  placeholder="e.g. Summer 9-Ball Open"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time *</Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "justify-start text-left font-normal flex-1 select-none focus-visible:ring-offset-2",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formatDate(selectedDate)}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input
                        type="time"
                        {...register("time", { required: true })}
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="pl-10 w-32 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue">Venue</Label>
                  <VenueSearch
                    value={watch("venueId")}
                    onChange={(venueId) => setValue("venueId", venueId as Id<"venues">)}
                    placeholder="Search venues..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="flyer">Tournament Flyer</Label>
                <TournamentFlyerUpload
                  onUpload={handleFlyerUpload}
                  onRemove={handleFlyerRemove}
                  onError={(error) => console.error("File upload error:", error)}
                  onExtractInfo={handleExtractInfo}
                  currentUrl={flyerUrl}
                />
              </div>
            </div>

            {/* Game Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Game Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gameType">Game Type *</Label>
                  <Select onValueChange={(value) => setValue("gameType", value as any)} value={watch("gameType")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Game Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eight_ball">8 Ball</SelectItem>
                      <SelectItem value="nine_ball">9 Ball</SelectItem>
                      <SelectItem value="ten_ball">10 Ball</SelectItem>
                      <SelectItem value="one_pocket">One Pocket</SelectItem>
                      <SelectItem value="bank_pool">Bank Pool</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="playerType">Player Type *</Label>
                  <Select onValueChange={(value) => setValue("playerType", value as any)} value={watch("playerType")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Player Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="singles">Singles (1v1)</SelectItem>
                      <SelectItem value="doubles">Doubles (2v2)</SelectItem>
                      <SelectItem value="scotch_doubles">Scotch Doubles (2v2 alternating)</SelectItem>
                      <SelectItem value="teams">Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tournament Type *</Label>
                  <Select onValueChange={(value) => setValue("type", value as any)} value={watch("type")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Single Elimination</SelectItem>
                      <SelectItem value="double">Double Elimination</SelectItem>
                      <SelectItem value="scotch_double">Scotch Double</SelectItem>
                      <SelectItem value="teams">Teams</SelectItem>
                      <SelectItem value="round_robin">Round Robin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bracketOrdering">Bracket Ordering *</Label>
                  <Select onValueChange={(value) => setValue("bracketOrdering", value as any)} value={watch("bracketOrdering")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bracket Ordering" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random_draw">Random Draw</SelectItem>
                      <SelectItem value="seeded_draw">Seeded Draw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="winnersRaceTo">Winners Race To</Label>
                  <Input
                    id="winnersRaceTo"
                    {...register("winnersRaceTo", { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 7"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="losersRaceTo">Losers Race To</Label>
                  <Input
                    id="losersRaceTo"
                    {...register("losersRaceTo", { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 5"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Tournament Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium border-b pb-2">Tournament Settings</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxPlayers">Max Players</Label>
                  <Input
                    id="maxPlayers"
                    {...register("maxPlayers", { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 32"
                    min="2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="entryFee">Entry Fee ($)</Label>
                  <Input
                    id="entryFee"
                    {...register("entryFee", { valueAsNumber: true })}
                    type="number"
                    placeholder="e.g. 25"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  placeholder="Tournament details, rules, prizes, etc."
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiresApproval"
                    {...register("requiresApproval")}
                    checked={watch("requiresApproval")}
                    onCheckedChange={(checked) => setValue("requiresApproval", checked === true)}
                  />
                  <Label
                    htmlFor="requiresApproval"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Requires approval for registration
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="allowSelfRegistration"
                    {...register("allowSelfRegistration")}
                    checked={watch("allowSelfRegistration")}
                    onCheckedChange={(checked) => setValue("allowSelfRegistration", checked === true)}
                  />
                  <Label
                    htmlFor="allowSelfRegistration"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Allow self-registration
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    {...register("isPublic")}
                    checked={watch("isPublic")}
                    onCheckedChange={(checked) => setValue("isPublic", checked === true)}
                  />
                  <Label
                    htmlFor="isPublic"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Make tournament public
                  </Label>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}




