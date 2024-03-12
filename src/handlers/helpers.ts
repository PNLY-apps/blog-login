import { Env } from "..";
import { OAuth2IdentifyUser, handleOauth } from "./discord";
import { createMemberByEmail, getGhostAuth, getMemberByEmail, getMemberImpersonationByEmail, GhostMember } from "./ghost";
const OAUTH2_AUTH_URI: string = 'https://discord.com/oauth2/authorize?client_id=1216308158038020137&response_type=code&redirect_uri=https%3A%2F%2Flogin.pnly.io&scope=identify+email&prompt=none'
const BANNED_USERS_THIS_IS_PUBLIC_TO_SHAME_YOU: string[] = ['170084968788262913']

export async function resolveSiteHit(
    request: Request,
    env: Env
): Promise<Response> {
    const REQUEST_URL = new URL(request.url)
    const CODE = REQUEST_URL.searchParams.get('code')
    if (CODE) {
        const OAUTH2_DATA = await handleOauth(
            env.DISCORD_SECRET,
            env.DISCORD_APP_ID,
            env.DISCORD_REDIRECT_URI,
            CODE
        )
        const USER_DATA = await OAuth2IdentifyUser(OAUTH2_DATA)
        if (!USER_DATA.email) {return Response.redirect('https://blog.pnly.io')}
        if (BANNED_USERS_THIS_IS_PUBLIC_TO_SHAME_YOU.includes(USER_DATA.id)) {return Response.redirect('https://blog.pnly.io')}
        const GHOST_AUTH = await getGhostAuth(
            env.ADMIN_USER,
            env.ADMIN_PASS
        )
        if (!GHOST_AUTH) {return Response.redirect('https://blog.pnly.io')}
        const GHOST_USER = await getMemberByEmail(
            GHOST_AUTH,
            USER_DATA.email
        )
        if (!GHOST_USER) {
            const NEW_GHOST_USER = await createMemberByEmail(
                GHOST_AUTH,
                USER_DATA.email,
                USER_DATA.global_name ?? USER_DATA.username
            )
            const REDIRECT = await getMemberImpersonationByEmail(
                GHOST_AUTH,
                USER_DATA.email
            )
            return Response.redirect(REDIRECT)
        }
        const REDIRECT = await getMemberImpersonationByEmail(
            GHOST_AUTH,
            USER_DATA.email
        )
        return Response.redirect(REDIRECT)
    }
    return Response.redirect(OAUTH2_AUTH_URI)
}