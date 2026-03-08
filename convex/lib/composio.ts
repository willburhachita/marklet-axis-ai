/**
 * Composio Action Wrapper — v3 API
 *
 * Uses Composio's v3 REST API to manage social account connections and tool execution.
 *
 * Terminology (v1/v2 → v3 migration):
 *   entityId       → user_id
 *   integrationId  → auth_config_id
 *   actions        → tools  (/actions/ → /tools/)
 *   connection     → connected_account
 *
 * Setup: COMPOSIO_API_KEY is set via `npx convex env set COMPOSIO_API_KEY <key>`
 *
 * Auth configs currently set up in this Composio account:
 *   LinkedIn : ac_s-grHJwSo8WU
 *   GitHub   : ac_XOr08sOQXi5j
 *   Gmail    : ac_RUVrooLG581Z
 *
 * NOTE: Twitter requires custom Twitter Developer App credentials.
 * To add Twitter support:
 *   1. Create a Twitter Developer App at https://developer.x.com/en/portal/dashboard
 *   2. Add a new Auth Config in your Composio dashboard for Twitter with those credentials
 *   3. Add the new auth config ID to AUTH_CONFIG_IDS below
 */

interface ComposioConfig {
    apiKey: string;
    baseUrl: string;
}

declare const process: { env: Record<string, string | undefined> };

function getConfig(): ComposioConfig {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
        throw new Error(
            "COMPOSIO_API_KEY not set. Add it via: npx convex env set COMPOSIO_API_KEY <key>"
        );
    }
    return {
        apiKey,
        baseUrl: "https://backend.composio.dev/api/v3",
    };
}

/**
 * Auth config IDs for Composio integrations.
 *
 * Fallback hardcoded values come from GET /api/v3/auth_configs on this account.
 * Override any of them with Convex env vars:
 *
 *   COMPOSIO_LINKEDIN_AUTH_CONFIG_ID  (default: ac_s-grHJwSo8WU)
 *   COMPOSIO_GITHUB_AUTH_CONFIG_ID    (default: ac_XOr08sOQXi5j)
 *   COMPOSIO_GMAIL_AUTH_CONFIG_ID     (default: ac_RUVrooLG581Z)
 *   COMPOSIO_TWITTER_AUTH_CONFIG_ID   (no default — requires your own Twitter Developer App)
 *
 * To add Twitter:
 *   1. Create a Twitter Developer App at https://developer.x.com/en/portal/dashboard
 *   2. Add callback URL: https://backend.composio.dev/api/v1/auth-apps/add
 *   3. Create an Auth Config in the Composio dashboard using your Client ID + Secret
 *   4. Run: npx convex env set COMPOSIO_TWITTER_AUTH_CONFIG_ID <auth-config-id>
 */
export function getAuthConfigId(platform: string): string | undefined {
    const map: Record<string, string | undefined> = {
        linkedin: process.env.COMPOSIO_LINKEDIN_AUTH_CONFIG_ID ?? "ac_s-grHJwSo8WU",
        github: process.env.COMPOSIO_GITHUB_AUTH_CONFIG_ID ?? "ac_XOr08sOQXi5j",
        gmail: process.env.COMPOSIO_GMAIL_AUTH_CONFIG_ID ?? "ac_RUVrooLG581Z",
        twitter: process.env.COMPOSIO_TWITTER_AUTH_CONFIG_ID,
    };
    return map[platform];
}

// Keep the static export for any code that still references it
export const AUTH_CONFIG_IDS = {
    linkedin: "ac_s-grHJwSo8WU",
    github: "ac_XOr08sOQXi5j",
    gmail: "ac_RUVrooLG581Z",
} as const;

/**
 * Execute a Composio tool (formerly "action" in v1/v2).
 *
 * v3 endpoint: POST /api/v3/tools/{tool_slug}/execute
 * v3 field:    user_id  (was entityId in v1/v2)
 */
export async function executeAction(
    toolName: string,
    userId: string,
    params: Record<string, unknown>
): Promise<unknown> {
    const config = getConfig();

    const response = await fetch(`${config.baseUrl}/tools/${toolName}/execute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
        },
        body: JSON.stringify({
            user_id: userId,
            input: params,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Composio tool ${toolName} failed: ${error}`);
    }

    return response.json();
}

/**
 * Get the connected account status for a user + auth config.
 *
 * v3 endpoint: GET /api/v3/connected_accounts?user_id=...&auth_config_id=...
 */
export async function getConnectionStatus(
    userId: string,
    authConfigId: string
): Promise<{ connected: boolean; accountName?: string }> {
    const config = getConfig();

    try {
        const response = await fetch(
            `${config.baseUrl}/connected_accounts?user_id=${encodeURIComponent(userId)}&auth_config_id=${encodeURIComponent(authConfigId)}`,
            {
                headers: {
                    "x-api-key": config.apiKey,
                },
            }
        );

        if (!response.ok) return { connected: false };

        const data = (await response.json()) as {
            items?: Array<{
                status: string;
                profile?: { display_name?: string; email?: string };
                user_id?: string;
            }>;
        };

        const active = data.items?.find((item) => item.status === "ACTIVE");

        return {
            connected: !!active,
            accountName:
                active?.profile?.display_name ||
                active?.profile?.email ||
                active?.user_id,
        };
    } catch {
        return { connected: false };
    }
}

/**
 * Initiate an OAuth connection for a user — returns a redirect URL.
 *
 * v3 endpoint: POST /api/v3/connected_accounts/link
 * Required fields:
 *   auth_config_id : the auth config ID (not integration ID)
 *   user_id        : identifies the user in Composio (was entityId)
 *   callback_url   : where to redirect after OAuth completes
 *
 * Returns:
 *   redirect_url          : send the user here to complete OAuth
 *   connected_account_id  : the account record being created
 */
export async function initiateConnection(
    userId: string,
    authConfigId: string,
    callbackUrl: string
): Promise<{ redirectUrl: string; connectedAccountId: string }> {
    const config = getConfig();

    const response = await fetch(`${config.baseUrl}/connected_accounts/link`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
        },
        body: JSON.stringify({
            auth_config_id: authConfigId,
            user_id: userId,
            callback_url: callbackUrl,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to initiate connection: ${error}`);
    }

    const data = (await response.json()) as {
        redirect_url: string;
        connected_account_id: string;
    };

    return {
        redirectUrl: data.redirect_url,
        connectedAccountId: data.connected_account_id,
    };
}

/**
 * Get available auth configs from Composio (for debugging/introspection).
 */
export async function getAvailableAuthConfigs(): Promise<unknown> {
    const config = getConfig();

    const response = await fetch(`${config.baseUrl}/auth_configs`, {
        headers: {
            "x-api-key": config.apiKey,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get auth configs: ${error}`);
    }

    return response.json();
}

// ===========================
// Platform-specific tools
// ===========================

/**
 * Post a tweet via Composio.
 * Requires a connected Twitter account for this user_id.
 */
export async function postTweet(
    userId: string,
    text: string
): Promise<unknown> {
    return executeAction("TWITTER_CREATION_OF_A_POST", userId, { text });
}

/**
 * Post to LinkedIn via Composio.
 */
export async function postLinkedIn(
    userId: string,
    text: string
): Promise<unknown> {
    return executeAction("LINKEDIN_CREATE_POST", userId, { text });
}

/**
 * Get GitHub repo info via Composio.
 */
export async function getGithubRepo(
    userId: string,
    owner: string,
    repo: string
): Promise<unknown> {
    return executeAction("GITHUB_GET_A_REPOSITORY", userId, { owner, repo });
}

/**
 * Get GitHub repo file tree via Composio.
 */
export async function getGithubTree(
    userId: string,
    owner: string,
    repo: string,
    treeSha: string
): Promise<unknown> {
    return executeAction("GITHUB_GET_A_TREE", userId, {
        owner,
        repo,
        tree_sha: treeSha,
        recursive: "true",
    });
}

/**
 * Get a file's contents from a GitHub repo via Composio.
 */
export async function getGithubFileContent(
    userId: string,
    owner: string,
    repo: string,
    path: string
): Promise<unknown> {
    return executeAction("GITHUB_GET_REPOSITORY_CONTENT", userId, {
        owner,
        repo,
        path,
    });
}
