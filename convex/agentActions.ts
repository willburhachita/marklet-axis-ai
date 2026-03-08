/**
 * Agent Actions — Server-side Convex actions
 *
 * These run on the Convex server and can make external API calls
 * (LLM, Composio, etc.). Each action creates a log entry, calls
 * the appropriate service, stores results, and logs the activity.
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

declare const process: { env: Record<string, string | undefined> };
import { generateJSON, generateText, generateImage } from "./lib/llm";
import {
    STRATEGY_AGENT_PROMPT,
    CONTENT_AGENT_PROMPT,
    LAUNCH_AGENT_PROMPT,
    CODEBASE_AGENT_PROMPT,
    LEGAL_AGENT_PROMPT,
    IDENTITY_NAME_PROMPT,
    IDENTITY_DESC_PROMPT,
    LOGO_BRIEF_PROMPT,
} from "./lib/prompts";

/**
 * Generate a full marketing strategy from the app profile.
 */
export const generateStrategy = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        // Start execution log
        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "strategy",
            input: "Generate full marketing strategy",
        });

        try {
            // Get app profile
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            // Pull in codebase analysis for deeply rooted data
            const analysis = await ctx.runQuery(api.codebaseAnalysis.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const productContext = buildProductContext(profile, analysis);

            // Build user prompt from profile data
            const userPrompt = `Generate a marketing strategy for this app:
        
${productContext}

Additionally, consider the following metadata:
Platforms: ${profile.platforms.join(", ")}
Region: ${profile.region}
Stage: ${profile.stage}
Monetization: ${profile.monetization}
${profile.appUrl ? `App URL: ${profile.appUrl}` : ""}
${profile.competitors?.length ? `Competitors: ${profile.competitors.join(", ")}` : ""}`;

            // Call LLM
            const strategy = await generateJSON(STRATEGY_AGENT_PROMPT, userPrompt);

            // Save strategy
            await ctx.runMutation(api.strategies.save, {
                appProfileId: args.appProfileId,
                ...(strategy as Record<string, unknown>),
            } as Parameters<typeof api.strategies.save>[0]);

            // Log activity
            await ctx.runMutation(api.activities.log, {
                userId: args.userId,
                agentType: "strategy",
                action: "generate_strategy",
                description: `Strategy Agent generated marketing strategy for ${profile.appName}`,
            });

            // Complete execution log
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: "Strategy generated successfully",
                status: "completed",
                duration: Date.now() - startTime,
            });

            return { success: true };
        } catch (error) {
            const msg = String(error);
            const isQuota = msg.includes("quota") || msg.includes("429") || msg.includes("Too Many Requests");
            const friendlyMsg = isQuota
                ? "AI quota exceeded — please wait a few minutes and try again."
                : msg;

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: friendlyMsg,
                status: "failed",
                duration: Date.now() - startTime,
            });

            const errorMsg = isQuota ? "AI quota exceeded — try again in a few minutes." : msg;
            return { success: false, error: errorMsg, isQuotaError: isQuota };
        }
    },
});

/**
 * Tweak the tone of the existing strategy.
 */
export const tweakTone = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();
        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "strategy",
            input: "Tweak marketing tone",
        });

        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, { profileId: args.appProfileId });
            if (!profile) throw new Error("Profile not found");
            const existing = await ctx.runQuery(api.strategies.getByProfile, { appProfileId: args.appProfileId });
            if (!existing) throw new Error("Strategy not found");

            const tweakPrompt = `You are a branding expert. We need to tweak the tone of this product's strategy to make it more bold, punchy, and distinct.
            
Product: ${profile.appName}
Current Positioning: ${existing.positioning}
Current Tone: ${existing.brandVoice.tone}

Return ONLY a JSON object with this structure:
{
  "positioning": "Rewritten 2-3 sentence positioning statement that is bolder",
  "brandVoice": {
    "tone": "New description of the bolder tone",
    "personality": "New description of personality",
    "doList": ["Do 1", "Do 2"],
    "dontList": ["Don't 1", "Don't 2"]
  }
}
IMPORTANT: Respond with valid JSON only.`;

            const tweaked = await generateJSON<{
                positioning: string;
                brandVoice: any;
            }>("You are a branding expert.", tweakPrompt, { temperature: 0.9 });

            await ctx.runMutation(api.strategies.save, {
                ...existing,
                positioning: tweaked.positioning,
                brandVoice: tweaked.brandVoice,
            } as Parameters<typeof api.strategies.save>[0]);

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId, output: "Tone tweaked", status: "completed", duration: Date.now() - startTime,
            });

            return { success: true };
        } catch (error) {
            const msg = String(error);
            await ctx.runMutation(api.agentLogs.completeExecution, { logId, output: msg, status: "failed", duration: Date.now() - startTime });
            return { success: false, error: msg };
        }
    }
});

/**
 * Generate execution steps (roadmap) based on confirmed positioning.
 */
export const generateExecutionSteps = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();
        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "strategy",
            input: "Generate Execution Steps based on confirmed positioning",
        });

        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, { profileId: args.appProfileId });
            if (!profile) throw new Error("Profile not found");
            const existing = await ctx.runQuery(api.strategies.getByProfile, { appProfileId: args.appProfileId });
            if (!existing) throw new Error("Strategy not found. Confirm positioning first.");

            const roadmapPrompt = `You are an execution strategist. The user has confirmed the marketing positioning for their product. Create a concrete, 4-step execution roadmap based on this data.
            
Product: ${profile.appName}
Positioning: ${existing.positioning}
Tone: ${existing.brandVoice.tone}
Audience: ${profile.targetAudience}

Return ONLY a JSON object with this structure:
{
  "launchRoadmap": [
    { "week": 1, "title": "Step 1: Foundational assets", "tasks": ["Task A", "Task B"] },
    { "week": 2, "title": "Step 2: Teaser Campaign", "tasks": ["Task C", "Task D"] },
    { "week": 3, "title": "Step 3: Launch Day", "tasks": ["Task E", "Task F"] },
    { "week": 4, "title": "Step 4: Post-Launch Momentum", "tasks": ["Task G", "Task H"] }
  ]
}
IMPORTANT: Make tasks hyper-specific to the product. Limit tasks to 3-5 per step. Valid JSON only.`;

            const generated = await generateJSON<{ launchRoadmap: any }>("You are an execution strategist.", roadmapPrompt);

            await ctx.runMutation(api.strategies.save, {
                ...existing,
                launchRoadmap: generated.launchRoadmap,
            } as Parameters<typeof api.strategies.save>[0]);

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId, output: "Execution steps generated", status: "completed", duration: Date.now() - startTime,
            });

            return { success: true };
        } catch (error) {
            const msg = String(error);
            await ctx.runMutation(api.agentLogs.completeExecution, { logId, output: msg, status: "failed", duration: Date.now() - startTime });
            return { success: false, error: msg };
        }
    }
});

/**
 * Refine execution steps based on user feedback.
 */
export const refineExecutionSteps = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
        feedback: v.string(),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();
        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "strategy",
            input: `Refining execution steps: "${args.feedback}"`,
        });

        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, { profileId: args.appProfileId });
            if (!profile) throw new Error("Profile not found");
            const existing = await ctx.runQuery(api.strategies.getByProfile, { appProfileId: args.appProfileId });
            if (!existing) throw new Error("No strategy found. Confirm positioning first.");

            const currentSteps = JSON.stringify(existing.launchRoadmap ?? [], null, 2);

            const refinePrompt = `You are an execution strategist. The user has reviewed their 4-step execution roadmap and provided feedback.

Product: ${profile.appName}
Positioning: ${existing.positioning}
Audience: ${profile.targetAudience}

Current Roadmap:
${currentSteps}

User Feedback: "${args.feedback}"

Revise the roadmap based on the user's feedback while keeping the overall structure (4 steps).
Return ONLY a JSON object with this structure:
{
  "launchRoadmap": [
    { "week": 1, "title": "Step 1: ...", "tasks": ["Task A", "Task B"] },
    { "week": 2, "title": "Step 2: ...", "tasks": ["Task C", "Task D"] },
    { "week": 3, "title": "Step 3: ...", "tasks": ["Task E", "Task F"] },
    { "week": 4, "title": "Step 4: ...", "tasks": ["Task G", "Task H"] }
  ]
}
IMPORTANT: Incorporate the feedback directly. Keep tasks hyper-specific. Valid JSON only.`;

            const refined = await generateJSON<{ launchRoadmap: any }>("You are an execution strategist.", refinePrompt, { temperature: 0.8 });

            await ctx.runMutation(api.strategies.save, {
                ...existing,
                launchRoadmap: refined.launchRoadmap,
            } as Parameters<typeof api.strategies.save>[0]);

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId, output: "Execution steps refined", status: "completed", duration: Date.now() - startTime,
            });

            return { success: true };
        } catch (error) {
            const msg = String(error);
            await ctx.runMutation(api.agentLogs.completeExecution, { logId, output: msg, status: "failed", duration: Date.now() - startTime });
            return { success: false, error: msg };
        }
    }
});

/**
 * Initiate a network account connection via Composio OAuth (v3 API).
 * Returns a redirect URL and the connectedAccountId for the callback to use.
 *
 * Auth config IDs are loaded from Convex env vars (see composio.ts).
 * To add Twitter: set COMPOSIO_TWITTER_AUTH_CONFIG_ID in Convex env.
 */
export const initiateNetworkConnection = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
        platform: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; url?: string; connectedAccountId?: string; error?: string }> => {
        try {
            const { initiateConnection, getAuthConfigId } = await import("./lib/composio");

            const authConfigId = getAuthConfigId(args.platform);
            if (!authConfigId) {
                throw new Error(
                    `${args.platform} integration is not configured. ` +
                    `Set COMPOSIO_${args.platform.toUpperCase()}_AUTH_CONFIG_ID in Convex env vars.`
                );
            }

            const composioUserId = `user_${args.userId}`;
            const siteUrl = process.env.SITE_URL || "http://localhost:5173";
            const callbackUrl = `${siteUrl}/integrations/callback?platform=${args.platform}`;

            const { redirectUrl, connectedAccountId } = await initiateConnection(
                composioUserId,
                authConfigId,
                callbackUrl
            );

            return { success: true, url: redirectUrl, connectedAccountId };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }
});

/**
 * Verify a Composio OAuth connection completed successfully and save it.
 * Called from IntegrationsCallback after the user returns from OAuth.
 */
export const verifyAndSaveConnection = action({
    args: {
        userId: v.id("users"),
        platform: v.string(),
        connectedAccountId: v.string(),
    },
    handler: async (ctx, args): Promise<{ success: boolean; accountName?: string; error?: string }> => {
        try {
            const { getConnectionStatus, getAuthConfigId } = await import("./lib/composio");

            const authConfigId = getAuthConfigId(args.platform);
            if (!authConfigId) {
                throw new Error(`Unknown platform: ${args.platform}`);
            }

            const composioUserId = `user_${args.userId}`;
            const status = await getConnectionStatus(composioUserId, authConfigId);

            if (!status.connected) {
                return { success: false, error: "Connection not active. Please try connecting again." };
            }

            // Upsert to socialAccounts table
            await ctx.runMutation(api.socialAccounts.connect, {
                userId: args.userId,
                platform: args.platform,
                accountName: status.accountName || args.platform,
                composioEntityId: composioUserId,
            });

            // Activity log
            await ctx.runMutation(api.activities.log, {
                userId: args.userId,
                agentType: "integration",
                action: "connect_account",
                description: `Connected ${args.platform}${status.accountName ? `: @${status.accountName}` : ""}`,
                metadata: { platform: args.platform, accountName: status.accountName ?? null },
            });

            return { success: true, accountName: status.accountName };
        } catch (error) {
            return { success: false, error: String(error) };
        }
    }
});

/**
 * Generate a single content piece.

 */
export const generateContent = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
        contentType: v.string(),
        platform: v.string(),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "content",
            input: `Generate ${args.contentType} for ${args.platform}`,
        });

        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            // Get strategy for context
            const strategy = await ctx.runQuery(api.strategies.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const userPrompt = `Generate a ${args.contentType.replace(/_/g, " ")} for ${args.platform}.

App Name: ${profile.appName}
Description: ${profile.description}
Target Audience: ${profile.targetAudience}
Stage: ${profile.stage}
${strategy ? `Positioning: ${strategy.positioning}` : ""}
${strategy ? `Brand Tone: ${strategy.brandVoice.tone}` : ""}`;

            const content = await generateJSON<{
                title: string;
                body: string;
                type: string;
                platform: string;
            }>(CONTENT_AGENT_PROMPT, userPrompt);

            // Save content
            const contentId = await ctx.runMutation(api.contents.save, {
                appProfileId: args.appProfileId,
                type: args.contentType,
                title: content.title,
                body: content.body,
                platform: args.platform,
                status: "draft",
            });

            // Log activity
            await ctx.runMutation(api.activities.log, {
                userId: args.userId,
                agentType: "content",
                action: "generate_content",
                description: `Content Agent generated ${args.contentType.replace(/_/g, " ")} — "${content.title}"`,
            });

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: `Generated "${content.title}"`,
                status: "completed",
                duration: Date.now() - startTime,
            });

            return { success: true, contentId };
        } catch (error) {
            const msg = String(error);
            const isQuota = msg.includes("quota") || msg.includes("429") || msg.includes("Too Many Requests");
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: isQuota ? "AI quota exceeded — try again in a few minutes." : msg,
                status: "failed",
                duration: Date.now() - startTime,
            });
            return { success: false, error: isQuota ? "AI quota exceeded — try again in a few minutes." : msg, isQuotaError: isQuota };
        }
    },
});

/**
 * Generate all launch kit assets.
 */
export const generateLaunchKit = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "launch",
            input: "Generate all launch assets",
        });

        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            const strategy = await ctx.runQuery(api.strategies.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const assetTypes = [
                "product_hunt",
                "hacker_news",
                "press_email",
                "twitter_launch",
                "linkedin_launch",
                "betalist",
            ];

            for (const assetType of assetTypes) {
                const userPrompt = `Generate a ${assetType.replace(/_/g, " ")} launch asset.

App Name: ${profile.appName}
Description: ${profile.description}
Target Audience: ${profile.targetAudience}
${strategy ? `Positioning: ${strategy.positioning}` : ""}
${strategy ? `Key Differentiators: ${strategy.differentiators.join(", ")}` : ""}

Asset type: ${assetType}`;

                const asset = await generateJSON<{
                    title: string;
                    body: string;
                    assetType: string;
                }>(LAUNCH_AGENT_PROMPT, userPrompt);

                await ctx.runMutation(api.launchAssets.save, {
                    appProfileId: args.appProfileId,
                    assetType,
                    title: asset.title,
                    body: asset.body,
                    status: "draft",
                });
            }

            await ctx.runMutation(api.activities.log, {
                userId: args.userId,
                agentType: "launch",
                action: "generate_launch_kit",
                description: `Launch Agent generated ${assetTypes.length} launch assets for ${profile.appName}`,
            });

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: `Generated ${assetTypes.length} launch assets`,
                status: "completed",
                duration: Date.now() - startTime,
            });

            return { success: true };
        } catch (error) {
            const msg = String(error);
            const isQuota = msg.includes("quota") || msg.includes("429") || msg.includes("Too Many Requests");
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: isQuota ? "AI quota exceeded — try again in a few minutes." : msg,
                status: "failed",
                duration: Date.now() - startTime,
            });
            return { success: false, error: isQuota ? "AI quota exceeded — try again in a few minutes." : msg, isQuotaError: isQuota };
        }
    },
});

/**
 * Generate a legal document.
 */
export const generateLegalDocument = action({
    args: {
        appProfileId: v.id("appProfiles"),
        userId: v.id("users"),
        documentType: v.string(),
    },
    handler: async (ctx, args) => {
        const startTime = Date.now();

        const logId = await ctx.runMutation(api.agentLogs.startExecution, {
            appProfileId: args.appProfileId,
            agentType: "legal",
            input: `Generate ${args.documentType}`,
        });

        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            // Get codebase analysis for legal context
            const analysis = await ctx.runQuery(api.codebaseAnalysis.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const docTypeLabel = args.documentType.replace(/_/g, " ");
            const userPrompt = `Generate a ${docTypeLabel} for:

App Name: ${profile.appName}
Description: ${profile.description}
Region: ${profile.region}
${analysis ? `Tech Stack: ${analysis.techStack.join(", ")}` : ""}
${analysis ? `Legal Requirements: ${JSON.stringify(analysis.legalRequirements)}` : ""}

The current date is ${new Date().toISOString().split("T")[0]}.`;

            const body = await generateText(LEGAL_AGENT_PROMPT, userPrompt);

            // Save resource
            const title =
                args.documentType === "privacy_policy"
                    ? "Privacy Policy"
                    : args.documentType === "terms_of_service"
                        ? "Terms of Service"
                        : args.documentType === "cookie_policy"
                            ? "Cookie Policy"
                            : args.documentType === "gdpr_compliance"
                                ? "GDPR Compliance"
                                : args.documentType === "ccpa_compliance"
                                    ? "CCPA Compliance"
                                    : docTypeLabel;

            await ctx.runMutation(api.resources.save, {
                appProfileId: args.appProfileId,
                type: args.documentType,
                title,
                body,
                category: "legal",
                status: "draft",
                generatedBy: "legal_agent",
            });

            await ctx.runMutation(api.activities.log, {
                userId: args.userId,
                agentType: "legal",
                action: "generate_legal",
                description: `Legal Agent generated ${title}`,
            });

            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: `Generated ${title}`,
                status: "completed",
                duration: Date.now() - startTime,
            });

            return { success: true };
        } catch (error) {
            const msg = String(error);
            const isQuota = msg.includes("quota") || msg.includes("429") || msg.includes("Too Many Requests");
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: isQuota ? "AI quota exceeded — try again in a few minutes." : msg,
                status: "failed",
                duration: Date.now() - startTime,
            });
            return { success: false, error: isQuota ? "AI quota exceeded — try again in a few minutes." : msg, isQuotaError: isQuota };
        }
    },
});

/**
 * Post content to a social platform via Composio.
 */
export const postToSocial = action({
    args: {
        contentId: v.id("contents"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const content = await ctx.runQuery(api.contents.getById, {
            contentId: args.contentId,
        });
        if (!content) throw new Error("Content not found");

        // Get the user's social accounts
        const accounts = await ctx.runQuery(api.socialAccounts.getByUser, {
            userId: args.userId,
        });

        const account = accounts.find(
            (a: any) => a.platform === content.platform && a.isActive
        );
        if (!account) {
            throw new Error(
                `No connected ${content.platform} account found. Connect it in Settings.`
            );
        }

        try {
            // Import dynamically to avoid issues when Composio isn't configured
            const { postTweet, postLinkedIn } = await import("./lib/composio");

            // composioUserId must match what was used during initiateNetworkConnection
            const composioUserId = `user_${args.userId}`;
            let result: unknown;
            if (content.platform === "twitter") {
                result = await postTweet(composioUserId, content.body);
            } else if (content.platform === "linkedin") {
                result = await postLinkedIn(composioUserId, content.body);
            } else {
                throw new Error(`Posting to ${content.platform} is not yet supported`);
            }

            // Mark as posted
            await ctx.runMutation(api.contents.updateStatus, {
                contentId: args.contentId,
                status: "posted",
                postedAt: Date.now(),
            });

            // Log activity
            await ctx.runMutation(api.activities.log, {
                userId: args.userId,
                agentType: "content",
                action: "post_content",
                description: `Content posted to ${content.platform}: "${content.title}"`,
                metadata: result,
            });

            return { success: true };
        } catch (error) {
            // Mark as failed
            await ctx.runMutation(api.contents.updateStatus, {
                contentId: args.contentId,
                status: "failed",
            });
            throw error;
        }
    },
});

// ===========================
// Identity Generation Actions
// ===========================

/**
 * Build a rich context string from the profile + codebase analysis.
 * This feeds into every identity prompt so the AI understands the REAL product.
 */
function buildProductContext(
    profile: {
        appName: string;
        description: string;
        targetAudience: string;
        platforms: string[];
        region: string;
        stage: string;
        monetization: string;
        appUrl?: string;
        competitors?: string[];
    },
    analysis?: {
        techStack: string[];
        features: Array<{ name: string; description: string; category: string }>;
        readmeContent?: string;
        dependencies?: Array<{ name: string; version: string; type: string }>;
    } | null
): string {
    let ctx = `Product Profile:
- Current Name: ${profile.appName}
- Current Description: ${profile.description}
- Target Audience: ${profile.targetAudience}
- Platforms: ${profile.platforms.join(", ") || "Not specified"}
- Region: ${profile.region}
- Stage: ${profile.stage}
- Monetization: ${profile.monetization}
${profile.appUrl ? `- URL: ${profile.appUrl}` : ""}
${profile.competitors?.length ? `- Known Competitors: ${profile.competitors.join(", ")}` : ""}`;

    if (analysis) {
        ctx += `\n\nCodebase Intelligence:`;
        if (analysis.techStack.length > 0) {
            ctx += `\n- Tech Stack: ${analysis.techStack.join(", ")}`;
        }
        if (analysis.features.length > 0) {
            const coreFeatures = analysis.features
                .filter((f) => f.category === "core")
                .slice(0, 5);
            const allFeatures =
                coreFeatures.length > 0 ? coreFeatures : analysis.features.slice(0, 5);
            ctx += `\n- Key Features:\n${allFeatures.map((f) => `  • ${f.name}: ${f.description}`).join("\n")}`;
        }
        if (analysis.readmeContent) {
            // Truncate README to keep prompt reasonable
            const readme = analysis.readmeContent.slice(0, 800);
            ctx += `\n- README Excerpt:\n${readme}`;
        }
    }

    return ctx;
}

/** Creative lenses rotated per call so the LLM approaches naming from a fresh angle each time */
const NAME_CREATIVE_ANGLES = [
    "Think like a Silicon Valley VC pitching this at a Demo Day — what name makes investors lean forward?",
    "Think metaphorically: pick a name inspired by nature, physics, or mythology that captures the product's core motion or power.",
    "Think like a Gen Z founder: short, bold, slightly abstract — a word that doesn't exist yet or a surprising compound (e.g. Figma, Vercel, Supabase).",
    "Think emotionally: what feeling does this product create in the user? Name it after that feeling or transformation.",
    "Think like a luxury brand: clean, prestigious, one or two syllables, timeless (think Stripe, Linear, Arc).",
    "Think laterally: what is the OPPOSITE of how you'd expect this product to be named? Surprise the user.",
    "Think globally: a name that works in English but also sounds powerful or positive in other languages.",
    "Think culturally: a reference to a historical figure, concept, or place that the target audience would immediately connect with.",
];

/**
 * Generate a smart, marketing-ready app name suggestion.
 */
export const generateIdentityName = action({
    args: {
        appProfileId: v.id("appProfiles"),
        previousNames: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args): Promise<{ success: boolean; name?: string; rationale?: string; error?: string }> => {
        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            const analysis = await ctx.runQuery(api.codebaseAnalysis.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const productContext = buildProductContext(profile, analysis);

            // Pick a rotating creative angle based on how many names already exist
            const previousNames = args.previousNames ?? [];
            const angleIndex = previousNames.length % NAME_CREATIVE_ANGLES.length;
            const creativeAngle = NAME_CREATIVE_ANGLES[angleIndex];

            const avoidClause = previousNames.length > 0
                ? `\n\nIMPORTANT — Names already suggested (DO NOT repeat or use variations of these):\n${previousNames.map(n => `  - "${n}"`).join("\n")}`
                : "";

            const userPrompt = `${productContext}${avoidClause}

Creative direction for THIS suggestion: ${creativeAngle}

Generate ONE fresh product name using the creative direction above. It must be completely different in style, feel, and structure from any previously suggested names. The name should feel like it belongs on Product Hunt's front page.`;

            const result = await generateJSON<{ name: string; rationale: string }>(
                IDENTITY_NAME_PROMPT,
                userPrompt,
                { temperature: 0.95 }
            );

            return { success: true, name: result.name, rationale: result.rationale };
        } catch (error) {
            const msg = String(error);
            return { success: false, error: msg };
        }
    },
});

/** Creative lenses for description copy — different positioning angles per call */
const DESC_CREATIVE_ANGLES = [
    { angle: "pain-first", instruction: "Open with the painful status quo the user lives in today, then position the product as the escape. Make the problem visceral before introducing the solution." },
    { angle: "outcome-first", instruction: "Lead with the best-case future state the user unlocks. Paint the 'after' picture first, then explain what makes it possible." },
    { angle: "challenger", instruction: "Position this as the bold alternative to how everyone else in the space does it. Use 'Unlike...' or 'Finally...' framing. Make it feel like a movement." },
    { angle: "social-proof-forward", instruction: "Write as if the product already has raving fans. Reference the TYPE of people who use it and what they achieve. Make readers want to be in that group." },
    { angle: "simplicity", instruction: "Emphasize radical simplicity and speed. What used to take hours now takes seconds. Focus on the friction that disappears." },
    { angle: "authority", instruction: "Write with quiet confidence. No hype — just precise, assured language that signals deep expertise. Let the capability speak for itself." },
    { angle: "storytelling", instruction: "Start with a micro-story or scenario: a specific type of user in a specific moment discovering why they need this. Make it cinematic in 2-3 sentences." },
    { angle: "aspiration", instruction: "Appeal to identity: who does the user become by using this product? What does it say about them? Make using this feel like an upgrade to their professional self." },
];

/**
 * Generate a compelling, conversion-focused product description.
 */
export const generateIdentityDesc = action({
    args: {
        appProfileId: v.id("appProfiles"),
        currentName: v.optional(v.string()),
        previousDescriptions: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args): Promise<{ success: boolean; description?: string; hook?: string; error?: string }> => {
        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            const analysis = await ctx.runQuery(api.codebaseAnalysis.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const productContext = buildProductContext(profile, analysis);
            const nameToUse = args.currentName || profile.appName;

            // Pick a rotating creative angle
            const previousDescs = args.previousDescriptions ?? [];
            const angleIndex = previousDescs.length % DESC_CREATIVE_ANGLES.length;
            const { angle, instruction } = DESC_CREATIVE_ANGLES[angleIndex];

            const avoidClause = previousDescs.length > 0
                ? `\n\nIMPORTANT — Descriptions already written (DO NOT repeat these ideas or phrasings):\n${previousDescs.map((d, i) => `  ${i + 1}. "${d.slice(0, 120)}..."`).join("\n")}`
                : "";

            const userPrompt = `${productContext}${avoidClause}

The product is called "${nameToUse}".
Copywriting style for THIS variation: [${angle.toUpperCase()}] — ${instruction}

Write a completely fresh description using this specific angle. It must feel structurally and tonally distinct from any previous descriptions. Target audience: ${profile.targetAudience || "tech-savvy professionals"}.`;

            const result = await generateJSON<{ description: string; hook: string }>(
                IDENTITY_DESC_PROMPT,
                userPrompt,
                { temperature: 0.85 }
            );

            return { success: true, description: result.description, hook: result.hook };
        } catch (error) {
            const msg = String(error);
            return { success: false, error: msg };
        }
    },
});

/** Visual design directions that rotate per regeneration — each produces a fundamentally different logo aesthetic */
const LOGO_DESIGN_DIRECTIONS = [
    {
        style: "glassmorphism icon",
        directive: "Design a frosted glass icon with layered translucent geometric shapes, subtle inner glow, and a smooth gradient background. Think Apple Vision Pro aesthetic — premium, depth-forward, luminous.",
        colorHint: "Deep navy to violet gradient with glowing accent highlights (electric blue or mint)",
    },
    {
        style: "bold geometric mark",
        directive: "Design a strong, symmetrical geometric mark — think negative space cut from a solid shape. Use the core concept of the product and reduce it to its purest geometric abstraction. Inspired by logos like Mitsubishi, Target, FedEx's hidden arrow.",
        colorHint: "One bold hero color on white: deep indigo, electric orange, or confident crimson",
    },
    {
        style: "natural organic form",
        directive: "Design an organic, flowing icon inspired by nature — a leaf, wave, flame, seed, or constellation — that metaphorically represents the product's essence. Smooth curves, natural motion, hand-crafted feel.",
        colorHint: "Earthy greens, warm amber, ocean teal — grounded and human",
    },
    {
        style: "3D isometric tech mark",
        directive: "Design a bold 3D isometric icon — a cube, prism, or extruded geometric form with hard light from upper left. Think Notion, Linear, or Stripe dashboard aesthetic. Clean edges, precise shadows.",
        colorHint: "Vibrant purple-to-pink gradient or electric blue with white faces",
    },
    {
        style: "minimal line art icon",
        directive: "Design a single-weight line art icon — clean, editorial, almost architectural. Use 1-2 strokes to capture the product concept. Inspired by icons on luxury brand websites. Negative space is the hero.",
        colorHint: "Monochrome black on white, or gold on dark — high contrast, zero noise",
    },
    {
        style: "retro-modern badge",
        directive: "Design a retro-modern circular emblem — geometric inner design inside a badge shape with subtle grain texture. Inspired by 1960s NASA logos crossed with modern startup energy. Timeless craft meets contemporary tech.",
        colorHint: "Warm cream, burnt orange, postal red, or deep forest green with off-white details",
    },
    {
        style: "gradient blob mark",
        directive: "Design a flowing, amorphous blob-shaped icon with a rich multi-stop gradient inside — the shape itself should feel alive and energetic, like a brand in motion. Inspired by Figma's early aesthetic and Framer.",
        colorHint: "Purple to coral to yellow gradient, or teal to lime — maximum vibrancy",
    },
    {
        style: "sharp angular emblem",
        directive: "Design a sharp, angular heraldic-inspired mark — asymmetrical yet balanced, with a commanding presence. Think high-end esports logos meets luxury fashion mark. Bold enough to be embossed on metal.",
        colorHint: "Matte black with platinum or gold accents — powerful, authoritative",
    },
];

/**
 * Generate a rich creative brief for logo image generation.
 * Takes a regenerateIndex to rotate visual design direction on each call.
 */
export const generateLogoBrief = action({
    args: {
        appProfileId: v.id("appProfiles"),
        currentName: v.optional(v.string()),
        regenerateIndex: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<{
        success: boolean;
        brief?: string;
        style?: string;
        colorPalette?: string;
        imagePrompt?: string;
        designDirection?: string;
        error?: string;
    }> => {
        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            const analysis = await ctx.runQuery(api.codebaseAnalysis.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const productContext = buildProductContext(profile, analysis);
            // Always use the name passed from the frontend (the live form value)
            const nameToUse = args.currentName?.trim() || profile.appName;

            // Pick design direction — rotates with each regeneration
            const idx = (args.regenerateIndex ?? 0) % LOGO_DESIGN_DIRECTIONS.length;
            const direction = LOGO_DESIGN_DIRECTIONS[idx];

            const userPrompt = `${productContext}

The product is called "${nameToUse}". 

DESIGN DIRECTION FOR THIS ITERATION: ${direction.directive}
COLOR DIRECTION: ${direction.colorHint}

Create a logo concept that uses this exact visual style, adapted to express what "${nameToUse}" does for ${profile.targetAudience || "its users"}. 
The logo must feel intentional and professional — like it was designed by a top-tier branding agency specifically for this product.
It will be used as an app icon (1024x1024), website favicon, and social media avatar.`;

            const result = await generateJSON<{
                brief: string;
                style: string;
                colorPalette: string;
            }>(LOGO_BRIEF_PROMPT, userPrompt, { temperature: 0.85 });

            // Build a rich, specific image generation prompt
            const imagePrompt = [
                `Professional logo icon for "${nameToUse}":`,
                result.brief,
                `Visual style: ${direction.style}, ${result.style}.`,
                `Color palette: ${result.colorPalette}.`,
                `Precise centered composition on clean background.`,
                `No text, letters, numbers, or typography anywhere.`,
                `Award-winning logo design, high resolution vector quality, sharp edges.`,
            ].join(" ");

            return {
                success: true,
                brief: result.brief,
                style: `${direction.style} — ${result.style}`,
                colorPalette: result.colorPalette,
                imagePrompt,
                designDirection: direction.style,
            };
        } catch (error) {
            const msg = String(error);
            return { success: false, error: msg };
        }
    },
});

/**
 * Full end-to-end logo generation:
 * 1. Generate a creative brief for the logo (via LLM)
 * 2. Generate the actual image (via DigitalOcean image API using openai-gpt-image-1)
 * Returns the base64 PNG data URI so the frontend can display it directly.
 */
export const generateLogoImage = action({
    args: {
        appProfileId: v.id("appProfiles"),
        currentName: v.optional(v.string()),
        regenerateIndex: v.optional(v.number()),
    },
    handler: async (ctx, args): Promise<{
        success: boolean;
        imageDataUrl?: string;
        brief?: string;
        style?: string;
        colorPalette?: string;
        designDirection?: string;
        error?: string;
    }> => {
        try {
            const profile = await ctx.runQuery(api.appProfiles.getById, {
                profileId: args.appProfileId,
            });
            if (!profile) throw new Error("App profile not found");

            const analysis = await ctx.runQuery(api.codebaseAnalysis.getByProfile, {
                appProfileId: args.appProfileId,
            });

            const productContext = buildProductContext(profile, analysis);
            const nameToUse = args.currentName?.trim() || profile.appName;

            const idx = (args.regenerateIndex ?? 0) % LOGO_DESIGN_DIRECTIONS.length;
            const direction = LOGO_DESIGN_DIRECTIONS[idx];

            const briefUserPrompt = `${productContext}

The product is called "${nameToUse}". 

DESIGN DIRECTION FOR THIS ITERATION: ${direction.directive}
COLOR DIRECTION: ${direction.colorHint}

Create a logo concept that uses this exact visual style, adapted to express what "${nameToUse}" does for ${profile.targetAudience || "its users"}. 
The logo must feel intentional and professional — like it was designed by a top-tier branding agency specifically for this product.
It will be used as an app icon (1024x1024), website favicon, and social media avatar.`;

            const briefResult = await generateJSON<{
                brief: string;
                style: string;
                colorPalette: string;
            }>(LOGO_BRIEF_PROMPT, briefUserPrompt, { temperature: 0.85 });

            // Build image generation prompt optimized for logo output
            const imagePrompt = [
                `Professional app logo icon for an app called "${nameToUse}":`,
                briefResult.brief,
                `Visual style: ${direction.style}, ${briefResult.style}.`,
                `Color palette: ${briefResult.colorPalette}.`,
                `Centered composition on clean white background.`,
                `No text, letters, numbers, or typography anywhere in the image.`,
                `Award-winning logo design, high resolution, sharp clean edges, vector-quality icon.`,
            ].join(" ");

            // Call DigitalOcean image generation API
            const imageDataUrl = await generateImage(imagePrompt, { size: "1024x1024" });

            return {
                success: true,
                imageDataUrl,
                brief: briefResult.brief,
                style: `${direction.style} — ${briefResult.style}`,
                colorPalette: briefResult.colorPalette,
                designDirection: direction.style,
            };
        } catch (error) {
            const msg = String(error);
            return { success: false, error: msg };
        }
    },
});
