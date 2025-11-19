"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Logo({
	withLabel = true,
	className,
}: {
	className?: string;
	withLabel?: boolean;
}) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<span
			className={cn(
				"flex items-center font-bold lowercase tracking-tighter text-4xl text-foreground leading-none",
				className,
			)}
		>
			<img
				src="/logo.png"
				alt="rackd"
				width={40}
				height={40}
			/>
			{withLabel && (
				<span className="ml-1 hidden text-3xl tracking-tighter md:block">
					rackd
				</span>
			)}
		</span>
	);
}
