import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ChevronDownIcon, MapPin, Plus, CircleIcon, Sparkles, X, Image } from "lucide-react";
import { getDefaultClassNames, DayPicker } from "react-day-picker";
import { c as cn, d as buttonVariants, B as Button } from "./router-CozkPsbM.js";
import { D as Dialog, a as DialogContent, d as DialogHeader, b as DialogTitle } from "./dialog-C0i-cdoB.js";
import { I as Input } from "./input-DCxY3WWX.js";
import { L as Label } from "./label-Z8WohVOh.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-BtqsTuOV.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-BPSwp-0A.js";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { useQuery, useAction, useMutation } from "convex/react";
import { b as api } from "./globals-Bsfdm3JA.js";
import { A as AddVenueModal } from "./add-venue-modal-C10x_m-g.js";
import { u as useFileUpload, P as Progress, D as Dropzone, a as DropzoneContent, b as DropzoneEmptyState } from "./venue-image-upload-VPDsqg2T.js";
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  return /* @__PURE__ */ jsx(
    DayPicker,
    {
      showOutsideDays,
      className: cn(
        "bg-background group/calendar p-3 [--cell-size:--spacing(8)] [[data-slot=card-content]_&]:bg-transparent [[data-slot=popover-content]_&]:bg-transparent",
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      ),
      captionLayout,
      formatters: {
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters
      },
      classNames: {
        root: cn("w-fit", defaultClassNames.root),
        months: cn(
          "flex gap-4 flex-col md:flex-row relative",
          defaultClassNames.months
        ),
        month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
        nav: cn(
          "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "size-(--cell-size) aria-disabled:opacity-50 p-0 select-none",
          defaultClassNames.button_next
        ),
        month_caption: cn(
          "flex items-center justify-center h-(--cell-size) w-full px-(--cell-size)",
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          "w-full flex items-center text-sm font-medium justify-center h-(--cell-size) gap-1.5",
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          "relative has-focus:border-ring border border-input shadow-xs has-focus:ring-ring/50 has-focus:ring-[3px] rounded-md",
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          "absolute bg-popover inset-0 opacity-0",
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          "select-none font-medium",
          captionLayout === "label" ? "text-sm" : "rounded-md pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-muted-foreground [&>svg]:size-3.5",
          defaultClassNames.caption_label
        ),
        table: "w-full border-collapse",
        weekdays: cn("flex", defaultClassNames.weekdays),
        weekday: cn(
          "text-muted-foreground rounded-md flex-1 font-normal text-[0.8rem] select-none",
          defaultClassNames.weekday
        ),
        week: cn("flex w-full mt-2", defaultClassNames.week),
        week_number_header: cn(
          "select-none w-(--cell-size)",
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          "text-[0.8rem] select-none text-muted-foreground",
          defaultClassNames.week_number
        ),
        day: cn(
          "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
          defaultClassNames.day
        ),
        range_start: cn(
          "rounded-l-md bg-accent",
          defaultClassNames.range_start
        ),
        range_middle: cn("rounded-none", defaultClassNames.range_middle),
        range_end: cn("rounded-r-md bg-accent", defaultClassNames.range_end),
        today: cn(
          "bg-accent text-accent-foreground rounded-md data-[selected=true]:rounded-none",
          defaultClassNames.today
        ),
        outside: cn(
          "text-muted-foreground aria-selected:text-muted-foreground",
          defaultClassNames.outside
        ),
        disabled: cn(
          "text-muted-foreground opacity-50",
          defaultClassNames.disabled
        ),
        hidden: cn("invisible", defaultClassNames.hidden),
        ...classNames
      },
      components: {
        Root: ({ className: className2, rootRef, ...props2 }) => {
          return /* @__PURE__ */ jsx(
            "div",
            {
              "data-slot": "calendar",
              ref: rootRef,
              className: cn(className2),
              ...props2
            }
          );
        },
        Chevron: ({ className: className2, orientation, ...props2 }) => {
          if (orientation === "left") {
            return /* @__PURE__ */ jsx(ChevronLeftIcon, { className: cn("size-4", className2), ...props2 });
          }
          if (orientation === "right") {
            return /* @__PURE__ */ jsx(
              ChevronRightIcon,
              {
                className: cn("size-4", className2),
                ...props2
              }
            );
          }
          return /* @__PURE__ */ jsx(ChevronDownIcon, { className: cn("size-4", className2), ...props2 });
        },
        DayButton: CalendarDayButton,
        WeekNumber: ({ children, ...props2 }) => {
          return /* @__PURE__ */ jsx("td", { ...props2, children: /* @__PURE__ */ jsx("div", { className: "flex size-(--cell-size) items-center justify-center text-center", children }) });
        },
        ...components
      },
      ...props
    }
  );
}
function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames();
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus();
  }, [modifiers.focused]);
  return /* @__PURE__ */ jsx(
    Button,
    {
      ref,
      variant: "ghost",
      size: "icon",
      "data-day": day.date.toLocaleDateString(),
      "data-selected-single": modifiers.selected && !modifiers.range_start && !modifiers.range_end && !modifiers.range_middle,
      "data-range-start": modifiers.range_start,
      "data-range-end": modifiers.range_end,
      "data-range-middle": modifiers.range_middle,
      className: cn(
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      ),
      ...props
    }
  );
}
function VenueSearch({ value, onChange, placeholder = "Search venues..." }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const venues = useQuery(api.venues.search, { query: searchTerm });
  const selectedVenue = useQuery(api.venues.getById, value ? { id: value } : "skip");
  const handleSelect = (venueId, venueName) => {
    onChange(venueId);
    setSearchTerm(venueName);
    setShowResults(false);
  };
  const handleClear = () => {
    onChange(void 0);
    setSearchTerm("");
    setShowResults(false);
  };
  const handleVenueAdded = (venueId) => {
    onChange(venueId);
    setShowAddModal(false);
    setSearchTerm("");
  };
  return /* @__PURE__ */ jsxs("div", { className: "relative", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex-1 relative", children: [
        /* @__PURE__ */ jsx(
          Input,
          {
            value: selectedVenue ? selectedVenue.name : searchTerm,
            onChange: (e) => {
              setSearchTerm(e.target.value);
              setShowResults(true);
              if (!e.target.value) {
                onChange(void 0);
              }
            },
            onFocus: () => setShowResults(true),
            placeholder,
            className: "pr-8"
          }
        ),
        /* @__PURE__ */ jsx(MapPin, { className: "absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" }),
        (selectedVenue || searchTerm) && /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            onClick: handleClear,
            className: "absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600",
            children: "×"
          }
        )
      ] }),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: () => setShowAddModal(true),
          className: "px-3",
          children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" })
        }
      )
    ] }),
    showResults && searchTerm && venues && venues.length > 0 && /* @__PURE__ */ jsx("div", { className: "absolute z-10 w-full mt-1 border rounded-xl shadow-lg bg-card max-h-60 overflow-y-auto", children: venues.map((venue) => /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        onClick: () => handleSelect(venue._id, venue.name),
        className: "w-full px-3 py-2 text-left hover:bg-accent/50 border-b last:border-b-0",
        children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: venue.name }),
          /* @__PURE__ */ jsxs("div", { className: "text-sm text-gray-500", children: [
            venue.type.replace("_", " "),
            " • ",
            venue.access.replace("_", " "),
            venue.address && ` • ${venue.address}`
          ] })
        ]
      },
      venue._id
    )) }),
    showResults && searchTerm && venues && venues.length === 0 && /* @__PURE__ */ jsx("div", { className: "absolute z-10 w-full mt-1 bg-sidebar border rounded-xl shadow-lg", children: /* @__PURE__ */ jsxs("div", { className: "px-3 py-2 text-muted-foreground text-sm", children: [
      "No venues found.",
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "link",
          onClick: () => setShowAddModal(true),
          children: "Add a new venue?"
        }
      )
    ] }) }),
    showResults && /* @__PURE__ */ jsx(
      "div",
      {
        className: "fixed inset-0 z-5",
        onClick: () => setShowResults(false)
      }
    ),
    /* @__PURE__ */ jsx(
      AddVenueModal,
      {
        open: showAddModal,
        onOpenChange: setShowAddModal,
        onVenueAdded: handleVenueAdded
      }
    )
  ] });
}
function RadioGroup({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Root,
    {
      "data-slot": "radio-group",
      className: cn("grid gap-3", className),
      ...props
    }
  );
}
function RadioGroupItem({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    RadioGroupPrimitive.Item,
    {
      "data-slot": "radio-group-item",
      className: cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      ),
      ...props,
      children: /* @__PURE__ */ jsx(
        RadioGroupPrimitive.Indicator,
        {
          "data-slot": "radio-group-indicator",
          className: "relative flex items-center justify-center",
          children: /* @__PURE__ */ jsx(CircleIcon, { className: "fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" })
        }
      )
    }
  );
}
function AddTablesModal({ open, onOpenChange, onAddTables }) {
  const [activeTab, setActiveTab] = useState("single");
  const [importVenueId, setImportVenueId] = useState();
  const [singleTable, setSingleTable] = useState({
    label: "",
    startNumber: 1,
    endNumber: 1,
    manufacturer: "",
    size: "8 Foot",
    isLiveStreaming: false,
    liveStreamUrl: "",
    status: "OPEN"
  });
  const [multipleTable, setMultipleTable] = useState({
    startNumber: 1,
    endNumber: 8,
    manufacturer: "",
    size: "8 Foot"
  });
  const manufacturersList = [
    "Aileex",
    "Blackball",
    "Brunswick",
    "Diamond",
    "Gabriels",
    "Heiron & Smith",
    "Imperial",
    "Joy",
    "Min",
    "Olhausen",
    "Olio",
    "Pot Black",
    "Predator",
    "Rasson",
    "Shender",
    "Star",
    "Supreme",
    "Valley",
    "Wiraka",
    "Xing Pai",
    "Other"
  ];
  const sizes = [
    "6.5 Foot",
    "7 Foot",
    "8 Foot",
    "9 Foot",
    "10 Foot",
    "12 Foot"
  ];
  const handleSave = () => {
    if (activeTab === "import" && importVenueId) {
      onAddTables([], importVenueId);
    } else if (activeTab === "single") {
      onAddTables([singleTable]);
    } else if (activeTab === "multiple") {
      onAddTables([multipleTable]);
    }
    handleClose();
  };
  const handleClose = () => {
    setSingleTable({
      label: "",
      startNumber: 1,
      endNumber: 1,
      manufacturer: "",
      size: "8 Foot",
      isLiveStreaming: false,
      liveStreamUrl: "",
      status: "OPEN"
    });
    setMultipleTable({
      startNumber: 1,
      endNumber: 8,
      manufacturer: "",
      size: "8 Foot"
    });
    setImportVenueId(void 0);
    setActiveTab("single");
    onOpenChange(false);
  };
  return /* @__PURE__ */ jsx(Dialog, { open, onOpenChange: handleClose, children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-3xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { className: "text-xl font-semibold", children: "Add Table(s)" }) }),
    /* @__PURE__ */ jsxs(Tabs, { value: activeTab, onValueChange: (v) => setActiveTab(v), className: "w-full", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-3", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "single", children: "Single Table" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "multiple", children: "Multiple Tables" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "import", children: "Import Venue Tables" })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "single", className: "space-y-4 mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "single-label", children: "* Label" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "single-label",
              value: singleTable.label || "",
              onChange: (e) => setSingleTable({ ...singleTable, label: e.target.value }),
              placeholder: "How to refer to this table (e.g. Table 1)"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "single-manufacturer", children: "Manufacturer" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: singleTable.manufacturer || "",
              onValueChange: (value) => setSingleTable({ ...singleTable, manufacturer: value }),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a manufacturer" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: manufacturersList.map((manufacturer) => /* @__PURE__ */ jsx(SelectItem, { value: manufacturer, children: manufacturer }, manufacturer)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Size" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: sizes.map((size) => /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: singleTable.size === size ? "default" : "outline",
              size: "sm",
              onClick: () => setSingleTable({ ...singleTable, size }),
              children: size
            },
            size
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Live Streaming table" }),
          /* @__PURE__ */ jsx(
            RadioGroup,
            {
              value: singleTable.isLiveStreaming ? "yes" : "no",
              onValueChange: (value) => setSingleTable({ ...singleTable, isLiveStreaming: value === "yes" }),
              children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-4", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "yes", id: "streaming-yes" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "streaming-yes", children: "Yes" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
                  /* @__PURE__ */ jsx(RadioGroupItem, { value: "no", id: "streaming-no" }),
                  /* @__PURE__ */ jsx(Label, { htmlFor: "streaming-no", children: "No" })
                ] })
              ] })
            }
          )
        ] }),
        singleTable.isLiveStreaming && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "single-stream-url", children: "Live Stream URL" }),
          /* @__PURE__ */ jsx(
            Input,
            {
              id: "single-stream-url",
              value: singleTable.liveStreamUrl || "",
              onChange: (e) => setSingleTable({ ...singleTable, liveStreamUrl: e.target.value }),
              placeholder: "https://www.domain.com"
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Status" }),
          /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["OPEN", "CLOSED", "IN_USE"].map((status) => /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: singleTable.status === status ? "default" : "outline",
              size: "sm",
              onClick: () => setSingleTable({ ...singleTable, status }),
              children: status
            },
            status
          )) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(TabsContent, { value: "multiple", className: "space-y-4 mt-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "multiple-start", children: "* Start Number" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "multiple-start",
                type: "number",
                min: "1",
                value: multipleTable.startNumber,
                onChange: (e) => setMultipleTable({ ...multipleTable, startNumber: parseInt(e.target.value) || 1 }),
                placeholder: "Enter the first table number"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "multiple-end", children: "* End Number" }),
            /* @__PURE__ */ jsx(
              Input,
              {
                id: "multiple-end",
                type: "number",
                min: "1",
                value: multipleTable.endNumber,
                onChange: (e) => setMultipleTable({ ...multipleTable, endNumber: parseInt(e.target.value) || 1 }),
                placeholder: "Enter the last table number"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "multiple-manufacturer", children: "Manufacturer" }),
          /* @__PURE__ */ jsxs(
            Select,
            {
              value: multipleTable.manufacturer || "",
              onValueChange: (value) => setMultipleTable({ ...multipleTable, manufacturer: value }),
              children: [
                /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select a manufacturer" }) }),
                /* @__PURE__ */ jsx(SelectContent, { children: manufacturersList.map((manufacturer) => /* @__PURE__ */ jsx(SelectItem, { value: manufacturer, children: manufacturer }, manufacturer)) })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Size" }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: sizes.map((size) => /* @__PURE__ */ jsx(
            Button,
            {
              type: "button",
              variant: multipleTable.size === size ? "default" : "outline",
              size: "sm",
              onClick: () => setMultipleTable({ ...multipleTable, size }),
              children: size
            },
            size
          )) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground", children: [
          "This will create tables numbered ",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: multipleTable.startNumber }),
          " ",
          " to ",
          " ",
          /* @__PURE__ */ jsx("span", { className: "font-mono font-semibold", children: multipleTable.endNumber }),
          " ",
          "(",
          Math.max(1, multipleTable.endNumber - multipleTable.startNumber + 1),
          " tables)"
        ] })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "import", className: "space-y-4 mt-6", children: /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx(Label, { htmlFor: "import-venue", children: "Venue" }),
        /* @__PURE__ */ jsx(
          VenueSearch,
          {
            value: importVenueId,
            onChange: (venueId) => setImportVenueId(venueId),
            placeholder: "Tipsy Cues - Harker Heights, Texas"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2 pt-4 border-t mt-6", children: [
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "outline",
          onClick: handleClose,
          children: "Cancel"
        }
      ),
      /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "default",
          onClick: handleSave,
          disabled: activeTab === "single" && !singleTable.label || activeTab === "multiple" && (!multipleTable.startNumber || !multipleTable.endNumber) || activeTab === "import" && !importVenueId,
          children: activeTab === "import" ? "Import Venue Tables" : activeTab === "multiple" ? "Create Tables" : "Create Table"
        }
      )
    ] })
  ] }) });
}
function TournamentFlyerUpload({
  onUpload,
  onRemove,
  onError,
  onExtractInfo,
  className,
  currentUrl,
  currentStorageId
}) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadedStorageId, setUploadedStorageId] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const { uploadFile, isUploading, uploadProgress } = useFileUpload();
  const extractInfo = useAction(api.tournaments.extractTournamentInfo);
  const deleteFileByStorageId = useMutation(api.files.deleteFileByStorageId);
  const onExtractInfoRef = useRef(onExtractInfo);
  const onUploadRef = useRef(onUpload);
  const [isDeleting, setIsDeleting] = useState(false);
  useEffect(() => {
    onExtractInfoRef.current = onExtractInfo;
  }, [onExtractInfo]);
  useEffect(() => {
    onUploadRef.current = onUpload;
  }, [onUpload]);
  const uploadedImageUrl = useQuery(
    api.files.getFileUrl,
    uploadedStorageId ? { storageId: uploadedStorageId } : "skip"
  );
  const currentImageUrl = useQuery(
    api.files.getFileUrl,
    currentStorageId ? { storageId: currentStorageId } : "skip"
  );
  const handleDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploadedFiles([file]);
    try {
      const result = await uploadFile(file, {
        category: "tournament_flyer",
        description: "Tournament flyer image"
      });
      setUploadedStorageId(result.storageId);
    } catch (error) {
      console.error("Upload failed:", error);
      onError?.(error);
      setUploadedFiles([]);
      setUploadedStorageId(null);
    }
  };
  const removeFile = useCallback(async () => {
    const storageIdToDelete = uploadedStorageId || currentStorageId;
    if (!storageIdToDelete) {
      setUploadedFiles([]);
      setUploadedStorageId(null);
      onRemove?.();
      return;
    }
    setIsDeleting(true);
    try {
      console.log("Deleting file from storage:", storageIdToDelete);
      await deleteFileByStorageId({ storageId: storageIdToDelete });
      console.log("File deleted successfully from storage");
      setUploadedFiles([]);
      setUploadedStorageId(null);
      onRemove?.();
    } catch (error) {
      console.error("Failed to delete file from storage:", error);
      onError?.(error);
      setUploadedFiles([]);
      setUploadedStorageId(null);
      onRemove?.();
    } finally {
      setIsDeleting(false);
    }
  }, [uploadedStorageId, currentStorageId, deleteFileByStorageId, onRemove, onError]);
  const handleExtractInfo = useCallback(async () => {
    const storageIdToUse = uploadedStorageId || currentStorageId;
    if (!storageIdToUse) {
      onError?.(new Error("No image uploaded"));
      return;
    }
    setIsExtracting(true);
    try {
      const extractedInfo = await extractInfo({ storageId: storageIdToUse });
      onExtractInfoRef.current?.(extractedInfo);
    } catch (error) {
      console.error("Failed to extract tournament info:", error);
      onError?.(error);
    } finally {
      setIsExtracting(false);
    }
  }, [uploadedStorageId, currentStorageId, extractInfo, onError]);
  const displayUrl = uploadedImageUrl || currentImageUrl || currentUrl;
  const hasFiles = uploadedFiles.length > 0 || displayUrl;
  useEffect(() => {
    if (uploadedImageUrl && onUploadRef.current) {
      onUploadRef.current(uploadedImageUrl);
    }
  }, [uploadedImageUrl]);
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-4", className), children: [
    isUploading && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
        /* @__PURE__ */ jsx("span", { children: "Uploading flyer..." }),
        /* @__PURE__ */ jsxs("span", { children: [
          uploadProgress,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Progress, { value: uploadProgress, className: "w-full" })
    ] }),
    displayUrl && /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx("div", { className: "border rounded-lg overflow-hidden", children: /* @__PURE__ */ jsx(
        "img",
        {
          src: displayUrl,
          alt: "Tournament flyer",
          className: "w-full h-48 object-cover"
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "absolute top-2 right-2 flex gap-2", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "secondary",
            onClick: handleExtractInfo,
            disabled: isUploading || isExtracting,
            title: "Extract tournament information from flyer",
            children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4 mr-1" }),
              isExtracting ? "Extracting..." : "Extract Info"
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            type: "button",
            size: "sm",
            variant: "destructive",
            onClick: removeFile,
            disabled: isUploading || isExtracting || isDeleting,
            children: [
              /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
              isDeleting && /* @__PURE__ */ jsx("span", { className: "ml-1", children: "Deleting..." })
            ]
          }
        )
      ] }),
      uploadedFiles[0] && /* @__PURE__ */ jsx("div", { className: "mt-2 p-3 bg-muted rounded-lg", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(Image, { className: "h-4 w-4 text-blue-500" }),
        /* @__PURE__ */ jsx("span", { className: "text-sm font-medium", children: uploadedFiles[0].name }),
        /* @__PURE__ */ jsxs("span", { className: "text-xs text-muted-foreground", children: [
          "(",
          (uploadedFiles[0].size / 1024 / 1024).toFixed(2),
          " MB)"
        ] }),
        uploadedImageUrl && /* @__PURE__ */ jsx("span", { className: "text-xs text-green-600", children: "• Uploaded" })
      ] }) })
    ] }),
    !hasFiles && /* @__PURE__ */ jsxs(
      Dropzone,
      {
        src: uploadedFiles,
        accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".heic", ".heif"] },
        maxSize: 5 * 1024 * 1024,
        maxFiles: 1,
        onDrop: handleDrop,
        onError,
        disabled: isUploading,
        children: [
          /* @__PURE__ */ jsx(DropzoneContent, {}),
          /* @__PURE__ */ jsx(DropzoneEmptyState, {})
        ]
      }
    )
  ] });
}
export {
  AddTablesModal as A,
  Calendar as C,
  RadioGroup as R,
  TournamentFlyerUpload as T,
  VenueSearch as V,
  RadioGroupItem as a
};
