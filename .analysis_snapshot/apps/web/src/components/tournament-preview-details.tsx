import { Calendar, MapPin, DollarSign, Trophy } from 'lucide-react'

interface TournamentPreviewDetailsProps {
    date: string
    venue: string
    entryFee?: number
    gameType: string
    tournamentType: string
}

export function TournamentPreviewDetails({
    date,
    venue,
    entryFee,
    gameType,
    tournamentType,
}: TournamentPreviewDetailsProps) {
    return (
        <div className="p-4 bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700">
            <div className="text-sm font-semibold uppercase text-foreground dark:text-zinc-200 mb-3">
                Tournament Details
            </div>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-muted-foreground dark:text-zinc-400 shrink-0" />
                    <span className="text-sm text-foreground dark:text-zinc-200">{date}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-muted-foreground dark:text-zinc-400 shrink-0" />
                    <span className="text-sm text-foreground dark:text-zinc-200">{venue}</span>
                </div>
                {entryFee !== undefined && entryFee !== null && (
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-4.5 h-4.5 text-muted-foreground dark:text-zinc-400 shrink-0" />
                        <span className="text-sm text-foreground dark:text-zinc-200">${entryFee} entry fee</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Trophy className="w-4.5 h-4.5 text-muted-foreground dark:text-zinc-400 shrink-0" />
                    <span className="text-sm text-foreground dark:text-zinc-200">
                        {gameType} • {tournamentType.replace('_', ' ')}
                    </span>
                </div>
            </div>
        </div>
    )
}

