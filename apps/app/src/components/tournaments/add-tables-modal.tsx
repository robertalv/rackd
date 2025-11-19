"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@rackd/ui/components/dialog";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Label } from "@rackd/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rackd/ui/components/tabs";
import { RadioGroup, RadioGroupItem } from "@rackd/ui/components/radio-group";
import { Info } from "lucide-react";
import { VenueSearch } from "../venues/venue-search";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface Table {
  label?: string;
  startNumber: number;
  endNumber: number;
  manufacturer: string;
  size: string;
  isLiveStreaming?: boolean;
  liveStreamUrl?: string;
  status?: "OPEN" | "CLOSED" | "IN_USE";
}

interface AddTablesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddTables: (tables: Table[], importVenueId?: Id<"venues">) => void;
}

export function AddTablesModal({ open, onOpenChange, onAddTables }: AddTablesModalProps) {
  const [activeTab, setActiveTab] = useState<"single" | "multiple" | "import">("single");
  const [importVenueId, setImportVenueId] = useState<Id<"venues"> | undefined>();

  // Single table state
  const [singleTable, setSingleTable] = useState<Table>({
    label: "",
    startNumber: 1,
    endNumber: 1,
    manufacturer: "",
    size: "8 Foot",
    isLiveStreaming: false,
    liveStreamUrl: "",
    status: "OPEN"
  });

  // Multiple tables state
  const [multipleTable, setMultipleTable] = useState<Table>({
    startNumber: 1,
    endNumber: 8,
    manufacturer: "",
    size: "8 Foot"
  });

  const manufacturersList = [
    "Aileex", "Blackball", "Brunswick", "Diamond", "Gabriels", "Heiron & Smith",
    "Imperial", "Joy", "Min", "Olhausen", "Olio", "Pot Black", "Predator",
    "Rasson", "Shender", "Star", "Supreme", "Valley", "Wiraka", "Xing Pai", "Other"
  ];

  const sizes = [
    "6.5 Foot", "7 Foot", "8 Foot", "9 Foot", "10 Foot", "12 Foot"
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
    // Reset state
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
    setImportVenueId(undefined);
    setActiveTab("single");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Table(s)</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="single">Single Table</TabsTrigger>
            <TabsTrigger value="multiple">Multiple Tables</TabsTrigger>
            <TabsTrigger value="import">Import Venue Tables</TabsTrigger>
          </TabsList>

          {/* SINGLE TABLE MODE */}
          <TabsContent value="single" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="single-label">* Label</Label>
              <Input
                id="single-label"
                value={singleTable.label || ""}
                onChange={(e) => setSingleTable({ ...singleTable, label: e.target.value })}
                placeholder="How to refer to this table (e.g. Table 1)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="single-manufacturer">Manufacturer</Label>
              <Select
                value={singleTable.manufacturer || ""}
                onValueChange={(value) => setSingleTable({ ...singleTable, manufacturer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturersList.map(manufacturer => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <Button
                    key={size}
                    type="button"
                    variant={singleTable.size === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSingleTable({ ...singleTable, size })}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Live Streaming table</Label>
              <RadioGroup
                value={singleTable.isLiveStreaming ? "yes" : "no"}
                onValueChange={(value) => setSingleTable({ ...singleTable, isLiveStreaming: value === "yes" })}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="streaming-yes" />
                    <Label htmlFor="streaming-yes">Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="streaming-no" />
                    <Label htmlFor="streaming-no">No</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            {singleTable.isLiveStreaming && (
              <div className="space-y-2">
                <Label htmlFor="single-stream-url">Live Stream URL</Label>
                <Input
                  id="single-stream-url"
                  value={singleTable.liveStreamUrl || ""}
                  onChange={(e) => setSingleTable({ ...singleTable, liveStreamUrl: e.target.value })}
                  placeholder="https://www.domain.com"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2">
                {(["OPEN", "CLOSED", "IN_USE"] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={singleTable.status === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSingleTable({ ...singleTable, status })}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* MULTIPLE TABLES MODE */}
          <TabsContent value="multiple" className="space-y-4 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="multiple-start">* Start Number</Label>
                <Input
                  id="multiple-start"
                  type="number"
                  min="1"
                  value={multipleTable.startNumber}
                  onChange={(e) => setMultipleTable({ ...multipleTable, startNumber: parseInt(e.target.value) || 1 })}
                  placeholder="Enter the first table number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="multiple-end">* End Number</Label>
                <Input
                  id="multiple-end"
                  type="number"
                  min="1"
                  value={multipleTable.endNumber}
                  onChange={(e) => setMultipleTable({ ...multipleTable, endNumber: parseInt(e.target.value) || 1 })}
                  placeholder="Enter the last table number"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="multiple-manufacturer">Manufacturer</Label>
              <Select
                value={multipleTable.manufacturer || ""}
                onValueChange={(value) => setMultipleTable({ ...multipleTable, manufacturer: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a manufacturer" />
                </SelectTrigger>
                <SelectContent>
                  {manufacturersList.map(manufacturer => (
                    <SelectItem key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Size</Label>
              <div className="flex flex-wrap gap-2">
                {sizes.map(size => (
                  <Button
                    key={size}
                    type="button"
                    variant={multipleTable.size === size ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMultipleTable({ ...multipleTable, size })}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              This will create tables numbered {" "}
              <span className="font-mono font-semibold">{multipleTable.startNumber}</span>
              {" "} to {" "}
              <span className="font-mono font-semibold">{multipleTable.endNumber}</span>
              {" "}(
              {Math.max(1, multipleTable.endNumber - multipleTable.startNumber + 1)} tables)
            </div>
          </TabsContent>

          {/* IMPORT VENUE TABLES MODE */}
          <TabsContent value="import" className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="import-venue">Venue</Label>
              <VenueSearch
                value={importVenueId}
                onChange={(venueId) => setImportVenueId(venueId as Id<"venues">)}
                placeholder="Tipsy Cues - Harker Heights, Texas"
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            onClick={handleSave}
            disabled={
              (activeTab === "single" && !singleTable.label) ||
              (activeTab === "multiple" && (!multipleTable.startNumber || !multipleTable.endNumber)) ||
              (activeTab === "import" && !importVenueId)
            }
          >
            {activeTab === "import" ? "Import Venue Tables" : activeTab === "multiple" ? "Create Tables" : "Create Table"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}









