import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { useMutation } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { useForm, useWatch } from "react-hook-form";
import { B as Button, c as cn } from "./router-CozkPsbM.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-CNeVhZxM.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { C as Checkbox } from "./checkbox-Bd8KRozL.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import { T as Textarea } from "./textarea-CRbQQyBj.js";
import { C as Calendar, V as VenueSearch, T as TournamentFlyerUpload, A as AddTablesModal } from "./tournament-flyer-upload-CtjPewB5.js";
import { P as Popover, b as PopoverTrigger, a as PopoverContent } from "./popover-BvaypCcm.js";
import { useNavigate } from "@tanstack/react-router";
import { CalendarIcon, Clock, Plus, Trash2, Save } from "lucide-react";
import { D as Dialog, a as DialogContent, d as DialogHeader, b as DialogTitle } from "./dialog-C0i-cdoB.js";
import { toast } from "sonner";
import { T as Table, a as TableHeader, b as TableRow, c as TableHead, d as TableBody, e as TableCell } from "./table-CvQ4KYcO.js";
import "better-auth/react";
import "@convex-dev/better-auth/client/plugins";
import "@convex-dev/better-auth";
import "@convex-dev/better-auth/plugins";
import "@better-auth/expo";
import "convex/server";
import "better-auth";
import "convex/values";
import "@tanstack/react-query";
import "@tanstack/react-router-with-query";
import "@convex-dev/react-query";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router-devtools";
import "@convex-dev/better-auth/react";
import "@convex-dev/better-auth/react-start";
import "zod";
import "clsx";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-checkbox";
import "@radix-ui/react-select";
import "react-day-picker";
import "./tabs-BPSwp-0A.js";
import "@radix-ui/react-tabs";
import "@radix-ui/react-radio-group";
import "./add-venue-modal-C10x_m-g.js";
import "./venue-image-upload-VPDsqg2T.js";
import "@radix-ui/react-progress";
import "react-dropzone";
import "@radix-ui/react-popover";
import "@radix-ui/react-dialog";
function SaveTemplateModal({ open, onOpenChange, tournamentData }) {
  const { register, handleSubmit, formState: { isSubmitting }, reset } = useForm();
  const onSubmit = async (data) => {
    try {
      toast.info("Template saving feature coming soon!");
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save template:", error);
      toast.error("Failed to save template");
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-md", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: "Save Tournament Template" }) }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Label, { className: "block text-sm font-medium mb-1", children: "Template Name *" }),
        /* @__PURE__ */ jsx(
          Input,
          {
            ...register("name", { required: true }),
            placeholder: "e.g. Weekly 9-Ball Tournament",
            autoFocus: true
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 p-3 rounded-md", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-600 mb-2", children: "This template will save:" }),
        /* @__PURE__ */ jsxs("ul", { className: "text-xs text-gray-500 space-y-1", children: [
          /* @__PURE__ */ jsx("li", { children: "• Game format and type" }),
          /* @__PURE__ */ jsx("li", { children: "• Player configuration" }),
          /* @__PURE__ */ jsx("li", { children: "• Bracket settings" }),
          /* @__PURE__ */ jsx("li", { children: "• Race to settings" }),
          /* @__PURE__ */ jsx("li", { children: "• Entry fee and max players" }),
          /* @__PURE__ */ jsx("li", { children: "• Venue selection" })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4", children: [
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: isSubmitting, className: "flex-1", children: isSubmitting ? "Saving..." : "Save Template" }),
        /* @__PURE__ */ jsx(
          Button,
          {
            type: "button",
            variant: "outline",
            onClick: () => onOpenChange(false),
            children: "Cancel"
          }
        )
      ] })
    ] })
  ] }) });
}
function TournamentForm() {
  const navigate = useNavigate();
  const create = useMutation(api.tournaments.create);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTablesModal, setShowTablesModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [createPost, setCreatePost] = useState(false);
  const { register, handleSubmit, control, formState: { isSubmitting }, watch, setValue } = useForm({
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
  const handleExtractInfo = useCallback((info) => {
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
      setValue("venue", info.venue, { shouldDirty: true });
    }
    if (info.entryFee !== void 0) setValue("entryFee", info.entryFee, { shouldDirty: true });
    if (info.description) setValue("description", info.description, { shouldDirty: true });
    if (info.gameType) setValue("gameType", info.gameType, { shouldDirty: true });
    if (info.playerType) setValue("playerType", info.playerType, { shouldDirty: true });
    if (info.maxPlayers) setValue("maxPlayers", info.maxPlayers, { shouldDirty: true });
  }, [setValue]);
  const handleFlyerUpload = useCallback((url) => {
    setValue("flyerUrl", url);
  }, [setValue]);
  const handleFlyerRemove = useCallback(() => {
    setValue("flyerUrl", void 0);
  }, [setValue]);
  const handleFlyerError = useCallback((error) => {
    console.error("File upload error:", error);
  }, []);
  const onSubmit = async (data) => {
    try {
      let combinedDateTime;
      if (selectedDate && selectedTime) {
        const [hours, minutes] = selectedTime.split(":").map(Number);
        const dateTime = new Date(selectedDate);
        dateTime.setHours(hours || 0, minutes || 0, 0, 0);
        combinedDateTime = dateTime.getTime();
      } else {
        combinedDateTime = Date.now();
      }
      const { time, date, bracketOrdering, importVenueId: importVenue, ...rest } = data;
      const tournamentId = await create({
        ...rest,
        date: combinedDateTime,
        bracketOrdering: bracketOrdering || "random_draw",
        createPost: createPost || void 0,
        // turnstileToken: turnstileToken || undefined, // Commented out
        tables: data.tables && data.tables.length > 0 ? data.tables.map((table) => ({
          label: table.label,
          startNumber: table.startNumber,
          endNumber: table.endNumber,
          manufacturer: table.manufacturer,
          size: table.size,
          isLiveStreaming: table.isLiveStreaming,
          liveStreamUrl: table.liveStreamUrl,
          status: table.status
        })) : void 0
      });
      navigate({ to: `/tournaments/${tournamentId}` });
    } catch (error) {
      console.error("Failed to create tournament:", error);
    }
  };
  const handleSaveTemplate = () => {
    setShowTemplateModal(true);
  };
  const handleAddTables = (newTables, importVenue) => {
    if (importVenue) {
      setValue("importVenueId", importVenue);
    } else {
      const currentTables = watch("tables") || [];
      setValue("tables", [...currentTables, ...newTables]);
    }
  };
  const handleRemoveTable = (index) => {
    const currentTables = watch("tables") || [];
    setValue("tables", currentTables.filter((_, i) => i !== index));
  };
  const formatDate = (date) => {
    if (!date) return "Select date";
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CalendarIcon, { className: "h-5 w-5" }),
        "Create New Tournament"
      ] }) }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium border-b pb-2", children: "Basic Information" }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Tournament Name *" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "name",
                ...register("name", { required: true }),
                placeholder: "e.g. Summer 9-Ball Open"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "date", children: "Date & Time *" }),
              /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
                /* @__PURE__ */ jsxs(Popover, { children: [
                  /* @__PURE__ */ jsx(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs(
                    Button,
                    {
                      variant: "outline",
                      className: cn(
                        "justify-start text-left font-normal flex-1 select-none focus-visible:ring-offset-2",
                        !selectedDate && "text-muted-foreground"
                      ),
                      children: [
                        /* @__PURE__ */ jsx(CalendarIcon, { className: "mr-2 h-4 w-4" }),
                        formatDate(selectedDate)
                      ]
                    }
                  ) }),
                  /* @__PURE__ */ jsx(PopoverContent, { className: "w-auto p-0", align: "start", children: /* @__PURE__ */ jsx(
                    Calendar,
                    {
                      mode: "single",
                      selected: selectedDate,
                      onSelect: setSelectedDate,
                      disabled: (date) => date < /* @__PURE__ */ new Date()
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsx(Clock, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" }),
                  /* @__PURE__ */ jsx(
                    Input,
                    {
                      type: "time",
                      ...register("time", { required: true }),
                      value: selectedTime,
                      onChange: (e) => setSelectedTime(e.target.value),
                      className: "pl-10 w-32 [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    }
                  )
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "venue", children: "Venue" }),
              /* @__PURE__ */ jsx(
                VenueSearch,
                {
                  value: watch("venueId"),
                  onChange: (venueId) => setValue("venueId", venueId),
                  placeholder: "Search venues..."
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "flyer", children: "Tournament Flyer" }),
            /* @__PURE__ */ jsx(
              TournamentFlyerUpload,
              {
                onUpload: handleFlyerUpload,
                onRemove: handleFlyerRemove,
                onError: handleFlyerError,
                onExtractInfo: handleExtractInfo,
                currentUrl: flyerUrl
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "createPost",
                checked: createPost,
                onCheckedChange: (checked) => setCreatePost(checked === true)
              }
            ),
            /* @__PURE__ */ jsx(
              Label,
              {
                htmlFor: "createPost",
                className: "text-sm font-normal cursor-pointer",
                children: "Create a post about this tournament"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium border-b pb-2", children: "Game Configuration" }),
          /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "gameType", children: "Game Type *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("gameType", value), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Game Type" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "eight_ball", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("img", { src: "/images/8ball.png", alt: "8 Ball", width: 20, height: 20, className: "rounded-full" }),
                  "8 Ball"
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "nine_ball", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("img", { src: "/images/9ball.png", alt: "9 Ball", width: 20, height: 20, className: "rounded-full" }),
                  "9 Ball"
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "ten_ball", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsx("img", { src: "/images/10ball.png", alt: "10 Ball", width: 20, height: 20, className: "rounded-full" }),
                  "10 Ball"
                ] }) }),
                /* @__PURE__ */ jsx(SelectItem, { value: "one_pocket", children: "One Pocket" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "bank_pool", children: "Bank Pool" })
              ] })
            ] })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "playerType", children: "Player Type *" }),
              /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("playerType", value), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Player Type" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "singles", children: "Singles (1v1)" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "doubles", children: "Doubles (2v2)" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "scotch_doubles", children: "Scotch Doubles (2v2 alternating)" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "teams", children: "Teams" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "type", children: "Tournament Type *" }),
              /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("type", value), children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Type" }) }),
                /* @__PURE__ */ jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsx(SelectItem, { value: "single", children: "Single Elimination" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "double", children: "Double Elimination" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "scotch_double", children: "Scotch Double" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "teams", children: "Teams" }),
                  /* @__PURE__ */ jsx(SelectItem, { value: "round_robin", children: "Round Robin" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "bracketOrdering", children: "Bracket Ordering *" }),
            /* @__PURE__ */ jsxs(Select, { onValueChange: (value) => setValue("bracketOrdering", value), children: [
              /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select Bracket Ordering" }) }),
              /* @__PURE__ */ jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsx(SelectItem, { value: "random_draw", children: "Random Draw" }),
                /* @__PURE__ */ jsx(SelectItem, { value: "seeded_draw", children: "Seeded Draw" })
              ] })
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-500", children: [
              watch("bracketOrdering") === "random_draw" && "Player order will be randomized using the Fisher-Yates shuffle algorithm",
              watch("bracketOrdering") === "seeded_draw" && "Highest seeded player plays lowest seeded player, etc."
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "winnersRaceTo", children: "Winners Race To" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "winnersRaceTo",
                  ...register("winnersRaceTo", { valueAsNumber: true }),
                  type: "number",
                  placeholder: "e.g. 7",
                  min: "1"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "losersRaceTo", children: "Losers Race To" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "losersRaceTo",
                  ...register("losersRaceTo", { valueAsNumber: true }),
                  type: "number",
                  placeholder: "e.g. 5",
                  min: "1"
                }
              )
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium border-b pb-2", children: "Tournament Settings" }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "maxPlayers", children: "Max Players" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "maxPlayers",
                  ...register("maxPlayers", { valueAsNumber: true }),
                  type: "number",
                  placeholder: "e.g. 32",
                  min: "2"
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "entryFee", children: "Entry Fee ($)" }),
              /* @__PURE__ */ jsx(
                Input,
                {
                  id: "entryFee",
                  ...register("entryFee", { valueAsNumber: true }),
                  type: "number",
                  placeholder: "e.g. 25",
                  min: "0",
                  step: "0.01"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "description", children: "Description" }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                id: "description",
                ...register("description"),
                rows: 3,
                placeholder: "Tournament details, rules, prizes, etc."
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between border-b pb-2", children: [
            /* @__PURE__ */ jsx("h3", { className: "text-lg font-medium", children: "Tables" }),
            /* @__PURE__ */ jsxs(
              Button,
              {
                type: "button",
                variant: "outline",
                size: "sm",
                onClick: () => setShowTablesModal(true),
                children: [
                  /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4 mr-1" }),
                  "Add Tables"
                ]
              }
            )
          ] }),
          (!watch("tables") || watch("tables")?.length === 0) && !importVenueId && /* @__PURE__ */ jsxs("div", { className: "text-center py-8 border border-dashed border-border rounded-lg", children: [
            /* @__PURE__ */ jsx("p", { children: "No tables added yet." }),
            /* @__PURE__ */ jsx("p", { className: "text-sm", children: 'Click "Add Tables" to get started.' })
          ] }),
          importVenueId && /* @__PURE__ */ jsx("div", { className: "p-4 bg-green-50 border border-green-200 rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium text-green-900", children: "Venue Tables Will Be Imported" }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-green-700", children: "Tables from the selected venue will be imported when the tournament is created." })
            ] }),
            /* @__PURE__ */ jsx(
              Button,
              {
                type: "button",
                variant: "ghost",
                size: "sm",
                onClick: () => setValue("importVenueId", void 0),
                className: "text-red-600 hover:text-red-800",
                children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
              }
            )
          ] }) }),
          watch("tables") && watch("tables").length > 0 && /* @__PURE__ */ jsx("div", { className: "rounded-md border", children: /* @__PURE__ */ jsxs(Table, { children: [
            /* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableHead, { children: "Label" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Size" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Streaming" }),
              /* @__PURE__ */ jsx(TableHead, { children: "Status" }),
              /* @__PURE__ */ jsx(TableHead, { className: "text-right", children: "Action" })
            ] }) }),
            /* @__PURE__ */ jsx(TableBody, { children: watch("tables").map((table, index) => /* @__PURE__ */ jsxs(TableRow, { children: [
              /* @__PURE__ */ jsx(TableCell, { children: table.label ? table.label : `Tables ${table.startNumber} - ${table.endNumber}` }),
              /* @__PURE__ */ jsx(TableCell, { children: table.manufacturer ? `${table.manufacturer} • ${table.size}` : table.size }),
              /* @__PURE__ */ jsx(TableCell, { children: table.isLiveStreaming ? "Yes" : "No" }),
              /* @__PURE__ */ jsx(TableCell, { children: table.status || "OPEN" }),
              /* @__PURE__ */ jsx(TableCell, { className: "text-right", children: /* @__PURE__ */ jsx(
                Button,
                {
                  type: "button",
                  variant: "ghost",
                  size: "sm",
                  onClick: () => handleRemoveTable(index),
                  className: "text-red-600 hover:text-red-800",
                  children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                }
              ) })
            ] }, `${table.label || "range"}-${index}`)) })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 pt-4", children: [
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "submit",
              disabled: isSubmitting,
              className: "flex-1",
              children: isSubmitting ? "Creating..." : "Create Tournament"
            }
          ),
          /* @__PURE__ */ jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: handleSaveTemplate,
              children: [
                /* @__PURE__ */ jsx(Save, { className: "h-4 w-4 mr-1" }),
                "Save as Template"
              ]
            }
          ),
          /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: "outline",
              onClick: () => navigate({ to: "/tournaments" }),
              children: "Cancel"
            }
          )
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(
      SaveTemplateModal,
      {
        open: showTemplateModal,
        onOpenChange: setShowTemplateModal,
        tournamentData: {
          ...watchedData,
          selectedDate,
          selectedTime
        }
      }
    ),
    /* @__PURE__ */ jsx(
      AddTablesModal,
      {
        open: showTablesModal,
        onOpenChange: setShowTablesModal,
        onAddTables: handleAddTables
      }
    )
  ] });
}
function NewTournamentPage() {
  return /* @__PURE__ */ jsx("div", { className: "container mx-auto py-8 max-w-4xl", children: /* @__PURE__ */ jsx(TournamentForm, {}) });
}
export {
  NewTournamentPage as component
};
