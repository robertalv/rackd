import { Mail, SendHorizonal, Trophy } from 'lucide-react'
import type { Variants } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/motion/text-effect'
import { AnimatedGroup } from '@/components/motion/animated-group'
import { LogoCloud } from '@/components/logo-cloud'
import { TournamentPreviewHeader } from '@/components/tournament-preview-header'
import { TournamentPreviewTabs } from '@/components/tournament-preview-tabs'
import { TournamentPreviewProgress } from '@/components/tournament-preview-progress'
import { TournamentPreviewDetails } from '@/components/tournament-preview-details'
import { TournamentPreviewStats } from '@/components/tournament-preview-stats'
import { TournamentPreviewMatchStatus } from '@/components/tournament-preview-match-status'
import { HeroPill } from '@/components/hero-pill'
import { IconFlame } from '@tabler/icons-react'
import { useState } from 'react'
import { useQuery, useMutation } from 'convex/react'
import { api } from '@rackd/backend/convex/_generated/api'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} satisfies { item: Variants }

export default function HeroSection() {
    const [email, setEmail] = useState('')
    const [isJoining, setIsJoining] = useState(false)
    const waitlistCount = useQuery(api.waitlist.count)
    const joinMutation = useMutation(api.waitlist.joinWaitlist)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || isJoining) return
        setIsJoining(true)
        try {
            await joinMutation({ email, source: 'Early Access' })
            setEmail('')
        } catch (error) {
            console.error('Failed to join waitlist:', error)
        } finally {
            setIsJoining(false)
        }
    }

    return (
        <>
            <main className="overflow-hidden [--color-primary-foreground:var(--color-white)] [--color-primary:var(--color-green-600)]">
                <section>
                    <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-12">
                        <div className="relative z-10 mx-auto max-w-4xl text-center">
                            <div className="mb-10">
                            <HeroPill 
                                icon={<IconFlame className="text-red-500 size-4" />}
                                text={<div className="gap-1"><span className="font-semibold">{waitlistCount?.total ?? 0}</span> people on waitlist</div>}
                            />
                            </div>
                            <TextEffect
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                as="h1"
                                className="text-balance text-5xl font-medium md:text-6xl">
                                Connect with Rackd
                            </TextEffect>
                            <TextEffect
                                per="line"
                                preset="fade-in-blur"
                                speedSegment={0.3}
                                delay={0.5}
                                as="p"
                                className="mx-auto mt-6 max-w-2xl text-pretty text-lg">
                                Find tournaments, connect with players, and discover billiard venues all in one place.
                            </TextEffect>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                                className="mt-12">
                                <form
                                    onSubmit={handleSubmit}
                                    className="mx-auto max-w-sm">
                                    <div className="bg-background has-[input:focus]:ring-muted relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2">
                                        <Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

                                        <input
                                            placeholder="Your mail address"
                                            className="h-12 w-full bg-transparent pl-12 focus:outline-none"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                        />

                                        <div className="md:pr-1.5 lg:pr-0">
                                            <Button
                                                aria-label="submit"
                                                size="sm"
                                                className="rounded-(--radius)"
                                                disabled={isJoining}
                                            >
                                                <span className="hidden md:block">{isJoining ? 'Joining...' : 'Join Waitlist'}</span>
                                                <SendHorizonal
                                                    className="relative mx-auto size-5 md:hidden"
                                                    strokeWidth={2}
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </form>

                                <div
                                    aria-hidden
                                    className="bg-radial from-primary/50 dark:from-primary/25 relative mx-auto mt-32 max-w-4xl to-transparent to-55% text-left">
                                    <div className="bg-background border-border/50 absolute inset-0 mx-auto w-[500px] -translate-x-3 -translate-y-12 rounded-3xl border p-2 [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:-translate-x-6">
                                        <div className="relative h-96 overflow-hidden rounded-3xl border p-2 pb-12 before:absolute before:inset-0 before:bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_6px)] before:opacity-50"></div>
                                    </div>
                                    <div className="bg-muted dark:bg-background/50 border-border/50 mx-auto w-[500px] translate-x-4 rounded-3xl border p-2 backdrop-blur-3xl [mask-image:linear-gradient(to_bottom,#000_50%,transparent_90%)] sm:translate-x-8">
                                        <div className="bg-background space-y-2 overflow-hidden rounded-3xl border p-2 shadow-xl dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-black dark:backdrop-blur-3xl">
                                            <AppComponent />

                                            <div className="bg-muted rounded-3xl p-4 pb-16 dark:bg-white/5"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] mix-blend-overlay [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:opacity-5"></div>
                                </div>
                            </AnimatedGroup>
                        </div>
                        <LogoCloud />
                    </div>
                </section>
            </main>
        </>
    )
}
const AppComponent = () => {
    const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'matches'>('overview')

    const handleTabChange = (tab: 'overview' | 'players' | 'matches') => {
        setActiveTab(tab)
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="">
                        {/* Tournament Flyer */}
                        <div className="overflow-hidden bg-muted/30 dark:bg-zinc-800/30 border border-border/30 dark:border-zinc-700 mb-4">
                            <div className="aspect-video bg-gradient-to-br from-green-500/20 to-blue-500/20 dark:from-green-500/10 dark:to-blue-500/10 flex items-center justify-center">
                                <div className="text-center">
                                    <Trophy className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-2" />
                                    <p className="text-xs text-muted-foreground dark:text-zinc-400">Tournament Flyer</p>
                                </div>
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="space-y-4">
                        <TournamentPreviewProgress
                            completionPercentage={75}
                            completedMatches={12}
                            totalMatches={16}
                            isLive={true}
                        />

                        {/* Tournament Details */}
                        <TournamentPreviewDetails
                            date="March 15, 2024"
                            venue="The Rack Billiards"
                            entryFee={50}
                            gameType="8-Ball"
                            tournamentType="single_elimination"
                        />

                        {/* Stats Cards */}
                        <TournamentPreviewStats
                            matches={16}
                            players={24}
                            collected={1200}
                            potAmount={1080}
                        />

                        {/* Match Status Summary */}
                        <TournamentPreviewMatchStatus completed={12} inProgress={2} upcoming={2} />
                        </div>
                    </div>
                )

            case 'players':
                return (
                    <div className="p-4 space-y-3">
                        <div className="text-sm font-semibold uppercase text-foreground dark:text-zinc-200 mb-3">
                            Registered Players (24)
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="p-3 rounded-lg bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700 flex items-center gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center shrink-0">
                                    <span className="text-sm font-semibold text-primary dark:text-primary-foreground">
                                        {String.fromCharCode(64 + i)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-foreground dark:text-zinc-200">
                                        Player {i}
                                    </div>
                                    <div className="text-xs text-muted-foreground dark:text-zinc-400">
                                        650 Fargo Rating
                                    </div>
                                </div>
                                <div className="px-2 py-1 rounded-full bg-green-500/20 dark:bg-green-500/30 text-xs font-medium text-green-600 dark:text-green-400">
                                    Checked In
                                </div>
                            </div>
                        ))}
                    </div>
                )

            case 'matches':
                return (
                    <div className="p-4 space-y-3">
                        <div className="text-sm font-semibold uppercase text-foreground dark:text-zinc-200 mb-3">
                            Matches (16)
                        </div>
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="p-3 rounded-lg bg-muted/50 dark:bg-zinc-800/50 border border-border/30 dark:border-zinc-700"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs uppercase text-muted-foreground dark:text-zinc-400">
                                        Round {i}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-green-500/20 dark:bg-green-500/30 text-xs font-medium text-green-600 dark:text-green-400">
                                        COMPLETED
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-foreground dark:text-zinc-200">
                                        Player {i * 2 - 1}
                                    </div>
                                    <div className="text-xs text-muted-foreground dark:text-zinc-400">vs</div>
                                    <div className="text-sm font-medium text-foreground dark:text-zinc-200">
                                        Player {i * 2}
                                    </div>
                                </div>
                                <div className="mt-2 text-right">
                                    <span className="text-lg font-bold text-primary dark:text-primary">
                                        7 - 5
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="relative rounded-3xl bg-background dark:bg-zinc-900 border border-border/50 dark:border-zinc-800 overflow-hidden">
            <TournamentPreviewHeader tournamentName="Spring Championship 2024" status="active" />
            <TournamentPreviewTabs activeTab={activeTab} onTabChange={handleTabChange} />
            {renderContent()}
        </div>
    )
}
