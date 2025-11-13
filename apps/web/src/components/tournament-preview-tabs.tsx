import { Grid3x3, Users, Gamepad2 } from 'lucide-react'

type TabMode = 'overview' | 'players' | 'matches'

interface Tab {
    mode: TabMode
    label: string
    icon: React.ReactNode
}

interface TournamentPreviewTabsProps {
    activeTab: TabMode
    onTabChange: (tab: TabMode) => void
}

export function TournamentPreviewTabs({ activeTab, onTabChange }: TournamentPreviewTabsProps) {
    const tabs: Tab[] = [
        { mode: 'overview', label: 'Overview', icon: <Grid3x3 className="w-4 h-4" /> },
        { mode: 'players', label: 'Players', icon: <Users className="w-4 h-4" /> },
        { mode: 'matches', label: 'Matches', icon: <Gamepad2 className="w-4 h-4" /> },
    ]

    return (
        <div className="border-b border-border/30 dark:border-zinc-800 bg-background dark:bg-zinc-900 overflow-x-auto">
            <div className="flex items-center gap-2 px-4 py-3.5">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.mode
                    return (
                        <button
                            key={tab.mode}
                            type="button"
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                onTabChange(tab.mode)
                            }}
                            className={`px-3 py-2 rounded-none border shrink-0 flex items-center justify-center transition-colors cursor-pointer relative z-10 ${
                                isActive
                                    ? 'bg-primary border-primary dark:bg-primary dark:border-primary'
                                    : 'bg-transparent border-border/30 dark:border-zinc-800 hover:bg-muted dark:hover:bg-zinc-800'
                            }`}
                        >
                            <div className={isActive ? 'text-primary-foreground' : 'text-foreground dark:text-zinc-300'}>
                                {tab.icon}
                            </div>
                            <span
                                className={`text-sm font-medium ml-2 ${
                                    isActive ? 'text-primary-foreground' : 'text-foreground dark:text-zinc-300'
                                }`}
                            >
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

