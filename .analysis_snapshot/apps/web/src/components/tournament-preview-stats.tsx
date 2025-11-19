interface TournamentPreviewStatsProps {
    matches: number
    players: number
    collected?: number
    potAmount?: number
}

export function TournamentPreviewStats({
    matches,
    players,
    collected,
    potAmount,
}: TournamentPreviewStatsProps) {
    return (
        <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[100px] p-4 bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
                <div className="text-2xl font-bold text-primary dark:text-primary mb-1">{matches}</div>
                <div className="text-xs uppercase text-muted-foreground dark:text-zinc-400">Matches</div>
            </div>
            <div className="flex-1 min-w-[100px] p-4 bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
                <div className="text-2xl font-bold text-primary dark:text-primary mb-1">{players}</div>
                <div className="text-xs uppercase text-muted-foreground dark:text-zinc-400">Players</div>
            </div>
            {collected !== undefined && (
                <div className="flex-1 min-w-[100px] p-4 bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
                    <div className="text-2xl font-bold text-green-500 dark:text-green-400 mb-1">
                        ${collected.toFixed(0)}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground dark:text-zinc-400">Collected</div>
                </div>
            )}
            {potAmount !== undefined && (
                <div className="flex-1 min-w-[100px] p-4 bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
                    <div className="text-2xl font-bold text-green-500 dark:text-green-400 mb-1">
                        ${potAmount.toFixed(0)}
                    </div>
                    <div className="text-xs uppercase text-muted-foreground dark:text-zinc-400">Pot</div>
                </div>
            )}
        </div>
    )
}

