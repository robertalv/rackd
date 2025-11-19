"use client";

import { useState } from "react";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { extractTournamentInfo } from "@/lib/functions/extract-tournament-info";
import { Loader2, Link2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

type ExtractResponse = {
	success: boolean;
	data?: {
		name?: string | null;
		dateTimestamp?: number | null;
		venue?: string | null;
		entryFee?: number | null;
		gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool" | null;
		maxPlayers?: number | null;
		description?: string | null;
		screenshot?: string | null;
		rawData?: any;
	};
	error?: string;
};

/**
 * Component for importing tournament information from a URL
 * This integrates with the tournament form to auto-populate fields
 */
export function TournamentUrlImporter({
	onExtract,
}: {
	onExtract?: (info: {
		name?: string;
		dateTimestamp?: number; // Timestamp in milliseconds
		time?: string;
		venue?: string;
		entryFee?: number;
		description?: string;
		gameType?: "eight_ball" | "nine_ball" | "ten_ball" | "one_pocket" | "bank_pool";
		playerType?: "singles" | "doubles" | "scotch_doubles" | "teams";
		maxPlayers?: number;
		screenshot?: string;
	}) => void;
}) {
	const [url, setUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [result, setResult] = useState<ExtractResponse | null>(null);

	const handleExtract = async () => {
		if (!url.trim()) {
			toast.error("Please enter a URL");
			return;
		}

		setIsLoading(true);
		setResult(null);

		try {
			const response = await (extractTournamentInfo as any)({ url: url.trim() }) as ExtractResponse;
			setResult(response);

			if (response.success && response.data && onExtract) {
				// Convert dateTimestamp to time string if available
				let timeString: string | undefined;
				if (response.data.dateTimestamp) {
					const date = new Date(response.data.dateTimestamp);
					timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
				}

				onExtract({
					name: response.data.name ?? undefined,
					dateTimestamp: response.data.dateTimestamp ?? undefined,
					time: timeString,
					venue: response.data.venue ?? undefined,
					entryFee: response.data.entryFee ?? undefined,
					gameType: response.data.gameType ?? undefined,
					maxPlayers: response.data.maxPlayers ?? undefined,
					description: response.data.description ?? undefined,
					screenshot: response.data.rawData?.screenshot ?? undefined,
				});

				toast.success("Tournament information extracted successfully!");
			} else {
				toast.error(response.error || "Failed to extract tournament information");
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to extract tournament info";
			setResult({
				success: false,
				error: errorMessage,
			});
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Card className="border-dashed">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<Sparkles className="size-4" />
					Import from URL
				</CardTitle>
				<CardDescription className="text-sm">
					Paste a URL to a tournament page (Facebook event, website, etc.) and we'll extract the details automatically.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Input
						placeholder="https://example.com/tournament..."
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !isLoading) {
								handleExtract();
							}
						}}
						disabled={isLoading}
						className="flex-1"
					/>
					<Button onClick={handleExtract} disabled={isLoading || !url.trim()} size="default">
						{isLoading ? (
							<>
								<Loader2 className="mr-2 size-4 animate-spin" />
								Extracting...
							</>
						) : (
							<>
								<Link2 className="mr-2 size-4" />
								Extract
							</>
						)}
					</Button>
				</div>

				{result && result.success && result.data && (
					<div className="rounded-lg border bg-muted/50 p-3">
						<div className="flex items-start gap-2 text-sm">
							<CheckCircle2 className="mt-0.5 size-4 text-green-600 dark:text-green-400 shrink-0" />
							<div className="flex-1 space-y-1">
								<span className="font-semibold text-green-600 dark:text-green-400">
									Successfully extracted tournament information!
								</span>
								<div className="mt-2 space-y-1 text-xs text-muted-foreground">
									{result.data.name && (
										<div>
											<span className="font-medium">Name:</span> {result.data.name}
										</div>
									)}
									{result.data.dateTimestamp && (
										<div>
											<span className="font-medium">Date:</span>{" "}
											{new Date(result.data.dateTimestamp).toLocaleDateString()}
										</div>
									)}
									{result.data.venue && (
										<div>
											<span className="font-medium">Venue:</span> {result.data.venue}
										</div>
									)}
									{result.data.entryFee !== null && result.data.entryFee !== undefined && (
										<div>
											<span className="font-medium">Entry Fee:</span> ${result.data.entryFee}
										</div>
									)}
									{result.data.gameType && (
										<div>
											<span className="font-medium">Game Type:</span> {result.data.gameType.replace("_", " ")}
										</div>
									)}
									{result.data.maxPlayers && (
										<div>
											<span className="font-medium">Max Players:</span> {result.data.maxPlayers}
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{result && !result.success && (
					<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
						<div className="flex items-start gap-2 text-sm">
							<XCircle className="mt-0.5 size-4 text-destructive shrink-0" />
							<div>
								<span className="font-semibold text-destructive">Error:</span>{" "}
								<span className="text-muted-foreground">{result.error || "Failed to extract information"}</span>
							</div>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

