/**
 * Composio Action Wrapper
 *
 * Handles integrations with external services (Twitter, LinkedIn, GitHub)
 * via the Composio platform. Each function wraps a specific Composio action.
 *
 * Setup: Set COMPOSIO_API_KEY via `npx convex env set COMPOSIO_API_KEY <key>`
 */

interface ComposioConfig {
    apiKey: string;
    baseUrl: string;
}

function getConfig(): ComposioConfig {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) {
        throw new Error(
            "COMPOSIO_API_KEY not set. Add it via: npx convex env set COMPOSIO_API_KEY <key>"
        );
    }
    return {
        apiKey,
        baseUrl: "https://backend.composio.dev/api/v2",
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
            `${config.baseUrl}/connectedAccounts?entityId=${entityId}&integrationId=${integrationId}`,
            {
                headers: {
                    "x-api-key": config.apiKey,
                },
            }
        );

        if (!response.ok) {
            return { connected: false };
        }

        const data = (await response.json()) as { items?: Array<{ status: string; accountName?: string }> };
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
 */
export async function initiateConnection(
    entityId: string,
    integrationId: string,
    redirectUrl: string
): Promise<{ url: string; connectedAccountId: string }> {
    const config = getConfig();

    const response = await fetch(`${config.baseUrl}/connectedAccounts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.apiKey,
        },
        body: JSON.stringify({
            entityId,
            integrationId,
            redirectUri: redirectUrl,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to initiate connection: ${error}`);
    }

    return response.json() as Promise<{ url: string; connectedAccountId: string }>;
}

// ===========================
// Platform-specific actions
// ===========================

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
