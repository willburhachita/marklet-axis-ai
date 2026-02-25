import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the codebase analysis for an app profile.
 */
export const getByProfile = query({
    args: { appProfileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("codebaseAnalysis")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .first();
    },
});

/**
 * Save or update codebase analysis results.
 */
export const save = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        githubRepoId: v.id("githubRepos"),
        techStack: v.array(v.string()),
        features: v.array(
            v.object({
                name: v.string(),
                description: v.string(),
                category: v.string(),
            })
        ),
        dependencies: v.array(
            v.object({
                name: v.string(),
                version: v.string(),
                type: v.string(),
            })
        ),
        endpoints: v.optional(
            v.array(
                v.object({
                    method: v.string(),
                    path: v.string(),
                    description: v.optional(v.string()),
                })
            )
        ),
        fileStructure: v.optional(v.string()),
        readmeContent: v.optional(v.string()),
        legalRequirements: v.array(
            v.object({
                documentType: v.string(),
                reason: v.string(),
                severity: v.union(
                    v.literal("required"),
                    v.literal("recommended"),
                    v.literal("optional")
                ),
            })
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Check if analysis already exists
        const existing = await ctx.db
            .query("codebaseAnalysis")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                ...args,
                updatedAt: now,
            });
            return existing._id;
        }

        return await ctx.db.insert("codebaseAnalysis", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});
