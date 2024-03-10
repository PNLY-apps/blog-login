const ADMIN_API_BASE_URL: string = 'https://blog.pnly.io/ghost/api/admin'

export interface GhostMember {
    "id": string,
    "uuid": string,
    "email": string,
    "name": string | null,
    "note": string | null,
    "geolocation": string | null,
    "created_at": string,
    "updated_at": string,
    "labels": [],
    "subscriptions": [],
    "avatar_image": string,
    "email_count": number,
    "email_opened_count": number,
    "email_open_rate": string | null,
    "status": string,
    "last_seen_at": string | null,
    "tiers": [],
    "newsletters": []
}

export async function getGhostAuth(
    username: string,
    password: string
): Promise<string | null> {
    const r = await fetch(
        `${ADMIN_API_BASE_URL}/session`,
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                'user-agent': 'PNLY Ghost API Worker (cloudflare 1.0)',
                origin: 'https://login.pnly.io'
            },
            body: JSON.stringify({
                username,
                password
            })
        }
    )
    return r.headers.get('set-cookie')
}

export async function getMemberByEmail(auth: string, email: string): Promise<GhostMember | undefined> {
    const response = await fetch(
        `${ADMIN_API_BASE_URL}/members?filter=email:${email}`,
        {
            headers: {
                cookie: auth,
                'content-type': 'application/json',
                'user-agent': 'PNLY Ghost API Worker (cloudflare 1.0)',
                origin: 'https://login.pnly.io'
            }
        }
    )
    if (!response.ok) {
        throw new Error(`[GHOST] ${response.url}: ${response.status} ${response.statusText}\n${await response.text()}`)
    }
    const responseJson: {members: GhostMember[]} = await response.json()
    return responseJson.members[0]
}

export async function createMemberByEmail(auth: string, email: string, name: string | undefined = undefined): Promise<GhostMember> {
    const response = await fetch(
        `${ADMIN_API_BASE_URL}/members?filter=email:${email}`,
        {
            headers: {
                cookie: auth,
                'content-type': 'application/json',
                'user-agent': 'PNLY Ghost API Worker (cloudflare 1.0)',
                origin: 'https://login.pnly.io'
            },
            method: 'POST',
            body: JSON.stringify({
                members: [{
                    email,
                    name
                }]
            })
        }
    )
    if (!response.ok) {
        throw new Error(`[GHOST] ${response.url}: ${response.status} ${response.statusText}\n${await response.text()}`)
    }
    const responseJson: {members: GhostMember[]} = await response.json()
    return responseJson.members[0]
}

export async function getMemberImpersonationByEmail(auth: string, email: string): Promise<string> {
    const member = await getMemberByEmail(auth, email)
    if (!member) {
        throw new Error('Member does not exist')
    }
    const response = await fetch(
        `${ADMIN_API_BASE_URL}/members/${member.id}/signin_urls`,
        {
            headers: {
                cookie: auth,
                'content-type': 'application/json',
                'user-agent': 'PNLY Ghost API Worker (cloudflare 1.0)',
                origin: 'https://login.pnly.io'
            }
        }
    )
    if (!response.ok) {
        throw new Error(`[GHOST] ${response.url}: ${response.status} ${response.statusText}\n${await response.text()}`)
    }
    const responseJson: {member_signin_urls: {url: string}[]} = await response.json()
    return responseJson.member_signin_urls[0].url
}