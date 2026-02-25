import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all social accounts for a user.
 */
export const getByUser = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("socialAccounts")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();
    },
});

/**
 * Connect a social account via Composio.
 */
export const connect = mutation({
    args: {
        userId: v.id("users"),
        platform: v.string(),
        accountName: v.string(),
        composioEntityId: v.string(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("socialAccounts", {
            ...args,
            isActive: true,
            connectedAt: Date.now(),
        });
    },
});

/**
 * Disconnect a social account.
 */
export const disconnect = mutation({
    args: { accountId: v.id("socialAccounts") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.accountId, { isActive: false });
    },
});

/**
 * Remove a social account entirely.
 */
export const remove = mutation({
    args: { accountId: v.id("socialAccounts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.accountId);
    },
});
