/**
 * Composio Action Wrapper
 *
 * Handles integrations with external services (Twitter, LinkedIn, GitHub)
 * via the Composio platform. Each function wraps a specific Composio action.
 *
 * For MVP development: Uses Composio's sandbox mode for Twitter/LinkedIn
 * so you don't need your own developer accounts on those platforms.
 *
 * Setup: COMPOSIO_API_KEY is set via `npx convex env set COMPOSIO_API_KEY <key>`
 */

interface ComposioConfig {
    apiKey: string;
    baseUrl: string;
}

// Convex actions run in a Node.js-compatible environment that exposes process.env
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
 * Execute a Composio action.
 */
export async function executeAction(
    actionName: string,
    entityId: string,
    params: Record<string, unknown>
): Promise<unknown> {
    const config = getConfig();

    const response = await fetch(`${config.baseUrl}/actions/${actionName}/execute`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
        },
        body: JSON.stringify({
            entityId,
            input: params,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Composio action ${actionName} failed: ${error}`);
    }

    return response.json();
}

/**
 * Get the connection status for an entity's integration.
 */
export async function getConnectionStatus(
    entityId: string,
    integrationId: string
): Promise<{ connected: boolean; accountName?: string }> {
    const config = getConfig();

    try {
        const response = await fetch(
            `${config.baseUrl}/connected_accounts?entityId=${entityId}&integrationId=${integrationId}`,
            {
                headers: {
                    "x-api-key": config.apiKey,
                },
            }
        );

        if (!response.ok) {
            return { connected: false };
        }

        const data = (await response.json()) as {
            items?: Array<{ status: string; accountName?: string }>;
        };
        const activeConnection = data.items?.find(
            (item: { status: string }) => item.status === "ACTIVE"
        );

        return {
            connected: !!activeConnection,
            accountName: activeConnection?.accountName,
        };
    } catch {
        return { connected: false };
    }
}

/**
 * Initiate an OAuth connection for a user entity.
 *
 * For Twitter and LinkedIn, uses Composio's sandbox integrations
 * so you don't need your own developer accounts during MVP.
 * Pass useSandbox: true to use sandbox mode.
 */
export async function initiateConnection(
    entityId: string,
    integrationId: string,
    redirectUrl: string,
    options?: { useSandbox?: boolean }
): Promise<{ url: string; connectedAccountId: string }> {
    const config = getConfig();

    const body: Record<string, unknown> = {
        entityId,
        integrationId,
        redirectUri: redirectUrl,
    };

    // For sandbox mode, Composio provides pre-configured integrations
    // that don't require your own OAuth app credentials
    if (options?.useSandbox) {
        body.useComposioAuth = true;
    }

    const response = await fetch(`${config.baseUrl}/connected_accounts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to initiate connection: ${error}`);
    }

    return response.json() as Promise<{
        url: string;
        connectedAccountId: string;
    }>;
}

/**
 * Get available integrations from Composio.
 * Returns which integrations can be used (including sandbox ones).
 */
export async function getAvailableIntegrations(): Promise<unknown> {
    const config = getConfig();

    const response = await fetch(`${config.baseUrl}/integrations`, {
        headers: {
            "x-api-key": config.apiKey,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to get integrations: ${error}`);
    }

    return response.json();
}

// ===========================
// Platform-specific actions
// ===========================

/**
 * Integration IDs for Composio sandbox.
 * These use Composio's own OAuth apps so you don't need developer accounts.
 */
export const SANDBOX_INTEGRATIONS = {
    twitter: "twitter-sandbox",
    linkedin: "linkedin-sandbox",
    github: "github",
    gmail: "gmail",
} as const;

/**
 * Post a tweet via Composio.
 */
export async function postTweet(
    entityId: string,
    text: string
): Promise<unknown> {
    return executeAction("TWITTER_CREATION_OF_A_POST", entityId, {
        text,
    });
}

/**
 * Post to LinkedIn via Composio.
 */
export async function postLinkedIn(
    entityId: string,
    text: string
): Promise<unknown> {
    return executeAction("LINKEDIN_CREATE_POST", entityId, {
        text,
    });
}

/**
 * Get GitHub repo info via Composio.
 */
export async function getGithubRepo(
    entityId: string,
    owner: string,
    repo: string
): Promise<unknown> {
    return executeAction("GITHUB_GET_A_REPOSITORY", entityId, {
        owner,
        repo,
    });
}

/**
 * Get GitHub repo file tree via Composio.
 */
export async function getGithubTree(
    entityId: string,
    owner: string,
    repo: string,
    treeSha: string
): Promise<unknown> {
    return executeAction("GITHUB_GET_A_TREE", entityId, {
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
    entityId: string,
    owner: string,
    repo: string,
    path: string
): Promise<unknown> {
    return executeAction("GITHUB_GET_REPOSITORY_CONTENT", entityId, {
        owner,
        repo,
        path,
    });
}
