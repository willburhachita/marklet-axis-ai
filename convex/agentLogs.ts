import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get agent logs for an app profile.
 */
export const getByProfile = query({
    args: {
        appProfileId: v.id("appProfiles"),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit ?? 50;
        return await ctx.db
            .query("agentLogs")
            .withIndex("by_profile", (q) =>
                q.eq("appProfileId", args.appProfileId)
            )
            .order("desc")
            .take(limit);
    },
});

/**
 * Start an agent execution (creates a "running" log).
 */
export const startExecution = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        agentType: v.string(),
        input: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("agentLogs", {
            ...args,
            output: "",
            status: "running",
            createdAt: Date.now(),
        });
    },
});

/**
 * Complete an agent execution.
 */
export const completeExecution = mutation({
    args: {
        logId: v.id("agentLogs"),
        output: v.string(),
        status: v.union(v.literal("completed"), v.literal("failed")),
        duration: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { logId, ...updates } = args;
        await ctx.db.patch(logId, updates);
    },
});
