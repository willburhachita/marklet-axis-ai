import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all content for an app profile.
 */
export const getByProfile = query({
    args: { appProfileId: v.id("appProfiles") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("contents")
            .withIndex("by_profile", (q) => q.eq("appProfileId", args.appProfileId))
            .order("desc")
            .collect();
    },
});

/**
 * Get content filtered by status.
 */
export const getByStatus = query({
    args: {
        appProfileId: v.id("appProfiles"),
        status: v.union(
            v.literal("draft"),
            v.literal("approved"),
            v.literal("scheduled"),
            v.literal("posted"),
            v.literal("failed")
        ),
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("contents")
            .withIndex("by_status", (q) =>
                q.eq("appProfileId", args.appProfileId).eq("status", args.status)
            )
            .order("desc")
            .collect();
    },
});

/**
 * Get a single content piece by ID.
 */
export const getById = query({
    args: { contentId: v.id("contents") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.contentId);
    },
});

/**
 * Save a new content piece.
 */
export const save = mutation({
    args: {
        appProfileId: v.id("appProfiles"),
        type: v.string(),
        title: v.string(),
        body: v.string(),
        variants: v.optional(v.array(v.string())),
        status: v.union(
            v.literal("draft"),
            v.literal("approved"),
            v.literal("scheduled"),
            v.literal("posted"),
            v.literal("failed")
        ),
        platform: v.string(),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("contents", {
            ...args,
            createdAt: now,
            updatedAt: now,
        });
    },
});

/**
 * Update content status (approve, schedule, mark posted, etc.)
 */
export const updateStatus = mutation({
    args: {
        contentId: v.id("contents"),
        status: v.union(
            v.literal("draft"),
            v.literal("approved"),
            v.literal("scheduled"),
            v.literal("posted"),
            v.literal("failed")
        ),
        externalId: v.optional(v.string()),
        postedAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { contentId, ...updates } = args;
        await ctx.db.patch(contentId, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

/**
 * Update content body (edit).
 */
export const updateBody = mutation({
    args: {
        contentId: v.id("contents"),
        title: v.optional(v.string()),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const { contentId, ...updates } = args;
        const filtered: Record<string, unknown> = { updatedAt: Date.now() };
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) filtered[key] = value;
        }
        await ctx.db.patch(contentId, filtered);
    },
});

/**
 * Delete a content piece.
 */
export const remove = mutation({
    args: { contentId: v.id("contents") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.contentId);
    },
});
