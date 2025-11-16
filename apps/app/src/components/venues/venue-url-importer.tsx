"use client";

import { useState } from "react";
import { Button } from "@rackd/ui/components/button";
import { Input } from "@rackd/ui/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rackd/ui/components/card";
import { extractVenueInfo } from "@/lib/functions/extract-venue-info";
import { Loader2, Link2, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";

type ExtractResponse = {
	success: boolean;
	data?: {
		name?: string | null;
		description?: string | null;
		address?: string | null;
		city?: string | null;
		region?: string | null;
		country?: string | null;
		phone?: string | null;
		email?: string | null;
		website?: string | null;
		operatingHours?: string | null;
		socialLinks?: { platform: string; url: string; icon: string }[];
		numberOfTables?: number | null;
	};
	error?: string;
};

/**
 * Component for importing venue information from a URL
 * This integrates with the venue form to auto-populate fields
 */
export function VenueUrlImporter({
	onExtract,
}: {
	onExtract?: (info: {
		name?: string;
		description?: string;
		address?: string;
		city?: string;
		region?: string;
		country?: string;
		phone?: string;
		email?: string;
		website?: string;
		operatingHours?: string;
		socialLinks?: { platform: string; url: string; icon: string }[];
		numberOfTables?: number;
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
			const response = await (extractVenueInfo as any)({ url: url.trim() }) as ExtractResponse;
			setResult(response);

			if (response.success && response.data && onExtract) {
				onExtract({
					name: response.data.name ?? undefined,
					description: response.data.description ?? undefined,
					address: response.data.address ?? undefined,
					city: response.data.city ?? undefined,
					region: response.data.region ?? undefined,
					country: response.data.country ?? undefined,
					phone: response.data.phone ?? undefined,
					email: response.data.email ?? undefined,
					website: response.data.website ?? undefined,
					operatingHours: response.data.operatingHours ?? undefined,
					socialLinks: response.data.socialLinks ?? undefined,
					numberOfTables: response.data.numberOfTables ?? undefined,
				});

				toast.success("Venue information extracted successfully!");
			} else {
				toast.error(response.error || "Failed to extract venue information");
			}
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to extract venue info";
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
					Import from Website
				</CardTitle>
				<CardDescription className="text-sm">
					Paste a URL to a venue website and we'll extract the details automatically.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Input
						placeholder="https://example.com/venue..."
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
									Successfully extracted venue information!
								</span>
								<div className="mt-2 space-y-1 text-xs text-muted-foreground">
									{result.data.name && (
										<div>
											<span className="font-medium">Name:</span> {result.data.name}
										</div>
									)}
									{result.data.address && (
										<div>
											<span className="font-medium">Address:</span> {result.data.address}
										</div>
									)}
									{result.data.city && (
										<div>
											<span className="font-medium">City:</span> {result.data.city}
										</div>
									)}
									{result.data.phone && (
										<div>
											<span className="font-medium">Phone:</span> {result.data.phone}
										</div>
									)}
									{result.data.email && (
										<div>
											<span className="font-medium">Email:</span> {result.data.email}
										</div>
									)}
									{result.data.numberOfTables !== null && result.data.numberOfTables !== undefined && (
										<div>
											<span className="font-medium">Tables:</span> {result.data.numberOfTables}
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

