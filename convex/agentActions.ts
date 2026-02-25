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
import { generateJSON, generateText } from "./lib/llm";
import {
    STRATEGY_AGENT_PROMPT,
    CONTENT_AGENT_PROMPT,
    LAUNCH_AGENT_PROMPT,
    CODEBASE_AGENT_PROMPT,
    LEGAL_AGENT_PROMPT,
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

            // Build user prompt from profile data
            const userPrompt = `Generate a marketing strategy for this app:
        
App Name: ${profile.appName}
Description: ${profile.description}
Target Audience: ${profile.targetAudience}
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
            // Log failure
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: String(error),
                status: "failed",
                duration: Date.now() - startTime,
            });
            throw error;
        }
    },
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
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: String(error),
                status: "failed",
                duration: Date.now() - startTime,
            });
            throw error;
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
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: String(error),
                status: "failed",
                duration: Date.now() - startTime,
            });
            throw error;
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
            await ctx.runMutation(api.agentLogs.completeExecution, {
                logId,
                output: String(error),
                status: "failed",
                duration: Date.now() - startTime,
            });
            throw error;
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
            (a) => a.platform === content.platform && a.isActive
        );
        if (!account) {
            throw new Error(
                `No connected ${content.platform} account found. Connect it in Settings.`
            );
        }

        try {
            // Import dynamically to avoid issues when Composio isn't configured
            const { postTweet, postLinkedIn } = await import("./lib/composio");

            let result: unknown;
            if (content.platform === "twitter") {
                result = await postTweet(account.composioEntityId, content.body);
            } else if (content.platform === "linkedin") {
                result = await postLinkedIn(account.composioEntityId, content.body);
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
