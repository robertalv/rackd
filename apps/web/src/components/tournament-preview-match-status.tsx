interface TournamentPreviewMatchStatusProps {
    completed: number
    inProgress: number
    upcoming: number
}

export function TournamentPreviewMatchStatus({
    completed,
    inProgress,
    upcoming,
}: TournamentPreviewMatchStatusProps) {
    return (
        <div className="p-4 rounded-lg bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
            <div className="text-sm font-semibold uppercase text-foreground dark:text-zinc-200 mb-3">
                Match Status
            </div>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-zinc-400">Completed</span>
                    <span className="text-sm font-medium text-foreground dark:text-zinc-200">{completed}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-zinc-400">In Progress</span>
                    <span className="text-sm font-medium text-foreground dark:text-zinc-200">{inProgress}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground dark:text-zinc-400">Upcoming</span>
                    <span className="text-sm font-medium text-foreground dark:text-zinc-200">{upcoming}</span>
                </div>
            </div>
        </div>
    )
}

