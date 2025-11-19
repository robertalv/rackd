declare module "https://edge.netlify.com" {
	export interface Context {
		ip?: string;
		cookies: {
			get(name: string): string | undefined;
			set(name: string, value: string, options?: {
				httpOnly?: boolean;
				secure?: boolean;
				sameSite?: "strict" | "lax" | "none";
				maxAge?: number;
				path?: string;
			}): void;
		};
		geo?: {
			city?: string;
			country?: string;
			subdivision?: string;
		};
	}
}

