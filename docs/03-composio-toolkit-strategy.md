# MarketAxis AI — Composio Toolkit Strategy

## Why Composio?

Composio gives your agents **real hands** — they can actually DO things on external platforms, not just generate text. It handles:

- OAuth authentication flows
- API integrations with 150+ tools
- Action execution (post, reply, read, search)
- Webhook triggers

This means your AI agents can **read from** and **write to** real social platforms, email, and other tools.

---

## Composio Tools vs. Alternatives

| Approach | Pros | Cons |
|----------|------|------|
| **Composio** | Pre-built integrations, handles auth, fast to ship | Monthly cost, dependency on third party |
| Raw APIs | Full control, no middleman | Huge dev time, auth management nightmare |
| Zapier/Make | Visual workflows | Not designed for agent-level control |

**Verdict:** Composio is the right call for MVP. You ship in weeks, not months.

---

## Recommended Composio Integrations for MVP

### Tier 1: Must-Have (MVP)

| Integration | Agent(s) | Actions Used |
|-------------|----------|--------------|
| **Twitter/X** | Content, Social Reply | Post tweet, post thread, read mentions, reply, like, read DMs |
| **LinkedIn** | Content, Launch | Post update, read comments, reply to comments |
| **Gmail / Email** | Launch, Outreach | Send email, read replies, create drafts |
| **GitHub** | Codebase, Legal, Strategy | Read repo, list files, read file contents, get README, get package.json |

### Tier 2: High Value (Phase 2)

| Integration | Agent(s) | Actions Used |
|-------------|----------|--------------|
| **Reddit** | Content, Launch | Post to subreddit, read comments, reply |
| **Instagram** | Content | Post image with caption, read comments |
| **Product Hunt** | Launch | Submit product, reply to comments |
| **Discord** | Social Reply | Post messages, monitor channels |
| **Slack** | Social Reply | Post messages, monitor channels |

### Tier 3: Nice-to-Have (Phase 3)

| Integration | Agent(s) | Actions Used |
|-------------|----------|--------------|
| **Google Analytics** | Growth | Read traffic data, conversion events |
| **Mailchimp / Resend** | Outreach | Manage email lists, send campaigns |
| **Notion** | Strategy | Export strategy docs |
| **Medium / Dev.to** | Content | Publish blog posts |
| **TikTok** | Content | Post video descriptions |

---

## How Composio Fits In Your Architecture

```
User Action (Dashboard)
        │
        ▼
  React Frontend
        │
        ▼
  Convex Backend (mutations / actions)
        │
        ├── Internal: LLM call via DigitalOcean worker
        │         │
        │         └── Returns generated content
        │
        └── External: Composio action
                  │
                  ├── composio.executeAction("twitter_post_tweet", { text: "..." })
                  ├── composio.executeAction("linkedin_create_post", { text: "..." })
                  └── composio.executeAction("gmail_send_email", { to, subject, body })
```

---

## Composio Setup — Step by Step

### 1. Install Composio SDK

```bash
npm install composio-core
```

### 2. Initialize in Your Backend

```javascript
// In your Convex action or DigitalOcean worker
import { Composio } from "composio-core";

const composio = new Composio({ apiKey: process.env.COMPOSIO_API_KEY });
```

### 3. Connect User's Social Accounts

Composio handles OAuth. When a user clicks "Connect Twitter":

```javascript
// Initiate connection
const connection = await composio.connectedAccounts.initiate({
  integrationId: "twitter",
  entityId: userId, // your user's ID
  redirectUrl: "https://yourapp.com/callback"
});
// User redirected to Twitter OAuth → comes back → account connected
```

### 4. Execute Actions

```javascript
// Post a tweet
await composio.executeAction({
  action: "twitter_post_tweet",
  entityId: userId,
  params: {
    text: "Just shipped our new feature! 🚀 Check it out: https://..."
  }
});

// Read Twitter mentions
const mentions = await composio.executeAction({
  action: "twitter_get_mentions",
  entityId: userId,
  params: {}
});
```

### 5. Set Up Triggers (for monitoring)

```javascript
// Trigger when someone mentions you on Twitter
await composio.triggers.subscribe({
  trigger: "twitter_new_mention",
  entityId: userId,
  config: {},
  callback: async (data) => {
    // Send to Social Reply Agent for processing
    await processMention(data);
  }
});
```

---

## Composio Action Map (Per Agent)

### Content Agent — Post Actions

| Action | Platform | When Used |
|--------|----------|-----------|
| `twitter_post_tweet` | Twitter/X | Single post |
| `twitter_create_thread` | Twitter/X | Thread posts |
| `linkedin_create_post` | LinkedIn | Professional posts |
| `reddit_submit_post` | Reddit | Community posts |
| `instagram_create_post` | Instagram | Image + caption |

### Social Reply Agent — Read + Reply Actions

| Action | Platform | When Used |
|--------|----------|-----------|
| `twitter_get_mentions` | Twitter/X | Monitoring |
| `twitter_reply_to_tweet` | Twitter/X | Replying |
| `twitter_like_tweet` | Twitter/X | Engagement |
| `linkedin_get_comments` | LinkedIn | Monitoring |
| `linkedin_reply_to_comment` | LinkedIn | Replying |

### Launch Agent — Multi-Platform Actions

| Action | Platform | When Used |
|--------|----------|-----------|
| `gmail_send_email` | Email | Press outreach |
| `gmail_create_draft` | Email | Draft for review |
| `twitter_post_tweet` | Twitter/X | Launch announcement |
| `linkedin_create_post` | LinkedIn | Launch announcement |
| `producthunt_submit` | Product Hunt | Product launch |

### Outreach Agent — Email Actions

| Action | Platform | When Used |
|--------|----------|-----------|
| `gmail_send_email` | Email | Cold outreach |
| `gmail_get_threads` | Email | Read responses |
| `gmail_reply_to_thread` | Email | Follow-up |

---

## Handling Composio in Dual Mode

### Assist Mode Flow

```
Agent generates content
        │
        ▼
Content stored in Convex (status: "draft")
        │
        ▼
User sees draft in dashboard
        │
        ▼
User clicks "Approve & Post"
        │
        ▼
Convex action calls Composio
        │
        ▼
Content posted to platform
        │
        ▼
Status updated to "posted" in Convex
```

### Autopilot Mode Flow

```
Agent generates content
        │
        ▼
Content stored in Convex (status: "auto-approved")
        │
        ▼
Scheduled via DigitalOcean cron
        │
        ▼
Cron triggers Convex action
        │
        ▼
Convex action calls Composio
        │
        ▼
Content posted to platform
        │
        ▼
Status updated to "posted" in Convex
        │
        ▼
User notified in dashboard activity feed
```

---

## Rate Limiting & Safety

| Platform | Limit | Our Safety Buffer |
|----------|-------|-------------------|
| Twitter/X | 300 tweets/3h (premium) | Max 20 posts/day |
| LinkedIn | ~100 posts/day | Max 5 posts/day |
| Reddit | ~10 posts/10min | Max 3 posts/day |
| Gmail | 500 emails/day | Max 50 emails/day |

**Important:** Always stay well under platform limits. Getting accounts flagged/banned would be catastrophic for user trust.

---

## Cost Estimation

| Component | Cost |
|-----------|------|
| Composio API | ~$29–99/month depending on plan |
| Per-action cost | Some actions free, some metered |
| Our LLM calls | ~$0.01–0.05 per generation (GPT-4 mini / Claude Haiku) |
| DigitalOcean workers | ~$12–48/month per droplet |

**Per-user cost estimate:** ~$2–5/month at scale.

At $19/month pricing, that's **75–90% gross margin**. Healthy.

---

## Browser Automation (Future — Phase 3)

For platforms where Composio doesn't have API access, or for tasks like:

- Submitting to Product Hunt manually
- Posting on BetaList
- Filling forms on directories
- Scraping competitor content

Use a headless browser approach:

- **Tool:** Puppeteer / Playwright on DigitalOcean
- **Trigger:** Agent decides browser action is needed
- **Execution:** DigitalOcean worker runs browser script
- **Reporting:** Screenshot + result stored in Convex

This is powerful but complex. Save for Phase 3.
