import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex, crossDomain } from "@convex-dev/better-auth/plugins";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import { betterAuth } from "better-auth/minimal";
import authConfig from "../auth.config";

// The component client — has adapter methods + helpers for integrating Convex with Better Auth
export const authComponent = createClient<DataModel>(components.betterAuth);

// SITE_URL = the frontend URL (http://localhost:5173 in dev)
// The crossDomain plugin uses this to rewrite OAuth callback URLs
const siteUrl = process.env.SITE_URL!;

export const createAuth = (ctx: GenericCtx<DataModel>) => {
    return betterAuth({
        // Allow requests from the frontend origin
        trustedOrigins: [
            siteUrl,
            "http://localhost:5173",
            "http://localhost:3000",
        ],
        secret: process.env.BETTER_AUTH_SECRET,
        database: authComponent.adapter(ctx),
        appName: "MarketAxis AI",
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: false,
        },
        socialProviders: {
            github: {
                clientId: process.env.GITHUB_CLIENT_ID!,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            },
            google: {
                clientId: process.env.GOOGLE_CLIENT_ID!,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            },
        },
        plugins: [
            // crossDomain: required for React SPA where auth server & frontend are different origins
            crossDomain({ siteUrl }),
            // convex: required for Convex compatibility (auth token verification)
            convex({ authConfig }),
        ],
    });
};
