import { Env } from "..";
import {RESTPostOAuth2AccessTokenResult, APIUser} from "discord-api-types/v10"

const DISCORD_API_BASE_URL: string = 'https://discord.com/api/v10'

export async function handleOauth(
    secret: string,
    client_id: string,
    redirect_uri: string,
    code: string
): Promise<RESTPostOAuth2AccessTokenResult> {
    const oauthParams = new URLSearchParams()
    oauthParams.append('client_id', client_id)
    oauthParams.append('client_secret', secret)
    oauthParams.append('grant_type', 'authorization_code')
    oauthParams.append('code', code)
    oauthParams.append('redirect_uri', redirect_uri)
  
    const oauthReq = await fetch(
        'https://discord.com/api/v10/oauth2/token',
        {
            method: 'POST',
            body: oauthParams,
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            }
        }
    )

    if (!oauthReq.ok) {
        console.warn(JSON.stringify(await oauthReq.json(), null, 2))
        throw new Error(`Discord API error, OAuth2: ${oauthReq.status}`)
    }

    const oauthData: RESTPostOAuth2AccessTokenResult = await oauthReq.json()

    return oauthData
}

export async function OAuth2IdentifyUser(
    tokenData: RESTPostOAuth2AccessTokenResult
): Promise<APIUser> {
    const userReq = await fetch(
        `https://discord.com/api/v10/users/@me`,
        {
            headers: {
                'content-type': 'application/json; charset=utf-8',
                authorization: `Bearer ${tokenData.access_token}`
            }
        }
    )

    const userData: APIUser = await userReq.json()

    return userData
}