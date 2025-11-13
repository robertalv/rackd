interface TournamentPreviewProgressProps {
    completionPercentage: number
    completedMatches: number
    totalMatches: number
    isLive?: boolean
}

export function TournamentPreviewProgress({
    completionPercentage,
    completedMatches,
    totalMatches,
    isLive = false,
}: TournamentPreviewProgressProps) {
    return (
        <div className="p-4 bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
            <div className="text-sm font-semibold uppercase text-foreground dark:text-zinc-200 mb-3">
                Tournament Progress
            </div>
            <div className="flex items-baseline mb-2">
                <span className="text-4xl font-bold text-primary dark:text-primary">{completionPercentage}%</span>
                <span className="text-lg ml-2 text-muted-foreground dark:text-zinc-400">complete</span>
            </div>
            <div className="text-sm text-muted-foreground dark:text-zinc-400 mb-3">
                {completedMatches} of {totalMatches} matches completed
            </div>
            {isLive && (
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400" />
                    <span className="text-sm font-medium text-green-500 dark:text-green-400">LIVE</span>
                </div>
            )}
        </div>
    )
}

