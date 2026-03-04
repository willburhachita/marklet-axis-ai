# MarketAxis AI — Convex Backend Schema

## Why Convex?

- **Real-time**: Agent actions stream to dashboard instantly
- **Serverless**: No server management
- **TypeScript-native**: Type-safe queries and mutations
- **Auth**: Better Auth integration for flexible authentication
- **Actions**: Run server-side code (LLM calls, Composio)

---

## Schema Definition

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // User profile
  users: defineTable({
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    plan: v.union(v.literal("free"), v.literal("indie"), v.literal("startup"), v.literal("pro")),
    mode: v.union(v.literal("assist"), v.literal("autopilot")),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  // App profile (one per user in MVP)
  appProfiles: defineTable({
    userId: v.id("users"),
    appName: v.string(),
    description: v.string(),
    targetAudience: v.string(),
    platforms: v.array(v.string()),
    region: v.string(),
    stage: v.union(v.literal("idea"), v.literal("mvp"), v.literal("beta"), v.literal("launched")),
    monetization: v.string(),
    appUrl: v.optional(v.string()),
    competitors: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Generated strategy
  strategies: defineTable({
    appProfileId: v.id("appProfiles"),
    positioning: v.string(),
    brandVoice: v.object({
      tone: v.string(),
      personality: v.string(),
      doList: v.array(v.string()),
      dontList: v.array(v.string()),
    }),
    contentCalendar: v.array(v.object({
      day: v.number(),
      title: v.string(),
      platform: v.string(),
      contentType: v.string(),
    })),
    launchRoadmap: v.array(v.object({
      week: v.number(),
      title: v.string(),
      tasks: v.array(v.string()),
    })),
    targetCommunities: v.array(v.object({
      name: v.string(),
      platform: v.string(),
      url: v.optional(v.string()),
    })),
    differentiators: v.array(v.string()),
    pricingPosition: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile", ["appProfileId"]),

  // Generated content pieces
  contents: defineTable({
    appProfileId: v.id("appProfiles"),
    type: v.string(), // "twitter_thread", "linkedin_post", etc.
    title: v.string(),
    body: v.string(),
    variants: v.optional(v.array(v.string())),
    status: v.union(
      v.literal("draft"), v.literal("approved"),
      v.literal("scheduled"), v.literal("posted"), v.literal("failed")
    ),
    platform: v.string(),
    postedAt: v.optional(v.number()),
    externalId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile", ["appProfileId"])
    .index("by_status", ["appProfileId", "status"]),

  // Launch kit assets
  launchAssets: defineTable({
    appProfileId: v.id("appProfiles"),
    assetType: v.string(), // "product_hunt", "hacker_news", etc.
    title: v.string(),
    body: v.string(),
    status: v.union(v.literal("draft"), v.literal("ready"), v.literal("submitted")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile", ["appProfileId"]),

  // Connected social accounts
  socialAccounts: defineTable({
    userId: v.id("users"),
    platform: v.string(),
    accountName: v.string(),
    composioEntityId: v.string(),
    isActive: v.boolean(),
    connectedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Activity log
  activities: defineTable({
    userId: v.id("users"),
    agentType: v.string(), // "strategy", "content", "launch", etc.
    action: v.string(),
    description: v.string(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Agent execution logs
  agentLogs: defineTable({
    appProfileId: v.id("appProfiles"),
    agentType: v.string(),
    input: v.string(),
    output: v.string(),
    status: v.union(v.literal("running"), v.literal("completed"), v.literal("failed")),
    duration: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_profile", ["appProfileId"]),

  // Connected GitHub repositories
  githubRepos: defineTable({
    appProfileId: v.id("appProfiles"),
    repoName: v.string(),
    repoUrl: v.string(),
    defaultBranch: v.string(),
    language: v.optional(v.string()),
    description: v.optional(v.string()),
    lastAnalyzedAt: v.optional(v.number()),
    connectedAt: v.number(),
  }).index("by_profile", ["appProfileId"]),

  // Codebase analysis results
  codebaseAnalysis: defineTable({
    appProfileId: v.id("appProfiles"),
    githubRepoId: v.id("githubRepos"),
    techStack: v.array(v.string()),
    features: v.array(v.object({
      name: v.string(),
      description: v.string(),
      category: v.string(),
    })),
    dependencies: v.array(v.object({
      name: v.string(),
      version: v.string(),
      type: v.string(), // "production" | "dev"
    })),
    endpoints: v.optional(v.array(v.object({
      method: v.string(),
      path: v.string(),
      description: v.optional(v.string()),
    }))),
    fileStructure: v.optional(v.string()),
    readmeContent: v.optional(v.string()),
    legalRequirements: v.array(v.object({
      documentType: v.string(),
      reason: v.string(),
      severity: v.union(v.literal("required"), v.literal("recommended"), v.literal("optional")),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile", ["appProfileId"]),

  // Resources (generated documents vault)
  resources: defineTable({
    appProfileId: v.id("appProfiles"),
    type: v.string(), // "privacy_policy", "terms_of_service", "cookie_policy", etc.
    title: v.string(),
    body: v.string(),
    category: v.union(
      v.literal("legal"), v.literal("marketing"),
      v.literal("technical"), v.literal("other")
    ),
    status: v.union(v.literal("draft"), v.literal("final"), v.literal("archived")),
    version: v.number(),
    generatedBy: v.string(), // "legal_agent", "strategy_agent", etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_profile", ["appProfileId"])
    .index("by_category", ["appProfileId", "category"]),
});
```

---

## Key Functions

### Mutations
- `createAppProfile` — Save onboarding data
- `updateStrategy` — Save/update strategy
- `saveContent` — Store generated content
- `updateContentStatus` — Change content lifecycle
- `connectSocialAccount` — Store Composio connection
- `connectGithubRepo` — Store GitHub repo connection
- `saveCodebaseAnalysis` — Store analysis results
- `saveResource` — Store generated document
- `updateResource` — Edit document
- `toggleMode` — Switch assist/autopilot
- `logActivity` — Record agent actions

### Queries
- `getAppProfile` — Load user's app
- `getStrategy` — Load strategy (real-time)
- `getContents` — Filter by status/type
- `getLaunchAssets` — All launch kit items
- `getActivities` — Activity feed
- `getSocialAccounts` — Connected platforms
- `getGithubRepos` — Connected repositories
- `getCodebaseAnalysis` — Analysis results
- `getResources` — All documents, filterable by category

### Actions (Server-Side)
- `generateStrategy` — Call LLM, parse, store
- `generateContent` — Call LLM per content type
- `generateLaunchKit` — Batch generate all assets
- `postToSocial` — Call Composio to post
- `pollMentions` — Scheduled social monitoring (Phase 2)

---

## Convex Directory Structure

```
convex/
├── schema.ts          # Schema definition
├── auth.ts            # Authentication config
├── users.ts           # User mutations/queries
├── appProfiles.ts     # App profile CRUD
├── strategies.ts      # Strategy generation
├── contents.ts        # Content CRUD + generation
├── launchAssets.ts     # Launch kit generation
├── socialAccounts.ts   # Social account management
├── activities.ts       # Activity feed
├── agentLogs.ts        # Agent execution tracking
└── lib/
    ├── llm.ts         # LLM helper (system prompts, API calls)
    ├── composio.ts    # Composio action wrapper
    └── prompts.ts     # Agent system prompts
```
