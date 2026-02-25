import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get recent activities for a user (most recent first).
 */
export const getByUser = query({
    args: {
        userId: v.id("users"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 20;
        return await ctx.db
            .query("activities")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(limit);
    },
});

/**
 * Log a new activity (called internally by agents).
 */
export const log = mutation({
    args: {
        userId: v.id("users"),
        agentType: v.string(),
        action: v.string(),
        description: v.string(),
        metadata: v.optional(v.any()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("activities", {
            ...args,
            createdAt: Date.now(),
        });
    },
});
