import { defineApp } from "convex/server";
// Import from the PACKAGE, not the local betterAuth folder
import betterAuth from "@convex-dev/better-auth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
