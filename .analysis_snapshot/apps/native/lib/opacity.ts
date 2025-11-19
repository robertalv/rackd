/**
 * Global opacity values for consistent color usage across the app
 * These values are used as hex alpha channel suffixes (e.g., color + opacity.OPACITY_10)
 */
export const opacity = {
	/** 10% opacity - Very subtle borders and dividers */
	OPACITY_10: "1A",
	/** 20% opacity - Subtle backgrounds and borders */
	OPACITY_20: "33",
	/** 40% opacity - Medium visibility for icons and secondary elements */
	OPACITY_40: "66",
	/** 60% opacity - Good visibility for secondary text and icons */
	OPACITY_60: "99",
	/** 80% opacity - High visibility for labels and important secondary text */
	OPACITY_80: "CC",
	/** 90% opacity - Very high visibility, almost opaque */
	OPACITY_90: "E6",
} as const;

/**
 * Helper function to apply opacity to a color
 * @param color - The base color (hex or theme color)
 * @param opacityValue - The opacity value from the opacity object
 * @returns Color string with opacity appended
 */
export function withOpacity(color: string, opacityValue: string): string {
	return color + opacityValue;
}

