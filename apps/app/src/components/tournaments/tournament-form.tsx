"use client";

import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { Label } from "@rackd/ui/components/label";
import { HeaderLabel } from "@rackd/ui/components/label";
import { Checkbox } from "@rackd/ui/components/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { Calendar } from "@rackd/ui/components/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@rackd/ui/components/popover";
import { useNavigate } from "@tanstack/react-router";
import { Icon, Calendar02Icon, Time04Icon, Add01Icon, Delete03Icon } from "@rackd/ui/icons";
import { Save } from "lucide-react";
import { cn } from "@rackd/ui/lib/utils";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupTextarea,
} from "@rackd/ui/components/input-group";
import { VenueSearch } from "../venues/venue-search";
import { SaveTemplateModal } from "./save-template-modal";
import { AddTablesModal } from "./add-tables-modal";
import { TournamentFlyerUpload } from "../file-upload/tournament-flyer-upload";
import { TournamentUrlImporter } from "./tournament-url-importer";
// Turnstile - Commented out, only using on login/signup
// import { useTurnstile } from "@rackd/cloudflare/client/turnstile";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@rackd/ui/components/table";

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
  createPost?: boolean;
  importVenueId?: Id<"venues">;
  tables: Array<{
    label?: string;
    startNumber: number;
    endNumber: number;
    manufacturer: string;
    size: string;
    isLiveStreaming?: boolean;
    liveStreamUrl?: string;
    status?: "OPEN" | "CLOSED" | "IN_USE";
  }>;
};

export function TournamentForm() {
  const navigate = useNavigate();
  const create = useMutation(api.tournaments.create);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [createPost, setCreatePost] = useState(false);

  // Turnstile bot protection - Commented out, only using on login/signup
  // const turnstileSiteKey = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY;
  // const { token: turnstileToken, containerRef: turnstileContainerRef, reset: resetTurnstile } = useTurnstile({
  //   siteKey: turnstileSiteKey || "",
  //   theme: "auto",
  //   size: "normal",
  //   onSuccess: () => {
  //     // Token is ready
  //   },
  //   onError: (error) => {
  //     console.error("Turnstile error:", error);
  //   },
  // });

  const { register, handleSubmit, control, formState: { isSubmitting }, watch, setValue } = useForm<FormData>({
    defaultValues: {
      tables: [],
      playerType: "singles",
      type: "single",
      gameType: "eight_ball",
      bracketOrdering: "random_draw"
    }
  });

  const watchedData = useWatch({ control });
  const importVenueId = watch("importVenueId");
  const flyerUrl = watch("flyerUrl");

  // Memoize callbacks to prevent infinite loops
  const handleExtractInfo = useCallback((info: {
    name?: string;
    dateTimestamp?: number; // Timestamp in milliseconds
    time?: string;
    venue?: string;
    entryFee?: number;
    description?: string;
    gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
    playerType?: "singles" | "doubles" | "scotch_doubles" | "teams";
    maxPlayers?: number;
  }) => {
    // Populate form fields with extracted information
    if (info.name) setValue("name", info.name, { shouldDirty: true });
    if (info.dateTimestamp) {
      const date = new Date(info.dateTimestamp);
      setSelectedDate(date);
    }
    if (info.time) {
      setSelectedTime(info.time);
      setValue("time", info.time, { shouldDirty: true });
    }
    if (info.venue) {
      // Try to find venue by name/address, or set as venue string
      setValue("venue", info.venue, { shouldDirty: true });
    }
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

  const handleFlyerError = useCallback((error: Error) => {
    console.error("File upload error:", error);
  }, []);

  const onSubmit = async (data: FormData) => {
    // Turnstile verification - Commented out, only using on login/signup
    // if (turnstileSiteKey && !turnstileToken) {
    //   alert("Please complete the verification");
    //   return;
    // }

    try {
      // Combine selected date and time
      let combinedDateTime: number;
      if (selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours || 0, minutes || 0, 0, 0);
        combinedDateTime = dateTime.getTime();
      } else {
        // Fallback to current date/time if not set
        combinedDateTime = Date.now();
      }

      const { time, date, bracketOrdering, importVenueId: importVenue, ...rest } = data;

      const tournamentId = await create({
        ...rest,
        date: combinedDateTime,
        bracketOrdering: bracketOrdering || "random_draw",
        createPost: createPost || undefined,
        // turnstileToken: turnstileToken || undefined, // Commented out
        tables: data.tables && data.tables.length > 0 ? data.tables.map((table) => ({
          label: table.label,
          startNumber: table.startNumber,
          endNumber: table.endNumber,
          manufacturer: table.manufacturer as any,
          size: table.size as any,
          isLiveStreaming: table.isLiveStreaming,
          liveStreamUrl: table.liveStreamUrl,
          status: table.status as any,
        })) : undefined,
      });

      // TODO: Handle venue tables import when mutation is available
      // if (importVenue) {
      //   await importVenueTables({
      //     tournamentId,
      //     venueId: importVenue as Id<"venues">,
      //   });
      // }

      navigate({ to: `/tournaments/${tournamentId}` });
      
      // Reset Turnstile after successful creation - Commented out
      // if (turnstileSiteKey) {
      //   resetTurnstile();
      // }
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };

  const handleSaveTemplate = () => {
    setShowTemplateModal(true);
  };

  const handleAddTables = (newTables: FormData["tables"], importVenue?: Id<"venues">) => {
    if (importVenue) {
      setValue("importVenueId", importVenue);
    } else {
      const currentTables = watch("tables") || [];
      setValue("tables", [...currentTables, ...newTables]);
    }
  };

  const handleRemoveTable = (index: number) => {
    const currentTables = watch("tables") || [];
    setValue("tables", currentTables.filter((_, i) => i !== index));
  };

  // Simple date formatter
  const formatDate = (date: Date | undefined) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon icon={Calendar02Icon} className="h-5 w-5" />
              Create New Tournament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <HeaderLabel size="lg">Basic Information</HeaderLabel>
                </div>

                {/* URL Importer */}
                {/* TODO: Finish later. */}
                {/* <TournamentUrlImporter onExtract={handleExtractInfo} /> */}

                <div className="space-y-2">
                  <Label htmlFor="name">Tournament Name *</Label>
                  <InputGroup>
                    <InputGroupInput
                      id="name"
                      {...register("name", { required: true })}
                      placeholder="e.g. Summer 9-Ball Open"
                    />
                  </InputGroup>
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
                            <Icon icon={Calendar02Icon} className="h-4 w-4 mr-2" />
                            {formatDate(selectedDate)}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>

                      <InputGroup className="w-32">
                        <InputGroupAddon align="inline-start">
                          <Icon icon={Time04Icon} className="h-4 w-4" />
                        </InputGroupAddon>
                        <InputGroupInput
                          type="time"
                          {...register("time", { required: true })}
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          className="[&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                        />
                      </InputGroup>
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
                    onError={handleFlyerError}
                    onExtractInfo={handleExtractInfo}
                    currentUrl={flyerUrl}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="createPost"
                    checked={createPost}
                    onCheckedChange={(checked) => setCreatePost(checked === true)}
                  />
                  <Label
                    htmlFor="createPost"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Create a post about this tournament
                  </Label>
                </div>
              </div>

              {/* Game Configuration */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <HeaderLabel size="lg">Game Configuration</HeaderLabel>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gameType">Game Type *</Label>
                    <Select onValueChange={(value) => setValue("gameType", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Game Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eight_ball">
                          <div className="flex items-center gap-2">
                            <img src="/images/8ball.png" alt="8 Ball" width={20} height={20} className="rounded-full" />
                            8 Ball
                          </div>
                        </SelectItem>
                        <SelectItem value="nine_ball">
                          <div className="flex items-center gap-2">
                            <img src="/images/9ball.png" alt="9 Ball" width={20} height={20} className="rounded-full" />
                            9 Ball
                          </div>
                        </SelectItem>
                        <SelectItem value="ten_ball">
                          <div className="flex items-center gap-2">
                            <img src="/images/10ball.png" alt="10 Ball" width={20} height={20} className="rounded-full" />
                            10 Ball
                          </div>
                        </SelectItem>
                        <SelectItem value="one_pocket">One Pocket</SelectItem>
                        <SelectItem value="bank_pool">Bank Pool</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="playerType">Player Type *</Label>
                    <Select onValueChange={(value) => setValue("playerType", value as any)}>
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
                  <div className="space-y-2">
                    <Label htmlFor="type">Tournament Type *</Label>
                    <Select onValueChange={(value) => setValue("type", value as any)}>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bracketOrdering">Bracket Ordering *</Label>
                  <Select onValueChange={(value) => setValue("bracketOrdering", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bracket Ordering" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random_draw">Random Draw</SelectItem>
                      <SelectItem value="seeded_draw">Seeded Draw</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {watch("bracketOrdering") === "random_draw" &&
                      "Player order will be randomized using the Fisher-Yates shuffle algorithm"}
                    {watch("bracketOrdering") === "seeded_draw" &&
                      "Highest seeded player plays lowest seeded player, etc."}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="winnersRaceTo">Winners Race To</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="winnersRaceTo"
                        {...register("winnersRaceTo", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 7"
                        min="1"
                      />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="losersRaceTo">Losers Race To</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="losersRaceTo"
                        {...register("losersRaceTo", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 5"
                        min="1"
                      />
                    </InputGroup>
                  </div>
                </div>
              </div>

              {/* Tournament Settings */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <HeaderLabel size="lg">Tournament Settings</HeaderLabel>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxPlayers">Max Players</Label>
                    <InputGroup>
                      <InputGroupInput
                        id="maxPlayers"
                        {...register("maxPlayers", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 32"
                        min="2"
                      />
                    </InputGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="entryFee">Entry Fee ($)</Label>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <span>$</span>
                      </InputGroupAddon>
                      <InputGroupInput
                        id="entryFee"
                        {...register("entryFee", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 25"
                        min="0"
                        step="0.01"
                      />
                    </InputGroup>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <InputGroup>
                    <InputGroupTextarea
                      id="description"
                      {...register("description")}
                      rows={3}
                      placeholder="Tournament details, rules, prizes, etc."
                    />
                  </InputGroup>
                </div>
              </div>

              {/* Tables Section */}
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <HeaderLabel size="lg">Tables</HeaderLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTablesModal(true)}
                  >
                    <Icon icon={Add01Icon} className="h-4 w-4 mr-1" />
                    Add Tables
                  </Button>
                </div>
              {(!watch("tables") || watch("tables")?.length === 0) && !importVenueId && (
                <div className="text-center py-8 border border-dashed border-border rounded-lg">
                  <p>No tables added yet.</p>
                  <p className="text-sm">Click "Add Tables" to get started.</p>
                </div>
              )}
              {importVenueId && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900">Venue Tables Will Be Imported</p>
                      <p className="text-sm text-green-700">Tables from the selected venue will be imported when the tournament is created.</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setValue("importVenueId", undefined)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Icon icon={Delete03Icon} className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              {watch("tables") && watch("tables")!.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Label</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Streaming</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {watch("tables")!.map((table, index) => (
                        <TableRow key={`${table.label || "range"}-${index}`}>
                          <TableCell>
                            {table.label
                              ? table.label
                              : `Tables ${table.startNumber} - ${table.endNumber}`}
                          </TableCell>
                          <TableCell>
                            {table.manufacturer ? `${table.manufacturer} • ${table.size}` : table.size}
                          </TableCell>
                          <TableCell>{table.isLiveStreaming ? "Yes" : "No"}</TableCell>
                          <TableCell>{table.status || "OPEN"}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTable(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Icon icon={Delete03Icon} className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

                <div className="flex gap-2 pt-4 border-t border-border">
                  {/* Turnstile widget - Commented out, only using on login/signup */}
                  {/* {turnstileSiteKey && (
                    <div ref={turnstileContainerRef} className="flex justify-center" />
                  )} */}
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="flex-1"
                  >
                    {isSubmitting ? "Creating..." : "Create Tournament"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveTemplate}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save as Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate({ to: "/tournaments" })}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      <SaveTemplateModal
        open={showTemplateModal}
        onOpenChange={setShowTemplateModal}
        tournamentData={{
          ...watchedData,
          selectedDate,
          selectedTime
        }}
      />
      <AddTablesModal
        open={showTablesModal}
        onOpenChange={setShowTablesModal}
        onAddTables={handleAddTables}
      />
    </>
  );
}

