import { InfiniteSlider } from '@/components/motion/infinite-slider'
import { ProgressiveBlur } from '@/components/motion/progressive-blur'
import { NetlifyLogo, CloudflareLogo, ConvexLogo, CoderabbitLogo, SentryLogo, AutumnLogo, FirecrawlLogo, TanstackLogo } from './logos';

const ITEMS = [ 
    { name: 'Netlify', href: 'https://netlify.com', src: NetlifyLogo },
    { name: 'Cloudflare', href: 'https://cloudflare.com', src: CloudflareLogo },
    { name: 'Convex', href: 'https://convex.dev', src: ConvexLogo },
    { name: 'Coderabbit', href: 'https://coderabbit.com', src: CoderabbitLogo },
    { name: 'Sentry', href: 'https://sentry.io', src: SentryLogo },
    { name: 'Autumn', href: 'https://autumn.dev', src: AutumnLogo },
    { name: 'Firecrawl', href: 'https://firecrawl.com', src: FirecrawlLogo },
    { name: 'Tanstack', href: 'https://tanstack.com', src: TanstackLogo },
] as const;

export const LogoCloud = () => {
    return (
        <section>
            <div className="group relative m-auto max-w-6xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="inline md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-sm">Built with</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
						{ITEMS.map((item) => {
							const LogoComponent = item.src;
							return (
								<a
									key={item.name}
									href={item.href}
									target="_blank"
									rel="noopener noreferrer"
									className="flex opacity-70 saturate-0 transition-opacity hover:opacity-100 hover:saturate-100"
								>
									<LogoComponent
										className="mx-auto h-8 w-auto"
									/>
								</a>
							);
						})}
                        </InfiniteSlider>

                        <div className="bg-linear-to-r from-transparent absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-transparent absolute inset-y-0 right-0 w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
