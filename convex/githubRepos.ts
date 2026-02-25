import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get GitHub repos for an app profile.
 */
export const getByProfile = query({
    args: { appProfileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("githubRepos")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .collect();
    },
});

/**
 * Connect a GitHub repo.
 */
export const connect = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        repoName: v.string(),
        repoUrl: v.string(),
        defaultBranch: v.string(),
        language: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("githubRepos", {
            ...args,
            connectedAt: Date.now(),
        });
    },
});

/**
 * Update a repo's last analyzed timestamp.
 */
export const markAnalyzed = mutation({
    args: { repoId: v.id("githubRepos") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.repoId, { lastAnalyzedAt: Date.now() });
    },
});

/**
 * Remove a connected repo.
 */
export const remove = mutation({
    args: { repoId: v.id("githubRepos") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.repoId);
    },
});
