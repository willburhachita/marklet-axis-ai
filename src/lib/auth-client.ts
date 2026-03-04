/**
 * Better Auth Client — Frontend
 *
 * Official setup per https://labs.convex.dev/better-auth/framework-guides/react
 *
 * baseURL = VITE_CONVEX_SITE_URL (the Convex site domain where HTTP routes live)
 * crossDomainClient: handles cross-origin auth (stores session in localStorage,
 *   forwards cookies via headers, rewrites OAuth callback URLs)
 */

import { createAuthClient } from "better-auth/react";
import {
    convexClient,
    crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_CONVEX_SITE_URL,
    plugins: [convexClient(), crossDomainClient()],
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
} = authClient;
