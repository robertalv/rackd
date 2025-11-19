"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@rackd/ui/components/avatar";
import { hasFlag } from 'country-flag-icons';
import { cn } from "@rackd/ui/lib/utils";

interface CountryFlagProps {
	countryCode: string;
	size?: "xs" | "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	xs: "w-4 h-4",
	sm: "w-5 h-5",
	md: "w-6 h-6",
	lg: "w-8 h-8",
};

// Convert 3-letter country codes to 2-letter codes for flag lookup
const COUNTRY_CODE_MAP: Record<string, string> = {
	'USA': 'US', 'DEU': 'DE', 'IRQ': 'IQ', 'TWN': 'TW', 'ESP': 'ES',
	'PHL': 'PH', 'SGP': 'SG', 'SCT': 'GB', 'ALB': 'AL', 'AUT': 'AT',
	'POL': 'PL', 'GRC': 'GR', 'JPN': 'JP', 'CHN': 'CN', 'NLD': 'NL',
	'CAN': 'CA', 'HKG': 'HK', 'HUN': 'HU', 'VNM': 'VN', 'BIH': 'BA',
	'FIN': 'FI', 'GBR': 'GB', 'RUS': 'RU', 'UKR': 'UA', 'DNK': 'DK',
	'SYR': 'SY', 'PER': 'PE', 'IDN': 'ID', 'CYP': 'CY', 'ITA': 'IT',
	'FRA': 'FR', 'BEL': 'BE', 'SWE': 'SE', 'NOR': 'NO', 'CZE': 'CZ',
	'SVK': 'SK', 'SVN': 'SI', 'HRV': 'HR', 'SRB': 'RS', 'MNE': 'ME',
	'MKD': 'MK', 'BGR': 'BG', 'ROU': 'RO', 'LTU': 'LT', 'LVA': 'LV',
	'EST': 'EE', 'BLR': 'BY', 'MDA': 'MD', 'GEO': 'GE', 'ARM': 'AM',
	'AZE': 'AZ', 'KAZ': 'KZ', 'UZB': 'UZ', 'TKM': 'TM', 'KGZ': 'KG',
	'TJK': 'TJ', 'MNG': 'MN', 'KOR': 'KR', 'PRK': 'KP', 'THA': 'TH',
	'MYS': 'MY', 'BRN': 'BN', 'LAO': 'LA', 'KHM': 'KH', 'MMR': 'MM',
};

/**
 * Country flag component in circular avatar
 * Displays a country flag icon based on country code (supports both 2-letter and 3-letter codes)
 */
export function CountryFlag({ countryCode, size = "md", className }: CountryFlagProps) {
	const [FlagComponent, setFlagComponent] = useState<React.ComponentType<any> | null>(null);

	useEffect(() => {
		const twoLetterCode = COUNTRY_CODE_MAP[countryCode] || countryCode;
		
		if (hasFlag(twoLetterCode.toUpperCase())) {
			import('country-flag-icons/react/3x2')
				.then((flags) => {
					const FlagComp = flags[twoLetterCode.toUpperCase() as keyof typeof flags];
					if (FlagComp) {
						setFlagComponent(() => FlagComp);
					}
				})
				.catch(() => {
					setFlagComponent(null);
				});
		}
	}, [countryCode]);

	const renderFallback = () => {
		if (FlagComponent) {
			return (
				<div className="w-full h-full overflow-hidden rounded-full">
					<FlagComponent className="w-full h-full object-cover scale-150" />
				</div>
			);
		}

		// Fallback to muted circle
		return (
			<div className="w-full h-full flex items-center justify-center bg-muted rounded-full">
				<span className="text-xs text-muted-foreground">{countryCode.slice(0, 2)}</span>
			</div>
		);
	};

	return (
		<Avatar className={cn(sizeClasses[size], className)}>
			<AvatarFallback className="border-0 p-0">
				{renderFallback()}
			</AvatarFallback>
		</Avatar>
	);
}




