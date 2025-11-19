import { ArrowLeft } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface TournamentPreviewHeaderProps {
    tournamentName: string
    status: 'upcoming' | 'active' | 'completed'
}

export function TournamentPreviewHeader({ tournamentName, status }: TournamentPreviewHeaderProps) {
    const statusConfig = {
        upcoming: { label: 'Upcoming', bg: 'bg-muted', text: 'text-foreground' },
        active: { label: 'Active', bg: 'bg-primary', text: 'text-primary-foreground' },
        completed: { label: 'Completed', bg: 'bg-green-500', text: 'text-white' },
    }

    const config = statusConfig[status]

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 dark:border-zinc-800 bg-background dark:bg-zinc-900">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-1.5 hover:bg-muted dark:hover:bg-zinc-800 rounded-lg transition-colors shrink-0">
                    <ArrowLeft className="w-5 h-5 text-foreground dark:text-zinc-200" />
                </div>
                <span className="text-xl font-bold tracking-tighter text-foreground dark:text-zinc-100 truncate">
                    {tournamentName}
                </span>
            </div>
            <Label className={cn(`px-2 py-0.5 rounded-full ${config.bg} dark:bg-primary shrink-0`)}>
                <span className={`text-xs font-medium ${config.text} dark:text-primary-foreground`}>{config.label}</span>
            </Label>
        </div>
    )
}

