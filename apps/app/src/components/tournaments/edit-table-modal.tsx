"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@rackd/ui/components/dialog";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Label } from "@rackd/ui/components/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@rackd/ui/components/select";
import { RadioGroup, RadioGroupItem } from "@rackd/ui/components/radio-group";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";

interface Table {
	_id: Id<"tables">;
	label?: string | null;
	startNumber: number;
	endNumber: number;
	manufacturer: string;
	size: string;
	isLiveStreaming?: boolean | null;
	liveStreamUrl?: string | null;
	status?: "OPEN" | "CLOSED" | "IN_USE" | null;
}

interface EditTableModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	table: Table | null;
	onUpdateTable: (tableId: Id<"tables">, updates: {
		label?: string;
		manufacturer?: string;
		size?: string;
		isLiveStreaming?: boolean;
		liveStreamUrl?: string;
		status?: "OPEN" | "CLOSED" | "IN_USE";
	}) => Promise<void>;
}

export function EditTableModal({ open, onOpenChange, table, onUpdateTable }: EditTableModalProps) {
	const [formData, setFormData] = useState({
		label: "",
		manufacturer: "",
		size: "8 Foot",
		isLiveStreaming: false,
		liveStreamUrl: "",
		status: "OPEN" as "OPEN" | "CLOSED" | "IN_USE",
	});
	const [isSaving, setIsSaving] = useState(false);

	const manufacturersList = [
		"Aileex", "Blackball", "Brunswick", "Diamond", "Gabriels", "Heiron & Smith",
		"Imperial", "Joy", "Min", "Olhausen", "Olio", "Pot Black", "Predator",
		"Rasson", "Shender", "Star", "Supreme", "Valley", "Wiraka", "Xing Pai", "Other"
	];

	const sizes = [
		"6.5 Foot", "7 Foot", "8 Foot", "9 Foot", "10 Foot", "12 Foot"
	];

	// Initialize form data when table changes
	useEffect(() => {
		if (table) {
			setFormData({
				label: table.label || "",
				manufacturer: table.manufacturer || "",
				size: table.size || "8 Foot",
				isLiveStreaming: table.isLiveStreaming ?? false,
				liveStreamUrl: table.liveStreamUrl || "",
				status: table.status || "OPEN",
			});
		}
	}, [table]);

	const handleSave = async () => {
		if (!table) return;

		setIsSaving(true);
		try {
			await onUpdateTable(table._id, {
				label: formData.label,
				manufacturer: formData.manufacturer,
				size: formData.size,
				isLiveStreaming: formData.isLiveStreaming,
				liveStreamUrl: formData.liveStreamUrl,
				status: formData.status,
			});
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to update table:", error);
			alert("Failed to update table. Please try again.");
		} finally {
			setIsSaving(false);
		}
	};

	const handleClose = () => {
		if (table) {
			// Reset to original values
			setFormData({
				label: table.label || "",
				manufacturer: table.manufacturer || "",
				size: table.size || "8 Foot",
				isLiveStreaming: table.isLiveStreaming ?? false,
				liveStreamUrl: table.liveStreamUrl || "",
				status: table.status || "OPEN",
			});
		}
		onOpenChange(false);
	};

	if (!table) return null;

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-xl font-semibold">Edit Table</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 mt-4">
					<div className="space-y-2">
						<Label htmlFor="label">
							* Label
						</Label>
						<Input
							id="label"
							value={formData.label}
							onChange={(e) => setFormData({ ...formData, label: e.target.value })}
							placeholder="How to refer to this table (e.g. Table 1)"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="manufacturer">Manufacturer</Label>
						<Select
							value={formData.manufacturer}
							onValueChange={(value) => setFormData({ ...formData, manufacturer: value })}
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
									variant={formData.size === size ? "default" : "outline"}
									size="sm"
									onClick={() => setFormData({ ...formData, size })}
								>
									{size}
								</Button>
							))}
						</div>
					</div>

					<div className="space-y-2">
						<Label>Live Streaming table</Label>
						<RadioGroup
							value={formData.isLiveStreaming ? "yes" : "no"}
							onValueChange={(value) => setFormData({ ...formData, isLiveStreaming: value === "yes" })}
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

					{formData.isLiveStreaming && (
						<div className="space-y-2">
							<Label htmlFor="stream-url">Live Stream URL</Label>
							<Input
								id="stream-url"
								value={formData.liveStreamUrl}
								onChange={(e) => setFormData({ ...formData, liveStreamUrl: e.target.value })}
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
									variant={formData.status === status ? "default" : "outline"}
									size="sm"
									onClick={() => setFormData({ ...formData, status })}
								>
									{status}
								</Button>
							))}
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-4 border-t mt-6">
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={isSaving}
					>
						Cancel
					</Button>
					<Button
						type="button"
						variant="default"
						onClick={handleSave}
						disabled={isSaving || !formData.label}
					>
						{isSaving ? "Updating..." : "Update Table"}
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}








