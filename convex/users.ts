import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the current authenticated user from the users table.
 * Uses ctx.auth.getUserIdentity() provided by Better Auth.
 */
export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        // Look up user by email from Better Auth identity
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", identity.email!))
            .unique();

        return user;
    },
});

/**
 * Get user by ID.
 */
export const getById = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.userId);
    },
});

/**
 * Create or sync a user after Better Auth sign-in.
 * Called from the frontend after successful auth to ensure
 * we have a matching record in our users table.
 */
export const syncUser = mutation({
    args: {
        email: v.string(),
        name: v.string(),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user exists
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();

        if (existing) {
            // Update name/avatar if changed
            await ctx.db.patch(existing._id, {
                name: args.name,
                avatarUrl: args.avatarUrl,
            });
            return existing._id;
        }

        // Create new user
        return await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            avatarUrl: args.avatarUrl,
            plan: "free",
            mode: "assist",
            createdAt: Date.now(),
        });
    },
});

/**
 * Toggle between assist and autopilot mode.
 */
export const toggleMode = mutation({
    args: {
        userId: v.id("users"),
        mode: v.union(v.literal("assist"), v.literal("autopilot")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { mode: args.mode });
    },
});

/**
 * Update user plan.
 */
export const updatePlan = mutation({
    args: {
        userId: v.id("users"),
        plan: v.union(
            v.literal("free"),
            v.literal("indie"),
            v.literal("startup"),
            v.literal("pro")
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.userId, { plan: args.plan });
    },
});
