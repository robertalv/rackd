"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@rackd/backend/convex/_generated/api";
import type { Id } from "@rackd/backend/convex/_generated/dataModel";
import { Button } from "@rackd/ui/components/button";
import { Card, CardContent } from "@rackd/ui/components/card";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AddTablesModal } from "./add-tables-modal";
import { EditTableModal } from "./edit-table-modal";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@rackd/ui/components/dialog";

type TabType = "all" | "in_use";

interface TablesManagementProps {
	tournamentId: Id<"tournaments">;
}

export function TablesManagement({ tournamentId }: TablesManagementProps) {
	const [activeTab, setActiveTab] = useState<TabType>("all");
	const [showAddTablesModal, setShowAddTablesModal] = useState(false);
	const [editingTable, setEditingTable] = useState<Id<"tables"> | null>(null);
	const [deletingTable, setDeletingTable] = useState<Id<"tables"> | null>(null);

	const tournament = useQuery(api.tournaments.getById, { id: tournamentId });
	const matches = useQuery(api.matches.getByTournament, { tournamentId });
	const tables = useQuery(api.tournaments.getTables, { tournamentId }) || [];
	const addTables = useMutation(api.tournaments.addTables);
	const updateTable = useMutation(api.tournaments.updateTable);
	const deleteTable = useMutation(api.tournaments.deleteTable);

	// Get players assigned to tables via matches
	const getPlayersForTable = (tableNumber: number) => {
		return matches?.filter((m) => m.tableNumber === tableNumber) || [];
	};

	// Filter tables based on active tab
	const filteredTables = tables.filter((table) => {
		if (activeTab === "all") return true;
		if (activeTab === "in_use") {
			const tableNum = table.tableNumber || table.startNumber;
			return table.status === "IN_USE" || getPlayersForTable(tableNum).length > 0;
		}
		return true;
	});

	const handleAddTables = async (newTables: Array<{
		label?: string;
		startNumber: number;
		endNumber: number;
		manufacturer: string;
		size: string;
		isLiveStreaming?: boolean;
		liveStreamUrl?: string;
		status?: "OPEN" | "CLOSED" | "IN_USE";
	}>, importVenueId?: Id<"venues">) => {
		try {
			if (importVenueId) {
				// TODO: Implement venue table import
				console.log("Venue table import not yet implemented");
				return;
			}

			if (newTables.length > 0) {
				await addTables({
					tournamentId,
					tables: newTables.map((table) => ({
						label: table.label,
						startNumber: table.startNumber,
						endNumber: table.endNumber,
						manufacturer: table.manufacturer as any,
						size: table.size as any,
						isLiveStreaming: table.isLiveStreaming,
						liveStreamUrl: table.liveStreamUrl,
						status: table.status as any,
					})),
				});
			}
		} catch (error) {
			console.error("Failed to add tables:", error);
			alert("Failed to add tables. Please try again.");
		}
	};

	const handleUpdateTable = async (
		tableId: Id<"tables">,
		updates: {
			label?: string;
			manufacturer?: string;
			size?: string;
			isLiveStreaming?: boolean;
			liveStreamUrl?: string;
			status?: "OPEN" | "CLOSED" | "IN_USE";
		}
	) => {
		try {
			await updateTable({
				tableId,
				label: updates.label,
				manufacturer: updates.manufacturer as any,
				size: updates.size as any,
				isLiveStreaming: updates.isLiveStreaming,
				liveStreamUrl: updates.liveStreamUrl,
				status: updates.status,
			});
			setEditingTable(null);
		} catch (error: any) {
			console.error("Failed to update table:", error);
			throw error;
		}
	};

	const handleDeleteTable = async (tableId: Id<"tables">) => {
		try {
			await deleteTable({ tableId });
			setDeletingTable(null);
		} catch (error: any) {
			console.error("Failed to delete table:", error);
			alert(error.message || "Failed to delete table. Please try again.");
		}
	};

	if (!tournament) {
		return (
			<div className="flex items-center justify-center h-full">
				<div>Loading...</div>
			</div>
		);
	}

	return (
		<div className="h-full flex flex-col bg-background">
			{/* Tabs */}
			<div className="border-b bg-card px-4">
				<div className="flex gap-4">
						<button
							onClick={() => setActiveTab("all")}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
								activeTab === "all"
									? "border-primary text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							ALL TABLES
						</button>
						<button
							onClick={() => setActiveTab("in_use")}
							className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
								activeTab === "in_use"
									? "border-primary text-foreground"
									: "border-transparent text-muted-foreground hover:text-foreground"
							}`}
						>
							IN USE
						</button>
					</div>
				</div>

			{/* Content */}
			<div className="flex-1 overflow-auto px-4 py-6">
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{/* Add New Table Card */}
					<Card
						className="border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
						onClick={() => setShowAddTablesModal(true)}
					>
						<CardContent className="p-8 flex flex-col items-center justify-center min-h-[300px]">
							<Plus className="h-16 w-16 text-muted-foreground mb-4" />
							<span className="text-sm font-medium text-muted-foreground">Add New Table</span>
						</CardContent>
					</Card>

					{/* Table Cards */}
					{filteredTables.map((table) => {
						const tableNum = table.tableNumber || table.startNumber;
						const tableMatches = getPlayersForTable(tableNum);
						const isInUse = table.status === "IN_USE" || tableMatches.length > 0;
						const isClosed = table.status === "CLOSED";
						const currentMatch = tableMatches[0];

						return (
							<Card key={table._id} className="relative">
								<CardContent className="p-4">
									{/* Table Header */}
									<div className="flex items-center justify-between mb-3">
										<span className="text-lg font-semibold">{table.label || `Table ${tableNum}`}</span>
										<div className="flex items-center gap-2">
											{isInUse ? (
												<span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded font-medium">
													IN_USE
												</span>
											) : isClosed ? (
												<span className="px-2 py-1 text-xs bg-gray-500/20 text-gray-400 rounded font-medium">
													CLOSED
												</span>
											) : (
												<span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded font-medium">
													OPEN
												</span>
											)}
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => setEditingTable(table._id)}
											>
												<Pencil className="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6 text-destructive hover:text-destructive"
												onClick={() => setDeletingTable(table._id)}
											>
												<Trash2 className="h-3 w-3" />
											</Button>
										</div>
									</div>

									{/* Pool Table Visualization */}
									<div className={`aspect-video rounded-lg flex items-center justify-center mb-3 relative overflow-hidden ${
										isClosed ? "bg-gray-900/30" : "bg-blue-900/30"
									}`}>
										{/* Pool Table Shape */}
										<div className="w-full h-full relative">
											{/* Table Surface */}
											<div className={`absolute inset-2 rounded-lg ${
												isClosed ? "bg-gray-700" : "bg-blue-700"
											}`}></div>
											{/* Pockets */}
											{/* Top Left */}
											<div className="absolute -top-3 -left-3 w-4 h-4 bg-black rounded-full translate-x-1/2 translate-y-1/2"></div>
											{/* Top Right */}
											<div className="absolute -top-1 -right-1 w-4 h-4 bg-black rounded-full"></div>
											{/* Top Center */}
											<div className="absolute top-0 left-1/2 w-4 h-4 bg-black rounded-full -translate-x-1/2 -translate-y-1/2"></div>
											{/* Bottom Left */}
											<div className="absolute -bottom-3 -left-3 w-4 h-4 bg-black rounded-full translate-x-1/2 -translate-y-1/2"></div>
											{/* Bottom Right */}
											<div className="absolute bottom-1 right-1 w-4 h-4 bg-black rounded-full translate-x-1/2 translate-y-1/2"></div>
											{/* Bottom Center */}
											<div className="absolute bottom-0 left-1/2 w-4 h-4 bg-black rounded-full -translate-x-1/2 translate-y-1/2"></div>

											{/* Content */}
											{isInUse && currentMatch ? (
												<div className="absolute inset-0 flex flex-col items-center justify-center p-4">
													<div className="w-full space-y-3">
														{/* Player 1 */}
														<div className="flex items-center justify-between px-4">
															<div className="flex items-center gap-2">
																<span className="text-lg">🇺🇸</span>
																<span className="text-sm font-medium">{currentMatch.player1?.name || "TBD"}</span>
															</div>
															<div className="px-2 py-1 bg-background rounded text-xs font-medium">
																{currentMatch.player1Score || 0}
															</div>
														</div>
														{/* Player 2 */}
														<div className="flex items-center justify-between px-4">
															<div className="flex items-center gap-2">
																<span className="text-lg">🇺🇸</span>
																<span className="text-sm font-medium">{currentMatch.player2?.name || "TBD"}</span>
															</div>
															<div className="px-2 py-1 bg-background rounded text-xs font-medium">
																{currentMatch.player2Score || 0}
															</div>
														</div>
													</div>
												</div>
											) : isClosed ? (
												<span className="absolute inset-0 flex items-center justify-center text-white font-medium text-lg">
													CLOSED
												</span>
											) : (
												<span className="absolute inset-0 flex items-center justify-center text-muted-foreground font-medium text-lg">
													OPEN
												</span>
											)}
										</div>
									</div>

									{/* Match Info */}
									{isInUse && currentMatch && (
										<div className="space-y-2 mt-3">
											<div className="text-xs text-muted-foreground">
												Match {currentMatch.round || 1}{" "}
												{currentMatch.bracketType === "winner" 
													? `(W${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`
													: currentMatch.bracketType === "loser"
													? `(L${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`
													: `(${currentMatch.round || 1}-${currentMatch.bracketPosition || 1})`}
											</div>
											{/* Progress Bar */}
											<div className="w-full bg-muted rounded-full h-1.5">
												<div className="bg-primary h-1.5 rounded-full" style={{ width: "0%" }}></div>
											</div>
											<div className="text-xs text-muted-foreground text-right">0%</div>
										</div>
									)}
								</CardContent>
							</Card>
						);
					})}
				</div>
			</div>

			{/* Add Tables Modal */}
			<AddTablesModal
				open={showAddTablesModal}
				onOpenChange={setShowAddTablesModal}
				onAddTables={handleAddTables}
			/>

			{/* Edit Table Modal */}
			<EditTableModal
				open={editingTable !== null}
				onOpenChange={(open) => !open && setEditingTable(null)}
				table={editingTable ? tables.find(t => t._id === editingTable) || null : null}
				onUpdateTable={handleUpdateTable}
			/>

			{/* Delete Confirmation Dialog */}
			<Dialog open={deletingTable !== null} onOpenChange={(open) => !open && setDeletingTable(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Table</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete this table? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<div className="flex justify-end gap-2 mt-4">
						<Button variant="outline" onClick={() => setDeletingTable(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={() => deletingTable && handleDeleteTable(deletingTable)}>
							Delete
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

