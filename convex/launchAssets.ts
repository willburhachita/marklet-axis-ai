import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all launch assets for an app profile.
 */
export const getByProfile = query({
    args: { appProfileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("launchAssets")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .collect();
    },
});

/**
 * Save a launch asset.
 */
export const save = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        assetType: v.string(),
        title: v.string(),
        body: v.string(),
        status: v.union(
            v.literal("draft"),
            v.literal("ready"),
            v.literal("submitted")
        ),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("launchAssets", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/**
 * Update launch asset status.
 */
export const updateStatus = mutation({
    args: {
        assetId: v.id("launchAssets"),
        status: v.union(
            v.literal("draft"),
            v.literal("ready"),
            v.literal("submitted")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.assetId, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

/**
 * Update launch asset body.
 */
export const updateBody = mutation({
    args: {
        assetId: v.id("launchAssets"),
        title: v.optional(v.string()),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const { assetId, ...updates } = args;
        const filtered: Record<string, unknown> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) filtered[key] = value;
        }
        await ctx.db.patch(assetId, filtered);
    },
});
