/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { resolveSiteHit } from "./handlers/helpers"

export interface Env {
	ADMIN_USER: string
	ADMIN_PASS: string
	DISCORD_SECRET: string
	DISCORD_APP_ID: string
	DISCORD_REDIRECT_URI: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		return await resolveSiteHit(
			request,
			env
		)
	},
};
