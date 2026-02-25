import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the app profile for the current user.
 */
export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("appProfiles")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .first();
    },
});

/**
 * Get app profile by ID.
 */
export const getById = query({
    args: { profileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.profileId);
    },
});

/**
 * Create a new app profile (onboarding).
 */
export const create = mutation({
    args: {
        userId: v.id("users"),
        appName: v.string(),
        description: v.string(),
        targetAudience: v.string(),
        platforms: v.array(v.string()),
        region: v.string(),
        stage: v.union(
            v.literal("idea"),
            v.literal("mvp"),
            v.literal("beta"),
            v.literal("launched")
        ),
        monetization: v.string(),
        appUrl: v.optional(v.string()),
        competitors: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("appProfiles", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/**
 * Update an existing app profile.
 */
export const update = mutation({
    args: {
        profileId: v.id("appProfiles"),
        appName: v.optional(v.string()),
        description: v.optional(v.string()),
        targetAudience: v.optional(v.string()),
        platforms: v.optional(v.array(v.string())),
        region: v.optional(v.string()),
        stage: v.optional(
            v.union(
                v.literal("idea"),
                v.literal("mvp"),
                v.literal("beta"),
                v.literal("launched")
            )
        ),
        monetization: v.optional(v.string()),
        appUrl: v.optional(v.string()),
        competitors: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { profileId, ...updates } = args;
        // Filter out undefined values
        const filtered: Record<string, unknown> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) filtered[key] = value;
        }
        await ctx.db.patch(profileId, filtered);
    },
});
