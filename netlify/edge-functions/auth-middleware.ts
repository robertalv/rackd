/// <reference path="./types.d.ts" />
import type { Context } from "https://edge.netlify.com";

export default async (request: Request, context: Context) => {
	const authToken = request.headers.get("Authorization")?.replace("Bearer ", "") ||
		context.cookies.get("auth-token");

	if (!authToken) {
		return new Response(null, {
			status: 200,
			headers: {
				"X-Auth-Status": "unauthenticated",
			},
		});
	}

	const newHeaders = new Headers(request.headers);
	newHeaders.set("X-Auth-Token", authToken);
	newHeaders.set("X-Auth-Status", "authenticated");

	return new Response(null, {
		status: 200,
		headers: {
			"X-Auth-Status": "authenticated",
		},
	});
};

